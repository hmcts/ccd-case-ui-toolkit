import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { BeforeYouStartComponent } from './before-you-start.component';

describe('BeforeYouStartComponent', () => {
  let component: BeforeYouStartComponent;
  let fixture: ComponentFixture<BeforeYouStartComponent>;

  const linkedCasesService = {
    caseId: '1682374819203471',
    isLinkedCasesEventTrigger: false,
    caseFieldValue: [],
    linkedCases: [],
    serverLinkedApiError: null,
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve()),
    url: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [BeforeYouStartComponent],
      providers: [
        { provide: LinkedCasesService, useValue: linkedCasesService },
        { provide: Router, useValue: mockRouter },

      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BeforeYouStartComponent);
    component = fixture.componentInstance;
    spyOn(component.linkedCasesStateEmitter, 'emit');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should next event emit linked cases state with no error', () => {
    fixture.detectChanges();
    const buttonElem = fixture.debugElement.query(By.css('.button-primary')); // change selector here
    buttonElem.triggerEventHandler('click', null);
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalledWith(
      { currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START, errorMessages: undefined, navigateToNextPage: true });
  });

  it('should display correct text content for link cases journey', () => {
    component.isLinkCasesJourney = true;
    fixture.detectChanges();
    const linkCasesJourneyElement = fixture.debugElement.nativeElement.querySelector('#link-cases-journey');
    expect(linkCasesJourneyElement.textContent).not.toBeNull();
  });

  it('should display correct text content for manage link cases journey', () => {
    component.isLinkCasesJourney = false;
    fixture.detectChanges();
    const manageLinkCasesJourneyElement = fixture.debugElement.nativeElement.querySelector('#manage-link-cases-journey');
    expect(manageLinkCasesJourneyElement.textContent).toBe(
      'If there are linked hearings for the case you need to un-link then you must unlink the hearing first.'
    );
  });

  it('should return to case details page', () => {
    component.onBack();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
});
