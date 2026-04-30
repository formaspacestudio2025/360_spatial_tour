import { generateWorkOrders } from './maintenance.service';
import { checkAndEscalateSLA } from './issue.service';

class CronService {
  private interval: NodeJS.Timeout | null = null;

  start() {
    console.log('Cron Service started - hourly checks active');
    
    // Run immediately on start
    this.runTasks();

    // Set interval for every hour
    this.interval = setInterval(() => {
      this.runTasks();
    }, 3600000); 
  }

  async runTasks() {
    try {
      console.log(`[Cron] Running scheduled tasks at ${new Date().toISOString()}`);
      
      const maintenanceCount = await generateWorkOrders();
      if (maintenanceCount > 0) {
        console.log(`[Cron] Generated ${maintenanceCount} maintenance work orders`);
      }

      const escalationResults = await checkAndEscalateSLA();
      if (escalationResults.length > 0) {
        console.log(`[Cron] Escalated ${escalationResults.length} issues via SLA rules`);
      }

    } catch (error) {
      console.error('[Cron] Task execution failed:', error);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

export const cronService = new CronService();
