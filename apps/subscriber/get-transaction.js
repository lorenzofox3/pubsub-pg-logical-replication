import { createStreamReducer } from '../../packages/event-store/index.js';

const transactionFromEvents = createStreamReducer({
  eventHandlers: {
    initiated(_, event) {
      return {
        transactionId: event.transactionId,
        status: 'initiated',
        amount: event.payload.amount,
        date: event.payload.date,
        version: 1,
      };
    },
    rejected(transaction, event) {
      return {
        ...transaction,
        status: 'rejected',
        authority: event.payload.authority,
        version: event.version,
      };
    },
    authorized(transaction, event) {
      return {
        ...transaction,
        status: 'authorized',
        authority: event.payload.authority,
        version: event.version,
      };
    },
  },
});

export const createGetTransaction =
  ({ eventStore }) =>
  async ({ transactionId }) => {
    const events = await eventStore.getStream({ transactionId });
    return transactionFromEvents({ events });
  };
