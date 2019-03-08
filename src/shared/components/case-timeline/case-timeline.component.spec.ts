import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { By } from '@angular/platform-browser';
import { FieldType, CaseField, CaseViewEvent } from '../../domain';
import { CaseTimelineComponent } from './case-timeline.component';

describe('CaseTimelineComponent', () => {

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

  let EventLogComponent;

  let fixture: ComponentFixture<CaseTimelineComponent>;
  let component: CaseTimelineComponent;
  let de: DebugElement;

  beforeEach(async(() => {

    EventLogComponent = MockComponent({ selector: 'ccd-event-log', inputs: [
      'events'
    ]});

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          CaseTimelineComponent,

          // Mocks
          EventLogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseTimelineComponent);
    component = fixture.componentInstance;

    component.events = CASE_EVENTS;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render case history component', () => {
    let eventLogDe = de.query(By.directive(EventLogComponent));

    expect(eventLogDe).toBeDefined();

    let eventLogComponent = eventLogDe.componentInstance;
    expect(eventLogComponent.events).toEqual(CASE_EVENTS);
  });
});
