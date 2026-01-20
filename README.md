# 🪝 HookCatch

**Webhook Testing & Cron Monitoring Made Simple**

HookCatch is a lightweight SaaS tool that helps developers test webhooks and monitor cron jobs with ease. No signup required to get started!

## 🚀 Features

### Webhook Testing
- ⚡ **Instant Setup** - Get a unique webhook URL in seconds
- 🔍 **Full Inspection** - View headers, body, query params, and more
- 💾 **Request History** - All requests are stored and retrievable
- 🔄 **Real-time Updates** - See requests as they arrive

### Cron Monitoring
- ⏰ **Scheduled Checks** - Monitor your cron jobs and scheduled tasks
- 🔔 **Smart Alerts** - Get notified via email or webhook when jobs fail
- 📊 **Health History** - Track the health of your scheduled tasks over time
- ⚙️ **Configurable Grace Periods** - Set custom timeout windows

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 3 endpoints, 100 requests/month, 24h retention |
| **Pro** | $9/month | 20 endpoints, 10K requests/month, 30-day retention, 10 cron monitors, email alerts |
| **Team** | $29/month | Unlimited everything, custom domains, Slack integration |

## 🏃 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hookcatch.git
   cd hookcatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Testing a Webhook

```bash
# Create an endpoint (or use the UI)
curl -X POST http://localhost:3000/api/endpoints

# Send a test request
curl -X POST http://localhost:3000/hook/YOUR_ENDPOINT_ID \
  -H 'Content-Type: application/json' \
  -d '{"test": "data", "timestamp": 1234567890}'

# View in browser
open http://localhost:3000/#/endpoint/YOUR_ENDPOINT_ID
```

### Setting Up Cron Monitoring

```bash
# Add to your crontab
*/5 * * * * /path/to/your/job.sh && curl -X POST http://localhost:3000/api/monitors/YOUR_MONITOR_ID/check
```

If your job doesn't ping within the grace period, you'll get an alert!

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: Vanilla JavaScript (no framework needed!)
- **Styling**: Custom CSS with dark theme
- **Deployment**: Works anywhere Node.js runs

## 📦 Deployment

### Deploy to a VPS (DigitalOcean, Linode, etc.)

```bash
# On your server
git clone https://github.com/yourusername/hookcatch.git
cd hookcatch
npm install --production
cp .env.example .env
# Edit .env with production settings

# Run with PM2 (recommended)
npm install -g pm2
pm2 start src/server.js --name hookcatch
pm2 save
pm2 startup
```

### Deploy to Railway / Render / Fly.io

1. Connect your GitHub repository
2. Set environment variables
3. Deploy! These platforms auto-detect Node.js apps

### Environment Variables

```env
PORT=3000
NODE_ENV=production
BASE_URL=https://yourdomain.com

# Email alerts (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payments (coming soon)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🎯 Use Cases

- **API Development** - Test webhooks from Stripe, GitHub, Twilio, etc.
- **CI/CD Pipelines** - Monitor deployment cron jobs
- **Backup Scripts** - Get alerted when backups fail
- **Data Sync Jobs** - Track scheduled data synchronization
- **Debugging** - Inspect webhook payloads in real-time

## 🤝 Contributing

Contributions welcome! This is an open-source project built to solve real developer problems.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with inspiration from:
- [Webhook.site](https://webhook.site) - For webhook testing
- [Healthchecks.io](https://healthchecks.io) - For cron monitoring
- Every developer who's ever needed to debug a webhook at 2 AM

## 📬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/hookcatch/issues)
- **Twitter**: [@hookcatch](https://twitter.com/hookcatch)
- **Email**: support@hookcatch.dev

---

**Made with ❤️ by developers, for developers**

*Catch webhooks. Monitor crons. Stay sane.*
