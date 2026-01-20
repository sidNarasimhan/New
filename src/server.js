import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db, { queries } from './db.js';
import { cronMonitor } from './cronMonitor.js';
import { sendAlert } from './alerts.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for simplicity
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(join(__dirname, '../public')));

// ============================================================================
// WEBHOOK ENDPOINTS
// ============================================================================

// Create new endpoint
app.post('/api/endpoints', (req, res) => {
  try {
    const endpointId = nanoid(12);
    const userId = req.body.userId || null;

    queries.createEndpoint.run(endpointId, userId);

    res.json({
      id: endpointId,
      url: `${process.env.BASE_URL || 'http://localhost:3000'}/hook/${endpointId}`,
      created_at: Date.now()
    });
  } catch (error) {
    console.error('Error creating endpoint:', error);
    res.status(500).json({ error: 'Failed to create endpoint' });
  }
});

// Get endpoint details and requests
app.get('/api/endpoints/:id', (req, res) => {
  try {
    const endpoint = queries.getEndpoint.get(req.params.id);

    if (!endpoint) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    const requests = queries.getRequests.all(req.params.id, 50);

    res.json({
      endpoint,
      requests: requests.map(r => ({
        ...r,
        headers: JSON.parse(r.headers),
        query: r.query ? JSON.parse(r.query) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch endpoint' });
  }
});

// Catch all webhook requests
app.all('/hook/:id', async (req, res) => {
  try {
    const endpointId = req.params.id;
    const endpoint = queries.getEndpoint.get(endpointId);

    if (!endpoint) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    // Store the request
    const requestId = nanoid(16);
    const now = Math.floor(Date.now() / 1000);

    queries.createRequest.run(
      requestId,
      endpointId,
      req.method,
      JSON.stringify(req.headers),
      typeof req.body === 'object' ? JSON.stringify(req.body) : req.body?.toString() || '',
      JSON.stringify(req.query),
      req.ip || req.connection.remoteAddress
    );

    // Update endpoint stats
    queries.updateEndpointStats.run(now, endpointId);

    // Cleanup old requests (free tier: 24h retention)
    const retentionPeriod = endpoint.is_premium ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    queries.deleteOldRequests.run(endpointId, now - retentionPeriod);

    res.json({
      success: true,
      message: 'Request captured',
      request_id: requestId,
      view_url: `${process.env.BASE_URL || 'http://localhost:3000'}/#/endpoint/${endpointId}`
    });
  } catch (error) {
    console.error('Error capturing webhook:', error);
    res.status(500).json({ error: 'Failed to capture request' });
  }
});

// ============================================================================
// CRON MONITORING
// ============================================================================

// Create new cron monitor
app.post('/api/monitors', (req, res) => {
  try {
    const { name, schedule, pingUrl, alertEmail, gracePeriod } = req.body;

    if (!name || !schedule || !pingUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const monitorId = nanoid(12);
    const userId = req.body.userId || null;

    queries.createMonitor.run(
      monitorId,
      userId,
      name,
      schedule,
      pingUrl,
      alertEmail || null,
      gracePeriod || 300
    );

    res.json({
      id: monitorId,
      name,
      check_url: `${process.env.BASE_URL || 'http://localhost:3000'}/api/monitors/${monitorId}/check`,
      created_at: Date.now()
    });
  } catch (error) {
    console.error('Error creating monitor:', error);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Check/ping a monitor
app.post('/api/monitors/:id/check', async (req, res) => {
  try {
    const monitor = queries.getMonitor.get(req.params.id);

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const pingId = nanoid(16);
    const now = Math.floor(Date.now() / 1000);

    queries.createPing.run(pingId, monitor.id, 'success', Date.now(), null);
    queries.updateMonitorPing.run(now, 'healthy', monitor.id);

    res.json({ success: true, message: 'Health check recorded' });
  } catch (error) {
    console.error('Error checking monitor:', error);
    res.status(500).json({ error: 'Failed to record check' });
  }
});

// Get monitor details
app.get('/api/monitors/:id', (req, res) => {
  try {
    const monitor = queries.getMonitor.get(req.params.id);

    if (!monitor) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const pings = queries.getPings.all(monitor.id, 50);

    res.json({ monitor, pings });
  } catch (error) {
    console.error('Error fetching monitor:', error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// ============================================================================
// FRONTEND ROUTES
// ============================================================================

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║         🪝 HookCatch is running!                  ║
  ║                                                   ║
  ║         http://localhost:${PORT}                    ║
  ║                                                   ║
  ║   Webhook Testing & Cron Monitoring Made Simple  ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);

  // Start cron monitor
  cronMonitor.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close();
  process.exit(0);
});
