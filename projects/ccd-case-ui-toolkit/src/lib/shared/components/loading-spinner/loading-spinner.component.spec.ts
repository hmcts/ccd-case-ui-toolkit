import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ LoadingSpinnerComponent, MockRpxTranslatePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading text', () => {
    expect(fixture.debugElement.nativeElement.querySelector('div.spinner-inner-container p').textContent).toContain('Loading');
  });

  it('should display overriden loading text', () => {
    component.loadingText = 'Loading instead of Searching';
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('div.spinner-inner-container p').textContent).toContain('Loading instead of Searching');
  });
});
