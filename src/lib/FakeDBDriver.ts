import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { fakeConnection } from './createFakeConnection';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';
import { FakePostgresQueryRunner } from './FakePostgresQueryRunner';

export class FakeDBDriver extends PostgresDriver {
  // Returning a fake connection to the master node.
  async connect(): Promise<void> {
    this.master = {
      connect: cb => {
        cb(null, fakeConnection, () => {});
      },
    };
    this.database = this.options.database;
  }
  createQueryRunner(mode): PostgresQueryRunner {
    return new FakePostgresQueryRunner(this, 'master');
  }
}
