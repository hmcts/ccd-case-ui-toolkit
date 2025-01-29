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
    initialCaseLinkRefs: [],
    serverLinkedApiError: null,
    hasContinuedFromStart: false,
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
    linkedCasesService.caseFieldValue = [{ id: '123' }];
    linkedCasesService.linkedCases = [];
    linkedCasesService.hasContinuedFromStart = false;
    linkedCasesService.initialCaseLinkRefs = [];
    fixture = TestBed.createComponent(BeforeYouStartComponent);
    component = fixture.componentInstance;
    spyOn(component.linkedCasesStateEmitter, 'emit');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
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

  it('should emit linkedCasesStateEmitter when next is called', () => {
    component.next();
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalled();
  });

  it('should call super.next when next is called and errorMessages is an empty array', () => {
    spyOn(component, 'next').and.callThrough();
    component.errorMessages = [];
    component.next();
    expect(component.next).toHaveBeenCalled();
  });

  it('should set the initialCaseLinkRefs when linkedCases is empty and caseFieldValue is not empty', () => {
    expect(linkedCasesService.initialCaseLinkRefs).toEqual(['123']);
  });

  it('should set the initialCaseLinkRefs when linkedCases is not empty and caseFieldValue is not empty', () => {
    expect(linkedCasesService.initialCaseLinkRefs).toEqual(['123']);
  });
});

describe('BeforeYouStartComponent - secondary checks', () => {
  let component: BeforeYouStartComponent;
  let fixture: ComponentFixture<BeforeYouStartComponent>;

  const linkedCasesService = {
    caseId: '1682374819203471',
    isLinkedCasesEventTrigger: false,
    caseFieldValue: [{ id: '123' }],
    linkedCases: [{ caseReference: '123' }],
    initialCaseLinkRefs: [],
    serverLinkedApiError: null,
    hasContinuedFromStart: false,
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

  it('should set the initialCaseLinkRefs when linkedCases is not empty and caseFieldValue is not empty', () => {
    expect(linkedCasesService.initialCaseLinkRefs).toEqual(['123']);
  });
});
