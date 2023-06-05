import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pipe, PipeTransform } from '@angular/core';
import { QueryWriteRespondToQueryComponent } from './query-write-respond-to-query.component';
import { FormDocument } from '../../../../../../domain';

@Pipe({ name: 'rpxTranslate' })
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryWriteRespondToQueryComponent', () => {
  let component: QueryWriteRespondToQueryComponent;
  let fixture: ComponentFixture<QueryWriteRespondToQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteRespondToQueryComponent, MockRpxTranslatePipe ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRespondToQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form group', () => {
    expect(component.formGroup).toBeTruthy();
  });

  describe('onDocumentCollectionUpdate', () => {
    it('should set documents value', () => {
      const documents: FormDocument[] = [
        { document_filename: 'file1', document_url: 'url1', document_binary_url: 'binary_url1' },
        { document_filename: 'file2', document_url: 'url2', document_binary_url: 'binary_url2' }
      ];

      component.onDocumentCollectionUpdate(documents);
      expect(component.formGroup.get('documents').value).toEqual(documents);
    });
  });
});
