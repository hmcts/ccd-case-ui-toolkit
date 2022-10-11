import { Component, OnInit } from "@angular/core";
import { AbstractFieldReadComponent } from "../base-field";

@Component({
  selector: 'ccd-read-judicial-user-field',
  templateUrl: './read-judicial-user-field.component.html'
})
export class ReadJudicialUserFieldComponent extends AbstractFieldReadComponent implements OnInit {

  constructor() {
    super();
  }

  public ngOnInit(): void {
    console.log('CASE FIELD', this.caseField);
  }
}