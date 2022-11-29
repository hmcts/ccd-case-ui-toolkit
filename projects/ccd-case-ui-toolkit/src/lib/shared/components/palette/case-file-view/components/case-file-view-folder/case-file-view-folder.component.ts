import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CaseFileViewCategory, CaseFileViewDocument, CategoriesAndDocuments, DocumentTreeNodeType } from '../../../../../domain/case-file-view';
import { DocumentTreeNode } from '../../../../../domain/case-file-view/document-tree-node/document-tree-node.model';
import { CaseFileViewFolderSelectorComponent } from '../case-file-view-folder-selector/case-file-view-folder-selector.component';

@Component({
  selector: 'ccd-case-file-view-folder',
  templateUrl: './case-file-view-folder.component.html',
  styleUrls: ['./case-file-view-folder.component.scss'],
})
export class CaseFileViewFolderComponent implements OnInit, OnDestroy {
  private static readonly UNCATEGORISED_DOCUMENTS_TITLE = 'Uncategorised documents';
  private static readonly DOCUMENT_SEARCH_FORM_CONTROL_NAME = 'documentSearchFormControl';
  private static readonly MINIMUM_SEARCH_CHARACTERS = 3;

  @Input() public categoriesAndDocuments: Observable<CategoriesAndDocuments>;

  public nestedTreeControl: NestedTreeControl<DocumentTreeNode>;
  public nestedDataSource: DocumentTreeNode[];
  public categories: CaseFileViewCategory[] = [];
  public categoriesAndDocumentsSubscription: Subscription;
  public documentFilterFormGroup: FormGroup;
  public documentSearchFormControl: FormControl;
  public documentTreeData: DocumentTreeNode[];
  public documentFilterSubscription: Subscription;
  public searchTermLength: number;

  private getChildren = (node: DocumentTreeNode) => of(node.children);
  public nestedChildren = (_: number, nodeData: DocumentTreeNode) => nodeData.children;

  constructor(private dialog: MatDialog) {
    this.nestedTreeControl = new NestedTreeControl<DocumentTreeNode>(this.getChildren);
  }

  public ngOnInit(): void {
    this.documentFilterFormGroup = new FormGroup({});
    this.documentSearchFormControl = new FormControl('');
    this.documentFilterFormGroup.addControl(CaseFileViewFolderComponent.DOCUMENT_SEARCH_FORM_CONTROL_NAME, this.documentSearchFormControl);

    // Listen to search input and initiate filter documents if at least three characters entered
    this.documentFilterSubscription = this.documentSearchFormControl.valueChanges.pipe(
      tap((searchTerm: string) => this.searchTermLength = searchTerm.length),
      switchMap((searchTerm: string) => this.filter(searchTerm.toLowerCase()).pipe())
    ).subscribe(documentTreeData => {
      this.nestedDataSource = documentTreeData;
      this.nestedTreeControl.dataNodes = documentTreeData;
      this.searchTermLength >= CaseFileViewFolderComponent.MINIMUM_SEARCH_CHARACTERS
        ? this.nestedTreeControl.expandAll()
        : this.nestedTreeControl.collapseAll();
    });

    // Subscribe to the input categories and documents, and generate tree data and initialise cdk tree
    this.categoriesAndDocumentsSubscription = this.categoriesAndDocuments.subscribe(categoriesAndDocuments => {
      const categories = categoriesAndDocuments.categories;
      // Generate document tree data from categories
      this.documentTreeData = this.generateTreeData(categories);
      // Append uncategorised documents
      if (categoriesAndDocuments.uncategorised_documents && categoriesAndDocuments.uncategorised_documents.length > 0) {
        const uncategorisedDocuments = this.getUncategorisedDocuments(categoriesAndDocuments.uncategorised_documents);
        this.documentTreeData.push(uncategorisedDocuments);
      }
      // Initialise cdk tree with generated data
      this.nestedDataSource = this.documentTreeData;
      this.nestedTreeControl.dataNodes = this.documentTreeData;
    });
  }

  public generateTreeData(categories: CaseFileViewCategory[]): DocumentTreeNode[] {
    return categories.reduce((tree, node) => {
      const newDocumentTreeNode = new DocumentTreeNode();
      newDocumentTreeNode.name = node.category_name;
      newDocumentTreeNode.type =  DocumentTreeNodeType.FOLDER;
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
      documentTreeNode.type = DocumentTreeNodeType.DOCUMENT;

      documentsToReturn.push(documentTreeNode);
    });

    return documentsToReturn;
  }

  public getUncategorisedDocuments(uncategorisedDocuments: CaseFileViewDocument[]): DocumentTreeNode {
    const documents: DocumentTreeNode[] = [];
    uncategorisedDocuments.forEach(document => {
      const documentTreeNode = new DocumentTreeNode();
      documentTreeNode.name = document.document_filename;
      documentTreeNode.type = DocumentTreeNodeType.DOCUMENT;

      documents.push(documentTreeNode);
    });

    const uncategorisedNode = new DocumentTreeNode();
    uncategorisedNode.name = CaseFileViewFolderComponent.UNCATEGORISED_DOCUMENTS_TITLE;
    uncategorisedNode.type = DocumentTreeNodeType.FOLDER;
    uncategorisedNode.children = documents;

    return uncategorisedNode;
  }

  public filter(searchTerm: string): Observable<DocumentTreeNode[]> {
    // Make a copy of the data so we do not mutate the original
    function copy(node: DocumentTreeNode) {
      const documentTreeNode = new DocumentTreeNode();
      return Object.assign(documentTreeNode, node);
    }

    let filteredData = this.documentTreeData;
    if (searchTerm && searchTerm.length >= CaseFileViewFolderComponent.MINIMUM_SEARCH_CHARACTERS && this.documentFilterFormGroup.controls[CaseFileViewFolderComponent.DOCUMENT_SEARCH_FORM_CONTROL_NAME].value.length > 2) {
      filteredData = this.documentTreeData.map(copy).filter(function filterTreeData(node: DocumentTreeNode) {
        if (node.name && node.name.toLowerCase().includes(searchTerm) && node.type === DocumentTreeNodeType.DOCUMENT) {
          return true;
        }
        // Call recursively if node has children
        if (node.children) {
          return (node.children = node.children.map(copy).filter(filterTreeData)).length;
        }
      });
    }
    return of(filteredData);
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

  public triggerDocumentAction(actionType: 'changeFolder' | 'openInANewTab' | 'download' | 'print', document: DocumentTreeNode) {
    switch(actionType) {
      case('changeFolder'):
        this.openMoveDialog(document);
        break;
      case('openInANewTab'):
        console.log('openInANewTab!');
        break;
      case('download'):
        console.log('download!');
        break;
      case('print'):
        console.log('print!');
        break;
      default:
        return;
    }
  }
  public sortDataSourceDescAlphabetically() {
    const sortedData = this.nestedDataSource.map(item => {
      item.sortChildrenDescending();
      return item;
    });

    this.updateNodeData(sortedData);
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

  private nodeToDocument(node: DocumentTreeNode): CaseFileViewDocument {
    if (node.type === 'folder') {
      return null;
    }

    const find = (name: string, categories: CaseFileViewCategory[]) => {
      let doc = null;
      for (let c of categories) {
        doc = c.documents.find(d => d.document_filename === name);
        if (doc) {
          return doc;
        }
        return find(name, c.sub_categories);
      }
    }

    return find(node.name, this.categories);
  }

  private openMoveDialog(node: DocumentTreeNode) {
    const dialogRef = this.dialog.open(CaseFileViewFolderSelectorComponent, {
      width: '350px',
      data: { categories: this.categories, document: this.nodeToDocument(node) }
    });

    dialogRef.afterClosed().subscribe(data => {
      console.log(data);
    });
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

  public ngOnDestroy(): void {
    this.categoriesAndDocumentsSubscription?.unsubscribe();

    this.documentFilterSubscription?.unsubscribe();
  }
}
