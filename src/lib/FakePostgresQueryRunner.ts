import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

export class FakePostgresQueryRunner extends PostgresQueryRunner {
  release(): Promise<void> {
    return Promise.resolve();
  }
}
