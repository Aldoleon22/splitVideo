import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import videoQueue from './lib/queue.js';

const serverAdapter = new ExpressAdapter();

createBullBoard({
  queues: [new BullAdapter(videoQueue)],
  serverAdapter,
});

serverAdapter.setBasePath('/admin/queues');

export { serverAdapter };

