import { Wizard } from './wizard.model';
import createSpy = jasmine.createSpy;
import { WizardPage } from './wizard-page.model';
import { CaseField } from '../../../domain/definition';

describe('wizard.model', () => {

  const PAGE_1: WizardPage = buildPage('page1', 'Page 1', 1);
  const PAGE_2: WizardPage = buildPage('page2', 'Page 2', 2, [
    buildCaseField('caseField1', 'someValue1'),
    buildCaseField('caseField2', 'someValue2')
  ]);
  const PAGE_3: WizardPage = buildPage('page3', 'Page 3', 3);

  const PAGES: WizardPage[] = [ PAGE_1, PAGE_2, PAGE_3];

  let wizard: Wizard;
  let canShow: any;

  beforeEach(() => {
    wizard = new Wizard(PAGES);
    canShow = createSpy('Predicate<WizardPage>');
  });

  describe('hasPage()', () => {
    it('should return true when page exists', () => {
      expect(wizard.hasPage('page1')).toBeTruthy();
    });

    it('should return false when page does not exists', () => {
      expect(wizard.hasPage('xxx')).toBeFalsy();
    });
  });

  describe('when all pages visible', () => {
    beforeEach(() => {
      canShow.and.returnValue(true);
    });

    it('should return first by order', () => {
      let page = wizard.firstPage(canShow);
      expect(page).toBe(PAGE_1);
    });

    it('should get page by id', () => {
      let page = wizard.getPage(PAGE_2.id, canShow);
      expect(page).toBe(PAGE_2);
    });

    it('should get next page', () => {
      let page = wizard.nextPage(PAGE_2.id, canShow);
      expect(page).toBe(PAGE_3);
    });

    it('should get previous page', () => {
      let page = wizard.previousPage(PAGE_2.id, canShow);
      expect(page).toBe(PAGE_1);
    });

    it('should have previous page', () => {
      let hasPrevious = wizard.hasPreviousPage(PAGE_2.id, canShow);
      expect(hasPrevious).toBeTruthy();
    });

    it('should throw error when page ID does not exist', () => {
      expect(() => {
        wizard.getPage('unknown', canShow);
      }).toThrowError('No page for ID: unknown');

      expect(() => {
        wizard.nextPage('unknown', canShow);
      }).toThrowError('No page for ID: unknown');

      expect(() => {
        wizard.previousPage('unknown', canShow);
      }).toThrowError('No page for ID: unknown');
    });

    it('should return undefined when no next', () => {
      let page = wizard.nextPage(PAGE_3.id, canShow);
      expect(page).toBeUndefined();
    });

    it('should return undefined when no previous', () => {
      let page = wizard.previousPage(PAGE_1.id, canShow);
      expect(page).toBeUndefined();
    });

    it('should not have previous when first', () => {
      let hasPrevious = wizard.hasPreviousPage(PAGE_1.id, canShow);
      expect(hasPrevious).toBeFalsy();
    });
  });

  describe('find page containing caseFieldId', () => {
    it('should get next page', () => {
      let page = wizard.findWizardPage('caseField1');
      expect(page).toBe(PAGE_2);
    });

    it('should return undefined if wizardPage does not exists', () => {
      let page = wizard.findWizardPage('nonExistentCaseFieldId');
      expect(page).toBeUndefined();
    });
  });

  describe('when some pages hidden', () => {
    it('should return first visible page', () => {
      canShow.and.returnValues(false, true);

      let page = wizard.firstPage(canShow);
      expect(page).toBe(PAGE_2);
      expect(canShow).toHaveBeenCalledWith(PAGE_1);
      expect(canShow).toHaveBeenCalledWith(PAGE_2);
    });

    it('should return undefined when getting hidden page', () => {
      canShow.and.returnValue(false);

      let page = wizard.getPage(PAGE_1.id, canShow);
      expect(page).toBeUndefined();
      expect(canShow).toHaveBeenCalledWith(PAGE_1);
    });

    it('should return next visible page', () => {
      // PAGE_2 --> hidden, PAGE_3 --> visible
      canShow.and.returnValues(false, true);

      let page = wizard.nextPage(PAGE_1.id, canShow);
      expect(page).toBe(PAGE_3);
      expect(canShow).not.toHaveBeenCalledWith(PAGE_1);
      expect(canShow).toHaveBeenCalledWith(PAGE_2);
      expect(canShow).toHaveBeenCalledWith(PAGE_3);
    });

    it('should return undefined when no next visible page', () => {
      canShow.and.returnValue(false);

      let page = wizard.nextPage(PAGE_1.id, canShow);
      expect(page).toBeUndefined();
    });

    it('should return previous visible page', () => {
      // PAGE_1 --> visible, PAGE_2 --> hidden
      canShow.and.returnValues(false, true);

      let page = wizard.previousPage(PAGE_3.id, canShow);
      expect(page).toBe(PAGE_1);
      expect(canShow).not.toHaveBeenCalledWith(PAGE_3);
      expect(canShow).toHaveBeenCalledWith(PAGE_2);
      expect(canShow).toHaveBeenCalledWith(PAGE_1);
    });

    it('should return undefined when no previous visible page', () => {
      canShow.and.returnValues(false);

      let page = wizard.previousPage(PAGE_3.id, canShow);
      expect(page).toBeUndefined();
    });

    it('should return undefined when no visible page', () => {
      canShow.and.returnValue(false);

      let page = wizard.firstPage(canShow);
      expect(page).toBeUndefined();
    });
  });

  describe('when pages not initially ordered', () => {
    beforeEach(() => {
      wizard = new Wizard([ PAGE_3, PAGE_1, PAGE_2]);
      canShow.and.returnValue(true);
    });

    it('should order the pages', () => {
      expect(wizard.firstPage(canShow)).toBe(PAGE_1);
      expect(wizard.nextPage(PAGE_1.id, canShow)).toBe(PAGE_2);
      expect(wizard.nextPage(PAGE_2.id, canShow)).toBe(PAGE_3);
    });
  });

  function buildPage(pageId: string, label: string, order: number, caseFields: CaseField[] = undefined): WizardPage {
    let wp = new WizardPage();
    wp.id = pageId;
    wp.label = label;
    wp.order = order;
    wp.case_fields = caseFields;
    return wp;
  }

  function buildCaseField(caseFieldId: string, caseFieldValue: any) {
    let caseField = new CaseField();
    caseField.id = caseFieldId;
    caseField.value = caseFieldValue;
    return caseField;
  }
});
