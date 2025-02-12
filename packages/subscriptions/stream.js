import { Readable } from 'node:stream';
import { createSubscription } from './subscription.js';

export const createSubscriptionStream = ({
  subscriptionName,
  publicationName,
  clientConfig,
}) => {
  const onError = (...args) => console.error(...args);
  const onData = (data) => {
    const canPush = stream.push(data);
    source.acknowledge(data);
    if (!canPush) {
      source.stop();
    }
  };

  const source = createSubscription({
    subscriptionName,
    publicationName,
    onError,
    onData,
    clientConfig,
  });

  const stream = new Readable({
    highWaterMark: 200,
    objectMode: true,
    read() {
      if (!source.isListening) {
        source.listen();
      }
    },
  });

  return stream;
};
