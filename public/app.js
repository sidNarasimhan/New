// Simple SPA Router
class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('load', () => this.route());
  }

  on(path, handler) {
    this.routes[path] = handler;
  }

  route() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, ...params] = hash.split('/').filter(Boolean);
    const route = path ? `/${path}` : '/';

    const handler = this.routes[route] || this.routes['/'];
    if (handler) {
      handler(...params);
    }
  }
}

const router = new Router();
const API_BASE = '';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert('Copied to clipboard!');
}

async function api(endpoint, options = {}) {
  const response = await fetch(API_BASE + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

// Home Page
router.on('/', () => {
  document.getElementById('content').innerHTML = `
    <div class="hero">
      <h1>Webhook Testing & Cron Monitoring</h1>
      <p>Catch webhooks instantly. Monitor cron jobs reliably. All in one simple tool.</p>
      <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
        <button class="btn btn-primary" onclick="createWebhookEndpoint()">
          🪝 Create Webhook Endpoint
        </button>
        <button class="btn btn-secondary" onclick="window.location.hash = '#/monitor/new'">
          ⏰ Create Cron Monitor
        </button>
      </div>
    </div>

    <div style="margin-top: 4rem;">
      <h2 style="text-align: center; margin-bottom: 2rem;">Why HookCatch?</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
        <div class="card">
          <h3>⚡ Instant Setup</h3>
          <p>Get a webhook URL in seconds. No signup required for testing.</p>
        </div>
        <div class="card">
          <h3>🔍 Full Inspection</h3>
          <p>See headers, body, query params - everything about your requests.</p>
        </div>
        <div class="card">
          <h3>🔔 Smart Alerts</h3>
          <p>Get notified when cron jobs fail. Email and webhook alerts.</p>
        </div>
        <div class="card">
          <h3>💰 Affordable</h3>
          <p>Free tier for testing. Premium starts at just $9/month.</p>
        </div>
      </div>
    </div>
  `;
});

// Pricing Page
router.on('/pricing', () => {
  document.getElementById('content').innerHTML = `
    <h1 style="text-align: center; margin-bottom: 3rem;">Simple, Transparent Pricing</h1>

    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Free</h3>
        <div class="price">$0<span>/month</span></div>
        <ul class="features">
          <li>3 webhook endpoints</li>
          <li>100 requests/month</li>
          <li>24-hour retention</li>
          <li>Basic inspection</li>
          <li>Community support</li>
        </ul>
        <button class="btn btn-secondary" onclick="window.location.hash = '#/'">Get Started</button>
      </div>

      <div class="pricing-card featured">
        <h3>Pro</h3>
        <div class="price">$9<span>/month</span></div>
        <ul class="features">
          <li>20 webhook endpoints</li>
          <li>10,000 requests/month</li>
          <li>30-day retention</li>
          <li>10 cron monitors</li>
          <li>Email alerts</li>
          <li>Priority support</li>
        </ul>
        <button class="btn btn-primary">Coming Soon</button>
      </div>

      <div class="pricing-card">
        <h3>Team</h3>
        <div class="price">$29<span>/month</span></div>
        <ul class="features">
          <li>Unlimited endpoints</li>
          <li>Unlimited requests</li>
          <li>90-day retention</li>
          <li>Unlimited cron monitors</li>
          <li>Custom domains</li>
          <li>Slack integration</li>
          <li>Dedicated support</li>
        </ul>
        <button class="btn btn-primary">Coming Soon</button>
      </div>
    </div>
  `;
});

// Docs Page
router.on('/docs', () => {
  document.getElementById('content').innerHTML = `
    <h1>Documentation</h1>

    <div class="card">
      <h3>📖 Quick Start: Webhook Testing</h3>
      <ol style="margin-left: 1.5rem; line-height: 2;">
        <li>Click "Create Webhook Endpoint" on the home page</li>
        <li>Copy your unique webhook URL</li>
        <li>Send POST/GET requests to test</li>
        <li>View all requests in real-time</li>
      </ol>

      <div class="code-block">
        <button class="copy-btn btn btn-secondary" onclick="copyToClipboard('curl -X POST https://hookcatch.dev/hook/abc123 -H \\'Content-Type: application/json\\' -d \\'{&quot;test&quot;: &quot;data&quot;}\\'')">Copy</button>
        <code>curl -X POST https://hookcatch.dev/hook/abc123 \\
  -H 'Content-Type: application/json' \\
  -d '{"test": "data"}'</code>
      </div>
    </div>

    <div class="card">
      <h3>⏰ Quick Start: Cron Monitoring</h3>
      <ol style="margin-left: 1.5rem; line-height: 2;">
        <li>Create a new cron monitor</li>
        <li>Set your schedule (e.g., "*/5 * * * *" for every 5 minutes)</li>
        <li>Add the check URL to your cron job</li>
        <li>Get alerted if your job fails to ping</li>
      </ol>

      <div class="code-block">
        <button class="copy-btn btn btn-secondary" onclick="copyToClipboard('*/5 * * * * /path/to/job.sh && curl -X POST https://hookcatch.dev/api/monitors/xyz789/check')">Copy</button>
        <code># Run every 5 minutes and ping HookCatch
*/5 * * * * /path/to/job.sh && curl -X POST https://hookcatch.dev/api/monitors/xyz789/check</code>
      </div>
    </div>

    <div class="card">
      <h3>🔌 API Reference</h3>
      <p><strong>Create Endpoint:</strong> POST /api/endpoints</p>
      <p><strong>View Requests:</strong> GET /api/endpoints/:id</p>
      <p><strong>Create Monitor:</strong> POST /api/monitors</p>
      <p><strong>Check Monitor:</strong> POST /api/monitors/:id/check</p>
    </div>
  `;
});

// Endpoint View
router.on('/endpoint', (endpointId) => {
  if (!endpointId) {
    window.location.hash = '#/';
    return;
  }

  loadEndpoint(endpointId);
});

async function loadEndpoint(endpointId) {
  document.getElementById('content').innerHTML = '<div class="loading">Loading endpoint...</div>';

  try {
    const data = await api(`/api/endpoints/${endpointId}`);
    const webhookUrl = `${window.location.origin}/hook/${endpointId}`;

    document.getElementById('content').innerHTML = `
      <div class="card">
        <h2>🪝 Webhook Endpoint</h2>
        <p style="color: var(--text-secondary);">Created: ${formatDate(data.endpoint.created_at)}</p>

        <div style="margin-top: 1rem;">
          <label style="font-weight: bold;">Your Webhook URL:</label>
          <div class="code-block" style="margin-top: 0.5rem;">
            <button class="copy-btn btn btn-secondary" onclick="copyToClipboard('${webhookUrl}')">Copy</button>
            <code>${webhookUrl}</code>
          </div>
        </div>

        <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <strong>Total Requests:</strong> ${data.endpoint.request_count || 0}
          </div>
          <div>
            <strong>Last Request:</strong> ${data.endpoint.last_request_at ? formatDate(data.endpoint.last_request_at) : 'Never'}
          </div>
        </div>

        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="loadEndpoint('${endpointId}')">
          🔄 Refresh
        </button>
      </div>

      <div class="card">
        <h3>Recent Requests (${data.requests.length})</h3>
        ${data.requests.length === 0 ? '<p style="color: var(--text-secondary);">No requests yet. Send a test request to your webhook URL above.</p>' : ''}
        <div id="requests-list">
          ${data.requests.map(req => `
            <div class="request-item" onclick="toggleRequestDetails('${req.id}')">
              <div class="request-header">
                <div>
                  <span class="method method-${req.method}">${req.method}</span>
                  <span style="margin-left: 1rem;">${req.ip_address}</span>
                </div>
                <span class="timestamp">${formatDate(req.created_at)}</span>
              </div>
              <div id="details-${req.id}" style="display: none; margin-top: 1rem;">
                <div style="margin-bottom: 1rem;">
                  <strong>Headers:</strong>
                  <pre style="background: var(--bg); padding: 0.5rem; border-radius: 0.25rem; overflow-x: auto;">${JSON.stringify(req.headers, null, 2)}</pre>
                </div>
                ${req.body ? `
                  <div>
                    <strong>Body:</strong>
                    <pre style="background: var(--bg); padding: 0.5rem; border-radius: 0.25rem; overflow-x: auto;">${req.body}</pre>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    document.getElementById('content').innerHTML = `
      <div class="card">
        <h3 style="color: var(--danger);">Error Loading Endpoint</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="window.location.hash = '#/'">Go Home</button>
      </div>
    `;
  }
}

function toggleRequestDetails(requestId) {
  const details = document.getElementById(`details-${requestId}`);
  details.style.display = details.style.display === 'none' ? 'block' : 'none';
}

// Create Webhook Endpoint
async function createWebhookEndpoint() {
  try {
    const data = await api('/api/endpoints', { method: 'POST' });
    window.location.hash = `#/endpoint/${data.id}`;
  } catch (error) {
    alert('Error creating endpoint: ' + error.message);
  }
}

// Monitor Management
router.on('/monitor', (action) => {
  if (action === 'new') {
    showCreateMonitorForm();
  }
});

function showCreateMonitorForm() {
  document.getElementById('content').innerHTML = `
    <div class="card">
      <h2>⏰ Create Cron Monitor</h2>
      <form onsubmit="createMonitor(event)">
        <div class="form-group">
          <label>Monitor Name</label>
          <input type="text" id="monitor-name" required placeholder="My Daily Backup">
        </div>

        <div class="form-group">
          <label>Schedule (cron format)</label>
          <input type="text" id="monitor-schedule" required placeholder="0 2 * * *" value="0 2 * * *">
          <small style="color: var(--text-secondary);">Examples: "0 2 * * *" (daily at 2am), "*/5 * * * *" (every 5 min)</small>
        </div>

        <div class="form-group">
          <label>Alert Email (optional)</label>
          <input type="email" id="monitor-email" placeholder="you@example.com">
        </div>

        <div class="form-group">
          <label>Grace Period (seconds)</label>
          <input type="number" id="monitor-grace" value="300" required>
          <small style="color: var(--text-secondary);">How long to wait after expected ping before alerting</small>
        </div>

        <button type="submit" class="btn btn-primary">Create Monitor</button>
      </form>
    </div>
  `;
}

async function createMonitor(event) {
  event.preventDefault();

  const name = document.getElementById('monitor-name').value;
  const schedule = document.getElementById('monitor-schedule').value;
  const alertEmail = document.getElementById('monitor-email').value;
  const gracePeriod = parseInt(document.getElementById('monitor-grace').value);

  try {
    const data = await api('/api/monitors', {
      method: 'POST',
      body: JSON.stringify({
        name,
        schedule,
        pingUrl: 'placeholder',
        alertEmail: alertEmail || null,
        gracePeriod
      })
    });

    alert(`Monitor created! Add this to your cron job:\n\ncurl -X POST ${data.check_url}`);
    window.location.hash = '#/';
  } catch (error) {
    alert('Error creating monitor: ' + error.message);
  }
}

// Make functions globally available
window.createWebhookEndpoint = createWebhookEndpoint;
window.createMonitor = createMonitor;
window.loadEndpoint = loadEndpoint;
window.toggleRequestDetails = toggleRequestDetails;
window.copyToClipboard = copyToClipboard;
