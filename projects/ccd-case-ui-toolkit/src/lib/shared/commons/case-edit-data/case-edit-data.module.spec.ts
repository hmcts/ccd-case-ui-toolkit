import { CaseEditDataModule } from './case-edit-data.module';

describe('JurisdictionService', () => {
  describe('forRoot', () => {
    it('shouldto be truthy', () => {
      expect(CaseEditDataModule.forRoot()).toBeTruthy();
    });
  });
});
