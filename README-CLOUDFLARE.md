# Teacher Schedule - Cloudflare Quick Tunnel

## Run
1. Install dependencies in root and backend: `npm install`
2. Ensure `cloudflared` is installed and available in PATH.
3. Run `run-all.bat`.
4. Share the `https://....trycloudflare.com` URL printed by cloudflared.

The Vite dev server allows the Cloudflare hostname and proxies `/api` to the local Express backend at port 4000. The browser therefore does not try to call `localhost:4000` directly.

Keep all opened command windows running. Quick Tunnel URLs are temporary and may change when restarted.
