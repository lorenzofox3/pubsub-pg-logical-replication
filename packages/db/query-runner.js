export const createQueryRunner = ({ client }) => {
  return {
    async query(query) {
      const { rows } = await client.query(query);
      return rows;
    },
    async one(query) {
      const { rows } = await client.query(query);
      return rows.at(0);
    },
  };
};
