import { CdkTreeModule } from '@angular/cdk/tree';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { plainToClass } from 'class-transformer';
import { of } from 'rxjs';
import {
  CaseFileViewDocument,
  CategoriesAndDocuments,
  DocumentTreeNode
} from '../../../../../domain/case-file-view';
import { CaseFileViewFolderComponent } from './case-file-view-folder.component';

describe('CaseFileViewFolderComponent', () => {
  let component: CaseFileViewFolderComponent;
  let fixture: ComponentFixture<CaseFileViewFolderComponent>;
  let nativeElement: any;

  const categoriesAndDocuments: CategoriesAndDocuments = {
    case_version: 1,
    categories: [
      {
        category_id: 'Beers',
        category_name: 'Beers',
        category_order: 1,
        documents: [
          {
            document_url: '/test',
            document_filename: 'Beers encyclopedia',
            document_binary_url: '/test/binary',
            attribute_path: '',
            upload_timestamp: ''
          }
        ],
        sub_categories: [
          {
            category_id: 'BeersBitters',
            category_name: 'Bitters',
            category_order: 1,
            documents: [],
            sub_categories: []
          },
          {
            category_id: 'BeersAmerican',
            category_name: 'American',
            category_order: 2,
            documents: [],
            sub_categories: []
          },
          {
            category_id: 'BeersAsian',
            category_name: 'Asian',
            category_order: 3,
            documents: [],
            sub_categories: []
          }
        ]
      },
      {
        category_id: 'Wines',
        category_name: 'Wines',
        category_order: 2,
        documents: [],
        sub_categories: [
          {
            category_id: 'WinesFrench',
            category_name: 'French',
            category_order: 1,
            documents: [],
            sub_categories: []
          },
          {
            category_id: 'WinesItalian',
            category_name: 'Italian',
            category_order: 2,
            documents: [],
            sub_categories: []
          }
        ]
      },
      {
        category_id: 'Spirits',
        category_name: 'Spirits',
        category_order: 3,
        documents: [],
        sub_categories: [
          {
            category_id: 'SpiritsWhisky',
            category_name: 'Scotch whisky',
            category_order: 1,
            documents: [],
            sub_categories: [
              {
                category_id: 'WhiskyHighland',
                category_name: 'Highland',
                category_order: 1,
                documents: [],
                sub_categories: [
                  {
                    category_id: 'WhiskyHighland1',
                    category_name: 'Highland 1',
                    category_order: 1,
                    documents: [],
                    sub_categories: []
                  }
                ]
              },
              {
                category_id: 'WhiskyLowland',
                category_name: 'Lowland',
                category_order: 2,
                documents: [],
                sub_categories: [
                  {
                    category_id: 'WhiskyLowland1',
                    category_name: 'Lowland 1',
                    category_order: 1,
                    documents: [
                      {
                        document_url: '/test',
                        document_filename: 'Details about Whisky Lowland 1',
                        document_binary_url: '/test/binary',
                        attribute_path: '',
                        upload_timestamp: ''
                      }
                    ],
                    sub_categories: []
                  },
                  {
                    category_id: 'WhiskyLowland2',
                    category_name: 'Lowland 2',
                    category_order: 2,
                    documents: [],
                    sub_categories: []
                  }
                ]
              },
              {
                category_id: 'WhiskyIslay',
                category_name: 'Islay',
                category_order: 3,
                documents: [
                  {
                    document_url: '/test',
                    document_filename: 'Details about Whisky Islay',
                    document_binary_url: '/test/binary',
                    attribute_path: '',
                    upload_timestamp: ''
                  },
                  {
                    document_url: '/test',
                    document_filename: 'More information about Whisky Islay',
                    document_binary_url: '/test/binary',
                    attribute_path: '',
                    upload_timestamp: ''
                  }
                ],
                sub_categories: []
              },
              {
                category_id: 'WhiskySpeyside',
                category_name: 'Speyside',
                category_order: 4,
                documents: [],
                sub_categories: []
              },
              {
                category_id: 'WhiskyCampbeltown',
                category_name: 'Campbeltown',
                category_order: 5,
                documents: [],
                sub_categories: []
              }
            ]
          }
        ]
      }
    ],
    uncategorised_documents: [
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
    ]
  };

  const treeData: DocumentTreeNode[] = plainToClass(DocumentTreeNode, [
    {
      name: 'Beers',
      type: 'category',
      children: [
        {
          name: 'Bitters',
          type: 'category',
          children: [],
        },
        {
          name: 'American',
          type: 'category',
          children: [],
        },
        {
          name: 'Asian',
          type: 'category',
          children: []
        },
        {
          name: 'Beers encyclopedia',
          type: 'document'
        }
      ]
    },
    {
      name: 'Wines',
      type: 'category',
      children: [
        {
          name: 'French',
          type: 'category',
          children: []
        },
        {
          name: 'Italian',
          type: 'category',
          children: []
        }
      ]
    },
    {
      name: 'Spirits',
      type: 'category',
      children: [
        {
          name: 'Scotch whisky',
          type: 'category',
          children: [
            {
              name: 'Highland',
              type: 'category',
              children: [
                {
                  name: 'Highland 1',
                  type: 'category',
                  children: []
                }
              ]
            },
            {
              name: 'Lowland',
              type: 'category',
              children: [
                {
                  name: 'Lowland 1',
                  type: 'category',
                  children: [
                    {
                      name: 'Details about Whisky Lowland 1',
                      type: 'document',
                    }
                  ]
                },
                {
                  name: 'Lowland 2',
                  type: 'category',
                  children: []
                }
              ]
            },
            {
              name: 'Islay',
              type: 'category',
              children: [
                {
                  name: 'Details about Whisky Islay',
                  type: 'document',
                },
                {
                  name: 'More information about Whisky Islay',
                  type: 'document',
                }
              ]
            },
            {
              name: 'Speyside',
              type: 'category',
              children: []
            },
            {
              name: 'Campbeltown',
              type: 'category',
              children: []
            }
          ]
        }
      ]
    }
  ]);

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
    component.categoriesAndDocuments$ = of(categoriesAndDocuments);
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
        name: 'Beers encyclopedia',
        type: 'document'
      }
    ]);
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    const uncategorisedDocuments: CaseFileViewDocument[] =  [
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
          type: 'document'
        },
        {
          name: 'Uncategorised document 2',
          type: 'document'
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

  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
  });
});
