import { CdkTreeModule } from '@angular/cdk/tree';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { plainToClass } from 'class-transformer';
import { of } from 'rxjs';
import {
  CaseFileViewDocument, DocumentTreeNode, DocumentTreeNodeType
} from '../../../../../domain/case-file-view';
import { categoriesAndDocuments } from '../../test-data/categories-and-documents-test-data';
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
        CdkTreeModule,
        ReactiveFormsModule
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

  it('should create', async() => {
    spyOn(component, 'filter').and.returnValue(of([]));
    const documentFilterInputEl = nativeElement.querySelector('.document-search');
    documentFilterInputEl.dispatchEvent(new Event('focusin'));
    documentFilterInputEl.value = 'enc';
    documentFilterInputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.filter).toHaveBeenCalled();
    expect(component.documentTreeData).toEqual(treeData);
  });

  it('should generate tree data from categorised data', () => {
    expect(component.generateTreeData(categoriesAndDocuments.categories)).toEqual(categorisedTreeData);
  });

  it('should get documents from category', () => {
    const documents = categoriesAndDocuments.categories[0].documents;
    const documentsTreeNodes: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
      {
        name: 'Lager encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Beers encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      },
      {
        name: 'Ale encyclopedia',
        type: DocumentTreeNodeType.DOCUMENT
      }
    ]);
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    expect(component.getUncategorisedDocuments(categoriesAndDocuments.uncategorised_documents)).toEqual(uncategorisedTreeData);
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

  it('should display correct folder icons', () => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    const firstNodeButton = documentTreeContainerEl.querySelector('.node');
    const iconEl = firstNodeButton.querySelector('.node__iconImg');
    expect(iconEl.getAttribute('src')).toEqual('/assets/images/folder.png');
    firstNodeButton.click();
    fixture.detectChanges();
    expect(iconEl.getAttribute('src')).toEqual('/assets/images/folder-open.png');
  });

  it('should filter documents', () => {
    const filteredTreeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
      {
        name: 'Spirits',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          {
            name: 'Scotch whisky',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Lowland',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Lowland 1',
                    type: DocumentTreeNodeType.FOLDER,
                    children: [
                      {
                        name: 'Details about Whisky Lowland 1',
                        type: DocumentTreeNodeType.DOCUMENT
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Islay',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Details about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  },
                  {
                    name: 'More information about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    component.documentTreeData = filteredTreeData;
    component.documentSearchFormControl.setValue('abo');
    component.filter('abo').subscribe(result => {
      expect(result).toEqual(filteredTreeData);
    });
  });

  it('should filter documents no match', () => {
    const filteredTreeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
      {
        name: 'Spirits',
        type: DocumentTreeNodeType.FOLDER,
        children: [
          {
            name: 'Scotch whisky',
            type: DocumentTreeNodeType.FOLDER,
            children: [
              {
                name: 'Lowland',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Lowland 1',
                    type: DocumentTreeNodeType.FOLDER,
                    children: [
                      {
                        name: 'Details about Whisky Lowland 1',
                        type: DocumentTreeNodeType.DOCUMENT
                      }
                    ]
                  }
                ]
              },
              {
                name: 'Islay',
                type: DocumentTreeNodeType.FOLDER,
                children: [
                  {
                    name: 'Details about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  },
                  {
                    name: 'More information about Whisky Islay',
                    type: DocumentTreeNodeType.DOCUMENT
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    component.documentTreeData = filteredTreeData;
    component.documentSearchFormControl.setValue('some random text');
    component.filter('some random text').subscribe(result => {
      expect(result.length).toEqual(0);
    });
  });

  it('should filter documents verify UI', async() => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentFilterInputEl = nativeElement.querySelector('.document-search');
    documentFilterInputEl.dispatchEvent(new Event('focusin'));
    documentFilterInputEl.value = 'enc';
    documentFilterInputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl.textContent).toContain('Beers encyclopedia');
  });

  it('should filter documents no match verify UI', async() => {
    component.nestedDataSource = treeData;
    fixture.detectChanges();
    const documentFilterInputEl = nativeElement.querySelector('.document-search');
    documentFilterInputEl.dispatchEvent(new Event('focusin'));
    documentFilterInputEl.value = 'some random text';
    documentFilterInputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const documentTreeContainerEl = nativeElement.querySelector('.document-tree-container');
    expect(documentTreeContainerEl.textContent).toContain('No results found');
  });


  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    spyOn(component.documentFilterSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.documentFilterSubscription.unsubscribe).toHaveBeenCalled();
  });
});
