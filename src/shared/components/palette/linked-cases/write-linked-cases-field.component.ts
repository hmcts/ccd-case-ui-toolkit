import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field';

@Component({
  selector: 'ccd-write-linked-cases-field',
  templateUrl: './write-linked-cases-field.component.html',
  styleUrls: ['./write-linked-cases-field.component.scss']
})
export class WriteLinkedCasesFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  
  constructor() {
    super();
  }

  public ngOnInit(): void {
  }
}
