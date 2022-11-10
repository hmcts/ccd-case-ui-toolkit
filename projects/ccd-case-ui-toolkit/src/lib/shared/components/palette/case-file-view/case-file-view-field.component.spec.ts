import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CategoriesAndDocuments } from '../../../domain/case-file-view/categories-and-documents.model';
import { CaseFileViewService } from '../../../services';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;
  let mockCaseFileViewService: any;
  const mockSnapshot = {
    paramMap: createSpyObj('paramMap', ['get']),
  };
  const mockRoute = {
    params: of({cid: '1234123412341234'}),
    snapshot: mockSnapshot
  };
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

  beforeEach(async(() => {
    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService', ['getCategoriesAndDocuments']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        CaseFileViewFieldComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseFileViewService, useValue: mockCaseFileViewService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFileViewFieldComponent);
    component = fixture.componentInstance;
    component.categoriesAndDocuments$ = of(categoriesAndDocuments);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mockCaseFileViewService.getCategoriesAndDocuments).toHaveBeenCalled();
  });
});
