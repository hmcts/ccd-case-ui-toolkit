import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AbstractFieldReadComponent } from '../base-field';
import { QueryListItem } from './models';
import { Document, DocumentLinks } from '../../../domain';
import { partyMessagesMockData } from './__mocks__';

@Component({
  selector: 'ccd-write-query-management-field',
  templateUrl: './write-query-management-field.component.html',
  styleUrls: ['./write-query-management-field.component.scss']
})
export class WriteQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public queryItem: QueryListItem;
  public attachments: Document[] = [];
  public responseFormGroup = new FormGroup({
    response: new FormControl('', Validators.required),
    documents: new FormControl([], Validators.required)
  });

  constructor() {
    super();
  }

  public ngOnInit() {
    this.queryItem = new QueryListItem();
    Object.assign(this.queryItem, partyMessagesMockData[0].partyMessages[0]);
  }

  public addNewAttachment(): void {
    let document: Document = {
      _links: {} as DocumentLinks,
      originalDocumentName: ''
    };
    this.attachments.push(document);
  }

  public removeAttachment(pos: number): void {
    this.attachments.splice(pos, 1);
  }
}
