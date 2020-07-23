import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';

export class DateTimeFormatUtils {
  public static formatDateAtTime(date: Date, is24Hour: boolean): string {
    return `${formatDate(date, 'dd MMM yyyy', 'en-UK')} at ${DateTimeFormatUtils.formatTime(date, is24Hour)}`;
  }

  public static formatTime(date: Date, is24Hour: boolean): string {
    return is24Hour ? formatDate(date, 'HH:mm', 'en-UK') : formatDate(date, 'h:mm a', 'en-UK').toLowerCase();
  }
}

@Component({
  selector: 'ccd-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent {

  @Input() classes = '';

  @Input() caption: string;
  @Input() firstCellIsHeader = true;

  @Input() rows: any[];

  @Input() columnConfig: TableColumnConfig[] = [
    { header: 'Date', key: 'date', type: 'text' },
    { header: 'Amount', key: 'amount' }
  ];

  constructor() { }

  public formatDate(date: Date): string {
    return formatDate(date, 'dd/MM/yyyy', 'en-UK');
  }

  public formatDateAtTime(date: Date): string {
      return DateTimeFormatUtils.formatDateAtTime(date, false);
  }
}

export class TableColumnConfig {
  header: string;
  key: string;
  type?: string;
  constructor() {
    this.header = '';
    this.key = '';
    this.type = 'text';
  }
}
