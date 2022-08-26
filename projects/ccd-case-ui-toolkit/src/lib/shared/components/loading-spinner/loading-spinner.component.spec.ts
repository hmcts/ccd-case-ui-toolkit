import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RpxTranslationModule.forRoot({ baseUrl: '', debounceTimeMs: 300, testMode: true, validity: { days: 1 }})        
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ LoadingSpinnerComponent ]
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
