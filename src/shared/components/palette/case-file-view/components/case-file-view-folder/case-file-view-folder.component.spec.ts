import { CdkTreeModule } from '@angular/cdk/tree';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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

  const categoriesAndDocuments: CategoriesAndDocuments = {
    case_version: 1,
    categories: [
      {
        'category_id': 'Beers',
        'category_name': 'Beers',
        'category_order': 1,
        'documents': [
          {
            'document_url': '/test',
            'document_filename': 'Beers encyclopedia',
            'document_binary_url': '/test/binary',
            'attribute_path': '',
            'upload_timestamp': ''
          }
        ],
        'sub_categories': [
          {
            'category_id': 'BeersBitters',
            'category_name': 'Bitters',
            'category_order': 1,
            'documents': [],
            'sub_categories': []
          },
          {
            'category_id': 'BeersAmerican',
            'category_name': 'American',
            'category_order': 2,
            'documents': [],
            'sub_categories': []
          },
          {
            'category_id': 'BeersAsian',
            'category_name': 'Asian',
            'category_order': 3,
            'documents': [],
            'sub_categories': []
          }
        ]
      },
      {
        'category_id': 'Wines',
        'category_name': 'Wines',
        'category_order': 2,
        'documents': [],
        'sub_categories': [
          {
            'category_id': 'WinesFrench',
            'category_name': 'French',
            'category_order': 1,
            'documents': [],
            'sub_categories': []
          },
          {
            'category_id': 'WinesItalian',
            'category_name': 'Italian',
            'category_order': 2,
            'documents': [],
            'sub_categories': []
          }
        ]
      },
      {
        'category_id': 'Spirits',
        'category_name': 'Spirits',
        'category_order': 3,
        'documents': [],
        'sub_categories': [
          {
            'category_id': 'SpiritsWhisky',
            'category_name': 'Scotch whisky',
            'category_order': 1,
            'documents': [],
            'sub_categories': [
              {
                'category_id': 'WhiskyHighland',
                'category_name': 'Highland',
                'category_order': 1,
                'documents': [],
                'sub_categories': [
                  {
                    'category_id': 'WhiskyHighland1',
                    'category_name': 'Highland 1',
                    'category_order': 1,
                    'documents': [],
                    'sub_categories': []
                  }
                ]
              },
              {
                'category_id': 'WhiskyLowland',
                'category_name': 'Lowland',
                'category_order': 2,
                'documents': [],
                'sub_categories': [
                  {
                    'category_id': 'WhiskyLowland1',
                    'category_name': 'Lowland 1',
                    'category_order': 1,
                    'documents': [
                      {
                        'document_url': '/test',
                        'document_filename': 'Details about Whisky Lowland 1',
                        'document_binary_url': '/test/binary',
                        'attribute_path': '',
                        'upload_timestamp': ''
                      }
                    ],
                    'sub_categories': []
                  },
                  {
                    'category_id': 'WhiskyLowland2',
                    'category_name': 'Lowland 2',
                    'category_order': 2,
                    'documents': [],
                    'sub_categories': []
                  }
                ]
              },
              {
                'category_id': 'WhiskyIslay',
                'category_name': 'Islay',
                'category_order': 3,
                'documents': [
                  {
                    'document_url': '/test',
                    'document_filename': 'Details about Whisky Islay',
                    'document_binary_url': '/test/binary',
                    'attribute_path': '',
                    'upload_timestamp': ''
                  },
                  {
                    'document_url': '/test',
                    'document_filename': 'More information about Whisky Islay',
                    'document_binary_url': '/test/binary',
                    'attribute_path': '',
                    'upload_timestamp': ''
                  }
                ],
                'sub_categories': []
              },
              {
                'category_id': 'WhiskySpeyside',
                'category_name': 'Speyside',
                'category_order': 4,
                'documents': [],
                'sub_categories': []
              },
              {
                'category_id': 'WhiskyCampbeltown',
                'category_name': 'Campbeltown',
                'category_order': 5,
                'documents': [],
                'sub_categories': []
              }
            ]
          }
        ]
      }
    ],
    uncategorised_documents: [
      {
        'document_url': '/uncategorised-document-1',
        'document_filename': 'Uncategorised document 1',
        'document_binary_url': '/test/binary',
        'attribute_path': '',
        'upload_timestamp': ''
      },
      {
        'document_url': '/uncategorised-document-2',
        'document_filename': 'Uncategorised document 2',
        'document_binary_url': '/test/binary',
        'attribute_path': '',
        'upload_timestamp': ''
      }
    ]
  };

  const treeData: DocumentTreeNode[] = [
    {
      'name': 'Beers',
      'children': [
        {
          'name': 'Bitters',
          'children': []
        },
        {
          'name': 'American',
          'children': []
        },
        {
          'name': 'Asian',
          'children': []
        },
        {
          'name': 'Beers encyclopedia'
        }
      ]
    },
    {
      'name': 'Wines',
      'children': [
        {
          'name': 'French',
          'children': []
        },
        {
          'name': 'Italian',
          'children': []
        }
      ]
    },
    {
      'name': 'Spirits',
      'children': [
        {
          'name': 'Scotch whisky',
          'children': [
            {
              'name': 'Highland',
              'children': [
                {
                  'name': 'Highland 1',
                  'children': []
                }
              ]
            },
            {
              'name': 'Lowland',
              'children': [
                {
                  'name': 'Lowland 1',
                  'children': [
                    {
                      'name': 'Details about Whisky Lowland 1'
                    }
                  ]
                },
                {
                  'name': 'Lowland 2',
                  'children': []
                }
              ]
            },
            {
              'name': 'Islay',
              'children': [
                {
                  'name': 'Details about Whisky Islay'
                },
                {
                  'name': 'More information about Whisky Islay'
                }
              ]
            },
            {
              'name': 'Speyside',
              'children': []
            },
            {
              'name': 'Campbeltown',
              'children': []
            }
          ]
        }
      ]
    }
  ];

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
        'name': 'Beers encyclopedia'
      }
    ];
    expect(component.getDocuments(documents)).toEqual(documentsTreeNodes);
  });

  it('should get uncategorised documents', () => {
    const uncategorisedDocuments: CaseFileViewDocument[] =  [
      {
        'document_url': '/uncategorised-document-1',
        'document_filename': 'Uncategorised document 1',
        'document_binary_url': '/test/binary',
        'attribute_path': '',
        'upload_timestamp': ''
      },
      {
        'document_url': '/uncategorised-document-2',
        'document_filename': 'Uncategorised document 2',
        'document_binary_url': '/test/binary',
        'attribute_path': '',
        'upload_timestamp': ''
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
    }
    expect(component.getUncategorisedDocuments(uncategorisedDocuments)).toEqual(uncategorisedDocumentsTreeNode);
  });

  it('should unsubscribe', () => {
    spyOn(component.categoriesAndDocumentsSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.categoriesAndDocumentsSubscription.unsubscribe).toHaveBeenCalled();
  });
});
