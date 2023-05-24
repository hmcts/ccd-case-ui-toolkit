import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Document, DocumentLinks } from '../../../domain';
import { WriteQueryManagementFieldComponent } from './write-query-management-field.component';

@Pipe({ name: 'ccdCaseReference' })
class CcdCaseReferenceMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('WriteQueryManagementFieldComponent', () => {
  let component: WriteQueryManagementFieldComponent;
  let fixture: ComponentFixture<WriteQueryManagementFieldComponent>;
  const attachments: Document[] = [
    {
      _links: {} as DocumentLinks,
      originalDocumentName: 'document_1'
    },
    {
      _links: {} as DocumentLinks,
      originalDocumentName: 'document_2'
    }
  ]

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        WriteQueryManagementFieldComponent,
        CcdCaseReferenceMockPipe,
        RpxTranslateMockPipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteQueryManagementFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should add and remove Attachment document', () => {
    component.attachments = attachments;
    expect(component.attachments.length).toBe(2);
    component.addNewAttachment();
    expect(component.attachments.length).toBe(3);
    component.removeAttachment(1);
    expect(component.attachments.length).toBe(2);
  });

  describe('ngOnInit', () => {
    it('should initialise the component and set queryItem', () => {
      component.ngOnInit();
      expect(component.queryItem).toBeDefined();
    });
  });
});

