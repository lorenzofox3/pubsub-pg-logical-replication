import { SQL } from '../db/index.js';
import assert from 'node:assert';

export const createEventStore = ({ db }) => {
  return {
    getStream({ streamId }) {
      return db.query(
        SQL`SELECT position,
                   event_type as type,
                   stream_id  as "streamId",
                   payload,
                   meta,
                   version
            FROM events
            WHERE stream_id = ${streamId}
            ORDER BY version`,
      );
    },
    appendEvent({ events }) {
      assert(events.length > 0, 'at least one event should be provided');

      const query = SQL`INSERT INTO events(event_type, stream_id, payload, meta, version) VALUES `;

      for (const {
        type,
        streamId,
        payload = null,
        meta = null,
        version = 1,
      } of events) {
        assert(type, 'type is required');
        assert(streamId, 'streamId is required');
        query.append(
          SQL`(${type}, ${streamId}, ${payload}, ${meta}, ${version})`,
        );
      }

      query.append(SQL`returning position`);

      return db.query(query);
    },
  };
};
