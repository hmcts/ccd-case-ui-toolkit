import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { SortOrder } from './sort-order'

@Component({
  selector: 'ccd-read-complex-field-collection-table',
  templateUrl: './read-complex-field-collection-table.html',
  styleUrls: ['./read-complex-field-collection-table.scss']
})
export class ReadComplexFieldCollectionTableComponent extends AbstractFieldReadComponent implements OnInit {

  public columns: String[];
  public columnsVerticalLabel: any;
  public columnsHorizontalLabel: any;
  public columnsAllLabels: any;
  public rows: any[] = [];
  public isHidden: boolean[] = [];

  ngOnInit(): void {
    if (this.caseField.display_context_parameter
      && this.caseField.display_context_parameter.trim().startsWith('#TABLE(')) {

      let displayContextParameter = this.caseField.display_context_parameter.trim();
      let result: string = displayContextParameter.replace('#TABLE(', '');
      this.columns = result.replace(')', '').split(',');

      let labelsVertical: { [k: string]: any } = {};
      let labelsHorizontal: { [k: string]: any } = {};
      let allLabels: { [k: string]: any } = {};
      this.populateCaseFieldValuesIntoRows();
      this.populateLabels(labelsVertical, allLabels);
      this.populateHorizontalLabels(labelsHorizontal, allLabels, labelsVertical);

      this.columnsVerticalLabel = labelsVertical;
      this.columnsHorizontalLabel = labelsHorizontal;
      this.columnsAllLabels = allLabels;

    }
  }

  private populateHorizontalLabels(labelsHorizontal: { [p: string]: any },
                                   allLabels: { [p: string]: any },
                                   labelsVertical: { [p: string]: any }) {
    for (let id of this.columns) {
      labelsHorizontal[id.trim()] = allLabels[id.trim()];
      labelsHorizontal[id.trim()].sortOrder = SortOrder.UNSORTED;
      delete labelsVertical[id.trim()];
    }
  }

  private populateLabels(labelsVertical: { [p: string]: any }, allLabels: { [p: string]: any }) {
    for (let obj of this.caseField.field_type.complex_fields) {
      if (obj.field_type.type === 'FixedList' ||
        obj.field_type.type === 'MultiSelectList' ||
        obj.field_type.type === 'FixedRadioList') {
        labelsVertical[obj.id] = {label: obj.label, type: obj.field_type, caseField: obj};
        allLabels[obj.id] = {label: obj.label, type: obj.field_type};
      } else if (obj.isComplex()) {
        labelsVertical[obj.id] = {label: obj.label, type: obj.field_type.type, caseField: obj};
        allLabels[obj.id] = {label: obj.label, type: obj.field_type.type, caseField: obj};
      } else {
        labelsVertical[obj.id] = {label: obj.label, type: {type: obj.field_type.type}, caseField: obj};
        allLabels[obj.id] = {label: obj.label, type: {type: obj.field_type.type}, caseField: obj};
      }
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
      if (this.isVerticleDataNotEmpty(row)) {
        return 'img/accordion-minus.png';
      } else {
        this.isHidden[row] = true;
        return 'img/accordion-plus.png';
      }
    }
  }

  /**
   * Needs to be called before 'ccdFieldsFilter' pipe is used, as it needs a caseField value.
   */
  addCaseFieldValue(field, value) {
    field.value = value;
    return true;
  }

  isNotBlank(value: string) {
    return value !== null && value !== '';
  }

  addCaseReferenceValue(field, value: any) {
    field.value = { CaseReference: value};
    return field;
  }

  private isVerticleDataNotEmpty(row) {
    let result = false
    for (let key in this.columnsVerticalLabel) {
      if (this.rows[row][key]) {
        result = true;
      }
    }
    return result;
  }

  keepOriginalOrder = (a, b) => a.key;

  sortRowsByColumns(column) {
    let shouldSortInAscendingOrder = this.columnsHorizontalLabel[column].sortOrder === SortOrder.UNSORTED
      || this.columnsHorizontalLabel[column].sortOrder === SortOrder.DESCENDING;

    switch (this.columnsHorizontalLabel[column].type.type) {
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
        break;
    }
  }

  private isSortAscending(column: any): boolean {
    return !(column.sortOrder === SortOrder.UNSORTED || column.sortOrder === SortOrder.DESCENDING);
  }

  sortWidget(column: any) {
    return this.isSortAscending(column) ? '&#9660;' : '&#9650;';
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
