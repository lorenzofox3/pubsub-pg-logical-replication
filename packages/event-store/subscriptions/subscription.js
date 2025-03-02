import { LogicalReplicationStream } from './stream.js';

export const createSubscription = ({
  subscriptionName,
  clientConfig,
  handler,
}) => {
  const stream = new LogicalReplicationStream({
    subscriptionName,
    publicationName: 'test_publication',
    slotName: 'test_slot',
    clientConfig,
  });

  return {
    async listen() {
      for await (const transaction of groupByTransaction(stream)) {
        try {
          await handler({ transaction });
          await stream.acknowledge(transaction.commitEndLsn);
        } catch (err) {
          console.error(err);
        }
      }
    },
  };
};

async function* groupByTransaction(stream) {
  let currentTransaction = {};
  for await (const { message } of stream) {
    if (message.tag === 'begin') {
      currentTransaction = {
        commitLsn: message.commitLsn,
        events: [],
        xid: message.xid,
      };
    }

    if (message.tag === 'insert') {
      currentTransaction.events.push(message.new);
    }

    if (message.tag === 'commit') {
      const replicationLagMs = Date.now() - Number(message.commitTime / 1000n);
      currentTransaction.commitEndLsn = message.commitEndLsn;
      currentTransaction.replicationLagMs = replicationLagMs;
      yield currentTransaction;
    }
  }
}
