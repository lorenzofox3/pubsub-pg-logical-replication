import { createClient } from './client.js';
import { createQueryRunner } from './query-runner.js';
import pg from 'pg';

export const createPool = ({ signal, ...config }) => {
  const pool = new pg.Pool(config);

  signal.addEventListener(
    'abort',
    () => {
      pool.end();
    },
    { once: true },
  );

  const queryRunner = createQueryRunner({ client: pool });

  return {
    ...queryRunner,
    async withinTransaction(handlerOrOptions) {
      const pgClient = await pool.connect();
      const db = createClient({ client: pgClient });
      try {
        return await db.withinTransaction(handlerOrOptions);
      } finally {
        pgClient.release();
      }
    },
  };
};
