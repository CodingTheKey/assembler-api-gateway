import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './index';
import { initEnv } from './env';
// Initialize environment from process.env
initEnv(process.env);
const app = createApp();
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`🚀 Server starting on port ${port}`);
serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`✅ Server running on http://localhost:${info.port}`);
});
