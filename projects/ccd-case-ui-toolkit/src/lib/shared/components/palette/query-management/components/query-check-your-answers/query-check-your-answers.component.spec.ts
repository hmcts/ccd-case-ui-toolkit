import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseField, Document, FormDocument } from '../../../../../domain';
import { QueryListItem } from '../../models';
import { QueryCheckYourAnswersComponent } from './query-check-your-answers.component';

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('QueryCheckYourAnswersComponent', () => {
  let component: QueryCheckYourAnswersComponent;
  let fixture: ComponentFixture<QueryCheckYourAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QueryCheckYourAnswersComponent,
        RpxTranslateMockPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCheckYourAnswersComponent);
    component = fixture.componentInstance;
    component.queryItem = Object.assign(new QueryListItem(), {
      subject: 'test',
      response: 'test'
    });
    component.formGroup = new FormGroup({
      fullName: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      attachments: new FormControl([])
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the caseField property', () => {
    expect(component.caseField).toEqual(jasmine.any(CaseField));
  });

  it('should emit back clicked event', () => {
    spyOn(component.backClicked, 'emit');
    component.goBack();
    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  describe('ngOnInit', () => {
    it('should set the caseField\'s value (type FormDocument) off the formGroup\'s attachments value (type Document)', () => {
      const documents: Document[] = [
        {
          originalDocumentName: 'test.txt',
          _links: {
            self: {
              href: 'http://localhost:3451/documents/123'
            },
            binary: {
              href: 'http://localhost:3451/documents/123/binary'
            }
          }
        }
      ];
      const formDocuments: { id: string; value: FormDocument }[] = [
        {
          id: null,
          value: {
            document_filename: 'test.txt',
            document_url: 'http://localhost:3451/documents/123',
            document_binary_url: 'http://localhost:3451/documents/123/binary'
          }
        }
      ];

      component.formGroup.get('attachments').setValue(documents);
      component.ngOnInit();
      expect(component.caseField.value).toEqual(formDocuments);
    });
  });
});