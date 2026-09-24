import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'tests/e2e', workers:1, use:{ baseURL:'http://localhost:3101' }, webServer: { command:'npm run dev -- --port 3101', url:'http://localhost:3101/api/health/live', reuseExistingServer:false } });
