import { ConnectionOptions, ConnectionManager } from 'typeorm';
import { FakeConnection } from './FakeConnection';
import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError';

export class FakeConnectionManager extends ConnectionManager {
  // Complete copy from ConnectionManager.connect, but now the Connection class uses the fake driver.
  create(options: ConnectionOptions): FakeConnection {
    // check if such connection is already registered
    const existConnection = this.connections.find(
      connection => connection.name === (options.name || 'default'),
    );
    if (existConnection) {
      // if connection is registered and its not closed then throw an error
      if (existConnection.isConnected) {
        throw new AlreadyHasActiveConnectionError(options.name || 'default');
      }
      // if its registered but closed then simply remove it from the manager
      this.connections.splice(this.connections.indexOf(existConnection), 1);
    }
    // create a new connection
    const connection = new FakeConnection(options);
    this.connections.push(connection);
    return connection;
  }
}
