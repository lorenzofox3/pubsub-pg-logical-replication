import { Readable } from 'node:stream';
import {
  LogicalReplicationService,
  PgoutputPlugin,
} from 'pg-logical-replication';

export class LogicalReplicationStream extends Readable {
  #source;
  #lastLsn;
  #decoder;
  #slotName;

  constructor(
    {
      highWaterMark = 200,
      publicationName,
      clientConfig,
      slotName,
      onError = console.error,
    } = {
      highWaterMark: 200,
    },
  ) {
    super({ highWaterMark, objectMode: true });

    const replicationService = (this.#source = new LogicalReplicationService(
      clientConfig,
      {
        acknowledge: { auto: false, timeoutSeconds: 0 },
      },
    ));

    this.#slotName = slotName;
    this.#decoder = new PgoutputPlugin({
      protoVersion: 4,
      binary: true,
      publicationNames: [publicationName],
    });

    this.#source.on('data', async (lsn, message) => {
      if (!this.push({ lsn, message })) {
        await replicationService.stop();
      }
    });

    this.#source.on('error', onError);

    this.#source.on('heartbeat', async (lsn, timestamp, shouldRespond) => {
      if (shouldRespond) await replicationService.acknowledge(lsn);
    });
  }

  _read() {
    if (this.#source.isStop()) {
      this.#source.subscribe(this.#decoder, this.#slotName, this.#lastLsn);
    }
  }

  async acknowledge(lsn) {
    this.#lastLsn = lsn;
    await this.#source.acknowledge(lsn);
  }
}
