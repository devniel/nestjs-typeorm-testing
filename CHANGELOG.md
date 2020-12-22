__0.1.1-alpha__ 21-DECEMBER-2020
- Updated to typeorm ^0.2.29.
- Updated to jest ^26.6.3.
- Added fake `on` and `removeListener` to `fakeConnection`.

__0.1.0-alpha__ 12-SEPTEMBER-2020
- Fixed problem about not restoring `typeorm.createConnection` stub (removed `sinon`).
- Internal `TypeOrmTestCoreModule.forRoot` now is async `TypeOrmTestCoreModule.forRootAsync` to wait for any pending async operation in the compilation.
- Added chore(deps) updates from dependabot.
- Updated dependencies (jest, typescript).
- Updated tests.

__0.0.9-alpha__ 11-APRIL-2020
- Removed unneccesary log.
  
__0.0.8-alpha__ 11-APRIL-2020
- Added `FakeConnection` disconnection on `module.close()` or `connection.close()`.

__0.0.7-alpha__ 11-APRIL-2020
- Added tests.
- Added option to add custom connection name.
- TIL: `@InjectRepository` looks for entities on the `default` connection, you should provide the connection name as a second argument, check the `testing-module.spec.ts` tests.
- Updated `default` connection to `DEFAULT_CONNECTION_NAME`.
