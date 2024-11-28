import { ReadCookieService } from "./read-cookie-service";

describe('CookieService', () => {
  const mockDocument: any = {
    cookie: ''
  };

  const cookieService: ReadCookieService = new ReadCookieService(mockDocument);

  afterEach(() => {
    mockDocument.cookie = '';
  });

  it('should get a cookie', () => {

    mockDocument.cookie = 'user=dummy';
    const result = cookieService.getCookie('user');
    expect(result).toBe('dummy');
  });

});
