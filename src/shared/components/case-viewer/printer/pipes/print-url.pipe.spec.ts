import { PrintUrlPipe } from './print-url.pipe';
import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../../app.config';

describe('PrintUrlPipe', () => {
  const PRINT_MANAGEMENT_URL = 'http://localhost:1234/print';
  const MATCHING_REMOTE_PRINT_MANAGEMENT_URL = 'https://return-case-doc.ccd.reform';
  const NON_MATCHING_REMOTE_PRINT_MANAGEMENT_URL = 'https://external.ccd.reform';
  let printUrlPipe: PrintUrlPipe;
  let appConfig: any;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getPrintServiceUrl', 'getRemotePrintServiceUrl']);
    appConfig.getPrintServiceUrl.and.returnValue(PRINT_MANAGEMENT_URL);
    appConfig.getRemotePrintServiceUrl.and.returnValue(MATCHING_REMOTE_PRINT_MANAGEMENT_URL);
    printUrlPipe = new PrintUrlPipe(appConfig);
  });

  describe('given the Print Service URL is the one in the app config', () => {
    it('should be replaced with the Print Service endpoint URL of the API Gateway', () => {
      let url = printUrlPipe.transform(MATCHING_REMOTE_PRINT_MANAGEMENT_URL);
      expect(url).toEqual(PRINT_MANAGEMENT_URL);
    });
  });

  describe('given the Print Service URL is NOT the one in the app config', () => {
    it('should be left unchanged', () => {
      let url = printUrlPipe.transform(NON_MATCHING_REMOTE_PRINT_MANAGEMENT_URL);
      expect(url).toEqual(NON_MATCHING_REMOTE_PRINT_MANAGEMENT_URL);
    });
  });
});
