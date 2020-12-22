import {
  DynamicModule,
  Global,
  Inject,
  Module,
  Provider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  generateString,
  getConnectionToken,
  getEntityManagerToken,
} from '@nestjs/typeorm/dist/common/typeorm.utils';
import { EntitiesMetadataStorage } from '@nestjs/typeorm/dist/entities-metadata.storage';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces';
import {
  DEFAULT_CONNECTION_NAME,
  TYPEORM_MODULE_ID,
  TYPEORM_MODULE_OPTIONS,
} from '@nestjs/typeorm/dist/typeorm.constants';
import { Connection, ConnectionOptions } from 'typeorm';

import {
  createFakeConnection,
  FakeConnectionOptions,
} from './createFakeConnection';

/**
 * A fake TypeOrmMockModule as a copy because it's not available to inherit from @nestjs/typeorm.
 * The only change is in `createConnectionFactory` where `createConnection` is replaced by
 * `createFakeConnection`.
 */
@Global()
@Module({})
export class TypeOrmTestCoreModule {
  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(
    options: FakeConnectionOptions = {
      type: 'postgres',
      name: DEFAULT_CONNECTION_NAME,
      entities: [],
    },
  ): DynamicModule {
    const typeOrmModuleOptions = {
      provide: TYPEORM_MODULE_OPTIONS,
      useValue: options,
    };
    const connectionProvider = {
      provide: getConnectionToken(options as ConnectionOptions) as string,
      useFactory: async () => await this.createConnectionFactory(options),
    };
    const entityManagerProvider = this.createEntityManagerProvider(
      options as ConnectionOptions,
    );
    return {
      module: TypeOrmTestCoreModule,
      providers: [
        entityManagerProvider,
        connectionProvider,
        typeOrmModuleOptions,
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  static forRootAsync(options: FakeConnectionOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options as ConnectionOptions) as string,
      useFactory: async () => {
        return await this.createConnectionFactory(options);
      },
      inject: [TYPEORM_MODULE_OPTIONS],
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options as ConnectionOptions) as string,
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options as ConnectionOptions)],
    };

    return {
      module: TypeOrmTestCoreModule,
      providers: [
        entityManagerProvider,
        connectionProvider,
        {
          provide: TYPEORM_MODULE_ID,
          useValue: generateString(),
        },
        {
          provide: TYPEORM_MODULE_OPTIONS,
          useFactory: () => options,
        },
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  private static createEntityManagerProvider(
    options: ConnectionOptions,
  ): Provider {
    return {
      provide: getEntityManagerToken(options) as string,
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options)],
    };
  }

  private static async createConnectionFactory(
    options: FakeConnectionOptions,
  ): Promise<Connection> {
    const connectionToken = options.name || DEFAULT_CONNECTION_NAME;
    let entities = options.entities;
    if (entities) {
      entities = entities.concat(
        EntitiesMetadataStorage.getEntitiesByConnection(connectionToken),
      );
    } else {
      entities = EntitiesMetadataStorage.getEntitiesByConnection(
        connectionToken,
      );
    }
    return createFakeConnection({
      ...options,
      entities,
    });
  }
}
