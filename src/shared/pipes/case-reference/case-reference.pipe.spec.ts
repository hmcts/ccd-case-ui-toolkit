import { CaseReferencePipe } from './case-reference.pipe';

describe('CaseReferencePipe', () => {

  let caseReference: CaseReferencePipe;

  beforeEach(() => {
    caseReference = new CaseReferencePipe();
  });

  it('should hyphenate every 4th digit of case reference', () => {
    expect(caseReference.transform('1234567890123456')).toBe('1234-5678-9012-3456');
  });

  it('should return DRAFT case reference looks like a draft Id', () => {
    expect(caseReference.transform('DRAFT123456789')).toBe('DRAFT');
  });
});
