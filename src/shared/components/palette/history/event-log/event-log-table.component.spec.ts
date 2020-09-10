import { EventLogTableComponent } from './event-log-table.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseViewEvent } from '../../../../domain/case-view';
import { DatePipe } from '../../utils';
import createSpyObj = jasmine.createSpyObj;
import * as moment from 'moment-timezone';

describe('EventLogTableComponent', () => {

  const EVENTS: CaseViewEvent[] = [
    {
      id: 5,
      timestamp: '2017-05-10T10:00:00.000Z',
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
      timestamp: '2017-05-09T16:07:03.973Z',
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
  const SELECTED_EVENT = EVENTS[0];

  const $TABLE_HEADERS = By.css('table>thead>tr>th');
  const $TABLE_ROWS = By.css('table>tbody>tr');
  const $TABLE_ROW_LINKS_TIMELINE = By.css('table>tbody>tr>td>div#case-timeline>a');
  const $TABLE_ROW_LINKS_STANDALONE = By.css('table>tbody>tr>td>div:not(.tooltip)>a');

  const COL_EVENT = 0;
  const COL_DATE = 1;
  const COL_AUTHOR = 2;

  let fixture: ComponentFixture<EventLogTableComponent>;
  let component: EventLogTableComponent;
  let de: DebugElement;

  describe('Standalone use', () => {
    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [
            EventLogTableComponent,
            DatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventLogTableComponent);
      component = fixture.componentInstance;

      component.events = EVENTS;
      component.selected = SELECTED_EVENT;
      component.isPartOfCaseTimeline = false;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a table with 3 columns', () => {
      let headers = de.queryAll($TABLE_HEADERS);

      expect(headers.length).toBe(3);

      expect(headers[COL_EVENT].nativeElement.textContent).toBe('Event');
      expect(headers[COL_DATE].nativeElement.textContent).toBe('Date');
      expect(headers[COL_AUTHOR].nativeElement.textContent).toBe('Author');
    });

    it('should render a row for each event', () => {
      let rows = de.queryAll($TABLE_ROWS);

      expect(rows.length).toBe(EVENTS.length);

      let firstRowCells = rows[0].queryAll(By.css('td'));

      expect(firstRowCells.length).toBe(3);
      let firstEvent = EVENTS[0];

      const timeZoneOffset = -(new Date().getTimezoneOffset());

      expect(firstRowCells[COL_EVENT].nativeElement.textContent).toBe(firstEvent.event_name + firstEvent.significant_item.description);
      expect(firstRowCells[COL_DATE].nativeElement.textContent)
        .toBe('10 May 2017, 10:00:00 AM Local: ' + moment(EVENTS[0].timestamp).utcOffset(timeZoneOffset).format('D MMM YYYY, h:mm:ss A'));
      expect(firstRowCells[COL_AUTHOR].nativeElement.textContent).toEqual('Justin SMITH');

      let secondRowCells = rows[1].queryAll(By.css('td'));

      expect(secondRowCells.length).toBe(3);
      let secondEvent = EVENTS[1];

      expect(secondRowCells[COL_EVENT].nativeElement.textContent).toBe(secondEvent.event_name);
      expect(secondRowCells[COL_DATE].nativeElement.textContent)
        .toBe('9 May 2017, 4:07:03 PM Local: ' + moment(EVENTS[1].timestamp).utcOffset(timeZoneOffset).format('D MMM YYYY, h:mm:ss A'));
      expect(secondRowCells[COL_AUTHOR].nativeElement.textContent).toEqual('Phillip CHAN');
    });

    it('should highlight the row selected', () => {
      let rows = de.queryAll($TABLE_ROWS);

      expect(rows[0].classes['EventLogTable-Selected']).toBeTruthy();
      expect(rows[1].classes['EventLogTable-Selected']).toBeFalsy();
    });

    it('should change the selected row when another row is clicked', () => {
      let rows = de.queryAll($TABLE_ROWS);

      rows[1].nativeElement.click();
      fixture.detectChanges();

      expect(component.selected).toBe(EVENTS[1]);
      expect(rows[0].classes['EventLogTable-Selected']).toBeFalsy();
      expect(rows[1].classes['EventLogTable-Selected']).toBeTruthy();
    });

    it('should fire onSelect event when another row is clicked', () => {
      spyOn(component.onSelect, 'emit');

      let rows = de.queryAll($TABLE_ROWS);

      rows[1].nativeElement.click();
      fixture.detectChanges();

      expect(component.onSelect.emit).toHaveBeenCalledWith(EVENTS[1]);
    });

    it('should render hyperlink for each row and link to event id', () => {
      let links = de.queryAll($TABLE_ROW_LINKS_STANDALONE);

      expect(links.length).toBe(2);
      expect(links[0].nativeElement.getAttribute('href')).toBe('/event/5/history');
      expect(links[1].nativeElement.getAttribute('href')).toBe('/event/4/history');
    });

    it('should display icon if significant item exist', () => {
      expect(component.significantItemExist(EVENTS[0])).toBeTruthy();
    });

    it('should not display icon if significant item does not exist', () => {
      expect(component.significantItemExist(EVENTS[1])).toBeFalsy();
    });

    it('should contain the significant item description', () => {
      expect(component.getSignificantItemDesc(EVENTS[0])).toEqual('First document description');
    });

    it('should contain the significant item url', () => {
      expect(component.getSignificantItemUrl(EVENTS[1])).toEqual('https://google.com');
    });
  });

  describe('Case timeline use', () => {

    let caseHistoryHandler;
    beforeEach(async(() => {

      caseHistoryHandler = createSpyObj('caseHistoryHandler', ['apply']);

      TestBed
        .configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [
            EventLogTableComponent,
            DatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(EventLogTableComponent);
      component = fixture.componentInstance;

      component.events = EVENTS;
      component.selected = SELECTED_EVENT;
      component.isPartOfCaseTimeline = true;
      component.onCaseHistory.subscribe(caseHistoryHandler.apply);

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should emit event if hyperlink clicked', () => {
      let rows = de.queryAll($TABLE_ROW_LINKS_TIMELINE);

      rows[1].nativeElement.click();
      fixture.detectChanges();

      expect(caseHistoryHandler.apply).toHaveBeenCalledWith(4);
    });
  });
});
