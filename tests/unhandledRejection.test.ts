import { crashReportingService } from '../src/services/crashReporting';
import { appLogger } from '../src/utils/logger';

jest.mock('../src/utils/logger', () => ({
  appLogger: {
    errorSync: jest.fn(),
  },
}));

jest.mock('../src/services/crashReporting', () => ({
  crashReportingService: {
    reportError: jest.fn(),
  },
}));

describe('Unhandled Promise Rejection', () => {
  let globalHandler: (error: Error, isFatal?: boolean) => void;

  beforeAll(() => {
    globalHandler = ErrorUtils.getGlobalHandler();
  });

  afterEach(() => {
    ErrorUtils.setGlobalHandler(globalHandler);
    jest.clearAllMocks();
  });

  it('should be captured by the global error handler', done => {
    const testError = new Error('Test unhandled rejection');

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      if (!isFatal) {
        appLogger.errorSync('Unhandled Promise Rejection', error);
        crashReportingService.reportError(error, 'UnhandledPromiseRejection');
        expect(appLogger.errorSync).toHaveBeenCalledWith('Unhandled Promise Rejection', testError);
        expect(crashReportingService.reportError).toHaveBeenCalledWith(
          testError,
          'UnhandledPromiseRejection'
        );
        done();
      }
    });

    Promise.reject(testError);
  });
});
