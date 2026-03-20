# Minecraft Economy Leaderboard

A clean Node.js leaderboard website for Minecraft Bedrock economy data.

## What it shows
- Money leaderboard
- Shards leaderboard
- Discord invite button
- Live refresh every 10 seconds

## Files
- `server.js` — Express backend that receives updates from Minecraft
- `public/` — polished dashboard UI
- `minecraft/` — Bedrock ScriptAPI sync code

## Run locally
```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Minecraft setup
1. Put the `minecraft/` files into your behavior pack.
2. Set the `apiUrl` and `apiKey` in `minecraft/scripts/config.js`.
3. Make sure your existing economy functions are available.
4. Run the sync script on Bedrock Dedicated Server.

## Important
`@minecraft/server-net` works on Bedrock Dedicated Server, not in the client or Realms.
