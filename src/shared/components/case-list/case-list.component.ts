import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

export interface CaseListItem {
  caseCreatedDate: Date;
  caseDueDate: Date;
  caseRef: string;
  petFirstName: string;
  petLastName: string;
  respFirstName: string;
  respLastName: string;
  sRef: string;
}

@Component({
  selector: 'ccd-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit, OnChanges {

  @Input() caseListItems: CaseListItem[];

  @Input() columnNames: string[]; // Need some validation to check number of columns equals number of item properties

  constructor() { }

  ngOnInit(): void {
    console.log('Case List items:');
    console.log(this.caseListItems);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  hasResults(): any {
    return this.caseListItems.length;
  }
}
