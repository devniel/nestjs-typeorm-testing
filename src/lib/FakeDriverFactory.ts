import { FakeConnection } from './FakeConnection';
import { DriverFactory } from 'typeorm/driver/DriverFactory';
import { FakeDBDriver } from './FakeDBDriver';
import { Driver } from 'typeorm';

export class FakeDriverFactory extends DriverFactory {
  create(connection: FakeConnection): Driver {
    return new FakeDBDriver(connection);
  }
}
