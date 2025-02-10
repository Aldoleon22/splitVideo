import videoQueue from './src/lib/queue.js';

async function checkJobStatus(jobId) {
  try {
    const job = await videoQueue.getJob(jobId);
    if (job) {
      const state = await job.getState();
      console.log(`Job ${jobId} status: ${state}`);
      if (state === 'completed') {
        const result = await job.getResult();
        console.log('Job result:', result);
      }
    } else {
      console.log(`Job ${jobId} not found`);
    }
  } catch (error) {
    console.error('Error checking job status:', error);
  }
}

// Vérifier le statut du job avec l'ID 1
checkJobStatus(1);

