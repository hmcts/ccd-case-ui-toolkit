import { HttpService } from '../http';
import { JurisdictionService } from './jurisdiction.service';

describe('JurisdictionService', () => {
  let service: JurisdictionService;

  describe('searchJudicialUsers', () => {
    it('should make a http post', () => {
      const mockHttpService = {
        post: () => { }
      };

      service = new JurisdictionService(mockHttpService as unknown as HttpService);
      spyOn(mockHttpService, 'post');
      service.searchJudicialUsers('searchTerm', 'serviceId');

      expect(mockHttpService.post).toHaveBeenCalledWith('api/prd/judicial/getJudicialUsersSearch', { searchString: 'searchTerm', serviceCode: 'serviceId' });
    });

    it('should include the regions when provided', () => {
      const mockHttpService = {
        post: () => { }
      };

      service = new JurisdictionService(mockHttpService as unknown as HttpService);
      spyOn(mockHttpService, 'post');
      service.searchJudicialUsers('searchTerm', 'serviceId', ['1235']);

      expect(mockHttpService.post).toHaveBeenCalledWith('api/prd/judicial/getJudicialUsersSearch',
        { searchString: 'searchTerm', serviceCode: 'serviceId', regions: ['1235'] });
    });
  });

  describe('searchJudicialUsersByPersonalCodes', () => {
    it('should make a http post', () => {
      const mockHttpService = {
        post: () => { }
      };
      const result = ['example'];

      service = new JurisdictionService(mockHttpService as unknown as HttpService);
      spyOn(mockHttpService, 'post');
      service.searchJudicialUsersByPersonalCodes(result);

      expect(mockHttpService.post).toHaveBeenCalledWith('api/prd/judicial/searchJudicialUserByPersonalCodes', { personal_code: result });

    });
  });
});
