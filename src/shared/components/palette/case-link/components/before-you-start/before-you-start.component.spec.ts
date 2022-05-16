import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkedCasesPages } from '../../enums';
import { BeforeYouStartComponent } from './before-you-start.component';

describe('BeforeYouStartComponent', () => {
  let component: BeforeYouStartComponent;
  let fixture: ComponentFixture<BeforeYouStartComponent>;
  let nextButton: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [BeforeYouStartComponent],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeforeYouStartComponent);
    component = fixture.componentInstance;
    spyOn(component.linkedCasesStateEmitter, 'emit');
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should next event emit linked cases state with no error', () => {
    nextButton.click();
    fixture.detectChanges();
    expect(component.errorMessages).toBeUndefined();
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalledWith(
      { currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START, errorMessages: component.errorMessages, navigateToNextPage: true });
  });
});
