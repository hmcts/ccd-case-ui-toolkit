import { TestBed } from '@angular/core/testing';
import { LinkedCasesService } from '../../components/palette/case-link/services';
import { LinkCasesReasonValuePipe } from './ccd-link-cases-reason-code.pipe';

describe('LinkCasesReasonValuePipe', () => {

  let linkCasesReasonValuePipe: LinkCasesReasonValuePipe;
  const linkedCasesService = new LinkedCasesService();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: LinkedCasesService, useValue: linkedCasesService}]
    });
    linkCasesReasonValuePipe = new LinkCasesReasonValuePipe(linkedCasesService);
  });

  it('should hyphenate every 4th digit of case reference', () => {
    expect(linkCasesReasonValuePipe.transform('1234567890123456')).toBe('1234-5678-9012-3456');
  });

  it('should return DRAFT case reference looks like a draft Id', () => {
    expect(linkCasesReasonValuePipe.transform('DRAFT123456789')).toBe('DRAFT');
  })
});
