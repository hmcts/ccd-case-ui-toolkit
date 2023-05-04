import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { Query } from './domain';
import { CaseTab } from '../../../domain';
import { ActivatedRoute } from '@angular/router';
import { QueryManagementUtils } from './utils/query-management.utils';

@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html',
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public queries: Query[];

  constructor(private readonly route: ActivatedRoute) {
    super();
  }

  public ngOnInit(): void {
    if (this.context === PaletteContext.DEFAULT) {
      const queryManagementTab = (this.route.snapshot.data.case.tabs as CaseTab[])
        .filter(tab => tab.fields && tab.fields
        .some(caseField => caseField.id === 'QueryManagement'));


      
    }
  }
}
