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

  it('should not convert case references that are part of a link, route or path', () => {
    expect(caseReference.transform('/1234567890123456')).toBe('/1234567890123456');
  });

  it('should convert case reference prompt but not link in markdown', () => {
    const input = 'Sample Label [case link reference - 1639568302102747](/caselink/1639568302102747)';
    const expected = 'Sample Label [case link reference - 1639-5683-0210-2747](/caselink/1639568302102747)';

    expect(caseReference.transform(input)).toBe(expected);
  });

  it('should convert all case references within a string', () => {
    const input = 'case ref 1: 1234567890123456 case ref 2: 1234567890123456';
    const expected = 'case ref 1: 1234-5678-9012-3456 case ref 2: 1234-5678-9012-3456';

    expect(caseReference.transform(input)).toBe(expected);
  });
});
