import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import refisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queue = {};
    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queue[key] = {
        bee: new Bee(key, {
          redis: refisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queue[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queue[job.key];

      bee.process(handle);
    });
  }
}
export default new Queue();
