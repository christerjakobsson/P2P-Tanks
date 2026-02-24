export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('ok');
    }

    if (url.pathname !== '/ws') {
      return new Response('Not found', { status: 404 });
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }

    const id = env.LOBBY.idFromName('global-lobby');
    const stub = env.LOBBY.get(id);
    return stub.fetch(request);
  }
};

export class GameLobby {
  constructor(state) {
    this.state = state;
    this.peers = new Map();
    this.rooms = new Map();
    this.peerRoom = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const peerId = (url.searchParams.get('peerId') || '').trim();

    if (!peerId) {
      return new Response('Missing peerId', { status: 400 });
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 426 });
    }

    if (this.peers.has(peerId)) {
      return new Response('peerId already in use', { status: 409 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();

    this.peers.set(peerId, server);
    this._ensureOwnRoom(peerId);

    this._send(server, { type: 'sys:welcome', peerId });

    server.addEventListener('message', (event) => {
      this._onMessage(peerId, event.data);
    });

    server.addEventListener('close', () => {
      this._onClose(peerId);
    });

    server.addEventListener('error', () => {
      this._onClose(peerId);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  _send(socket, obj) {
    try {
      socket.send(JSON.stringify(obj));
    } catch (_) {
    }
  }

  _sendToPeer(peerId, obj) {
    const socket = this.peers.get(peerId);
    if (!socket) return;
    this._send(socket, obj);
  }

  _ensureOwnRoom(peerId) {
    if (!this.rooms.has(peerId)) {
      this.rooms.set(peerId, new Set([peerId]));
    } else {
      this.rooms.get(peerId).add(peerId);
    }
    this.peerRoom.set(peerId, peerId);
  }

  _roomMembers(hostId) {
    return this.rooms.get(hostId) || new Set();
  }

  _onMessage(peerId, rawData) {
    let msg = null;
    try {
      msg = JSON.parse(rawData);
    } catch (_) {
      return;
    }

    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'sys:join-room') {
      this._joinRoom(peerId, msg.hostId);
      return;
    }

    if (msg.type === 'sys:disconnect-peer') {
      this._disconnectPeer(peerId, msg.peerId);
      return;
    }

    if (msg.type === 'relay') {
      this._relay(peerId, msg.to, msg.payload);
    }
  }

  _joinRoom(peerId, hostId) {
    hostId = (hostId || '').trim();
    if (!hostId || !this.rooms.has(hostId)) {
      this._sendToPeer(peerId, { type: 'sys:error', message: 'room host not found' });
      return;
    }

    const currentHost = this.peerRoom.get(peerId);
    if (currentHost === hostId) {
      const peers = [...this._roomMembers(hostId)].filter((id) => id !== peerId);
      this._sendToPeer(peerId, { type: 'sys:joined-room', hostId, peers });
      return;
    }

    this._leaveCurrentRoom(peerId);

    const members = this._roomMembers(hostId);
    const existingPeers = [...members].filter((id) => id !== peerId);

    members.add(peerId);
    this.peerRoom.set(peerId, hostId);

    this._sendToPeer(peerId, {
      type: 'sys:joined-room',
      hostId,
      peers: existingPeers
    });

    for (const existingPeer of existingPeers) {
      this._sendToPeer(existingPeer, {
        type: 'sys:peer-joined',
        peerId
      });
    }
  }

  _disconnectPeer(requesterId, targetPeerId) {
    targetPeerId = (targetPeerId || '').trim();
    if (!targetPeerId || !this.peers.has(targetPeerId)) return;

    const roomHost = this.peerRoom.get(requesterId);
    if (!roomHost) return;
    if (roomHost !== requesterId) return;

    const members = this._roomMembers(roomHost);
    if (!members.has(targetPeerId)) return;

    const targetSocket = this.peers.get(targetPeerId);
    if (!targetSocket) return;

    try {
      targetSocket.close(4001, 'Disconnected by room host');
    } catch (_) {
    }

    this._onClose(targetPeerId);
  }

  _relay(fromPeerId, toPeerId, payload) {
    const roomHost = this.peerRoom.get(fromPeerId);
    if (!roomHost) return;

    const members = this._roomMembers(roomHost);

    if (toPeerId && typeof toPeerId === 'string') {
      if (!members.has(toPeerId)) return;
      this._sendToPeer(toPeerId, {
        type: 'relay',
        from: fromPeerId,
        payload
      });
      return;
    }

    for (const peerId of members) {
      if (peerId === fromPeerId) continue;
      this._sendToPeer(peerId, {
        type: 'relay',
        from: fromPeerId,
        payload
      });
    }
  }

  _leaveCurrentRoom(peerId) {
    const hostId = this.peerRoom.get(peerId);
    if (!hostId) return;

    const members = this._roomMembers(hostId);
    if (members.has(peerId)) {
      members.delete(peerId);
    }

    for (const otherPeerId of members) {
      this._sendToPeer(otherPeerId, {
        type: 'sys:peer-left',
        peerId
      });
    }

    if (members.size === 0) {
      this.rooms.delete(hostId);
    }

    this._ensureOwnRoom(peerId);
  }

  _onClose(peerId) {
    if (!this.peers.has(peerId)) return;

    this._leaveCurrentRoom(peerId);

    const ownRoomMembers = this._roomMembers(peerId);
    ownRoomMembers.delete(peerId);
    if (ownRoomMembers.size === 0) {
      this.rooms.delete(peerId);
    }

    this.peerRoom.delete(peerId);
    this.peers.delete(peerId);
  }
}
