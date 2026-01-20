import cron from 'node-cron';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { queries } from './db.js';
import { sendAlert } from './alerts.js';

class CronMonitor {
  constructor() {
    this.checkInterval = null;
  }

  start() {
    console.log('🔍 Starting cron monitor service...');

    // Check all monitors every minute
    this.checkInterval = cron.schedule('* * * * *', async () => {
      await this.checkAllMonitors();
    });

    console.log('✅ Cron monitor service started');
  }

  async checkAllMonitors() {
    try {
      const monitors = queries.getAllMonitors.all();

      for (const monitor of monitors) {
        await this.checkMonitor(monitor);
      }
    } catch (error) {
      console.error('Error in monitor check cycle:', error);
    }
  }

  async checkMonitor(monitor) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const timeSinceLastPing = monitor.last_ping_at ? now - monitor.last_ping_at : null;

      // If no ping received yet, skip
      if (!monitor.last_ping_at) {
        return;
      }

      // Check if monitor is overdue (last ping + grace period)
      const isOverdue = timeSinceLastPing > monitor.grace_period;

      if (isOverdue && monitor.status === 'healthy') {
        // Monitor has failed!
        const pingId = nanoid(16);

        queries.createPing.run(
          pingId,
          monitor.id,
          'failed',
          null,
          `No ping received for ${timeSinceLastPing}s (grace period: ${monitor.grace_period}s)`
        );

        queries.updateMonitorPing.run(now, 'failed', monitor.id);

        // Send alert
        if (monitor.alert_email) {
          await sendAlert({
            type: 'email',
            to: monitor.alert_email,
            subject: `🚨 Monitor Failed: ${monitor.name}`,
            message: `Your cron monitor "${monitor.name}" has failed.\n\nLast ping: ${timeSinceLastPing}s ago\nExpected: Every ${monitor.grace_period}s\n\nSchedule: ${monitor.schedule}`
          });
        }

        if (monitor.alert_webhook) {
          await sendAlert({
            type: 'webhook',
            url: monitor.alert_webhook,
            data: {
              monitor_id: monitor.id,
              monitor_name: monitor.name,
              status: 'failed',
              last_ping_at: monitor.last_ping_at,
              time_since_ping: timeSinceLastPing,
              grace_period: monitor.grace_period
            }
          });
        }

        console.log(`🚨 Monitor failed: ${monitor.name} (ID: ${monitor.id})`);
      }
    } catch (error) {
      console.error(`Error checking monitor ${monitor.id}:`, error);
    }
  }

  stop() {
    if (this.checkInterval) {
      this.checkInterval.stop();
      console.log('Cron monitor service stopped');
    }
  }
}

export const cronMonitor = new CronMonitor();
