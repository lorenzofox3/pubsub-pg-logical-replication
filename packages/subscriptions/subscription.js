import {
  LogicalReplicationService,
  PgoutputPlugin,
} from 'pg-logical-replication';

export const createSubscription = ({
  subscriptionName,
  publicationName,
  onData,
  onError,
  clientConfig,
}) => {
  let lastLsn;

  const replicationService = new LogicalReplicationService(clientConfig, {
    acknowledge: { auto: false, timeoutSeconds: 0 },
  });

  const eventDecoder = new PgoutputPlugin({
    protoVersion: 4,
    binary: true,
    publicationNames: [publicationName],
  });

  replicationService.on('data', async (lsn, message) => {
    lastLsn = lsn;
    onData({ lsn, message });
  });

  replicationService.on('error', onError);

  replicationService.on('heartbeat', async (lsn, timestamp, shouldRespond) => {
    if (shouldRespond) await replicationService.acknowledge(lsn);
  });

  const listen = () => {
    return replicationService.subscribe(
      eventDecoder,
      subscriptionName,
      lastLsn,
    );
  };

  return {
    get isListening() {
      return !replicationService.isStop();
    },
    listen,
    acknowledge({ lsn }) {
      return replicationService.acknowledge(lsn);
    },
    stop() {
      return replicationService.stop();
    },
  };
};
