import { CdkTreeModule } from '@angular/cdk/tree';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  CaseFileViewDocument, DocumentTreeNode
} from '../../../../../domain/case-file-view';
import { categoriesAndDocuments } from '../../test-data/categories-and-documents-test-data';
import { treeData } from '../../test-data/document-tree-node-test-data';
import { CaseFileViewFolderComponent } from './case-file-view-folder.component';

describe('CaseFileViewFolderComponent', () => {
  let component: CaseFileViewFolderComponent;
  let fixture: ComponentFixture<CaseFileViewFolderComponent>;
  let nativeElement: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CdkTreeModule
      ],
      declarations: [
        CaseFileViewFolderComponent
      ],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFileViewFolderComponent);
    component = fixture.componentInstance;
    component.categoriesAndDocuments = of(categoriesAndDocuments);
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate tree data', () => {
    expect(component.generateTreeData(categoriesAndDocuments.categories)).toEqual(treeData);
  });

  it('should get documents from category', () => {
    const documents = categoriesAndDocuments.categories[0].documents;
    const documentsTreeNodes: DocumentTreeNode[] = [
      {
        name: 'Beers encyclopedia'
      }
    ];
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    const uncategorisedDocuments: CaseFileViewDocument[] = [
      {
        document_url: '/uncategorised-document-1',
        document_filename: 'Uncategorised document 1',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: ''
      },
      {
        document_url: '/uncategorised-document-2',
        document_filename: 'Uncategorised document 2',
        document_binary_url: '/test/binary',
        attribute_path: '',
        upload_timestamp: ''
      }
    ];
    const uncategorisedDocumentsTreeNode: DocumentTreeNode = {
      name: 'Uncategorised documents',
      children: [
        {
          name: 'Uncategorised document 1'
        },
        {
          name: 'Uncategorised document 2'
        }
      ]
    };
    expect(component.getUncategorisedDocuments(uncategorisedDocuments)).toEqual(uncategorisedDocumentsTreeNode);
  });

  it('should render cdk nested tree', () => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl).toBeDefined();
  });

  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
  });
});
