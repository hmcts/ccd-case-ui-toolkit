import { LeadDemoModule } from './lead-demo.module';

describe('LeadDemoModule', () => {
  let leadDemoModule: LeadDemoModule;

  beforeEach(() => {
    leadDemoModule = new LeadDemoModule();
  });

  it('should create an instance', () => {
    expect(leadDemoModule).toBeTruthy();
  });
});
