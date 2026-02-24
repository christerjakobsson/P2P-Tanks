const { PeerServer } = require('peer');

const port = Number(process.env.PEER_PORT || 9000);
const host = process.env.PEER_HOST || '0.0.0.0';
const path = process.env.PEER_PATH || '/peerjs';

PeerServer({
  port,
  host,
  path,
  allow_discovery: true,
  proxied: true
});

console.log(`PeerJS server listening on http://${host}:${port}${path}`);
