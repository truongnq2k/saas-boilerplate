import cron from 'node-cron';

type CronTask = {
  task: cron.ScheduledTask;
  description: string;
};

const jobs: CronTask[] = [];

export function initializeJobs() {
  console.log('⏰ Job scheduler initialized (no jobs configured)');
}

export function stopAllJobs() {
  jobs.forEach(({ task, description }) => {
    task.stop();
    console.log(`⏰ Stopped job: ${description}`);
  });
  console.log('⏰ All jobs stopped');
}

export function registerJob(cronExpression: string, task: () => void, description: string) {
  const scheduledTask = cron.schedule(cronExpression, task);
  jobs.push({ task: scheduledTask, description });
  console.log(`⏰ Registered job: ${description} (${cronExpression})`);
}
