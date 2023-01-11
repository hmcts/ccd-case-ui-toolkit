import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CaseViewEvent } from '../../../../domain/case-view';
import { FormatTranslatorService } from '../../../../services/case-fields/format-translator.service';
import { MockRpxTranslatePipe } from '../../../../test/mock-rpx-translate.pipe';
import { DashPipe, DatePipe } from '../../utils';
import { EventLogDetailsComponent } from './event-log-details.component';

describe('EventLogDetails', () => {

  const EVENT: CaseViewEvent = {
    id: 5,
    timestamp: '2017-05-10T10:00:00Z',
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
  };

  const EVENT_WITH_EMPTY_SUMMARY_AND_COMMENT: CaseViewEvent = {
    id: 5,
    timestamp: '2017-05-10T10:00:00Z',
    summary: '',
    comment: '',
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
  };

  const $TABLE_ROWS = By.css('table>tbody>tr');

  const expectRow = (row: DebugElement) => {
    return {
      toEqual: (label: string, value: string) => {
        const actualLabel = row
          .query(By.css('th'))
          .nativeElement
          .textContent
          .trim();
        const actualValue = row
          .query(By.css('td'))
          .nativeElement
          .textContent
          .trim();
        expect(actualLabel).toBe(label);
        expect(actualValue).toBe(value);
      },
      toNotEqual: (label: string, value: string) => {
        const actualLabel = row
          .query(By.css('th'))
          .nativeElement
          .textContent
          .trim();
        const actualValue = row
          .query(By.css('td'))
          .nativeElement
          .textContent
          .trim();
        expect(actualLabel).toBe(label);
        expect(actualValue).not.toBe(value);
      }
    };
  };

  let fixture: ComponentFixture<EventLogDetailsComponent>;
  let component: EventLogDetailsComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          EventLogDetailsComponent,
          DatePipe,
          DashPipe,
          MockRpxTranslatePipe
        ],
        providers: [FormatTranslatorService]
      })
      .compileComponents();

    fixture = TestBed.createComponent(EventLogDetailsComponent);
    component = fixture.componentInstance;

    component.event = EVENT;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render a table with the case details', () => {
    const rows = de.queryAll($TABLE_ROWS);

    expect(rows.length).toBe(6);

    const resultDate = new DatePipe(null).transform(EVENT.timestamp, 'local', null);
    expectRow(rows[0]).toEqual('Date', resultDate);
    expectRow(rows[1]).toEqual('Author', 'Justin SMITH');
    expectRow(rows[2]).toEqual('End state', EVENT.state_name);
    expectRow(rows[3]).toEqual('Event', EVENT.event_name);
    expectRow(rows[4]).toEqual('Summary', EVENT.summary);
    expectRow(rows[5]).toEqual('Comment', EVENT.comment);
  });

  it('should render dash if empty summary or comment field', () => {
    component.event = EVENT_WITH_EMPTY_SUMMARY_AND_COMMENT;
    fixture.detectChanges();

    const rows = de.queryAll($TABLE_ROWS);

    expect(rows.length).toBe(6);

    expectRow(rows[4]).toEqual('Summary', '-');
    expectRow(rows[5]).toEqual('Comment', '-');
  });

});
