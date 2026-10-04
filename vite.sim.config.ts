// TEMPORARY (local simulation only, delete afterwards): same as
// vite.config.ts but proxies /api to the simulation engine on :8010,
// because :8000 is taken by another local app.
import base from './vite.config'

export default {
  ...base,
  server: { ...base.server, proxy: { '/api': { target: 'http://localhost:8010', changeOrigin: true } } },
}
