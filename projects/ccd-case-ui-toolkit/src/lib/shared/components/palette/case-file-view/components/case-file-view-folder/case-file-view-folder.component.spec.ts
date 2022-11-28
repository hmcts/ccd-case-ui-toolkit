import { CdkTreeModule } from '@angular/cdk/tree';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { plainToClass } from 'class-transformer';
import { of } from 'rxjs';
import { DocumentTreeNode } from '../../../../../domain/case-file-view';
import { categoriesAndDocumentsTestData } from '../../test-data/categories-and-documents-test-data';
import {
  categorisedTreeData,
  treeData,
  treeDataSortedAlphabeticallyAsc,
  treeDataSortedAlphabeticallyDesc,
  uncategorisedTreeData
} from '../../test-data/document-tree-node-test-data';
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
    component.categoriesAndDocuments = of(categoriesAndDocumentsTestData);
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate tree data from categorised data', () => {
    expect(component.generateTreeData(categoriesAndDocumentsTestData.categories)).toEqual(categorisedTreeData);
  });

  it('should get documents from category', () => {
    const documents = categoriesAndDocumentsTestData.categories[0].documents;
    const documentsTreeNodes: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
      {
        name: 'Lager encyclopedia',
        type: 'document'
      },
      {
        name: 'Beers encyclopedia',
        type: 'document'
      },
      {
        name: 'Ale encyclopedia',
        type: 'document'
      }
    ]);
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    expect(component.getUncategorisedDocuments(categoriesAndDocumentsTestData.uncategorised_documents)).toEqual(uncategorisedTreeData);
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
      sortChildrenAscendingSpies.push(spyOn(item,'sortChildrenAscending').and.callThrough());
    });

    component.sortDataSourceAscAlphabetically();
    fixture.detectChanges();

    sortChildrenAscendingSpies.forEach((item) => {
      expect(item).toHaveBeenCalled();
    });

    expect(component.nestedDataSource).toEqual(treeDataSortedAlphabeticallyAsc);
  });

  it('should call sortChildrenDescending on all children of nestedDataSource when calling sortDataSourceDescAlphabetically', () => {
    const sortChildrenDescendingSpies = [];
    component.nestedDataSource.forEach((item) => {
      sortChildrenDescendingSpies.push(spyOn(item,'sortChildrenDescending').and.callThrough());
    });
    component.sortDataSourceDescAlphabetically();
    fixture.detectChanges();

    sortChildrenDescendingSpies.forEach((item) => {
      expect(item).toHaveBeenCalled();
    });

    expect(component.nestedDataSource).toEqual(treeDataSortedAlphabeticallyDesc);
  });

  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
  });

  it ('should get all document count as get documentCount', () => {
    expect(component.documentCount).toEqual(8);
  });
});
