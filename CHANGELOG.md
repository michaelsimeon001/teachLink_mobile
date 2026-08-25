## [1.16.4](https://github.com/rinafcode/teachLink_mobile/compare/v1.16.3...v1.16.4) (2026-08-25)


### Bug Fixes

* **api:** add missing pushLogContext/popLogContext exports to fix ReferenceError ([#912](https://github.com/rinafcode/teachLink_mobile/issues/912)) ([cc9639f](https://github.com/rinafcode/teachLink_mobile/commit/cc9639f1ba8a5d0ca2adec2a37c29fe850d08faa))
* **ci:** build APK before running Maestro E2E tests ([#915](https://github.com/rinafcode/teachLink_mobile/issues/915)) ([dd4d563](https://github.com/rinafcode/teachLink_mobile/commit/dd4d563730dcc80ca283ef2e3c9e689adf61a338))
* **test.yml:** only print 'All tests passed' when job actually succeeds ([#914](https://github.com/rinafcode/teachLink_mobile/issues/914)) ([8529f37](https://github.com/rinafcode/teachLink_mobile/commit/8529f3780edf0924163402696fc447c244f5458d))
* **tsconfig:** add skipLibCheck to unblock the syntax.yml type gate ([#913](https://github.com/rinafcode/teachLink_mobile/issues/913)) ([8327778](https://github.com/rinafcode/teachLink_mobile/commit/8327778f8326c576540e8fc1edf2cd2db12c3339))

## [1.16.3](https://github.com/rinafcode/teachLink_mobile/compare/v1.16.2...v1.16.3) (2026-08-25)


### Bug Fixes

* **api:** distinguish CORS failures from generic network errors in interceptors ([#919](https://github.com/rinafcode/teachLink_mobile/issues/919)) ([9dd63c4](https://github.com/rinafcode/teachLink_mobile/commit/9dd63c431be3e9021367e538e56386dc29c769ce))
* **ci:** correct workflow name from ci-optimized to ci in monitor-build-times.yml ([#916](https://github.com/rinafcode/teachLink_mobile/issues/916)) ([d17ffed](https://github.com/rinafcode/teachLink_mobile/commit/d17ffed1fdaea5361ed1e759806749c43b3c6b9f))
* **ssl:** default to pinning enabled when EXPO_PUBLIC_APP_ENV is unset or misspelled ([#918](https://github.com/rinafcode/teachLink_mobile/issues/918)) ([39749a4](https://github.com/rinafcode/teachLink_mobile/commit/39749a41935ee0a01c8ddbe9f8251b2b5a2a1bcc))
* **ssl:** read pin hashes from env vars, fail if placeholder or missing ([#917](https://github.com/rinafcode/teachLink_mobile/issues/917)) ([d7c24b4](https://github.com/rinafcode/teachLink_mobile/commit/d7c24b424f8ff9c757d1f44434a0633c9916f241))

## [1.16.2](https://github.com/rinafcode/teachLink_mobile/compare/v1.16.1...v1.16.2) (2026-08-25)


### Bug Fixes

* **app.json:** remove cydia from LSApplicationQueriesSchemes ([#923](https://github.com/rinafcode/teachLink_mobile/issues/923)) ([ca27f04](https://github.com/rinafcode/teachLink_mobile/commit/ca27f04d1ec3b8c68f94185417dd039ad3f71e51))
* **biometrics:** safe-load expo-local-authentication, default to not enrolled on error ([#920](https://github.com/rinafcode/teachLink_mobile/issues/920)) ([29fc78a](https://github.com/rinafcode/teachLink_mobile/commit/29fc78a30812f3017e9cf535a35aa20d7e0b8890))
* **security:** remove unsafe-eval and wildcard connect-src from trusted CSP tier ([#921](https://github.com/rinafcode/teachLink_mobile/issues/921)) ([ff5ed58](https://github.com/rinafcode/teachLink_mobile/commit/ff5ed58c58abfde114408b431775f65e546a73f1))
* **utils:** replace Math.random() with crypto-safe ID generation ([#922](https://github.com/rinafcode/teachLink_mobile/issues/922)) ([c730e18](https://github.com/rinafcode/teachLink_mobile/commit/c730e1835b6317153d30f650d9059e387d8368ab))

## [1.16.1](https://github.com/rinafcode/teachLink_mobile/compare/v1.16.0...v1.16.1) (2026-08-25)


### Bug Fixes

* **api:** route SESSION_EXPIRED rejection through buildSanitizedApiError ([#927](https://github.com/rinafcode/teachLink_mobile/issues/927)) ([7064711](https://github.com/rinafcode/teachLink_mobile/commit/7064711a35a50582ac3d3920fa44989ab85ae2df))
* **api:** use dedicated refreshClient to avoid interceptor re-entry on token refresh ([#926](https://github.com/rinafcode/teachLink_mobile/issues/926)) ([02f6827](https://github.com/rinafcode/teachLink_mobile/commit/02f6827fbbc6c7d79915ac0628941fb3a0598452))
* **audit:** use npm ci instead of npm install to match lockfile ([#925](https://github.com/rinafcode/teachLink_mobile/issues/925)) ([1bf42fd](https://github.com/rinafcode/teachLink_mobile/commit/1bf42fd838c2336760114d66510e3dc0edd32202))
* **ci:** add permissions block to restrict GITHUB_TOKEN scope ([#924](https://github.com/rinafcode/teachLink_mobile/issues/924)) ([02d261e](https://github.com/rinafcode/teachLink_mobile/commit/02d261eb5ddc8454fbe2b839cf844fdceae1b305))

# [1.16.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.15.0...v1.16.0) (2026-08-25)


### Bug Fixes

* **#594:** cap requestDeduplicator at 100 entries with 30s TTL eviction ([4a00abe](https://github.com/rinafcode/teachLink_mobile/commit/4a00abe0102fb13b03c5df93b54cd501c4ab87ca)), closes [#594](https://github.com/rinafcode/teachLink_mobile/issues/594)
* **#599:** debounce useFormCache writes at 800ms, add flushCache and unmount cleanup ([4ed22d4](https://github.com/rinafcode/teachLink_mobile/commit/4ed22d4a1bd2df6588957e5c7fb304b13d0c5c2e)), closes [#599](https://github.com/rinafcode/teachLink_mobile/issues/599)
* **#637:** persist quiz draft answers and add resume prompt ([b916b40](https://github.com/rinafcode/teachLink_mobile/commit/b916b40b775f95c07402f56d1f0fa6d2ff12d137)), closes [#637](https://github.com/rinafcode/teachLink_mobile/issues/637)
* **626:** stabilize SettingRow onPress/right/icon props to prevent unnecessary re-renders ([4422597](https://github.com/rinafcode/teachLink_mobile/commit/4422597a5ff1fd917391c0bf762e16e28ded2cd6))
* add build script for CI workflow ([a7d27fa](https://github.com/rinafcode/teachLink_mobile/commit/a7d27fa6245ab1595fa9d99a7ca7b8ea7d672a9a))
* add environment variables to all CI workflows ([2967357](https://github.com/rinafcode/teachLink_mobile/commit/2967357d147ed2c2adb9b62ad36d2613972f28fc))
* add error handler to searchIndexService.initialize() call ([a39511f](https://github.com/rinafcode/teachLink_mobile/commit/a39511fe34f66c64a2e3bf076a2fe0b6f0adf940))
* add expo-store-review dependency and test mocks ([805c115](https://github.com/rinafcode/teachLink_mobile/commit/805c115b3296e70504a7b5b92348464103b544cd))
* add generic type params to post/put/patch ([#801](https://github.com/rinafcode/teachLink_mobile/issues/801)) ([6daaf8c](https://github.com/rinafcode/teachLink_mobile/commit/6daaf8c0728d51be01584385660b63f7c8b99b62))
* add getItemLayout to FlatLists for virtualization performance ([0a6ec35](https://github.com/rinafcode/teachLink_mobile/commit/0a6ec35a08b415fdf21cff55cdba0fae4d6e1fd5))
* add uuid import via expo-crypto for request ID generation ([3a4dc79](https://github.com/rinafcode/teachLink_mobile/commit/3a4dc79a2efaa8edd2cf10fd7c8e9e93f1a5cb37))
* add validated platform helper to prevent receipt validation bypass ([d2635ce](https://github.com/rinafcode/teachLink_mobile/commit/d2635cecbf6877b8aeb59516bf258345eca94229))
* align axios mock with project standard pattern (all HTTP methods) ([b257e20](https://github.com/rinafcode/teachLink_mobile/commit/b257e209e1443e6bfcfb36284dbd72ae9ab653cd))
* align empty restore-purchases message with expected copy ([eafdb95](https://github.com/rinafcode/teachLink_mobile/commit/eafdb955ca21f7cfb2690eeaaaf4fee43880bdd2))
* allow lint warnings and use npm install in test workflow ([ef02e06](https://github.com/rinafcode/teachLink_mobile/commit/ef02e06aaea3e0fb7f1c7f5091e4a0202b5b8d77))
* **api:** sanitize unhandled API error messages, add Sentry request context ([#579](https://github.com/rinafcode/teachLink_mobile/issues/579)) ([801c845](https://github.com/rinafcode/teachLink_mobile/commit/801c8455508ce8206ebb707a59a8973f58ab593f))
* **auth:** add client-side lockout after repeated failed login attempts ([52d8e7d](https://github.com/rinafcode/teachLink_mobile/commit/52d8e7dea20b316d5594b9537d5812b4c4e011df)), closes [#581](https://github.com/rinafcode/teachLink_mobile/issues/581)
* **auth:** sanitize OAuth error responses before rendering in UI ([9e413de](https://github.com/rinafcode/teachLink_mobile/commit/9e413de7682a743a2e2af02d83637b94bfd8ba51)), closes [#676](https://github.com/rinafcode/teachLink_mobile/issues/676)
* cap metrics buffers, add auto‑flush and memory‑pressure flushing ([5446605](https://github.com/rinafcode/teachLink_mobile/commit/54466057104e31964e99922fd9e1ea498ece9f1d))
* change npm ci to npm install in workflows ([2fedf36](https://github.com/rinafcode/teachLink_mobile/commit/2fedf36d6cecd3d492896ccd57a4a8863a03967f))
* **ci:** resolve dependency install and workflow issues ([71fb612](https://github.com/rinafcode/teachLink_mobile/commit/71fb612f6e1eda2d0a62c9fc09af1e8659e7005c))
* clean up lint warnings in socket service after merge ([ff54a8e](https://github.com/rinafcode/teachLink_mobile/commit/ff54a8e6404609d4684461966b16d888b97f5721))
* **clipboard:** add 30-second TTL to clear pasted content from state ([5dca93a](https://github.com/rinafcode/teachLink_mobile/commit/5dca93a1af0fbc27b532d59bc1f12e39f940a265))
* correct expo-store-review version to 8.0.0 ([7d1246a](https://github.com/rinafcode/teachLink_mobile/commit/7d1246a75413975b7c30a7b1cd458900e7a0ce21))
* correct style array syntax in MobileProfile and format modified files ([532dd4b](https://github.com/rinafcode/teachLink_mobile/commit/532dd4b995ca339895ed6ea40858a7dac45a1cc9))
* deduplicate queued requests by method+URL+body fingerprint ([#813](https://github.com/rinafcode/teachLink_mobile/issues/813)) ([1f44a53](https://github.com/rinafcode/teachLink_mobile/commit/1f44a5358b0abbddc3e193a1ca7212cd5dbebf46))
* enforce @typescript-eslint/ban-ts-comment to ban unexplained [@ts-ignore](https://github.com/ts-ignore) ([#809](https://github.com/rinafcode/teachLink_mobile/issues/809)) ([21d021b](https://github.com/rinafcode/teachLink_mobile/commit/21d021b1f57c182da5999e0e5f4d3d939ae62149))
* explicitly add typescript and dependencies to sync lockfile for CI clean install ([b8fe75b](https://github.com/rinafcode/teachLink_mobile/commit/b8fe75b35ff59192181ada1d2f80c1748a049d7c))
* explicitly type persist onRehydrateStorage error callback ([#803](https://github.com/rinafcode/teachLink_mobile/issues/803)) ([15c90ad](https://github.com/rinafcode/teachLink_mobile/commit/15c90ad334c89d101083f7918d29e6ab89635073))
* gate Sentry init on EXPO_PUBLIC_SENTRY_ENABLED instead of isDev ([f6c1613](https://github.com/rinafcode/teachLink_mobile/commit/f6c1613d4e2588298bdfbab1fabc175447148091))
* guard token expiry listener to prevent accumulation on re-launch ([#812](https://github.com/rinafcode/teachLink_mobile/issues/812)) ([68f943f](https://github.com/rinafcode/teachLink_mobile/commit/68f943f6ee39dae6358744095314daa913417d06))
* handle AsyncStorage quota exceeded by clearing pending analytics queue ([6b046c3](https://github.com/rinafcode/teachLink_mobile/commit/6b046c371ae16ae29809f4e1f24fc8af97986a88))
* import missing components in AdvancedDataGrid and add rules of hooks bypasses ([ff297d8](https://github.com/rinafcode/teachLink_mobile/commit/ff297d88e7ee448ec831ec825f66e107ca734027))
* lazy-load lessons in MobileCourseViewer, embed via ?include=lessons ([#625](https://github.com/rinafcode/teachLink_mobile/issues/625)) ([54e1d9f](https://github.com/rinafcode/teachLink_mobile/commit/54e1d9f681eb6b6eb328549f54608b1a9bcf83e1))
* **lint:** use valid no-console rule form so ESLint 9 and the pre-commit hook run ([9d6ff2e](https://github.com/rinafcode/teachLink_mobile/commit/9d6ff2ea61be3a1c511abd80ec0b2b04b616f1d5))
* make auth and storage failures explicit and recoverable ([fe13d8f](https://github.com/rinafcode/teachLink_mobile/commit/fe13d8f1edc6e4c85ae3e5f43647f03486580e05)), closes [#788](https://github.com/rinafcode/teachLink_mobile/issues/788) [#789](https://github.com/rinafcode/teachLink_mobile/issues/789) [#790](https://github.com/rinafcode/teachLink_mobile/issues/790) [#791](https://github.com/rinafcode/teachLink_mobile/issues/791)
* **mobile:** optimize quiz analytics and socket reconnect backoff ([#593](https://github.com/rinafcode/teachLink_mobile/issues/593), [#601](https://github.com/rinafcode/teachLink_mobile/issues/601)) ([33283f0](https://github.com/rinafcode/teachLink_mobile/commit/33283f095436acb00cd31c3ef54dfec4ba5ad9b0))
* narrow error types and give failures specific, typed handling ([68ec214](https://github.com/rinafcode/teachLink_mobile/commit/68ec214606801eb7618774483ecf042ebda0829a)), closes [#796](https://github.com/rinafcode/teachLink_mobile/issues/796) [#797](https://github.com/rinafcode/teachLink_mobile/issues/797) [#798](https://github.com/rinafcode/teachLink_mobile/issues/798) [#799](https://github.com/rinafcode/teachLink_mobile/issues/799)
* null-check authErrorCode before getAuthErrorMessage ([#804](https://github.com/rinafcode/teachLink_mobile/issues/804)) ([4ba047a](https://github.com/rinafcode/teachLink_mobile/commit/4ba047ad20e16261714e70554fdea198b910c9c8))
* optimistic rollback, float completion, deep link replay, bg reconnect ([ef6ca00](https://github.com/rinafcode/teachLink_mobile/commit/ef6ca00eb2d4789314fbef9c8f78c775c56b4dff))
* pin jest-expo@54.0.17 (upstream ~54.0.19 doesn't exist on npm) ([1d9b8e1](https://github.com/rinafcode/teachLink_mobile/commit/1d9b8e12ea5f5f20a275ff470a09e928dce4967f))
* refactor component tree to reduce re-render propagation ([a634d31](https://github.com/rinafcode/teachLink_mobile/commit/a634d31c5d387027b6bba3cef227459d6c1e3c03))
* remove dead requestQueue import and usage ([ab533d8](https://github.com/rinafcode/teachLink_mobile/commit/ab533d8af9de56388ae3ad2561e51fe9cef8b49f))
* rename streaming test to TSX for JSX parsing support and commit updated lockfile ([be458bf](https://github.com/rinafcode/teachLink_mobile/commit/be458bf4a8267e8999eba3dddedb2c44c165ea1d))
* replace any with ApiClient type in RequestQueue ([#802](https://github.com/rinafcode/teachLink_mobile/issues/802)) ([71eb942](https://github.com/rinafcode/teachLink_mobile/commit/71eb9428ca78ce65db10fed95d2e409bc4614b6b))
* replace feature as any with FeatureType guard ([#807](https://github.com/rinafcode/teachLink_mobile/issues/807)) ([da79ca4](https://github.com/rinafcode/teachLink_mobile/commit/da79ca41884246b7b6b7c9913a4a0829553899d1))
* resolve CI failures, dependency mismatches and security vulnerabilities ([4a151d9](https://github.com/rinafcode/teachLink_mobile/commit/4a151d9f71ae983572f9a3ec4f46e8ef4c318653))
* resolve CI test failures by fixing test mocks and expectations ([031214c](https://github.com/rinafcode/teachLink_mobile/commit/031214c100e9856b7a3b4c079c4c648a16ad0655))
* resolve CI test failures from bad merge artifacts ([b9e0e82](https://github.com/rinafcode/teachLink_mobile/commit/b9e0e828c9ad7d4460b4686a6bacbef9f52f68e7))
* resolve ESLint errors — remove stale ScrollView ref, fix import order, wire onScroll handlers ([6cceac1](https://github.com/rinafcode/teachLink_mobile/commit/6cceac15500398e1338b1386bfbeac44d347234f))
* resolve eslint hook dependency errors and typescript compiler issues ([ab30009](https://github.com/rinafcode/teachLink_mobile/commit/ab300091ba489410af0ea591484710bc6ca1ea9f))
* resolve failing test suites for secureStorage, streaming, videoQuality, notifications, and card components ([239ca24](https://github.com/rinafcode/teachLink_mobile/commit/239ca24f742cccd20be5489263761863eb591c78))
* resolve import path alias in useProfileData.ts ([8e3c637](https://github.com/rinafcode/teachLink_mobile/commit/8e3c637c7be9a156461cd20dc8430b02ba8f357c))
* resolve issues [#617](https://github.com/rinafcode/teachLink_mobile/issues/617), [#618](https://github.com/rinafcode/teachLink_mobile/issues/618), [#619](https://github.com/rinafcode/teachLink_mobile/issues/619) ([6c7c2fb](https://github.com/rinafcode/teachLink_mobile/commit/6c7c2fb07adbd0adfec284b5df5765ec5ab3b03a))
* resolve issues [#620](https://github.com/rinafcode/teachLink_mobile/issues/620), [#621](https://github.com/rinafcode/teachLink_mobile/issues/621), [#622](https://github.com/rinafcode/teachLink_mobile/issues/622) ([8123c0b](https://github.com/rinafcode/teachLink_mobile/commit/8123c0b72770b7a31c5a928e2d59daead8d9536e))
* resolve upstream tsconfig and carousel syntax errors ([d4073e2](https://github.com/rinafcode/teachLink_mobile/commit/d4073e24107ee82bb3181af0fb65d760085679c3))
* security issue [#576](https://github.com/rinafcode/teachLink_mobile/issues/576) - sanitize console output and prevent internal state leaks in production ([b179d1b](https://github.com/rinafcode/teachLink_mobile/commit/b179d1b0d0897cacdc9c80449976c160d579f142))
* **security:** add SSL public key pinning for iOS and Android ([71bfdfe](https://github.com/rinafcode/teachLink_mobile/commit/71bfdfece558d74916930f5e1c78c4fe00677842)), closes [#577](https://github.com/rinafcode/teachLink_mobile/issues/577)
* **security:** validate & sanitise notification payload to block prototype pollution ([#586](https://github.com/rinafcode/teachLink_mobile/issues/586)) ([55018be](https://github.com/rinafcode/teachLink_mobile/commit/55018be41c170d88f2b083e76309bc4aba36e5ab))
* server-validate restore receipts ([#615](https://github.com/rinafcode/teachLink_mobile/issues/615)) and scope form cache by userId ([#616](https://github.com/rinafcode/teachLink_mobile/issues/616)) ([f78e0a0](https://github.com/rinafcode/teachLink_mobile/commit/f78e0a033550d839b9283ef6997579831cbc54ff))
* stop logging leaking data and stop errors disappearing silently ([6c3ad8c](https://github.com/rinafcode/teachLink_mobile/commit/6c3ad8c4323a82e323826dd1dac939974b20b9f4)), closes [#792](https://github.com/rinafcode/teachLink_mobile/issues/792) [#793](https://github.com/rinafcode/teachLink_mobile/issues/793) [#794](https://github.com/rinafcode/teachLink_mobile/issues/794) [#795](https://github.com/rinafcode/teachLink_mobile/issues/795)
* store notification timestamps as numeric ms, add migration and update logic ([c5cf4b0](https://github.com/rinafcode/teachLink_mobile/commit/c5cf4b0556659c991cca3a1870e7ff559b742f19))
* **store:** fix degradedFeatures Set serialization bug in persist middleware ([5a8a069](https://github.com/rinafcode/teachLink_mobile/commit/5a8a069ffc4311c9fa0702b1fcc3881f4658430f))
* **store:** guard getState() session check behind store hydration ([95b4c8d](https://github.com/rinafcode/teachLink_mobile/commit/95b4c8d7ced7588314e86530d00e0e4592c0a01b))
* **store:** validate courseProgressStore updates with type guard ([fc93aa9](https://github.com/rinafcode/teachLink_mobile/commit/fc93aa96ac777233321845985549d14ce2091e84))
* support diacritic-insensitive search indexing ([#629](https://github.com/rinafcode/teachLink_mobile/issues/629)) ([265c587](https://github.com/rinafcode/teachLink_mobile/commit/265c5878c858bb4f98f417e533d8a1e7bffe3056))
* type socket event callbacks with generic T instead of any ([#805](https://github.com/rinafcode/teachLink_mobile/issues/805)) ([770aef5](https://github.com/rinafcode/teachLink_mobile/commit/770aef5e69f658f52ad2f5f3263fd81546deadf0))
* typed errors and complete flows for mobile auth, push and API conflicts ([51cf7ad](https://github.com/rinafcode/teachLink_mobile/commit/51cf7ad1403d72c4366485d1c0a917b0292c8907)), closes [#784](https://github.com/rinafcode/teachLink_mobile/issues/784) [#785](https://github.com/rinafcode/teachLink_mobile/issues/785) [#786](https://github.com/rinafcode/teachLink_mobile/issues/786) [#787](https://github.com/rinafcode/teachLink_mobile/issues/787)
* use full jitter for socket reconnect to prevent thundering herd ([#810](https://github.com/rinafcode/teachLink_mobile/issues/810)) ([0131d65](https://github.com/rinafcode/teachLink_mobile/commit/0131d653060310aded55294d525ea89750e13ce2))
* validate 409 response shape at runtime before ConflictData access ([#806](https://github.com/rinafcode/teachLink_mobile/issues/806)) ([a534160](https://github.com/rinafcode/teachLink_mobile/commit/a53416035df22798a816081656114a0974a31369))
* validate and sanitize incoming deep links to prevent open redirects ([96064c9](https://github.com/rinafcode/teachLink_mobile/commit/96064c984a1cbb8673b8fd99936442ca2309938c))
* validate biometric type at runtime to prevent spoofing ([831672b](https://github.com/rinafcode/teachLink_mobile/commit/831672b1dd7ad03e5d9a55dd1e8311e4f96092d3))
* wrap bundle-size comment step in try-catch to allow fork PRs to pass ([3b88561](https://github.com/rinafcode/teachLink_mobile/commit/3b88561a62a6f84d747124bbea27f8c9dbdaf3d8))


### Features

* **#244:** Optimized context re-renders with useMemo and useCallback and also added a test for it ([40f63f3](https://github.com/rinafcode/teachLink_mobile/commit/40f63f305b22f9e5290d4238033955cc164e2732)), closes [#244](https://github.com/rinafcode/teachLink_mobile/issues/244)
* **#337:** Implement scroll position restoration for navigation ([3f6f87e](https://github.com/rinafcode/teachLink_mobile/commit/3f6f87e7a7e1c979ea3f7b81e27bf4ac061f7ba1)), closes [#337](https://github.com/rinafcode/teachLink_mobile/issues/337)
* **#390:** implement activity/metrics dashboard for team visibility ([33f9c7b](https://github.com/rinafcode/teachLink_mobile/commit/33f9c7bd6f88a4e2f2fb2e9ef2ea9b8fc9283625)), closes [#390](https://github.com/rinafcode/teachLink_mobile/issues/390) [#390](https://github.com/rinafcode/teachLink_mobile/issues/390) [#31](https://github.com/rinafcode/teachLink_mobile/issues/31) [#32](https://github.com/rinafcode/teachLink_mobile/issues/32) [#33](https://github.com/rinafcode/teachLink_mobile/issues/33) [#73](https://github.com/rinafcode/teachLink_mobile/issues/73)
* **#660:** Implement offline-first conflict resolution for concurrent edits ([7e63677](https://github.com/rinafcode/teachLink_mobile/commit/7e636776cb8fbdbedb7e06a74df23a3ddcc5caac)), closes [#660](https://github.com/rinafcode/teachLink_mobile/issues/660) [#660](https://github.com/rinafcode/teachLink_mobile/issues/660)
* **#661:** Add memory pressure auto-cleanup service with three-tier degradation ([b4dce3a](https://github.com/rinafcode/teachLink_mobile/commit/b4dce3ae1463dcbea79a16c8ee36ca188e0dd2df)), closes [#661](https://github.com/rinafcode/teachLink_mobile/issues/661)
* add analytics event batching with offline queue ([#670](https://github.com/rinafcode/teachLink_mobile/issues/670)) ([11314f0](https://github.com/rinafcode/teachLink_mobile/commit/11314f067980af4e077f572fdfe0e53134e54217))
* add ApiClient interface to replace any in RequestQueue ([#802](https://github.com/rinafcode/teachLink_mobile/issues/802)) ([300d547](https://github.com/rinafcode/teachLink_mobile/commit/300d5472a0bf369845a7529d5afd36bde439e2b0))
* add CI lint/typecheck gates, deep link crash fix, app version display, FlatList keyExtractor audit ([e471301](https://github.com/rinafcode/teachLink_mobile/commit/e471301afedd5cf674a3a7f868ae9924f2c678c1)), closes [#866](https://github.com/rinafcode/teachLink_mobile/issues/866) [#865](https://github.com/rinafcode/teachLink_mobile/issues/865) [#864](https://github.com/rinafcode/teachLink_mobile/issues/864) [#863](https://github.com/rinafcode/teachLink_mobile/issues/863)
* add haptic feedback for quiz answers and achievement unlocks ([30b14e0](https://github.com/rinafcode/teachLink_mobile/commit/30b14e0f761c06911ad732bdfe4b5d95867d7909))
* add health check auto-disable with feature flag integration ([ef00f90](https://github.com/rinafcode/teachLink_mobile/commit/ef00f90914b905c6f35d18ab8c09213b076f3781))
* add health check auto-disable with feature flag integration ([6c2d8a4](https://github.com/rinafcode/teachLink_mobile/commit/6c2d8a4d4f8251b668ee583fcf61c5f9a0b2cffe))
* add jailbreak/root detection to gate biometric auth and payments ([5bc3f21](https://github.com/rinafcode/teachLink_mobile/commit/5bc3f2198520012478a6a3a5ebf34952095bae83))
* add keyboard navigation support for tablet and web rendering targets ([397ced7](https://github.com/rinafcode/teachLink_mobile/commit/397ced74496ec24937a821ccaeaa36237bcd10df))
* add LRU eviction and size cap to image cache ([da7968f](https://github.com/rinafcode/teachLink_mobile/commit/da7968f7cb3ec9c9e7fdd063e41716c3d8308670))
* add module augmentation for custom Axios config fields ([#800](https://github.com/rinafcode/teachLink_mobile/issues/800)) ([ab10d43](https://github.com/rinafcode/teachLink_mobile/commit/ab10d43f41ae56811ef5216b21a6b7135df32b15))
* add notification deep link allowlist and payload schema validation ([#664](https://github.com/rinafcode/teachLink_mobile/issues/664)) ([64c8157](https://github.com/rinafcode/teachLink_mobile/commit/64c8157332520d9e91d5c22d4bb440f1d9b58634))
* Add Notification Permission Explanation Sheet and deferral logic ([b47dc5f](https://github.com/rinafcode/teachLink_mobile/commit/b47dc5fe54d3d6626145069e5735ee062c89bb66))
* add OfflineBanner component with queue depth indicator ([#824](https://github.com/rinafcode/teachLink_mobile/issues/824)) ([40eeeaa](https://github.com/rinafcode/teachLink_mobile/commit/40eeeaa39b785af39ccca7dab9224de2e1a492e3))
* Add PR syntax gate workflow that fails fast on TypeScript and lint errors ([441c79b](https://github.com/rinafcode/teachLink_mobile/commit/441c79b9abab565661fb5dab819ea20b4d5de788))
* add SecureWebView with configurable CSP injection ([45dee89](https://github.com/rinafcode/teachLink_mobile/commit/45dee897d84a46796b02f4c4c37797a073a9b67a)), closes [#669](https://github.com/rinafcode/teachLink_mobile/issues/669)
* add smart multi-tier API cache ([422b683](https://github.com/rinafcode/teachLink_mobile/commit/422b683e5386e31fb19b98cfc0c17e1d79a23198))
* add socket queue persistence, avatar upload retry, a11y labels, and dark mode fixes ([e075c59](https://github.com/rinafcode/teachLink_mobile/commit/e075c590fbca7400cfd194b4373e36b768b1e35a))
* add team pagination and secure offline queue replay ([606a5ac](https://github.com/rinafcode/teachLink_mobile/commit/606a5ac37d018b391732a2f63b38f664493cbabf))
* add WebP image format negotiation with PNG fallback ([11db8ce](https://github.com/rinafcode/teachLink_mobile/commit/11db8ce32c426ca2a4b407581aacef6ac758e5e6))
* **android:** configure ProGuard/R8 for APK size reduction ([#239](https://github.com/rinafcode/teachLink_mobile/issues/239)) ([7a406b1](https://github.com/rinafcode/teachLink_mobile/commit/7a406b14b347408468342996b8749048225ff094))
* **api:** add SWR-style cache revalidation with visible syncing state ([3ce5b5d](https://github.com/rinafcode/teachLink_mobile/commit/3ce5b5d5a0db49f333eb4df0b50460aca3ff6df1))
* **api:** apply per-endpoint TTL in apiService.get ([196d049](https://github.com/rinafcode/teachLink_mobile/commit/196d049a06e9bb7512391f5f469e46da9f3d2dbe))
* async MMKV store adapter, screen boundary reset keys, shared validators ([ab7d238](https://github.com/rinafcode/teachLink_mobile/commit/ab7d238e7238ad4a51f52b54b61d9125b226294c))
* biometric re-authentication timeout for sensitive operations. ([dc90674](https://github.com/rinafcode/teachLink_mobile/commit/dc90674469cf0188bfd09ef18e80b59cc3e1ad42))
* biometric reinstall check, perf-based timing, badge sync, video position persistence ([b017b31](https://github.com/rinafcode/teachLink_mobile/commit/b017b3120cadb159bb41da17af74636f357e1783)), closes [#630](https://github.com/rinafcode/teachLink_mobile/issues/630) [#631](https://github.com/rinafcode/teachLink_mobile/issues/631) [#633](https://github.com/rinafcode/teachLink_mobile/issues/633) [#636](https://github.com/rinafcode/teachLink_mobile/issues/636)
* **cache:** add invalidatePattern method ([f5b30c4](https://github.com/rinafcode/teachLink_mobile/commit/f5b30c4cc839b7faf6f75819114c830854e60b2d))
* **cache:** add per-endpoint TTL map and subscription/payment invalidation rules ([f438110](https://github.com/rinafcode/teachLink_mobile/commit/f4381107180fefd45996d7063f00012c46b17e99))
* commit solution for the listed issue ([a9ae082](https://github.com/rinafcode/teachLink_mobile/commit/a9ae08236e7353141a563973712625441f5a0c48))
* commit solutions for the listed issues ([c849311](https://github.com/rinafcode/teachLink_mobile/commit/c849311c0a1675742a31a8d251bc49824791ccc6))
* **course:** add CourseListSkeleton loading placeholder ([32f7d28](https://github.com/rinafcode/teachLink_mobile/commit/32f7d2811f5ea3436fe3e1d1df6f92619e251395))
* deduplicate markLessonComplete with 500ms guard window ([53443c9](https://github.com/rinafcode/teachLink_mobile/commit/53443c93769a25db50415037d5886c39b8d54a9c))
* enhance request queue with persistence, priority levels, and batch sync ([#228](https://github.com/rinafcode/teachLink_mobile/issues/228)) ([b594cac](https://github.com/rinafcode/teachLink_mobile/commit/b594cac4f8d35d16617737616bd06209758a3750))
* ErrorBoundary Sentry componentStack, search indexing placeholder, AsyncStorage security, pull-to-refresh ([fc68a28](https://github.com/rinafcode/teachLink_mobile/commit/fc68a28612dd03bb3c3ffe176a69ff7c5cef14d0))
* generate certificate of completion on course completion ([ecadf17](https://github.com/rinafcode/teachLink_mobile/commit/ecadf171beb5654ae14b7af25538804dcd06dff1))
* grid sort nullsFirst, network probe, token cache, dedup subscriptions ([80b982a](https://github.com/rinafcode/teachLink_mobile/commit/80b982a1826aacbc398c2c4e069f4af6ea1837e2)), closes [#632](https://github.com/rinafcode/teachLink_mobile/issues/632) [#634](https://github.com/rinafcode/teachLink_mobile/issues/634) [#635](https://github.com/rinafcode/teachLink_mobile/issues/635) [#638](https://github.com/rinafcode/teachLink_mobile/issues/638)
* **images:** implement progressive loading with LQIP and WebP ([#231](https://github.com/rinafcode/teachLink_mobile/issues/231)) ([5226202](https://github.com/rinafcode/teachLink_mobile/commit/5226202c3bf987de58cd948cbf0ae00137f2546d))
* implement aggressive image prefetching for likely user flows ([4c8237a](https://github.com/rinafcode/teachLink_mobile/commit/4c8237a96e12cd296491ae07679d4b0a4f145cf9)), closes [#233](https://github.com/rinafcode/teachLink_mobile/issues/233)
* implement app version auto-update mechanism ([fe18a4c](https://github.com/rinafcode/teachLink_mobile/commit/fe18a4c4029c65566db62b89c7db611a8324a694))
* implement background task scheduling to optimize UI responsiveness ([#268](https://github.com/rinafcode/teachLink_mobile/issues/268)) ([22c2a15](https://github.com/rinafcode/teachLink_mobile/commit/22c2a15333561c62d6dce3144f971edd1ca6be02))
* implement biometric re-enrollment flow to prevent user lockout after fingerprint change ([9e57b8b](https://github.com/rinafcode/teachLink_mobile/commit/9e57b8bc328868e3a6805614759d2390dfe03085))
* implement differential privacy for analytics ([#407](https://github.com/rinafcode/teachLink_mobile/issues/407)) ([806c158](https://github.com/rinafcode/teachLink_mobile/commit/806c1585a42ac11f7db4c7bac463ad0ea45e0bd0))
* implement efficient modal stacking and automatic z-index management ([5b1188f](https://github.com/rinafcode/teachLink_mobile/commit/5b1188f11ff57e8713defdd60aa6829e8b2fdca3))
* Implement graceful degradation for camera and location features ([e97e70c](https://github.com/rinafcode/teachLink_mobile/commit/e97e70c5b8b84706ed7982507d45a2da0e1bb1dd))
* implement idle task scheduling for non-critical initialization ([#243](https://github.com/rinafcode/teachLink_mobile/issues/243)) ([b936cdb](https://github.com/rinafcode/teachLink_mobile/commit/b936cdb8a45c043f93dae828e2579c9c7935852a))
* implement intersection observer and viewability hooks for OptimizedVideoPlayer visibility management ([7908ec4](https://github.com/rinafcode/teachLink_mobile/commit/7908ec4338db36b4a430f9db9da20a379461bb15))
* implement lazy video initialization for MobileVideoPlayer ([fe44e52](https://github.com/rinafcode/teachLink_mobile/commit/fe44e52704d4f44e2c8722d8d48a383cc63bd35e))
* Implement progressive image loading with LQIP and WebP ([2f7fa53](https://github.com/rinafcode/teachLink_mobile/commit/2f7fa53a9c00d1da61f7aefbc063dd33f735aafb))
* implement remote feature flags with local fallback and polling ([1282279](https://github.com/rinafcode/teachLink_mobile/commit/1282279b8177955714070446c9da4d33db1878b2))
* implement shimmer SkeletonLoader and fix quizStore index persistence bug ([aa04b7e](https://github.com/rinafcode/teachLink_mobile/commit/aa04b7ed5b4f7fe4f1d308dc6864ba589eb745c4))
* implement smart in-app review system ([ad0e3ab](https://github.com/rinafcode/teachLink_mobile/commit/ad0e3ab0d6256f09e83f74c0dd52387fdd16a317))
* implement touch event deduplication to prevent double-triggers ([#330](https://github.com/rinafcode/teachLink_mobile/issues/330)) ([c3c74db](https://github.com/rinafcode/teachLink_mobile/commit/c3c74dbf743b55e851dc2ea1031b697663a88254))
* migrate forms to react-hook-form for minimal re-renders ([2dc0cf7](https://github.com/rinafcode/teachLink_mobile/commit/2dc0cf742582934e0637b6fccab42ab1e7c2dd30))
* optimize data grid rendering and secure WebView ([4295c1c](https://github.com/rinafcode/teachLink_mobile/commit/4295c1c5d46c392000db4da05e45034375acb303))
* OTA update modal, OTP rate limiting, video lesson auto-complete, delete account confirmation ([5e31b26](https://github.com/rinafcode/teachLink_mobile/commit/5e31b26bcb1a8de1f76eeefe2327defbf76bcfc4))
* quiz results actions, self-contained AppState listener, testable biometric login ([09843d0](https://github.com/rinafcode/teachLink_mobile/commit/09843d0b5bfb73348d3015a632eb8dcd2c4958b1))
* **security:** encrypt AsyncStorage form cache entries with AES-256-GCM ([#587](https://github.com/rinafcode/teachLink_mobile/issues/587)) ([bf4b520](https://github.com/rinafcode/teachLink_mobile/commit/bf4b520c1ed2b54ea86e2aa40477021235cec5ec))
* **security:** mandatory server-side receipt validation before subscription grant ([689a535](https://github.com/rinafcode/teachLink_mobile/commit/689a535e6bda9281bb40114bfafb28efdf491f1a))
* **security:** re-sync biometric enabled state from SecureStore on foreground ([1dd4ec7](https://github.com/rinafcode/teachLink_mobile/commit/1dd4ec7f45cb6bf8cb4e014f660805c4367cce33))
* **sentry:** support tunnel URL to avoid exposing raw DSN in bundle ([cd7153a](https://github.com/rinafcode/teachLink_mobile/commit/cd7153a628e48f1baa3b24b10acd1bb473a736c6))
* **services:** implement idempotent location watch cleanup and hook to logout action via TDD ([edfd079](https://github.com/rinafcode/teachLink_mobile/commit/edfd0793d2af444a226d094fd6f63edc1d802f04))
* styling optimization and font subsetting pipeline ([d475802](https://github.com/rinafcode/teachLink_mobile/commit/d475802db3b575537c02f3b5e93a2cafb4580cc2))
* video crash recovery with retry, renovate config, token refresh race condition docs ([c80fb32](https://github.com/rinafcode/teachLink_mobile/commit/c80fb32ce9549c2c8280a91bdb931b28b9fa6e40))


### Performance Improvements

* add removeClippedSubviews to FlatList components ([6745d9f](https://github.com/rinafcode/teachLink_mobile/commit/6745d9fb3881bf6f3203a0011295a63125c6ac86))
* enable removeClippedSubviews on ScrollView and FlatList ([67d649e](https://github.com/rinafcode/teachLink_mobile/commit/67d649ea5aa101622b9e15c2b7bf0502d296e2cc))
* **frontend:** decouple typing loops from heavy transaction calculations with useTransition ([#245](https://github.com/rinafcode/teachLink_mobile/issues/245)) ([9ab7dfd](https://github.com/rinafcode/teachLink_mobile/commit/9ab7dfd3ac35657ddd9e00d299f7066477a3cda2))
* implement exponential backoff ([#225](https://github.com/rinafcode/teachLink_mobile/issues/225)), request deduplication ([#224](https://github.com/rinafcode/teachLink_mobile/issues/224)), and document lazy loading ([#216](https://github.com/rinafcode/teachLink_mobile/issues/216), [#223](https://github.com/rinafcode/teachLink_mobile/issues/223)) ([30e6d76](https://github.com/rinafcode/teachLink_mobile/commit/30e6d7615e2ff2a9ee98dbaf4b9440a7cab25d5c))
* memoize FlatList renderItem and enforce exhaustive-deps ([c6fcd66](https://github.com/rinafcode/teachLink_mobile/commit/c6fcd66778ae1b9f6b58940df7957a9982ea9cc2))
* reduce store memory footprint at startup ([3374028](https://github.com/rinafcode/teachLink_mobile/commit/33740289e80897cd586546e7af6087c77e3d6dff))
* replace per-response cache-stat calculation with 60 s batched flush ([#811](https://github.com/rinafcode/teachLink_mobile/issues/811)) ([5f519ed](https://github.com/rinafcode/teachLink_mobile/commit/5f519eda60279188b510dc30125424bc9222dbdc))
* skip or reduce cache warming on slow/cellular connections ([#814](https://github.com/rinafcode/teachLink_mobile/issues/814)) ([4723e69](https://github.com/rinafcode/teachLink_mobile/commit/4723e69f604e0ae71a0369466d73f97d5a3e45d5))
* split appStore and lazy-init achievement state ([ab8b06a](https://github.com/rinafcode/teachLink_mobile/commit/ab8b06abf1df31b5f7197ac2886e5808d1648ef3)), closes [#5](https://github.com/rinafcode/teachLink_mobile/issues/5) [#6](https://github.com/rinafcode/teachLink_mobile/issues/6) [#29](https://github.com/rinafcode/teachLink_mobile/issues/29)
* strategic memoization based on re-render profiling ([844c574](https://github.com/rinafcode/teachLink_mobile/commit/844c5745f9865774e48ac4e75352a76e9315d792))
* virtualize bookmark & syllabus lists ([#219](https://github.com/rinafcode/teachLink_mobile/issues/219)) ([15868ca](https://github.com/rinafcode/teachLink_mobile/commit/15868cac9198f19b137f99f7dafc14e9b1d82932))

# [1.15.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.14.1...v1.15.0) (2026-06-01)


### Features

* implement cursor-based pagination for courses and add related hooks and tests ([9f4efb2](https://github.com/rinafcode/teachLink_mobile/commit/9f4efb215e83cdc377c298d3c02cd56cf85e36a7))
* Implement efficient animation scheduling with requestAnimationFrame ([#349](https://github.com/rinafcode/teachLink_mobile/issues/349)) ([b0b8292](https://github.com/rinafcode/teachLink_mobile/commit/b0b82923c0d9bc8c4f746a0f635a9604b0a75218))

## [1.14.1](https://github.com/rinafcode/teachLink_mobile/compare/v1.14.0...v1.14.1) (2026-06-01)


### Bug Fixes

* prevent generic prop spreading in mobile drawer and offline indicator ([e60dea5](https://github.com/rinafcode/teachLink_mobile/commit/e60dea54b982b12f1b3661b6a1d5b930f2566d65))

# [1.14.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.13.0...v1.14.0) (2026-06-01)


### Features

* add resource timing metrics for API calls and image loads ([c34e734](https://github.com/rinafcode/teachLink_mobile/commit/c34e73413e1cf438aad68f7ee8a11f049714641c)), closes [#31](https://github.com/rinafcode/teachLink_mobile/issues/31) [#32](https://github.com/rinafcode/teachLink_mobile/issues/32) [#33](https://github.com/rinafcode/teachLink_mobile/issues/33) [#34](https://github.com/rinafcode/teachLink_mobile/issues/34)
* timeout countdown with progress bar and retry button ([9a4e516](https://github.com/rinafcode/teachLink_mobile/commit/9a4e51612c12efa07259b380c35a8aff11c625d7)), closes [#11](https://github.com/rinafcode/teachLink_mobile/issues/11) [#20](https://github.com/rinafcode/teachLink_mobile/issues/20)

# [1.13.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.12.0...v1.13.0) (2026-06-01)


### Features

* implement TopicFeed UI/UX enhancement ([5e49d20](https://github.com/rinafcode/teachLink_mobile/commit/5e49d20d90059b6d9c48f0465f0acb324b2f0c84))


### Performance Improvements

* add removeClippedSubviews to FlatList components ([1dc4ca3](https://github.com/rinafcode/teachLink_mobile/commit/1dc4ca31f6aadc5aecd1c63a20a81727b4d85e51))

# [1.12.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.11.0...v1.12.0) (2026-06-01)


### Features

* warm critical caches during splash screen startup ([a7f7b03](https://github.com/rinafcode/teachLink_mobile/commit/a7f7b03503f69df433c9b48cd5e5cab86ed96f1a))

# [1.11.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.10.0...v1.11.0) (2026-06-01)


### Bug Fixes

* add build script and regenerate package-lock.json ([1a8a4f3](https://github.com/rinafcode/teachLink_mobile/commit/1a8a4f3bda97e11d995b18e443cfa0a842de5c67))
* replace missing 'npm run build' with 'npx expo export' in CI workflow ([faf9ea0](https://github.com/rinafcode/teachLink_mobile/commit/faf9ea0b0bc96cfccfa924c2001ea05e34e14941))
* strip production debug code ([eaf8818](https://github.com/rinafcode/teachLink_mobile/commit/eaf88180950262537cb3ca092f5960975177d3de))


### Features

* Add cache warming and prefetching strategies for critical data ([d23ea2a](https://github.com/rinafcode/teachLink_mobile/commit/d23ea2a4e6d95e3f5613f4cf4ef5572b4b18d0e3))
* add Core Web Vitals monitoring with regression alerts ([0fbfbd1](https://github.com/rinafcode/teachLink_mobile/commit/0fbfbd18419260383db1754f9ac691d77e5a404c))
* add performance regression testing to CI pipeline ([3b13996](https://github.com/rinafcode/teachLink_mobile/commit/3b13996607a12b9d65ff08d8095ffef8202bafc7)), closes [#31](https://github.com/rinafcode/teachLink_mobile/issues/31) [#32](https://github.com/rinafcode/teachLink_mobile/issues/32) [#34](https://github.com/rinafcode/teachLink_mobile/issues/34)
* add React Profiler integration and performance monitoring ([#246](https://github.com/rinafcode/teachLink_mobile/issues/246)) ([b44bc9f](https://github.com/rinafcode/teachLink_mobile/commit/b44bc9f57242c5f143df70d343bca6cc01d3e7c1))
* add zustandBatch utility for batching state updates in React Native ([b52b8b2](https://github.com/rinafcode/teachLink_mobile/commit/b52b8b2a5ccfcb962e57b4f8e814e5ec1c99758f))
* animation state machine hook with FilterSheet integration ([72e649a](https://github.com/rinafcode/teachLink_mobile/commit/72e649abcd52398cd19b8dd898e3563669c0f8f1))
* **build:** inline small image assets under 1KB as data URLs ([6956ca0](https://github.com/rinafcode/teachLink_mobile/commit/6956ca07684b3d1de29f567897c395e3bc3a9a54))
* implement accessible focus management hooks and AccessibleModal component ([70154eb](https://github.com/rinafcode/teachLink_mobile/commit/70154eb9809084beeed6ad1ceab078cef44809fe))
* Implement battery level-aware performance throttling ([e99271a](https://github.com/rinafcode/teachLink_mobile/commit/e99271aac36dd95f9d59536b1d53d230cfb2c31e))
* implement clipboard performance optimization for large text ([#335](https://github.com/rinafcode/teachLink_mobile/issues/335)) ([8b9e2da](https://github.com/rinafcode/teachLink_mobile/commit/8b9e2da98adac5f319d0e32768df1da3eee3ffb7))
* implement cursor-based pagination for courses and add related hooks and tests ([8216a32](https://github.com/rinafcode/teachLink_mobile/commit/8216a32a7cb1b145fbd0d9b3dac30d4cf42fc34f))
* implement incremental builds and CI/CD caching ([#241](https://github.com/rinafcode/teachLink_mobile/issues/241)) ([d90dff1](https://github.com/rinafcode/teachLink_mobile/commit/d90dff174e2a1541b55a662a402c97327840021c))
* implement modal portal to isolate modals from parent re-renders ([922617c](https://github.com/rinafcode/teachLink_mobile/commit/922617ce48eaba6d3502c8e102966a67c5a60ced)), closes [#5](https://github.com/rinafcode/teachLink_mobile/issues/5) [#7](https://github.com/rinafcode/teachLink_mobile/issues/7) [#29](https://github.com/rinafcode/teachLink_mobile/issues/29)
* implement search cancellation in MobileSearch component ([0bd5fe4](https://github.com/rinafcode/teachLink_mobile/commit/0bd5fe495d7ac7c99052a35373a025fe3ea5844e))
* implement smart cache size management with LRU eviction ([e79efac](https://github.com/rinafcode/teachLink_mobile/commit/e79efacb302f61437aedd971cd1aac7f1cb18590))
* lazy load Sentry and socket.io ([0453648](https://github.com/rinafcode/teachLink_mobile/commit/04536486cd26c8f1ed0b7fb3610ebea04c1a65e0))
* measure predictive-preload accuracy and document the system ([a466a02](https://github.com/rinafcode/teachLink_mobile/commit/a466a0256a91d854855cefa692239a8311e13e2a))
* optimize CSS-in-JS styling with atomic NativeWind styles ([#350](https://github.com/rinafcode/teachLink_mobile/issues/350)) ([2e6ab6f](https://github.com/rinafcode/teachLink_mobile/commit/2e6ab6fdca359c68d5e5632e17556b882652423c))
* optimize location data fetching with caching, batching and precision tiers ([5a7c149](https://github.com/rinafcode/teachLink_mobile/commit/5a7c149cc0653d70fdf80486bb8727d756b47915))
* warm critical caches during splash screen startup ([c489fff](https://github.com/rinafcode/teachLink_mobile/commit/c489ffff5e2d4b7817d70f08e155e74f29668257))


### Performance Improvements

* implement keyboard event delegation at root level ([d552064](https://github.com/rinafcode/teachLink_mobile/commit/d5520647621f0c69b3c0887731f9cc0e9484f38b))
* **ios:** optimize iOS build with LLVM O3, LTO, and bitcode ([0eac62e](https://github.com/rinafcode/teachLink_mobile/commit/0eac62e7f3f41eb99105215775a4d270e9a54007))

# [1.9.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.8.0...v1.9.0) (2026-05-30)


### Bug Fixes

* resolve tmp package high vulnerability in npm audit ([289894b](https://github.com/rinafcode/teachLink_mobile/commit/289894bcbb17644b7f39812dd469bc8363cfb3d2))


### Features

* implement user preference for data-saver mode ([5fa933d](https://github.com/rinafcode/teachLink_mobile/commit/5fa933d59a53cdfe877ccf25a1637b7f30c3f3a1))


### Performance Improvements

* implement efficient diff algorithm for deep object updates ([22c2a5a](https://github.com/rinafcode/teachLink_mobile/commit/22c2a5a93c6e4882cab1ad89c3ea0036fd1bbec9))
* implement native bridge batching for haptics and logging ([dc630c5](https://github.com/rinafcode/teachLink_mobile/commit/dc630c53ad25be1be45f8013240ceb6d03ecb9b2))

# [1.8.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.7.0...v1.8.0) (2026-05-30)


### Features

* **notifications:** implement efficient deduplication and batching ([#387](https://github.com/rinafcode/teachLink_mobile/issues/387)) ([45d2b95](https://github.com/rinafcode/teachLink_mobile/commit/45d2b9595775848c60fbb1ab3f1edf1f3446e872))

# [1.7.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.6.0...v1.7.0) (2026-05-30)


### Features

* add StreamingProgressBar component for visual progress feedback ([85359f4](https://github.com/rinafcode/teachLink_mobile/commit/85359f420d2e5a8c7a30fc3988e420b887ad683f))
* add useStreamingData hook for progressive rendering with automatic deduplication and metrics ([95f70ad](https://github.com/rinafcode/teachLink_mobile/commit/95f70ad232ba452833e79337ba817757319b728d))
* implement streaming API service for progressive rendering with TTFB optimization ([93ae011](https://github.com/rinafcode/teachLink_mobile/commit/93ae01138a8c106f7a9b17650686247d159bac3c))

# [1.6.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.5.0...v1.6.0) (2026-05-30)


### Features

* **logging:** implement async batched logging to prevent UI blocking ([8e57654](https://github.com/rinafcode/teachLink_mobile/commit/8e576540f95e6827dfd2c18b216c0d80e47e09a5)), closes [#362](https://github.com/rinafcode/teachLink_mobile/issues/362)

# [1.5.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.4.0...v1.5.0) (2026-05-30)


### Bug Fixes

* **#347:** Replace index-based keys with stable unique identifiers ([e2917f8](https://github.com/rinafcode/teachLink_mobile/commit/e2917f8f2a3c7ce19625daa12cc2a2e4b00a1275)), closes [#347](https://github.com/rinafcode/teachLink_mobile/issues/347)
* **lint:** sort imports alphabetically and structurally to satisfy strict rule matchers ([f3215f2](https://github.com/rinafcode/teachLink_mobile/commit/f3215f278caf75123622298f2b317f2ad25c2bf7))


### Features

* **build:** add custom Babel production optimizer plugin ([3079903](https://github.com/rinafcode/teachLink_mobile/commit/3079903cf74883488599b00d9671b620a05d3cde))
* enhance useMemoryMonitor with heap tracking, automated leak detection, and high-usage alerts ([071a2b7](https://github.com/rinafcode/teachLink_mobile/commit/071a2b7e977173b1e196cc75928fd2181d7301c6)), closes [hi#usage](https://github.com/hi/issues/usage)
* implement font subsetting pipeline and custom font loading ([#253](https://github.com/rinafcode/teachLink_mobile/issues/253)) ([3d9bf4c](https://github.com/rinafcode/teachLink_mobile/commit/3d9bf4ce277e9afaa42b8d707278188938ca314c))
* implement progressive app startup with visible progress indicator ([0fb5159](https://github.com/rinafcode/teachLink_mobile/commit/0fb51594797edbd9488757bbed91034614b9d314))
* implement react.memo for expensive list item components ([ab05a9a](https://github.com/rinafcode/teachLink_mobile/commit/ab05a9af6c15f5f17231fbc92dacd65291b197d7))
* timeout countdown with progress bar and retry button ([c11e193](https://github.com/rinafcode/teachLink_mobile/commit/c11e19325ad6435d276db027a6fc7ce462dd6efc)), closes [#11](https://github.com/rinafcode/teachLink_mobile/issues/11) [#20](https://github.com/rinafcode/teachLink_mobile/issues/20)


### Performance Improvements

* add useCallback memoization to prevent unnecessary re-renders ([87fb612](https://github.com/rinafcode/teachLink_mobile/commit/87fb612c106c99709d64d0536236ede5bf9ba86e)), closes [#5](https://github.com/rinafcode/teachLink_mobile/issues/5) [#7](https://github.com/rinafcode/teachLink_mobile/issues/7) [#29](https://github.com/rinafcode/teachLink_mobile/issues/29)

# [1.4.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.3.0...v1.4.0) (2026-05-29)


### Bug Fixes

* **#261:** wire isSlowConnection to video quality adaptation ([59d4958](https://github.com/rinafcode/teachLink_mobile/commit/59d49580e92497052d50ef0d32973745ca1c240d)), closes [#261](https://github.com/rinafcode/teachLink_mobile/issues/261)


### Features

* add useFormValidation hook with 300ms debounce ([#351](https://github.com/rinafcode/teachLink_mobile/issues/351)) ([d4f3e64](https://github.com/rinafcode/teachLink_mobile/commit/d4f3e64e44c990245b61f34f66f09f52f4337ac8))
* added smart preloading of next likely screens ([dad22cb](https://github.com/rinafcode/teachLink_mobile/commit/dad22cbdc7ffe961b5707472f25be9bd935a0390))
* **components:** error boundary with automatic retry and exponential backoff ([8ced93b](https://github.com/rinafcode/teachLink_mobile/commit/8ced93bd4dc1ceb284b2283e54a52f15e553987f)), closes [#376](https://github.com/rinafcode/teachLink_mobile/issues/376)
* **devtools:** add in-app memory profiling overlay for development ([4be8119](https://github.com/rinafcode/teachLink_mobile/commit/4be81194401f7f77004cfa409b4f2b9a53f8c82d)), closes [#378](https://github.com/rinafcode/teachLink_mobile/issues/378)


### Performance Improvements

* lazy routes with Suspense and error boundaries ([574494e](https://github.com/rinafcode/teachLink_mobile/commit/574494ecbb096ba23ff171d09e3bd55d1d8224fb)), closes [#377](https://github.com/rinafcode/teachLink_mobile/issues/377)

# [1.3.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.2.0...v1.3.0) (2026-05-29)


### Bug Fixes

* harden mobile search and video player tests ([af42884](https://github.com/rinafcode/teachLink_mobile/commit/af42884b5dd0b2c13c90407767e38c4613b2eaa7))
* regenerate package-lock.json to sync with package.json dependencies ([bd919f4](https://github.com/rinafcode/teachLink_mobile/commit/bd919f4d23a8e0fb1ee40bff8c364c6d7cf83f57))
* repair quiz carousel bundle parse errors ([d451ac7](https://github.com/rinafcode/teachLink_mobile/commit/d451ac76f42c8e043fc938ec617d2a7dd8fbc614))
* resolve CI, dependency audit, and bundle size tracking workflow failures ([fcc8a5d](https://github.com/rinafcode/teachLink_mobile/commit/fcc8a5dcbcbce679af6ef0193f4727e4431c08e9))


### Features

* **#354:** Implement performance regression tests for heavy components ([81d04af](https://github.com/rinafcode/teachLink_mobile/commit/81d04af5e28abb68372613e6b4ace5d5e5ebe7bd)), closes [#354](https://github.com/rinafcode/teachLink_mobile/issues/354) [#354](https://github.com/rinafcode/teachLink_mobile/issues/354)
* **#392:** Implement efficient virtual scroll for infinite lists ([4f374ce](https://github.com/rinafcode/teachLink_mobile/commit/4f374ce40662bd91989ff30ddb8eeb9b7b367ea0)), closes [#392](https://github.com/rinafcode/teachLink_mobile/issues/392)
* **#412:** Implement batch processing for large data imports/exports ([6d5fa4e](https://github.com/rinafcode/teachLink_mobile/commit/6d5fa4e979b56552a226e1fb3ccf1da5f7494806)), closes [#412](https://github.com/rinafcode/teachLink_mobile/issues/412)
* **#640:** add OpenAPI 3.0 compliance validation with CI integration ([a319477](https://github.com/rinafcode/teachLink_mobile/commit/a3194778b57d02f4f646b6d2eb66826ffab0939c)), closes [#640](https://github.com/rinafcode/teachLink_mobile/issues/640)
* cache reusable form values for autofill ([b514fd4](https://github.com/rinafcode/teachLink_mobile/commit/b514fd456f895034a49c198dca2b6cf8b01364fd))
* expand cached form prefilling across auth flows ([0aaeedf](https://github.com/rinafcode/teachLink_mobile/commit/0aaeedf2d3a20d9ea92293cfbfee3160db6a29b2))
* implement optimized video player with native controls and buffering strategy ([c6da89b](https://github.com/rinafcode/teachLink_mobile/commit/c6da89b132d635c5e7172e0c5b3ee7a88948bcb3))
* reduce animation frame rate on low-end devices and battery saver mode ([8fb4b40](https://github.com/rinafcode/teachLink_mobile/commit/8fb4b40d8b8ce8afdbae9c766a0089644cf40884))
* version-based cache invalidation ([#260](https://github.com/rinafcode/teachLink_mobile/issues/260)) ([d51bd44](https://github.com/rinafcode/teachLink_mobile/commit/d51bd4445634135852f64a45d0d78d069ccc5ecc))
* virtualize LessonCarousel and QuizCarousel with FlatList ([7c5be18](https://github.com/rinafcode/teachLink_mobile/commit/7c5be18bdc8926df1c214c46ec7ca40a757da526))


### Performance Improvements

* **navigation:** implement deep link pre-warming ([#388](https://github.com/rinafcode/teachLink_mobile/issues/388)) ([3649cb9](https://github.com/rinafcode/teachLink_mobile/commit/3649cb9b43f235fb387af609edb37fe1de75b711))

# [1.2.0](https://github.com/rinafcode/teachLink_mobile/compare/v1.1.0...v1.2.0) (2026-05-28)


### Features

* add preconnect and dns-prefetch resource hints ([#409](https://github.com/rinafcode/teachLink_mobile/issues/409)) ([66fd12d](https://github.com/rinafcode/teachLink_mobile/commit/66fd12dba21b760f457f5b987e28ce5614e64fe8))

# [1.1.0](https://github.com/rinafcode/teachLink_mobile/compare/c22dc6127c209374a29384ea8d37acc9e4443824...v1.1.0) (2026-05-28)


### Bug Fixes

* batch and debounce rapid user input events (typing, scrolling) ([bf0098b](https://github.com/rinafcode/teachLink_mobile/commit/bf0098bcb10ca78ed387b89edb79d5871dc42753))
* **bookmarks:** wire up bookmark saving, sync, and list display ([3474656](https://github.com/rinafcode/teachLink_mobile/commit/3474656c07bdd535d7648c98f3398fa3d0e093b8))
* consistent code formatting [#171](https://github.com/rinafcode/teachLink_mobile/issues/171) ([48b6451](https://github.com/rinafcode/teachLink_mobile/commit/48b6451b167a03e02abe2fd5cb9569a4d2b5c860))
* **deps:** remove unused dependencies identified by depcheck ([#218](https://github.com/rinafcode/teachLink_mobile/issues/218)) ([4299a8e](https://github.com/rinafcode/teachLink_mobile/commit/4299a8ec3fad04bc6a79e9aaae4f391f7bb1b3e0))
* **hooks:** add all hooks to barrel export in index.ts ([1b3d9ba](https://github.com/rinafcode/teachLink_mobile/commit/1b3d9ba738a59a1e3aa39d7d4c2ef2f9dede9f4e))
* **hooks:** wire up course progress saving and server sync ([c445c7e](https://github.com/rinafcode/teachLink_mobile/commit/c445c7ed7c59eb75d60405db358e032931a697ec))
* implement comprehensive performance audit and optimization report system ([#414](https://github.com/rinafcode/teachLink_mobile/issues/414)) ([42f8f14](https://github.com/rinafcode/teachLink_mobile/commit/42f8f146b9b36684e7471524b0fc1aa821695306))
* memory issues ([859fc5d](https://github.com/rinafcode/teachLink_mobile/commit/859fc5d4b7088b129790286fff6c38d134123ade))
* remove direct console.log and add production stripping ([5177610](https://github.com/rinafcode/teachLink_mobile/commit/5177610bbcec93c2c0394264082253586e54babc))
* remove unused native expo dependencies (close [#041](https://github.com/rinafcode/teachLink_mobile/issues/041)) ([d25ff21](https://github.com/rinafcode/teachLink_mobile/commit/d25ff215b72a2f1da27c1c48904b2f24daeaabec))
* resolve merge conflict in PrimaryButton.tsx ([fe206b5](https://github.com/rinafcode/teachLink_mobile/commit/fe206b53df61e22b3fc7a20374bac9138e12d576))
* **secure-storage:** verify Keychain/Keystore usage and prevent AsyncStorage fallback ([5bd1bfc](https://github.com/rinafcode/teachLink_mobile/commit/5bd1bfc8b736f2ed8aef10341c52fcbd23d5791e)), closes [#140](https://github.com/rinafcode/teachLink_mobile/issues/140)
* updated eslint config ([72ba7c8](https://github.com/rinafcode/teachLink_mobile/commit/72ba7c8e6b397dad7da720e5be5f17a189130f83))
* verify and clean up search history implementation ([5353f87](https://github.com/rinafcode/teachLink_mobile/commit/5353f87542de534ed8782f566cb95f9631f93c4c)), closes [#154](https://github.com/rinafcode/teachLink_mobile/issues/154)
* wire up notification settings persistence ([7c56e0d](https://github.com/rinafcode/teachLink_mobile/commit/7c56e0dc4b92a1d2b8a8d02ed119c2af4b8ac631)), closes [#156](https://github.com/rinafcode/teachLink_mobile/issues/156)


### Features

* **#399:** implement progressive disclosure UI for complex screens ([bb1fd52](https://github.com/rinafcode/teachLink_mobile/commit/bb1fd52e36dee0481b8ec642042bd6a124f52569)), closes [#399](https://github.com/rinafcode/teachLink_mobile/issues/399) [#399](https://github.com/rinafcode/teachLink_mobile/issues/399)
* add accessibility tests for buttons, images, contrast, and keyboard nav ([11c74f0](https://github.com/rinafcode/teachLink_mobile/commit/11c74f0213eca0ee2d83b679b7dbf96ae67a8b96)), closes [#030](https://github.com/rinafcode/teachLink_mobile/issues/030)
* add API cache strategy with stale-while-revalidate ([74a2a4b](https://github.com/rinafcode/teachLink_mobile/commit/74a2a4bdba7d779540a319996a3adbbea1f4d843)), closes [#142](https://github.com/rinafcode/teachLink_mobile/issues/142)
* add bundle size tracking and alerts to CI ([9fcfc1d](https://github.com/rinafcode/teachLink_mobile/commit/9fcfc1daeabc309d672969f62be8d43eb27f8476)), closes [#145](https://github.com/rinafcode/teachLink_mobile/issues/145)
* add comprehensive test suite and CI workflow (Issue [#49](https://github.com/rinafcode/teachLink_mobile/issues/49)) ([7db5414](https://github.com/rinafcode/teachLink_mobile/commit/7db54142e095eed3efb65f4706c5a250931849be))
* add lazy loading / code splitting for screens ([#144](https://github.com/rinafcode/teachLink_mobile/issues/144)) ([16ce9a8](https://github.com/rinafcode/teachLink_mobile/commit/16ce9a848fef7e21f1370447f35a9801b4e22394))
* add lint, typecheck, and test steps to CI workflow ([43ec325](https://github.com/rinafcode/teachLink_mobile/commit/43ec32557f68c26e0c178894398cb11a8f20b242))
* add mobile video player component with controls and picture-in-picture support ([91f539f](https://github.com/rinafcode/teachLink_mobile/commit/91f539ff0d730ecf715c4fd60a343e27cf0e1fed))
* add npm audit and depcheck to CI workflow ([41dfc9b](https://github.com/rinafcode/teachLink_mobile/commit/41dfc9b1ac2f255054318283bc4285ac7e27fd5a))
* add React.lazy code splitting to all heavy routes ([fe8d59a](https://github.com/rinafcode/teachLink_mobile/commit/fe8d59aaf1a53063173fa8f0966aa5b9d1a170aa)), closes [#063](https://github.com/rinafcode/teachLink_mobile/issues/063)
* add real-time socket event handlers ([3d600cc](https://github.com/rinafcode/teachLink_mobile/commit/3d600ccee58157e1211edab065326fd67d64d1d1)), closes [#86](https://github.com/rinafcode/teachLink_mobile/issues/86)
* add release workflow (Close [#124](https://github.com/rinafcode/teachLink_mobile/issues/124)) ([be83228](https://github.com/rinafcode/teachLink_mobile/commit/be83228cb7c87820bba0babe080f2dad511643d2))
* add runtime environment variable validation ([00453ef](https://github.com/rinafcode/teachLink_mobile/commit/00453ef07e8882ef975c6a4c6c9d1a6da6afb093))
* **analytics:** implement event sampling and stabilize secure storage tests ([7abb531](https://github.com/rinafcode/teachLink_mobile/commit/7abb531deb85affe749562245e69654ecf603dfd))
* **analytics:** implement event tracking across screens and components ([0de3fc3](https://github.com/rinafcode/teachLink_mobile/commit/0de3fc3b6662366bd78cb0246e7f387489369c2a))
* **api:** add 429 rate limit handling with exponential backoff ([#141](https://github.com/rinafcode/teachLink_mobile/issues/141)) ([e5eee30](https://github.com/rinafcode/teachLink_mobile/commit/e5eee300e2b863b52f51573d8d6234b8734e5035))
* **api:** corrected linting issues. ([2316402](https://github.com/rinafcode/teachLink_mobile/commit/2316402a5ed8f95afbbe6fcc7f2042b419e5b5cc))
* **api:** implement 403, 429, and 500+ error handling with exponential backoff ([9add556](https://github.com/rinafcode/teachLink_mobile/commit/9add5569dfd84d9e74942032fe79a44642a82e5d))
* **assets:** restore high-resolution icons and fix placeholder assets ([3dc8b1c](https://github.com/rinafcode/teachLink_mobile/commit/3dc8b1cc8c825ee230778d727f9cfeb8c476f13f)), closes [hi#density](https://github.com/hi/issues/density) [hi#res](https://github.com/hi/issues/res) [hi#DPI](https://github.com/hi/issues/DPI)
* **auth:** add centralized auth service with login, logout, and checkAuthStatus ([102e463](https://github.com/rinafcode/teachLink_mobile/commit/102e463a3d8e95d1d93487267668ae8038c44273))
* build mobile test taking interface ([acd596a](https://github.com/rinafcode/teachLink_mobile/commit/acd596af2217e97424981b95fa6f220be681ab6a))
* create haptic feedback hook ([89c99fa](https://github.com/rinafcode/teachLink_mobile/commit/89c99faf758b1b41bc1f380cfcbc1cbaf432caaa))
* form validation added ([f2d214d](https://github.com/rinafcode/teachLink_mobile/commit/f2d214df029c3a09ad50567aa33b9b8bef7d3ec6))
* **image-cache:** integrate image caching throughout app ([0706bc3](https://github.com/rinafcode/teachLink_mobile/commit/0706bc3be65bd228e7d3af35bfe23f160ec25edd)), closes [#143](https://github.com/rinafcode/teachLink_mobile/issues/143)
* implement AdvancedDataGrid with sorting, filtering, editing, and export ([76b3e41](https://github.com/rinafcode/teachLink_mobile/commit/76b3e41fc8478d75d90e69b4da6b4eefb796bf3a))
* implement AdvancedDataGrid with sorting, filtering, editing, and export ([a78b592](https://github.com/rinafcode/teachLink_mobile/commit/a78b592116b3aec893923de41d870bcf615c87ee))
* implement app content cache versioning with smart updates ([#402](https://github.com/rinafcode/teachLink_mobile/issues/402)) ([7fc8c92](https://github.com/rinafcode/teachLink_mobile/commit/7fc8c92d6e400a9f7469d525e023e319578df9b6))
* implement automatic crash recovery with session restoration ([#411](https://github.com/rinafcode/teachLink_mobile/issues/411)) ([06a65c5](https://github.com/rinafcode/teachLink_mobile/commit/06a65c53c98e62b71cbcaac831d73db022d19592))
* implement automatic route-size based code splitting heuristics ([6b6534b](https://github.com/rinafcode/teachLink_mobile/commit/6b6534bdd1a3fd143206f34eb8f4eddee4b13e52))
* implement centralized logger and replace console statements ([960f707](https://github.com/rinafcode/teachLink_mobile/commit/960f7076cdf2424030abe810fe1b5cc464c72a25))
* implement contextual skeleton loading states for perceived performance ([#403](https://github.com/rinafcode/teachLink_mobile/issues/403)) ([c2c1edc](https://github.com/rinafcode/teachLink_mobile/commit/c2c1edcd1c00c904b4a6330df901e82372583c77))
* implement Deep linking and app links ([6552258](https://github.com/rinafcode/teachLink_mobile/commit/655225848ea350b12b84979f6bb7ccd9139bd938))
* implement dynamic font scaling throughout the app ([77685f8](https://github.com/rinafcode/teachLink_mobile/commit/77685f860f7b9c03be37b446eef3327478872bd0))
* implement error boundaries for main screens and layout components ([165e87d](https://github.com/rinafcode/teachLink_mobile/commit/165e87d9dd8b908f8134c63682259184a8b57292))
* implement mobile analytics and crash reporting [#36](https://github.com/rinafcode/teachLink_mobile/issues/36) ([4ba1ab1](https://github.com/rinafcode/teachLink_mobile/commit/4ba1ab1e35ff397df99e2aa04b713104adb4fe84))
* Implement mobile app store deployment with EAS ([8633760](https://github.com/rinafcode/teachLink_mobile/commit/8633760c0337d238cd287bec017b1fde2cf36a72))
* Implement Mobile Course Viewer with swipeable lessons, progress tracking, bookmarks, and notes ([5bbae39](https://github.com/rinafcode/teachLink_mobile/commit/5bbae3989bc218864922d6b25607c9f25f6fa9d9))
* implement mobile navigation system ([c22dc61](https://github.com/rinafcode/teachLink_mobile/commit/c22dc6127c209374a29384ea8d37acc9e4443824))
* Implement Mobile Profile Management components ([328c46b](https://github.com/rinafcode/teachLink_mobile/commit/328c46b3c42d7fe46d8b65be24887e071e71134d))
* Implement Mobile Profile Management components ([f559854](https://github.com/rinafcode/teachLink_mobile/commit/f559854d72df62751ed1e04e1509a29c757bf845))
* implement offline request queue with retry and pending badge ([37cb6cd](https://github.com/rinafcode/teachLink_mobile/commit/37cb6cd24079eca1ce7cb99c29d9e21dd1cdf765))
* implement session expiry handling (auto-refresh, logout, warnings) ([abbcf59](https://github.com/rinafcode/teachLink_mobile/commit/abbcf59d2113194a83fe209c42b46e133cbe2c4d))
* implement splash screen logic to manage application initialization and resource loading ([7989211](https://github.com/rinafcode/teachLink_mobile/commit/7989211bcfb1ed9603c9f4c33ac3d90310dec480))
* implement Trie-based autocomplete for instant search ([#410](https://github.com/rinafcode/teachLink_mobile/issues/410)) ([8cfaea1](https://github.com/rinafcode/teachLink_mobile/commit/8cfaea1cf3849727265fd2a7c0eea0e2ccaa4e69))
* implement useAnalytics hook and integrate automatic screen tracking in root layout ([657f792](https://github.com/rinafcode/teachLink_mobile/commit/657f792d0ab70ab70e4742f6967a1c85c3b46a72))
* initialize push notifications at app startup ([d2adee9](https://github.com/rinafcode/teachLink_mobile/commit/d2adee93b9d7ddca3298e6cefc0d1c0b10bbbe93))
* initialize TeachLink mobile app with Expo and React Native ([3abab2b](https://github.com/rinafcode/teachLink_mobile/commit/3abab2b05172f79b5e8fc49e98d6d03e652eddf1)), closes [#1](https://github.com/rinafcode/teachLink_mobile/issues/1)
* **logging:** Implement centralized structured logging system [#176](https://github.com/rinafcode/teachLink_mobile/issues/176) ([1ebe1cf](https://github.com/rinafcode/teachLink_mobile/commit/1ebe1cff84360c8c66df0eb3e99516b8eb78f5fb))
* Mobile Performance Optimizations (Image Caching, Virtual Lists, Memory Monitoring) ([bd8b740](https://github.com/rinafcode/teachLink_mobile/commit/bd8b74042217355e9fedda8065070c457b0c717b))
* redesign HomeScreen and MobileSyllabus with unified design system ([3bebea3](https://github.com/rinafcode/teachLink_mobile/commit/3bebea3e0891315a6c9798ec769382d30f88fce3)), closes [#19c3e6](https://github.com/rinafcode/teachLink_mobile/issues/19c3e6)
* setup Storybook and add component stories [#175](https://github.com/rinafcode/teachLink_mobile/issues/175) ([06e8a76](https://github.com/rinafcode/teachLink_mobile/commit/06e8a76418ef9b3ce8d4138660ca04f82b498b9b))
* **socket:** add protobuf-style binary websocket protocol ([c07c749](https://github.com/rinafcode/teachLink_mobile/commit/c07c749cdb5dbfef5af2ed4b428533b16832f584))
* **socket:** enable websocket deflate compression with benchmarking telemetry ([2920e22](https://github.com/rinafcode/teachLink_mobile/commit/2920e226bc34b0f5f3dcfec884ed0ce6382610cd))
* **store:** add devtools and subscribeWithSelector middleware to Zustand store ([6891fb2](https://github.com/rinafcode/teachLink_mobile/commit/6891fb23fe51a95d45683710c4ff29270b397a8e))
* **store:** implement selective persistence with versioning ([#384](https://github.com/rinafcode/teachLink_mobile/issues/384)) ([8c449da](https://github.com/rinafcode/teachLink_mobile/commit/8c449dad66ce1cff103acc50dd6d7943f8bd35f2))
* **swipe:** add native-backed swipe actions with gesture-handler animations ([f3d748b](https://github.com/rinafcode/teachLink_mobile/commit/f3d748bef731f7d617b97b86ea300bec282bb06f))
* **theme:** optimize dark mode switching with CSS variable tokens ([dca6303](https://github.com/rinafcode/teachLink_mobile/commit/dca6303c46773af4e042df31216572cdacdaf61b))
* update splash screen icon and theme colors in app configuration ([074c0ac](https://github.com/rinafcode/teachLink_mobile/commit/074c0ac90de7cee4910af7daab0df7022906da75))
* wire biometric auth into login/settings and add socket reconnection ([f86551a](https://github.com/rinafcode/teachLink_mobile/commit/f86551a415dcb3cd948389c2e2d816b5a9edc44b)), closes [#82](https://github.com/rinafcode/teachLink_mobile/issues/82) [#85](https://github.com/rinafcode/teachLink_mobile/issues/85)
* wire up achievement badges display with persistent storage ([61a86e0](https://github.com/rinafcode/teachLink_mobile/commit/61a86e07e8c9c83cb02488eab75bfbe1c8225aef)), closes [#155](https://github.com/rinafcode/teachLink_mobile/issues/155)
* wire up react-native-iap for mobile payments ([761dea9](https://github.com/rinafcode/teachLink_mobile/commit/761dea92f4bfc69f300bd7e8132c3a4ebec28b51))
* wire VoiceSearch into search input as compact mic button ([63b4857](https://github.com/rinafcode/teachLink_mobile/commit/63b485767f94b048988e214c99f09ef66f92c0b2)), closes [#88](https://github.com/rinafcode/teachLink_mobile/issues/88)


### Performance Improvements

* add lazy loading and code splitting ([#144](https://github.com/rinafcode/teachLink_mobile/issues/144)) ([bb5f372](https://github.com/rinafcode/teachLink_mobile/commit/bb5f3728d0679f3f9fd4686bf2965c50c18ca03d))
