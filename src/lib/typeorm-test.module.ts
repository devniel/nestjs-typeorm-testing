import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

import { TypeOrmTestCoreModule } from './typeorm-test-core.module';

@Module({})
export class TypeOrmTestModule extends TypeOrmModule {
  static forTest(entities: Function[] = [], type = 'postgres'): DynamicModule {
    // The type serves as the handler to create the queries, it should be one of the
    // supported types of typeorm.
    const options = {
      type,
      entities,
    } as ConnectionOptions;

    const root = TypeOrmTestCoreModule.forRoot(options);
    const feature = this.forFeature(entities);

    const result = {
      module: TypeOrmTestModule,
      providers: [...root.providers, ...feature.providers],
      exports: [...root.exports, ...feature.exports],
    };

    return result;
  }
}
