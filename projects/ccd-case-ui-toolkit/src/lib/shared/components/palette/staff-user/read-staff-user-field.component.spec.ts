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
});
