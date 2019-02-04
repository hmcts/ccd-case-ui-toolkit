import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { SortOrder } from './sort-order'

@Component({
  selector: 'ccd-read-complex-field-collection-table',
  templateUrl: './read-complex-field-collection-table.html',
  styleUrls: ['./read-complex-field-collection-table.scss']
})
export class ReadComplexFieldCollectionTableComponent extends AbstractFieldReadComponent implements OnInit {

  public isDisplayContextParameterAvailable = false;
  public columns: String[];
  public columnsLabel: String[];
  public columnsVerticalLabel: any;
  public columnsHorizontalLabel: any;
  public columnsHorizontalLabelVisibility: any;
  public columnsAllLabels: any;
  public sortType: string;
  public sortReverse: boolean;
  public rows: any[] = [];
  public isHidden: boolean[] = [];

  ngOnInit(): void {
    if (this.caseField.display_context_parameter && this.caseField.display_context_parameter.trim().startsWith('#TABLE(')) {
      this.isDisplayContextParameterAvailable = true;
      let displayContextParamter = this.caseField.display_context_parameter.trim();
      let result: string = displayContextParamter.replace('#TABLE(', '');
      this.columns = result.replace(')', '').split(',');

      let labels = '';
      let labelsVertical: { [k: string]: any } = {};
      let labelsHorizontal: { [k: string]: any } = {};
      let allLabels: { [k: string]: any } = {};
      this.populateCaseFieldValuesIntoRows();
      this.populateLabels(labelsVertical, allLabels);
      this.populateHorizontalLabels(labelsHorizontal, allLabels, labelsVertical);

      this.columnsLabel = labels.split(',');
      this.columnsVerticalLabel = labelsVertical;
      this.columnsHorizontalLabel = labelsHorizontal;
      this.columnsAllLabels = allLabels;
    }
  }

  private populateHorizontalLabels(labelsHorizontal: { [p: string]: any }, allLabels: { [p: string]: any }, labelsVertical: { [p: string]: any }) {

    for (let id of this.columns) {
      labelsHorizontal[id.trim()] = allLabels[id.trim()];
      labelsHorizontal[id.trim()].sortOrder = SortOrder.UNSORTED;
      delete labelsVertical[id.trim()];
    }
  }

  private populateLabels(labelsVertical: { [p: string]: any }, allLabels: { [p: string]: any }) {
    for (let obj of this.caseField.field_type.complex_fields) {
      labelsVertical[obj.id] = {label: obj.label, type: obj.field_type.type};
      allLabels[obj.id] = {label: obj.label, type: obj.field_type.type};
    }
  }

  private populateCaseFieldValuesIntoRows() {
    for (let obj of this.caseField.value) {
      this.rows.push(obj.value);
      this.isHidden.push(true);
    }
  }

  getImage(row) {
    if (this.isHidden[row]) {
      return 'img/accordion-plus.png';
    } else {
      return 'img/accordion-minus.png';
    }
  }

  sortRowsByColumns(column) {
    let shouldSortInAscendingOrder = this.columnsHorizontalLabel[column].sortOrder === SortOrder.UNSORTED || this.columnsHorizontalLabel[column].sortOrder === SortOrder.DESCENDING;
    switch (this.columnsHorizontalLabel[column].type) {
      case 'Number':
      case 'MoneyGBP': {
        if (shouldSortInAscendingOrder) {
          this.rows.sort((a, b) => a[column] - b[column]);
          this.columnsHorizontalLabel[column].sortOrder = SortOrder.ASCENDING;
        } else {
          this.rows.sort((a, b) => b[column] - a[column]);
          this.columnsHorizontalLabel[column].sortOrder = SortOrder.DESCENDING;
        }
        break;
      }
      case 'Text':
      case 'TextArea':
      case 'Email':
      case 'Date':
      case 'DateTime':
      case 'Label':
      case 'Postcode':
      case 'YesOrNo':
      case 'PhoneUK':
      case 'FixedList': {
        if (shouldSortInAscendingOrder) {
          this.rows.sort((a, b) => a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0);
          this.columnsHorizontalLabel[column].sortOrder = SortOrder.ASCENDING;
        } else {
          this.rows.sort((a, b) => a[column] < b[column] ? 1 : a[column] > b[column] ? -1 : 0);
          this.columnsHorizontalLabel[column].sortOrder = SortOrder.DESCENDING;
        }
      }
    }
  }

  private isSortAscending(column: any): boolean {
    return !    (column.sortOrder === SortOrder.UNSORTED || column.sortOrder === SortOrder.DESCENDING);
  }


  sortWidget(column: any) {
    return this.isSortAscending(column) ? '&#9660;' : '&#9650;';
  }


  trackByIndex(index: number, obj: any): any {
    return index;
  }

}
