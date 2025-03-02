import '../instrumentation.js';
import { env } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { createPool } from '../../packages/db/index.js';
import { createEventStore } from '../../packages/event-store/index.js';
import { nanoid } from 'nanoid';
import { faker } from '@faker-js/faker';
import opentelemetry from '@opentelemetry/api';

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_PORT,
} = env;

const clientConfig = {
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  user: POSTGRES_USER,
};

const publisherMeter = opentelemetry.metrics.getMeter('publisher');

const eventCounter = publisherMeter.createCounter('publisher.events.counter');

(async () => {
  const signal = AbortSignal.timeout(1_000 * 60 * 20);
  const db = createPool({
    ...clientConfig,
    signal,
  });
  const eventStore = createEventStore({ db });

  while (!signal.aborted) {
    await eventStore.appendEvent({
      events: [
        {
          type: 'initiated',
          version: 1,
          transactionId: nanoid(),
          payload: {
            amount: faker.finance.amount(),
            date: faker.date.recent(),
          },
        },
      ],
    });
    await setTimeout(Math.ceil(Math.random() * 10));
    eventCounter.add(1);
  }
})();
