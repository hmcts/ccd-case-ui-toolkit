import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseFlagStatus } from '../../enums';
import { CaseFlagTableComponent } from './case-flag-table.component';

describe('CaseFlagTableComponent', () => {
  let component: CaseFlagTableComponent;
  let fixture: ComponentFixture<CaseFlagTableComponent>;
  const flagData = {
    flags: {
      partyName: 'John Smith',
      roleOnCase: '',
      details: [{
        name: 'Wheel chair access',
        subTypeValue: '',
        subTypeKey: '',
        otherDescription: '',
        flagComment: '',
        dateTimeModified: new Date('2021-09-09 00:00:00'),
        dateTimeCreated: new Date('2021-09-09 00:00:00'),
        path: [],
        hearingRelevant: false,
        flagCode: '',
        status: CaseFlagStatus.ACTIVE
      },
      {
        name: 'Sign language',
        subTypeValue: 'British Sign Language (BSL)',
        subTypeKey: '',
        otherDescription: '',
        flagComment: '',
        dateTimeModified: new Date('2021-09-09 00:00:00'),
        dateTimeCreated: new Date('2021-09-09 00:00:00'),
        path: [],
        hearingRelevant: false,
        flagCode: '',
        status: CaseFlagStatus.ACTIVE
      }]
    },
    pathToFlagsFormGroup: '',
    caseField: null
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CaseFlagTableComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFlagTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display case flag table if there is case flag data', () => {
    component.flagData = flagData;
    fixture.detectChanges();
    const tableElement = fixture.debugElement.nativeElement.querySelector('govuk-table');
    expect(tableElement).toBeDefined();
  });

  it('should not display case flag table if there is no case flag data', () => {
    component.flagData = null;
    fixture.detectChanges();
    const tableElement = fixture.debugElement.nativeElement.querySelector('govuk-table');
    expect(tableElement).toBeNull();
  });

  it('should not display the blank column when displaying case flags', () => {
    component.flagData = flagData;
    fixture.detectChanges();
    const caseViewerFieldLabelElement = fixture.debugElement.nativeElement.querySelector('#case-viewer-field-label');
    expect(caseViewerFieldLabelElement).toBeNull();
  });
});
