import { formatDate } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseViewEvent } from '../../../../domain/case-view';
import { FormatTranslatorService } from '../../../../services/case-fields/format-translator.service';
import { DatePipe } from '../../utils';
import { EventLogTableComponent } from './event-log-table.component';
import createSpyObj = jasmine.createSpyObj;

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
  const $TABLE_COLUMNS = By.css('table>tbody>tr>td');

  const COL_EVENT = 0;
  const COL_DATE = 1;
  const COL_AUTHOR = 2;

  let fixture: ComponentFixture<EventLogTableComponent>;
  let component: EventLogTableComponent;
  let de: DebugElement;

  describe('Standalone use', () => {
    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [
            EventLogTableComponent,
            DatePipe
          ],
          providers: [FormatTranslatorService]
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
      const headers = de.queryAll($TABLE_HEADERS);

      expect(headers.length).toBe(3);

      expect(headers[COL_EVENT].nativeElement.textContent).toBe('Event');
      expect(headers[COL_DATE].nativeElement.textContent).toBe('Date');
      expect(headers[COL_AUTHOR].nativeElement.textContent).toBe('Author');
    });

    it('should render a row for each event', () => {
      const rows = de.queryAll($TABLE_ROWS);

      expect(rows.length).toBe(EVENTS.length);

      const firstRowCells = rows[0].queryAll(By.css('td'));

      expect(firstRowCells.length).toBe(3);
      const firstEvent = EVENTS[0];

      const date = new Date(2017, 4, 10); // 10th May, 2017
      const timeZoneOffset = - (new Date(date).getTimezoneOffset());

      expect(firstRowCells[COL_EVENT].nativeElement.textContent).toBe(firstEvent.event_name + firstEvent.significant_item.description);
      expect(firstRowCells[COL_AUTHOR].nativeElement.textContent).toEqual('Justin SMITH');

      const secondRowCells = rows[1].queryAll(By.css('td'));

      expect(secondRowCells.length).toBe(3);
      const secondEvent = EVENTS[1];

      expect(secondRowCells[COL_EVENT].nativeElement.textContent).toBe(secondEvent.event_name);
      expect(secondRowCells[COL_AUTHOR].nativeElement.textContent).toEqual('Phillip CHAN');
    });

    it('should highlight the row selected', () => {
      const rows = de.queryAll($TABLE_ROWS);

      expect(rows[0].classes['EventLogTable-Selected']).toBeTruthy();
      expect(rows[1].classes['EventLogTable-Selected']).toBeFalsy();
    });

    it('should change the selected row when another row is clicked', () => {
      const rows = de.queryAll($TABLE_ROWS);

      rows[1].nativeElement.click();
      fixture.detectChanges();

      expect(component.selected).toBe(EVENTS[1]);
      expect(rows[0].classes['EventLogTable-Selected']).toBeFalsy();
      expect(rows[1].classes['EventLogTable-Selected']).toBeTruthy();
    });

    it('should fire onSelect event when another row is clicked', () => {
      spyOn(component.onSelect, 'emit');

      const rows = de.queryAll($TABLE_ROWS);

      rows[1].nativeElement.click();
      fixture.detectChanges();

      expect(component.onSelect.emit).toHaveBeenCalledWith(EVENTS[1]);
    });

    it('should set aria-label attribute for non selected row date column', () => {
      const columns = de.queryAll($TABLE_COLUMNS);

      expect(columns[4].nativeElement.getAttribute('aria-label')).toBe(`date ${formatDate(EVENTS[1].timestamp, 'dd MMM yyyy hh:mm:ss a', 'en-GB')},
        press enter key for event ${EVENTS[1].event_name} details`);
    });

    it('should fire onSelect event when enter key pressed on non selected date column', () => {
      spyOn(component.onSelect, 'emit');
      const columns = de.queryAll($TABLE_COLUMNS);

      columns[4].nativeElement.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter'
      }));

      expect(component.onSelect.emit).toHaveBeenCalledWith(EVENTS[1]);
    });

    it('should render hyperlink for each row and link to event id', () => {
      const links = de.queryAll($TABLE_ROW_LINKS_STANDALONE);

      expect(links.length).toBe(2);
      expect(links[0].nativeElement.getAttribute('href')).toContain('/event/5/history');
      expect(links[1].nativeElement.getAttribute('href')).toContain('/event/4/history');
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
    beforeEach(waitForAsync(() => {

      caseHistoryHandler = createSpyObj('caseHistoryHandler', ['apply']);

      TestBed
        .configureTestingModule({
          imports: [RouterTestingModule],
          declarations: [
            EventLogTableComponent,
            DatePipe
          ],
          providers: [FormatTranslatorService]
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
      const rows = de.queryAll($TABLE_ROW_LINKS_TIMELINE);

      rows[1].nativeElement.click();
      fixture.detectChanges();

      expect(caseHistoryHandler.apply).toHaveBeenCalledWith(4);
    });
  });
});
