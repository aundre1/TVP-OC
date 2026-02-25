// ===========================================
// THE VIDEO POOL - Health Service
// ===========================================

import db from '../db/index.js';
import os from 'os';

export async function getDetailedHealth() {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let dbResponseMs = 0;

  try {
    const dbStart = Date.now();
    await db.query('SELECT 1');
    dbResponseMs = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = `error: ${e.message}`;
  }

  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  return {
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      responseMs: dbResponseMs,
    },
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      systemTotal: Math.round(totalMem / 1024 / 1024) + 'MB',
      systemFree: Math.round(freeMem / 1024 / 1024) + 'MB',
    },
    responseMs: Date.now() - start,
  };
}
