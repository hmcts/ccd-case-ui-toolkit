import { MultipleDemoModule } from './multiple-demo.module';

describe('MultipleDemoModule', () => {
  let multipleDemoModule: MultipleDemoModule;

  beforeEach(() => {
    multipleDemoModule = new MultipleDemoModule();
  });

  it('should create an instance', () => {
    expect(multipleDemoModule).toBeTruthy();
  });
});
