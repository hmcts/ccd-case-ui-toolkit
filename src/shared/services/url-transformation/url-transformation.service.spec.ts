import { UrlTransformationService } from './url-transformation.service';

function mockDocument(url: string) {
  return { URL: url };
}

describe('UrlTransformationService', () => {
  const CCD_INTERNAL_URL = 'https://ccd-case-management-web-demo.service.core-compute-demo.internal';
  const CCD_EXTERNAL_URL = 'https://www-ccd.demo.platform.hmcts.net';

  const XUI_INTERNAL_URL = 'https://xui-mo-webapp-demo.service.core-compute-demo.internal';
  const XUI_EXTERNAL_URL = 'https://www-xui-mo-webapp.demo.platform.hmcts.net';

  let urlTransformationService: UrlTransformationService;

  describe('getPreferredEquivalentOf()', () => {

    it('should return non-mapped app\'s internal URL when on external URL', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_EXTERNAL_URL));
      const testUrl = XUI_INTERNAL_URL;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(XUI_EXTERNAL_URL);
    });

    it('should return non-mapped app\'s external URL when on internal URL', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_INTERNAL_URL));
      const testUrl = XUI_EXTERNAL_URL;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(XUI_INTERNAL_URL);
    });

    it('should return mapped app\'s internal URL when on external URL', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_EXTERNAL_URL));
      const testUrl = CCD_INTERNAL_URL;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(CCD_EXTERNAL_URL);
    });

    it('should return mapped app\'s external URL when on internal URL', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_INTERNAL_URL));
      const testUrl = CCD_EXTERNAL_URL;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(CCD_INTERNAL_URL);
    });

    it('should return original URL when already on correct type', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_INTERNAL_URL));
      const testUrl = XUI_INTERNAL_URL;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(testUrl);
    });

    it('should return original URL for a URL not complying to internal or external structure', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_INTERNAL_URL));
      const testUrl = 'https://www.google.com';

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(testUrl);
    });

    it('should retain URL segments in a resulting internal URL', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_INTERNAL_URL));
      const segments = '/one/two/three';
      const testUrl = XUI_EXTERNAL_URL + segments;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(XUI_INTERNAL_URL + segments);
    });

    it('should retain URL segments in a resulting external URL', () => {
      urlTransformationService = new UrlTransformationService(mockDocument(CCD_EXTERNAL_URL));
      const segments = '/one/two/three';
      const testUrl = XUI_INTERNAL_URL + segments;

      const result = urlTransformationService.getPreferredEquivalentOf(testUrl);

      expect(result).toEqual(XUI_EXTERNAL_URL + segments);
    });
  }
  );

  describe('isInternalUrl()', () => {

    it('should return true for an internal url', () => {
      const result = urlTransformationService.isInternalUrl(XUI_INTERNAL_URL);
      expect(result).toBeTruthy();
    });

    it('should return false for an external url', () => {
      const result = urlTransformationService.isInternalUrl(XUI_EXTERNAL_URL);
      expect(result).toBeFalsy();
    });

    it('should return false for a URL not complying to internal or external structure', () => {
      const result = urlTransformationService.isInternalUrl('https://www.google.com');
      expect(result).toBeFalsy();
    });
  }
  );

  describe('isExternalUrl()', () => {

    it('should return true for an external url', () => {
      const result = urlTransformationService.isExternalUrl(XUI_EXTERNAL_URL);
      expect(result).toBeTruthy();
    });

    it('should return false for an internal url', () => {
      const result = urlTransformationService.isExternalUrl(XUI_INTERNAL_URL);
      expect(result).toBeFalsy();
    });

    it('should return false for a URL not complying to internal or external structure', () => {
      const result = urlTransformationService.isExternalUrl('https://www.google.com');
      expect(result).toBeFalsy();
    });
  }
  );
});
