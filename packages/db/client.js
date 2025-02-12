import { createQueryRunner } from './query-runner.js';

const getTransactionParameters = (handlerOrOptions) => {
  return typeof handlerOrOptions === 'function'
    ? {
        fn: handlerOrOptions,
        transactionIsolationLevel: 'READ COMMITTED',
      }
    : handlerOrOptions;
};

export const createClient = ({ client }) => {
  const queryRunner = createQueryRunner({ client });
  return {
    ...queryRunner,
    async withinTransaction(handlerOrOptions) {
      const { transactionIsolationLevel, fn } =
        getTransactionParameters(handlerOrOptions);
      try {
        await queryRunner.query(
          `BEGIN TRANSACTION ISOLATION LEVEL ${transactionIsolationLevel};`,
        );
        const db = {
          ...queryRunner,
          withinTransaction(handlerOrOptions) {
            const { fn } = getTransactionParameters(handlerOrOptions);
            return fn({ db });
          },
        };

        const result = await fn({
          db,
        });

        await queryRunner.query('COMMIT');

        return result;
      } catch (error) {
        await queryRunner.query('ROLLBACK;');
        throw error;
      }
    },
  };
};
