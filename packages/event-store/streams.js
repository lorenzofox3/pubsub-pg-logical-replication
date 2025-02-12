const identity = (x) => x;

export const createStreamReducer =
  ({ eventHandlers }) =>
  ({ events = [] }) => {
    return events.reduce(
      (aggregate, event) => {
        const handler = eventHandlers[event.type] ?? identity;
        return handler(aggregate, event);
      },
      { version: 0 },
    );
  };
