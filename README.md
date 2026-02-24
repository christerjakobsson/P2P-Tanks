# P2P-Tanks
P2P tanks with webrtc

## Run locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start required servers

In separate terminals:

```bash
npm run peer
```

```bash
npm run serve
```

Optional (for the websocket demo server):

```bash
npm run ws
```

### 3) Open in browser

- Main menu: `http://localhost:8080/`
- WebRTC game directly: `http://localhost:8080/webrtc/webretc_tanks_index.html`
- Websocket game directly: `http://localhost:8080/websockets/websocket_tanks_index.html`

For multiplayer, open the game in two browser windows/tabs, copy the host player's ID, and join from the other player.
