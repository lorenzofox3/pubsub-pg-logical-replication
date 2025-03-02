import { SQL } from '../db/index.js';
import assert from 'node:assert';

export const createEventStore = ({ db }) => {
  return {
    getStream({ transactionId }) {
      return db.query(
        SQL`SELECT position,
                   event_type as type,
                   transaction_id  as "transactionId",
                   payload,
                   version
            FROM transaction_events
            WHERE transaction_id = ${transactionId}
            ORDER BY version`,
      );
    },
    appendEvent({ events }) {
      assert(events.length > 0, 'at least one event should be provided');

      const query = SQL`INSERT INTO transaction_events(event_type, transaction_id, payload, version) VALUES `;

      for (const {
        type,
        transactionId,
        payload = null,
        version = 1,
      } of events) {
        assert(type, 'type is required');
        assert(transactionId, 'transactionId is required');
        query.append(SQL`(${type}, ${transactionId}, ${payload}, ${version})`);
      }

      query.append(SQL`returning position`);

      return db.query(query);
    },
  };
};
