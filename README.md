# P2P-Tanks (Cloudflare Pages + Workers/Durable Objects)

This project is migrated to run as:

- **Frontend (static files)** on **Cloudflare Pages**
- **Multiplayer relay/signaling** on **Cloudflare Workers + Durable Objects**

The game frontend lives in this repository root (`index.html`, `webrtc/`, `websockets/`).
The Cloudflare Worker lives in `cloudflare-worker/`.

## Architecture

- Pages serves the static game files.
- `webrtc/js/p2p_comm.js` now uses a WebSocket relay endpoint (`Conf.wsRelayUrl`) instead of PeerJS.
- Worker Durable Object (`GameLobby`) tracks peers/rooms and relays game messages.

## 1) Deploy the Worker (Durable Object relay)

From project root:

```bash
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler deploy
```

After deploy, copy your Worker URL, e.g.:

`https://p2p-tanks-relay.<your-subdomain>.workers.dev`

Your relay WebSocket URL will be:

`wss://p2p-tanks-relay.<your-subdomain>.workers.dev/ws`

## 2) Configure frontend relay URL

Open `webrtc/js/conf.js` and set:

```js
wsRelayUrl: 'wss://p2p-tanks-relay.<your-subdomain>.workers.dev/ws'
```

Commit and push this change.

## 3) Deploy frontend to Cloudflare Pages

1. Push repo to GitHub (already done if you use this repo).
2. In Cloudflare Dashboard → **Pages** → **Create a project**.
3. Connect to your GitHub repo.
4. Build settings:
	- **Framework preset**: None
	- **Build command**: *(leave empty)*
	- **Build output directory**: `.`
5. Deploy.

Your site will be available on your Pages domain.

## 4) Verify multiplayer

1. Open your Pages URL in two browser windows.
2. Enter `WebRTC version`.
3. In window A, start multiplayer and copy `Player ID`.
4. In window B, paste that ID into `Join player ID`.
5. Both players should connect and sync state.

## Local development

### Frontend only

```bash
python3 -m http.server 8080
```

Open:

- `http://localhost:8080/`
- `http://localhost:8080/webrtc/webretc_tanks_index.html`

### Worker relay locally

In another terminal:

```bash
cd cloudflare-worker
npm install
npx wrangler dev
```

Then set in `webrtc/js/conf.js`:

```js
wsRelayUrl: 'ws://127.0.0.1:8787/ws'
```

## Notes

- `websockets/server/websocket_server.js` is legacy and not required for Cloudflare deployment.
- The Worker relay is authoritative for room membership and message relay.
