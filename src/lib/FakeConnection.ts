import { Connection, Driver } from 'typeorm';
import { FakeDriverFactory } from './FakeDriverFactory';

export class FakeConnection extends Connection {
  _driver: Driver;
  get driver(): Driver {
    return this._driver;
  }
  set driver(options) {
    this._driver = new FakeDriverFactory().create(this);
  }
  async close() {
    (this as any)['isConnected'] = false;
  }
}
