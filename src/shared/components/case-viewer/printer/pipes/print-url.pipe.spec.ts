import { PrintUrlPipe } from './print-url.pipe';
import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../../app.config';

describe('PrintUrlPipe', () => {
  const LOCAL_PRINT_SERVICE_URL = '/print';
  const REMOTE_PRINT_SERVICE_URL_PATHNAME = '/jurisdictions/TEST/case-types/Test1/cases/1111222233334444';
  const REMOTE_PRINT_SERVICE_URL = 'https://return-case-doc.ccd.reform' + REMOTE_PRINT_SERVICE_URL_PATHNAME;
  let printUrlPipe: PrintUrlPipe;
  let appConfig: jasmine.SpyObj<AbstractAppConfig>;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getPrintServiceUrl']);
    appConfig.getPrintServiceUrl.and.returnValue(LOCAL_PRINT_SERVICE_URL);
    printUrlPipe = new PrintUrlPipe(appConfig);
    // Workaround using callFake to call "new"; not able to spy on URL constructor (this DOM object constructor
    // cannot be called as a function)
    const realURL = URL;
    spyOn(window, 'URL').and.callFake((url: string) => {
      return new realURL(url);
    });
  });

  it('should rewrite the remote Print Service URL correctly when the browser is Internet Explorer < 11', () => {
    // Set navigator.userAgent property to "Internet Explorer" (< 11) identifier
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)',
      configurable: true
    });
    const url = printUrlPipe.transform(REMOTE_PRINT_SERVICE_URL);
    // Check that the URL interface is NOT called; it's not supported by IE
    expect(URL).not.toHaveBeenCalled();
    expect(url).toEqual(LOCAL_PRINT_SERVICE_URL + REMOTE_PRINT_SERVICE_URL_PATHNAME);
  });

  it('should rewrite the remote Print Service URL correctly when the browser is Internet Explorer 11', () => {
    // Set navigator.userAgent property to "Internet Explorer 11" identifier
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko',
      configurable: true
    });
    const url = printUrlPipe.transform(REMOTE_PRINT_SERVICE_URL);
    // Check that the URL interface is NOT called; it's not supported by IE
    expect(URL).not.toHaveBeenCalled();
    expect(url).toEqual(LOCAL_PRINT_SERVICE_URL + REMOTE_PRINT_SERVICE_URL_PATHNAME);
  });

  it('should rewrite the remote Print Service URL correctly when the browser is not Internet Explorer', () => {
    // Set navigator.userAgent property to non-IE identifier
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82',
      configurable: true
    });
    const url = printUrlPipe.transform(REMOTE_PRINT_SERVICE_URL);
    // Check that the URL interface IS called; it's supported by non-IE browsers
    expect(URL).toHaveBeenCalled();
    expect(url).toEqual(LOCAL_PRINT_SERVICE_URL + REMOTE_PRINT_SERVICE_URL_PATHNAME);
  });

  it('should not rewrite the remote Print Service URL if it is null', () => {
    const url = printUrlPipe.transform(null);
    expect(url).toBeNull();
  });

  it('should not rewrite the remote Print Service URL if it is undefined', () => {
    const url = printUrlPipe.transform(undefined);
    expect(url).toBeUndefined();
  });

  it('should not rewrite the remote Print Service URL if it is an empty string', () => {
    const url = printUrlPipe.transform('');
    expect(url).toEqual('');
  });
});
