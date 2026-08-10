import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReadStaffUserFieldComponent } from './read-staff-user-field.component';

describe('ReadStaffUserFieldComponent', () => {
  let fixture: ComponentFixture<ReadStaffUserFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({ declarations: [ReadStaffUserFieldComponent] }).compileComponents();
    fixture = TestBed.createComponent(ReadStaffUserFieldComponent);
    fixture.componentInstance.caseField = { metadata: true } as any;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the persisted display name', () => {
    fixture.componentInstance.caseField = {
      value: { idamId: '123', displayName: 'Alex Staff' }
    } as any;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alex Staff');
  });

  it('should render nothing when there is no persisted value', () => {
    fixture.componentInstance.caseField = { value: null } as any;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
