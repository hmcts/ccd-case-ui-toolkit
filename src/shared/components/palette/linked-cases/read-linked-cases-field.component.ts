import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field';

@Component({
  selector: 'ccd-read-linked-cases-field',
  templateUrl: './read-linked-cases-field.component.html',
  styleUrls: ['./read-linked-cases-field.component.scss']
})
export class ReadLinkedCasesFieldComponent extends AbstractFieldReadComponent implements OnInit {
  
  constructor() {
    super();
  }

  public ngOnInit(): void {
  }
}
