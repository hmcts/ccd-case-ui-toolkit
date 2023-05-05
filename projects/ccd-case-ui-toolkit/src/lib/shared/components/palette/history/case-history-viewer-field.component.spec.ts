import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { CaseViewEvent } from '../../../domain';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseHistoryViewerFieldComponent } from './case-history-viewer-field.component';

describe('CaseHistoryViewerFieldComponent', () => {
  const FIELD_TYPE: FieldType = {
    id: 'CaseHistoryViewer',
    type: 'CaseHistoryViewer'
  };
  const CASE_EVENTS: CaseViewEvent[] = [
    {
      id: 5,
      timestamp: '2017-05-10T10:00:00.000',
      summary: 'Case updated again!',
      comment: 'Latest update',
      event_id: 'updateCase',
      event_name: 'Update a case',
      state_id: 'CaseUpdated',
      state_name: 'Case Updated',
      user_id: 0,
      user_last_name: 'smith',
      user_first_name: 'justin',
      significant_item: {
        type: 'DOCUMENT',
        description: 'First document description',
        url: 'https://google.com'
      }
    },
    {
      id: 4,
      timestamp: '2017-05-09T16:07:03.973',
      summary: 'Case updated!',
      comment: 'Plop plop',
      event_id: 'updateCase',
      event_name: 'Update a case',
      state_id: 'CaseUpdated',
      state_name: 'Case Updated',
      user_id: 0,
      user_last_name: 'chan',
      user_first_name: 'phillip',
      significant_item: {
        type: 'NON-DOCUMENT',
        description: 'Second document description',
        url: 'https://google.com'
      }
    }
  ];
  const CASE_FIELD: CaseField = ({
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: CASE_EVENTS
  }) as CaseField;
  const CASE_REFERENCE = '1234123412341234';

  let eventLogComponentMock;

  let fixture: ComponentFixture<CaseHistoryViewerFieldComponent>;
  let component: CaseHistoryViewerFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    eventLogComponentMock = MockComponent({ selector: 'ccd-event-log', inputs: [
      'events'
    ]});

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          CaseHistoryViewerFieldComponent,

          // Mocks
          eventLogComponentMock
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseHistoryViewerFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.caseReference = CASE_REFERENCE;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render case history component', () => {
    const eventLogDe = de.query(By.directive(eventLogComponentMock));

    expect(eventLogDe).toBeDefined();

    const eventLogComponent = eventLogDe.componentInstance;
    expect(eventLogComponent.events).toEqual(CASE_EVENTS);
  });
});
