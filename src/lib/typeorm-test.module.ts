import {
  DynamicModule,
  Module,
  OnApplicationShutdown,
  Inject,
  Type,
} from '@nestjs/common';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  getConnectionToken,
} from '@nestjs/typeorm';
import { ConnectionOptions, Connection } from 'typeorm';

import { TypeOrmTestCoreModule } from './typeorm-test-core.module';
import {
  DEFAULT_CONNECTION_NAME,
  TYPEORM_MODULE_OPTIONS,
} from '@nestjs/typeorm/dist/typeorm.constants';
import { ModuleRef } from '@nestjs/core';

interface TypeOrmTestModuleOptions {
  entities: Function[];
  type?: string;
  name?: string;
}

const TYPE = 'postgres';

@Module({})
export class TypeOrmTestModule implements OnApplicationShutdown {
  constructor(
    @Inject(TYPEORM_MODULE_OPTIONS)
    private readonly options: TypeOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forTest(
    entitiesOrOptions: TypeOrmTestModuleOptions | Function[],
  ): DynamicModule {
    let options;

    if (!(entitiesOrOptions instanceof Array)) {
      const _options = entitiesOrOptions as TypeOrmTestModuleOptions;
      options = {
        type: _options.type || TYPE,
        name: _options.name || DEFAULT_CONNECTION_NAME,
        entities: _options.entities || [],
      };
    } else {
      entitiesOrOptions = entitiesOrOptions || [];
      options = {
        type: TYPE,
        name: DEFAULT_CONNECTION_NAME,
        entities: entitiesOrOptions,
      };
    }

    // The type serves as the handler to create the queries, it should be one of the
    // supported types of typeorm.
    const root = TypeOrmTestCoreModule.forRoot(options as ConnectionOptions);
    const feature = TypeOrmModule.forFeature(options.entities, options.name);

    const result = {
      module: TypeOrmTestModule,
      providers: [...root.providers, ...feature.providers],
      exports: [...root.exports, ...feature.exports],
    };

    return result;
  }

  async onApplicationShutdown() {
    if (this.options.keepConnectionAlive) {
      return;
    }
    const connection = this.moduleRef.get<Connection>(getConnectionToken(this
      .options as ConnectionOptions) as Type<Connection>);
    connection && (await connection.close());
  }
}
