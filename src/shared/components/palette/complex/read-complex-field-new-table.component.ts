import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field';

@Component({
  selector: 'ccd-read-complex-field-new-table',
  templateUrl: './read-complex-field-new-table.html',
  styleUrls: ['./read-complex-field-new-table.scss']
})
export class ReadComplexFieldNewTableComponent extends AbstractFieldReadComponent  implements OnInit {

  public isDisplayContextParameterAvailable: boolean = false;
  public columns: String[];
  public columnsLabel: String[];
  public columnsVerticalLabel: any;
  public columnsHorizontalLabel: any;
  public columnsAllLabels: any;

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

      for (let obj of this.caseField.field_type.complex_fields) {
        labelsVertical[obj.id] = { label: obj.label, type: obj.field_type.type};
        allLabels[obj.id] = { label: obj.label, type: obj.field_type.type};
      }

      for (let id of this.columns) {
        let horizontalColumnFields: any;
        let verticalColumnFields: any;
        labelsHorizontal[id.trim()] = allLabels[id.trim()];
        delete labelsVertical[id.trim()];
      }

      this.columnsLabel = labels.split(',');
      this.columnsVerticalLabel = labelsVertical;
      this.columnsHorizontalLabel = labelsHorizontal;
      this.columnsAllLabels = allLabels;
    }
  }

}
