import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

import { TypeOrmTestCoreModule } from './typeorm-test-core.module';
import { DEFAULT_CONNECTION_NAME } from '@nestjs/typeorm/dist/typeorm.constants';

interface TypeOrmTestModuleOptions {
  entities: Function[];
  type?: string;
  name?: string;
}

const TYPE = 'postgres';

@Module({})
export class TypeOrmTestModule extends TypeOrmModule {
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
    const feature = this.forFeature(options.entities, options.name);

    const result = {
      module: TypeOrmTestModule,
      providers: [...root.providers, ...feature.providers],
      exports: [...root.exports, ...feature.exports],
    };

    return result;
  }
}
