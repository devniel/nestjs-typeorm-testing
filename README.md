Typeorm Testing module for NestJS, with this module you don't need an access to DB to test the BeforeInsert hook of typeorm entities.

Based on https://github.com/typeorm/typeorm/issues/1267#issuecomment-456200490 and some debugging/reading of the typeorm and @nestjs/typeorm flow.

Created with https://github.com/nestjsplus/nestjs-package-starter.

## Install:
```shell
npm install --save-dev @devniel/nestjs-typeorm-testing
```

## Example of use:

Invoke `TypeOrmTestModule.forTest` and pass as an argument an array with the entities used in the app.

By now it will create fake queries against a fake postgresql database connection.

If your entity (e.g. `User`) has hooks like `@BeforeInsert()`, the testing module will invoke it just like a regular typeorm module when using the injected repository in the proper services.

```ts
import { TypeOrmTestModule } from '@devniel/nestjs-typeorm-testing';

const module: TestingModule = await Test.createTestingModule({
  controllers: [AuthResolver],
  imports: [TypeOrmTestModule.forTest([User])],
  providers: [
    AuthService,
    UsersService,
    {
      provide: JwtService,
      useValue: jwtServiceMock,
    },
    {
      provide: RedisService,
      useValue: redisServiceMock,
    },
  ],
}).compile();
```

### Custom connection name

To provide a custom connection name, then set the first argument of `forTest` as an options object.

```ts
import { TypeOrmTestModule } from '@devniel/nestjs-typeorm-testing';

const module: TestingModule = await Test.createTestingModule({
  controllers: [AuthResolver],
  imports: [TypeOrmTestModule.forTest({
    entities: [User],
    name: 'default2'
  })],
  providers: [
    AuthService,
    UsersService,
    {
      provide: JwtService,
      useValue: jwtServiceMock,
    },
    {
      provide: RedisService,
      useValue: redisServiceMock,
    },
  ],
}).compile();
```

### Getting the fake connection
You can get the created fake connection and check its properties or close it.
```ts
import { TypeOrmTestModule } from '@devniel/nestjs-typeorm-testing';
import { getConnectionToken } from '@nestjs/typeorm';

const module: TestingModule = await Test.createTestingModule({
  controllers: [AuthResolver],
  imports: [TypeOrmTestModule.forTest({
    entities: [User],
    name: 'default2'
  })]
}).compile();
const connection = module.get(getConnectionToken('default2'));
connection.close(); // module.close() also closes the connection
```

## Todo:

- Capture queries.
- Create utils to override the repositories with ease.

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
