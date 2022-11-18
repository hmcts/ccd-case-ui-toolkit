import { CdkTree, NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { CaseFileViewCategory, CaseFileViewDocument, CategoriesAndDocuments, DocumentTreeNode } from '../../../../../domain/case-file-view';

@Component({
  selector: 'ccd-case-file-view-folder',
  templateUrl: './case-file-view-folder.component.html',
  styleUrls: ['./case-file-view-folder.component.scss'],
})
export class CaseFileViewFolderComponent implements OnInit, OnDestroy {
  private static readonly UNCATEGORISED_DOCUMENTS_TITLE = 'Uncategorised documents';

  @Input() public categoriesAndDocuments: Observable<CategoriesAndDocuments>;

  public nestedTreeControl: NestedTreeControl<DocumentTreeNode>;
  public nestedDataSource: DocumentTreeNode[];
  public categories: CaseFileViewCategory[] = [];
  public categoriesAndDocumentsSubscription: Subscription;

  @ViewChild('tree', {static: true}) public tree: CdkTree<DocumentTreeNode>;

  private getChildren = (node: DocumentTreeNode) => of(node.children);
  public nestedChildren = (_: number, nodeData: DocumentTreeNode) => nodeData.children;

  constructor() {
    this.nestedTreeControl = new NestedTreeControl<DocumentTreeNode>(this.getChildren);
  }

  public ngOnInit(): void {
    this.categoriesAndDocumentsSubscription = this.categoriesAndDocuments.subscribe(categoriesAndDocuments => {
      // Using the mock data for now as we have to display the documents as well for demo purpose
      const categories = this.loadCategories(); // categoriesAndDocuments.categories;
      // Generate document tree data from categories
      const treeData = this.generateTreeData(categories);
      // Append uncategorised documents
      if (categoriesAndDocuments.uncategorised_documents && categoriesAndDocuments.uncategorised_documents.length > 0) {
        const uncategorisedDocuments = this.getUncategorisedDocuments(categoriesAndDocuments.uncategorised_documents);
        treeData.push(uncategorisedDocuments);
      }
      // Initialise cdk tree with generated data
      this.nestedDataSource = treeData;
    });
  }

  public generateTreeData(categories: CaseFileViewCategory[]): DocumentTreeNode[] {
    return categories.reduce((tree, node) => {
      const newDocumentTreeNode = new DocumentTreeNode();
      newDocumentTreeNode.name = node.category_name;
      newDocumentTreeNode.type = 'category';
      newDocumentTreeNode.children = [...this.generateTreeData(node.sub_categories), ...this.getDocuments(node.documents)];

      return [
        ...tree,
        newDocumentTreeNode,
      ];
    }, []);
  }

  public getDocuments(documents: CaseFileViewDocument[]): DocumentTreeNode[] {
    const documentsToReturn: DocumentTreeNode[] = [];
    documents.forEach(document => {
      const documentTreeNode = new DocumentTreeNode();
      documentTreeNode.name = document.document_filename;
      documentTreeNode.type = 'document';

      documentsToReturn.push(documentTreeNode);
    });

    return documentsToReturn;
  }

  public getUncategorisedDocuments(uncategorisedDocuments: CaseFileViewDocument[]): DocumentTreeNode {
    const documents: DocumentTreeNode[] = [];
    uncategorisedDocuments.forEach(document => {
      const documentTreeNode = new DocumentTreeNode();
      documentTreeNode.name = document.document_filename;
      documentTreeNode.type = 'document';

      documents.push(documentTreeNode);
    });

    const uncategorisedNode = new DocumentTreeNode();
    uncategorisedNode.name = CaseFileViewFolderComponent.UNCATEGORISED_DOCUMENTS_TITLE;
    uncategorisedNode.type = 'category';
    uncategorisedNode.children = documents;

    return uncategorisedNode;
  }

  public sortDataSourceAscAlphabetically() {
    const sortedData = this.nestedDataSource.map(item => {
      item.sortChildrenAscending();

      const newDocumentTreeNode = new DocumentTreeNode();
      newDocumentTreeNode.name = item.name;
      newDocumentTreeNode.type = item.type;
      newDocumentTreeNode.children = item.children;

      return newDocumentTreeNode;
    });

    this.updateNodeData(sortedData);
  }
  public sortDataSourceDescAlphabetically() {
    const sortedData = this.nestedDataSource.map(item => {
      item.sortChildrenDescending();
      return item;
    });

    this.updateNodeData(sortedData);
  }

  public triggerDocumentAction(actionType: 'changeFolder' | 'openInANewTab' | 'download' | 'print') {
    switch(actionType) {
      case('changeFolder'):
        return;
      case('openInANewTab'):
        return;
      case('download'):
        return;
      case('print'):
        return;
      default:
        return;
    }
  }

  public ngOnDestroy(): void {
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
  }

  public updateNodeData(data: DocumentTreeNode[]) {
    const prevSelected = this.nestedTreeControl.expansionModel.selected.map(
      (item) => {
        return item.name;
      });

    this.nestedTreeControl.collapseAll();
    this.nestedDataSource = data.map((item) => {
      const newDocumentTreeNode = new DocumentTreeNode();
      newDocumentTreeNode.name = item.name;
      newDocumentTreeNode.type = item.type;
      newDocumentTreeNode.children = item.children;

      return newDocumentTreeNode;
    });

    const flattenedArray = this.nestedDataSource.map((item) => {
      return item.flattenedAll;
    }).flat();
    const newObjects = flattenedArray.filter((item) => {
      return prevSelected.includes(item.name);
    });
    newObjects.forEach(object => this.nestedTreeControl.expand(object));
  }

  public loadCategories(): CaseFileViewCategory[] {
    return [
      {
        category_id: 'Beers',
        category_name: 'Beers',
        category_order: 1,
        documents: [
          {
            document_url: '/test',
            document_filename: 'Lager encyclopedia',
            document_binary_url: '/test/binary',
            attribute_path: '',
            upload_timestamp: ''
          },
          {
            document_url: '/test',
            document_filename: 'Beers encyclopedia',
            document_binary_url: '/test/binary',
            attribute_path: '',
            upload_timestamp: ''
          },
          {
            document_url: '/test',
            document_filename: 'Ale encyclopedia',
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
    ];
  }
}
