import { DashPipe } from './dash.pipe';

describe('DashPipe', () => {

  let dashPipe: DashPipe;

  beforeEach(() => {
    dashPipe = new DashPipe();
  });

  it('should produce dash if empty field', () => {
    expect(dashPipe.transform('')).toBe('-');
  });

  it('should produce dash if null field', () => {
    expect(dashPipe.transform(null)).toBe('-');
  });

  it('should produce dash if undefined field', () => {
    expect(dashPipe.transform(undefined)).toBe('-');
  });

  it('should return original value if defined', () => {
    expect(dashPipe.transform('value')).toBe('value');
  });

});
