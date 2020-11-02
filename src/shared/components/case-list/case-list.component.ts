import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export class DateTimeFormatUtils {
  public static formatDateAtTime(date: Date, is24Hour: boolean): string {
    return `${formatDate(date, 'dd MMM yyyy', 'en-GB')} at ${DateTimeFormatUtils.formatTime(date, is24Hour)}`;
  }

  public static formatTime(date: Date, is24Hour: boolean): string {
    return is24Hour ? formatDate(date, 'HH:mm', 'en-GB') : formatDate(date, 'h:mm a', 'en-GB').toLowerCase();
  }
}

@Component({
  selector: 'ccd-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent {

  @Input() public classes = '';

  @Input() public caption: string;
  @Input() public firstCellIsHeader = false;

  @Input() public cases: Object[];

  @Input() public tableConfig: TableConfig = {
    idField: 'id',
    columnConfigs: [
      { header: 'Date', key: 'date', type: 'text' },
      { header: 'Amount', key: 'amount' }
    ]
  };

  @Input() public selectionEnabled = false;

  @Output() public selection = new EventEmitter<any[]>();

  @Input() public selectedCases: any[] = [];

  constructor() { }

  public formatDate(date: Date): string {
    return formatDate(date, 'dd MMM yyyy', 'en-GB');
  }

  public formatDateAtTime(date: Date): string {
      return DateTimeFormatUtils.formatDateAtTime(date, false);
  }

  public canBeShared(c: any): boolean {
    return true;
  }

  public canAnyBeShared(): boolean {
    return this.cases.some(c => this.canBeShared(c))
  }

  public selectAll(): void {
    if (this.allOnPageSelected()) {
      // All cases already selected, so unselect all on this page
      this.selectedCases = [];
    } else {
      this.cases.forEach(c => {
        if (!this.isSelected(c) && this.canBeShared(c)) {
          this.selectedCases = [... this.selectedCases, c];
        }
      });
    }
    this.selection.emit(this.selectedCases);
  }

  public changeSelection(aCase: any): void {
    if (this.isSelected(aCase)) {
      this.selectedCases.forEach((aSelectedCase, i) => {
        if (aCase.case_id === aSelectedCase.case_id) {
          this.selectedCases = this.selectedCases.slice(0, i).concat(this.selectedCases.slice(i + 1));
        }
      });
    } else {
      if (this.canBeShared(aCase)) {
        this.selectedCases = [...this.selectedCases, aCase];
      }
    }
    this.selection.emit(this.selectedCases);
  }

  public isSelected(aCase: any): boolean {
    if (this.selectedCases) {
      for (let index = 0, length = this.selectedCases.length; index < length; index++) {
        if (aCase.case_id === this.selectedCases[index].case_id) {
          return true;
        }
      }
    }
    return false;
  }

  public allOnPageSelected(): boolean {
    return !this.cases.some(c => !this.isSelected(c))
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

export class TableConfig {
  // Specifies which field of an item uniquely identifies it among others of the same type
  public idField: string;

  public columnConfigs: TableColumnConfig[];

  constructor() {
    this.idField = '';
    this.columnConfigs = [];
  }
}
