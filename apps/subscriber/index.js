import '../instrumentation.js';
import { env } from 'node:process';
import { createPool } from '../../packages/db/index.js';
import opentelemetry, { ValueType } from '@opentelemetry/api';
import {
  createEventStore,
  createSubscription,
} from '../../packages/event-store/index.js';
import { createGetTransaction } from './get-transaction.js';
import { createSaveTransaction } from './save-transaction.js';

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

const subscriptionMeter = opentelemetry.metrics.getMeter('subscription');

const lag = subscriptionMeter.createHistogram('subscription.events.lag', {
  description:
    'duration between the commit time of a transaction and the processing by the subscription',
  unit: 'ms',
  valueType: ValueType.INT,
});

(async () => {
  const signal = AbortSignal.timeout(1_000 * 60 * 25);
  const db = createPool({
    ...clientConfig,
    signal,
  });
  const eventStore = createEventStore({ db });

  const getTransaction = createGetTransaction({ eventStore });
  const saveTransaction = createSaveTransaction({ db });

  const subscription = createSubscription({
    subscriptionName: 'test_slot',
    clientConfig,
    handler: transactionHandler,
  });

  await subscription.listen();

  async function transactionHandler({ transaction: dbTransaction }) {
    const { events } = dbTransaction;
    await Promise.all(
      events.map(({ transaction_id: transactionId }) =>
        getTransaction({
          transactionId,
        }).then((transaction) => saveTransaction({ transaction })),
      ),
    );

    lag.record(dbTransaction.replicationLagMs);
  }
})();
