import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../data/hookcatch.db');
const dbDir = dirname(dbPath);

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  -- Endpoints table (webhook URLs)
  CREATE TABLE IF NOT EXISTS endpoints (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    last_request_at INTEGER,
    request_count INTEGER DEFAULT 0,
    is_premium INTEGER DEFAULT 0
  );

  -- Requests table (captured webhook requests)
  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    endpoint_id TEXT NOT NULL,
    method TEXT NOT NULL,
    headers TEXT NOT NULL,
    body TEXT,
    query TEXT,
    ip_address TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE
  );

  -- Cron monitors table
  CREATE TABLE IF NOT EXISTS cron_monitors (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    schedule TEXT NOT NULL,
    ping_url TEXT NOT NULL,
    alert_email TEXT,
    alert_webhook TEXT,
    last_ping_at INTEGER,
    status TEXT DEFAULT 'waiting',
    grace_period INTEGER DEFAULT 300,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    is_premium INTEGER DEFAULT 0
  );

  -- Cron pings table (health check history)
  CREATE TABLE IF NOT EXISTS cron_pings (
    id TEXT PRIMARY KEY,
    monitor_id TEXT NOT NULL,
    status TEXT NOT NULL,
    response_time INTEGER,
    error_message TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (monitor_id) REFERENCES cron_monitors(id) ON DELETE CASCADE
  );

  -- Users table (for premium features)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free',
    subscription_plan TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_requests_endpoint ON requests(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_cron_pings_monitor ON cron_pings(monitor_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_endpoints_user ON endpoints(user_id);
  CREATE INDEX IF NOT EXISTS idx_monitors_user ON cron_monitors(user_id);
`);

// Helper functions
export const queries = {
  // Endpoints
  createEndpoint: db.prepare('INSERT INTO endpoints (id, user_id) VALUES (?, ?)'),
  getEndpoint: db.prepare('SELECT * FROM endpoints WHERE id = ?'),
  updateEndpointStats: db.prepare(`
    UPDATE endpoints
    SET last_request_at = ?, request_count = request_count + 1
    WHERE id = ?
  `),
  deleteOldRequests: db.prepare(`
    DELETE FROM requests
    WHERE endpoint_id = ?
    AND created_at < ?
  `),

  // Requests
  createRequest: db.prepare(`
    INSERT INTO requests (id, endpoint_id, method, headers, body, query, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  getRequests: db.prepare(`
    SELECT * FROM requests
    WHERE endpoint_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `),
  getRequest: db.prepare('SELECT * FROM requests WHERE id = ?'),

  // Cron Monitors
  createMonitor: db.prepare(`
    INSERT INTO cron_monitors (id, user_id, name, schedule, ping_url, alert_email, grace_period)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  getMonitor: db.prepare('SELECT * FROM cron_monitors WHERE id = ?'),
  getAllMonitors: db.prepare('SELECT * FROM cron_monitors'),
  updateMonitorPing: db.prepare(`
    UPDATE cron_monitors
    SET last_ping_at = ?, status = ?
    WHERE id = ?
  `),

  // Cron Pings
  createPing: db.prepare(`
    INSERT INTO cron_pings (id, monitor_id, status, response_time, error_message)
    VALUES (?, ?, ?, ?, ?)
  `),
  getPings: db.prepare(`
    SELECT * FROM cron_pings
    WHERE monitor_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `),

  // Users
  createUser: db.prepare('INSERT INTO users (id, email) VALUES (?, ?)'),
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  updateUserSubscription: db.prepare(`
    UPDATE users
    SET stripe_customer_id = ?, subscription_status = ?, subscription_plan = ?
    WHERE id = ?
  `)
};

export default db;
