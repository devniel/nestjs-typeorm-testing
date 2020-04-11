RELEASE 0.0.1-alpha

11-APRIL-2020
- Added tests.
- Added option to add custom connection name.
- TIL: `@InjectRepository` looks for entities on the `default` connection, you should provide the connection name as a second argument, check the `testing-module.spec.ts` tests.
- Updated `default` connection to `DEFAULT_CONNECTION_NAME`.
