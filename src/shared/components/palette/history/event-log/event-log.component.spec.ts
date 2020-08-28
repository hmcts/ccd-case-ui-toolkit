import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventLogComponent } from './event-log.component';
import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaseViewEvent } from '../../../../domain/case-view';
import { DatePipe } from '../../utils';
import createSpyObj = jasmine.createSpyObj;
import { FormatTranslatorService } from '../../../../services/case-fields/format-translator.service';

describe('EventLogComponent', () => {

  @Component({
    selector: 'ccd-event-log-table',
    template: ``
  })
  class EventLogTableComponent {
    @Input()
    events: CaseViewEvent[];

    @Input()
    selected: CaseViewEvent;

    @Output()
    onSelect = new EventEmitter<CaseViewEvent>();

    @Output()
    onCaseHistory = new EventEmitter<string>();
  }

  @Component({
    selector: 'ccd-event-log-details',
    template: ``
  })
  class EventLogDetailsComponent {
    @Input()
    event: CaseViewEvent;
  }

  const EVENTS: CaseViewEvent[] = [
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
      user_last_name: 'Smith',
      user_first_name: 'Justin',
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
      user_last_name: 'Chan',
      user_first_name: 'Phillip',
      significant_item: {
        type: 'DOCUMENT',
        description: 'First document description',
        url: 'https://google.com'
      }
    }
  ];
  const SELECTED_EVENT = EVENTS[0];
  const NEWLY_SELECTED_EVENT = EVENTS[1];

  let fixture: ComponentFixture<EventLogComponent>;
  let component: EventLogComponent;
  let de: DebugElement;

  describe('Standalone use', () => {
    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            EventLogComponent,
            // Mock
            EventLogTableComponent,
            EventLogDetailsComponent,
            DatePipe
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventLogComponent);
      component = fixture.componentInstance;
      component.isPartOfCaseTimeline = true;

      component.events = EVENTS;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render an event log table', () => {
      let logTableElement = de.query(By.directive(EventLogTableComponent));

      expect(logTableElement).toBeTruthy();

      let logTable = logTableElement.componentInstance;

      expect(logTable.events).toEqual(EVENTS);
    });

    it('should have log table with no historyDetails subscribers', () => {
      let logTableElement = de.query(By.directive(EventLogTableComponent));
      let logTable = logTableElement.componentInstance;

      expect(logTable.onCaseHistory.observers.length).toBe(0);
    });

    it('should select the first event by default', () => {
      expect(component.selected).toBe(SELECTED_EVENT);

      let logTableElement = de.query(By.directive(EventLogTableComponent));
      let logTable = logTableElement.componentInstance;

      expect(logTable.selected).toEqual(SELECTED_EVENT);
    });

    it('should emit selected event on selection change', () => {
      spyOn(component, 'select').and.callThrough();

      let logTableElement = de.query(By.directive(EventLogTableComponent));
      let logTable = logTableElement.componentInstance;

      logTable.onSelect.emit(NEWLY_SELECTED_EVENT);

      expect(component.select).toHaveBeenCalledWith(NEWLY_SELECTED_EVENT);
      expect(component.select).toHaveBeenCalledTimes(1);
      expect(component.selected).toEqual(NEWLY_SELECTED_EVENT);
    });

    it('should render an event log details', () => {
      let logDetailsElement = de.query(By.directive(EventLogDetailsComponent));

      expect(logDetailsElement).toBeTruthy();

      let logTable = logDetailsElement.componentInstance;

      expect(logTable.event).toEqual(SELECTED_EVENT);
    });
  });

  describe('Case timeline use', () => {

    let caseHistoryHandler;
    beforeEach(async(() => {

      caseHistoryHandler = createSpyObj('caseHistoryHandler', ['apply']);

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            EventLogComponent,
            // Mock
            EventLogTableComponent,
            EventLogDetailsComponent,
            DatePipe
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventLogComponent);
      component = fixture.componentInstance;
      component.events = EVENTS;
      component.isPartOfCaseTimeline = true;
      component.onCaseHistory.subscribe(caseHistoryHandler.apply);

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should have log table with one historyDetails subscriber', () => {
      let logTableElement = de.query(By.directive(EventLogTableComponent));
      let logTable = logTableElement.componentInstance;

      expect(logTable.onCaseHistory.observers.length).toBe(1);
    });

    it('should emit event if hyperlink clicked', () => {
      component.caseHistoryClicked('4');

      expect(caseHistoryHandler.apply).toHaveBeenCalledWith('4');
    });
  });
});
