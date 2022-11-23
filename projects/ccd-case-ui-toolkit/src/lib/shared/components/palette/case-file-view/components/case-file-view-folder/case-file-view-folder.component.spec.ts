import { CdkTreeModule } from '@angular/cdk/tree';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import { plainToClass } from 'class-transformer';
import { of } from 'rxjs';
import {
  CaseFileViewDocument,
  DocumentTreeNode
} from '../../../../../domain/case-file-view';
import { DocumentManagementService, WindowService } from '../../../../../services';
import { categoriesAndDocuments } from '../../test-data/categories-and-documents-test-data';
import { treeData } from '../../test-data/document-tree-node-test-data';
import { CaseFileViewFolderComponent, MEDIA_VIEWER_LOCALSTORAGE_KEY } from './case-file-view-folder.component';

describe('CaseFileViewFolderComponent', () => {
  let component: CaseFileViewFolderComponent;
  let fixture: ComponentFixture<CaseFileViewFolderComponent>;
  let nativeElement: any;
  let mockWindowService: SpyObj<WindowService>;
  let mockDocumentManagementService: SpyObj<DocumentManagementService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CdkTreeModule,
        RouterTestingModule
      ],
      declarations: [
        CaseFileViewFolderComponent
      ],
      providers: [
        { provide: WindowService, useValue: mockWindowService },
        { provide: DocumentManagementService, useValue: mockDocumentManagementService }
      ]
    })
    .compileComponents();

    mockWindowService = createSpyObj<WindowService>('WindowService', ['setLocalStorage', 'openOnNewTab']);
    mockDocumentManagementService = createSpyObj<DocumentManagementService>('DocumentManagementService', ['getMediaViewerInfo']);
    mockDocumentManagementService.getMediaViewerInfo.and.callFake((documentFieldValue: any) => {
      return JSON.stringify({
        document_binary_url: documentFieldValue.document_binary_url,
        document_filename: documentFieldValue.document_filename,
        content_type: documentFieldValue.document_binary_url,
        annotation_api_url: documentFieldValue.document_binary_url,
        case_id: documentFieldValue.id,
        case_jurisdiction: documentFieldValue.jurisdiction
      });
    });

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
    const documentsTreeNodes: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
      {
        name: 'Lager encyclopedia',
        type: 'document',
        document_filename: 'Lager encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Beers encyclopedia',
        type: 'document',
        document_filename: 'Beers encyclopedia',
        document_binary_url: '/test/binary'
      },
      {
        name: 'Ale encyclopedia',
        type: 'document',
        document_filename: 'Ale encyclopedia',
        document_binary_url: '/test/binary'
      }
    ]);

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
    const uncategorisedDocumentsTreeNode: DocumentTreeNode = plainToClass(DocumentTreeNode, {
      name: 'Uncategorised documents',
      type: 'category',
      children: [
        {
          name: 'Uncategorised document 1',
          type: 'document',
          document_filename: 'Uncategorised document 1',
          document_binary_url: '/test/binary',
        },
        {
          name: 'Uncategorised document 2',
          type: 'document',
          document_filename: 'Uncategorised document 2',
          document_binary_url: '/test/binary',
        }
      ]
    });
    expect(component.getUncategorisedDocuments(uncategorisedDocuments)).toEqual(uncategorisedDocumentsTreeNode);
  });

  it('should render cdk nested tree', () => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl).toBeDefined();
  });

  it('should call sortChildrenAscending on all children of nestedDataSource when calling sortDataSourceAscAlphabetically', () => {
    const sortChildrenAscendingSpies = [];
    component.nestedDataSource.forEach((item) => {
      sortChildrenAscendingSpies.push(spyOn(item,'sortChildrenAscending'));
    });
    component.sortDataSourceAscAlphabetically();
    sortChildrenAscendingSpies.forEach((item) => {
      expect(item).toHaveBeenCalled();
    });
  });

  it('should call sortChildrenDescending on all children of nestedDataSource when calling sortDataSourceDescAlphabetically', () => {
    const sortChildrenDescendingSpies = [];
    component.nestedDataSource.forEach((item) => {
      sortChildrenDescendingSpies.push(spyOn(item,'sortChildrenDescending'));
    });
    component.sortDataSourceDescAlphabetically();
    sortChildrenDescendingSpies.forEach((item) => {
      expect(item).toHaveBeenCalled();
    });
  });

  it('should set mediaViewer localStorage' +
    'and open in a new tab using windowService when calling triggerDocumentAction with actionType: openInANewTab', () => {
    const documentTreeNode = component.nestedDataSource[0].children[3];
    component.triggerDocumentAction('openInANewTab', documentTreeNode);

    // @ts-expect-error -- private method
    expect(component.windowService.setLocalStorage).toHaveBeenCalledWith(
      MEDIA_VIEWER_LOCALSTORAGE_KEY,
      // @ts-expect-error -- private method
      component.documentManagementService.getMediaViewerInfo({
        document_binary_url: documentTreeNode.document_binary_url,
        document_filename: documentTreeNode.document_filename
      })
    );

    // @ts-expect-error -- private method
    expect(component.windowService.openOnNewTab).toHaveBeenCalledWith('/media-viewer');
  });

  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
  });
});
