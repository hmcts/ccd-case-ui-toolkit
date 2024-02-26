import { EnumDisplayDescriptionPipe } from './enum-display-description.pipe';

describe('EnumDisplayDescriptionPipe', () => {
  it('create an instance', () => {
    const pipe = new EnumDisplayDescriptionPipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform enum to array of descriptions', () => {
    enum DummyEnum {
      FIRST = 'First',
      SECOND = 'Second',
      THIRD = 'Third',
    }

    const pipe = new EnumDisplayDescriptionPipe();
    expect(pipe.transform(DummyEnum)).toEqual(['First', 'Second', 'Third']);
  });
});
