import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  generateString,
  getConnectionName,
  getConnectionToken,
  getEntityManagerToken,
  handleRetry,
} from '@nestjs/typeorm/dist/common/typeorm.utils';
import { EntitiesMetadataStorage } from '@nestjs/typeorm/dist/entities-metadata.storage';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm/dist/interfaces';
import {
  DEFAULT_CONNECTION_NAME,
  TYPEORM_MODULE_ID,
  TYPEORM_MODULE_OPTIONS,
} from '@nestjs/typeorm/dist/typeorm.constants';
import { defer } from 'rxjs';
import { Connection, ConnectionOptions } from 'typeorm';

import {
  createFakeConnection,
  getFakeConnectionManager,
} from './createFakeConnection';

/**
 * A fake TypeOrmMockModule as a copy because it's not available to inherit from @nestjs/typeorm.
 * The only change is in `createConnectionFactory` where `createConnection` is replaced by
 * `createFakeConnection`.
 */
@Global()
@Module({})
export class TypeOrmTestCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: TypeOrmModuleOptions = {}): DynamicModule {
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

  static forRootAsync(options: TypeOrmModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: getConnectionToken(options as ConnectionOptions) as string,
      useFactory: async (typeOrmOptions: TypeOrmModuleOptions) => {
        if (options.name) {
          return await this.createConnectionFactory({
            ...typeOrmOptions,
            name: options.name,
          });
        }
        return await this.createConnectionFactory(typeOrmOptions);
      },
      inject: [TYPEORM_MODULE_OPTIONS],
    };
    const entityManagerProvider = {
      provide: getEntityManagerToken(options as ConnectionOptions) as string,
      useFactory: (connection: Connection) => connection.manager,
      inject: [getConnectionToken(options as ConnectionOptions)],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: TypeOrmTestCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        entityManagerProvider,
        connectionProvider,
        {
          provide: TYPEORM_MODULE_ID,
          useValue: generateString(),
        },
      ],
      exports: [entityManagerProvider, connectionProvider],
    };
  }

  async onApplicationShutdown() {
    if (this.options.keepConnectionAlive) {
      return;
    }
    const connection = this.moduleRef.get<Connection>(
      getConnectionToken(this.options as ConnectionOptions) as Type<Connection>,
    );
    connection && (await connection.close());
  }

  private static createAsyncProviders(
    options: TypeOrmModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<TypeOrmOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: TypeOrmModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TYPEORM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<TypeOrmOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<TypeOrmOptionsFactory>,
    ];
    return {
      provide: TYPEORM_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TypeOrmOptionsFactory) =>
        await optionsFactory.createTypeOrmOptions(options.name),
      inject,
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
    options: TypeOrmModuleOptions,
  ): Promise<Connection> {
    try {
      if (options.keepConnectionAlive) {
        const connectionName = getConnectionName(options as ConnectionOptions);
        const manager = getFakeConnectionManager();
        if (manager.has(connectionName)) {
          const connection = manager.get(connectionName);
          if (connection.isConnected) {
            return connection;
          }
        }
      }
    } catch {}

    return await defer(
      (): Promise<Connection> => {
        if (!options.type) {
          return createFakeConnection();
        }
        if (!options.autoLoadEntities) {
          return createFakeConnection(options as ConnectionOptions);
        }

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
        } as ConnectionOptions);
      },
    )
      .pipe(handleRetry(options.retryAttempts, options.retryDelay))
      .toPromise();
  }
}
