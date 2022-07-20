import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LinkedCasesPages } from '../../enums';
import { BeforeYouStartComponent } from './before-you-start.component';

describe('BeforeYouStartComponent', () => {
  let component: BeforeYouStartComponent;
  let fixture: ComponentFixture<BeforeYouStartComponent>;
  let nextButton: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
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
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalledWith(
      { currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START, navigateToNextPage: true });
  });

  it('should display correct text content for link cases journey', () => {
    //component.isLinkCasesJourney = true;
    fixture.detectChanges();
    const linkCasesJourneyElement = fixture.debugElement.nativeElement.querySelector('#link-cases-journey');
    expect(linkCasesJourneyElement.textContent).toBe(
      'If a group of linked cases has a lead case, you must start from the lead case.If the cases to be linked has no lead, you can start the linking journey from any of those cases.');
  });

  it('should display correct text content for manage link cases journey', () => {
    //component.isLinkCasesJourney = false;
    fixture.detectChanges();
    const manageLinkCasesJourneyElement = fixture.debugElement.nativeElement.querySelector('#manage-link-cases-journey');
    expect(manageLinkCasesJourneyElement.textContent).toBe(
      'If there are linked hearings for the case you need to un-link then you must unlink the hearing first.'
    );
  });
});
