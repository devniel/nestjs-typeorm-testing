import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';

export class FakePostgresQueryRunner extends PostgresQueryRunner {
  release(): Promise<void> {
    return Promise.resolve();
  }
  query(_query: string, _parameters?: any[], _useStructuredResult?: boolean): Promise<any> {
    return Promise.resolve({
      records: []
    });
  }
}
