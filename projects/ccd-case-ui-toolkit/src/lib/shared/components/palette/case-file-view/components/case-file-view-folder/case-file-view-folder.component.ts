import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import {
  CaseFileViewCategory,
  CaseFileViewDocument,
  CategoriesAndDocuments,
  DocumentTreeNode,
  DocumentTreeNodeType
} from '../../../../../domain/case-file-view';

@Component({
  selector: 'ccd-case-file-view-folder',
  styleUrls: ['./case-file-view-folder.component.scss'],
  templateUrl: './case-file-view-folder.component.html'
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

  private getChildren = (node: DocumentTreeNode) => of(node.children);
  public nestedChildren = (_: number, nodeData: DocumentTreeNode) => nodeData.children;

  constructor() {
    this.nestedTreeControl = new NestedTreeControl<DocumentTreeNode>(this.getChildren);
  }

  public ngOnInit(): void {
    this.documentFilterFormGroup = new FormGroup({});
    this.documentSearchFormControl = new FormControl('');
    this.documentFilterFormGroup.addControl(CaseFileViewFolderComponent.DOCUMENT_SEARCH_FORM_CONTROL_NAME, this.documentSearchFormControl);

    // Listen to search input and initiate filter documents if at least three characters entered
    this.documentFilterSubscription = this.documentSearchFormControl.valueChanges.pipe(
      filter((searchTerm: string) => searchTerm && searchTerm.length >= CaseFileViewFolderComponent.MINIMUM_SEARCH_CHARACTERS),
      switchMap((searchTerm: string) =>  this.filter(searchTerm.toLowerCase(), this.documentTreeData))
    ).subscribe(documentTreeData => {
      this.nestedDataSource = documentTreeData;
      this.nestedTreeControl.dataNodes = documentTreeData;
      this.nestedTreeControl.expandAll();
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
    return categories.reduce((tree, node) => [
      ...tree,
      ...[
        {
          name: node.category_name,
          type: DocumentTreeNodeType.FOLDER,
          children: [...this.generateTreeData(node.sub_categories), ...this.getDocuments(node.documents)]
        },
      ],
    ], []);
  }

  public getDocuments(documents: CaseFileViewDocument[]): DocumentTreeNode[] {
    const documentsToReturn: DocumentTreeNode[] = [];
    documents.forEach(document => {
      documentsToReturn.push({ name: document.document_filename, type: DocumentTreeNodeType.DOCUMENT });
    });
    return documentsToReturn;
  }

  public getUncategorisedDocuments(uncategorisedDocuments: CaseFileViewDocument[]): DocumentTreeNode {
    const documents: DocumentTreeNode[] = [];
    uncategorisedDocuments.forEach(document => {
      documents.push({ name: document.document_filename, type: DocumentTreeNodeType.DOCUMENT });
    });
    return { name: CaseFileViewFolderComponent.UNCATEGORISED_DOCUMENTS_TITLE, type: DocumentTreeNodeType.FOLDER, children: documents };
  }

  public filter(searchTerm: string, documentTreeData: DocumentTreeNode[]): Observable<DocumentTreeNode[]> {
    // Make a copy of the data so we do not mutate the original
    function copy(node: DocumentTreeNode) {
      return Object.assign({}, node);
    }

    let filteredData = documentTreeData;
    if (searchTerm && searchTerm.length > 2 && this.documentFilterFormGroup.controls[CaseFileViewFolderComponent.DOCUMENT_SEARCH_FORM_CONTROL_NAME].value.length > 2) {
      filteredData = documentTreeData.map(copy).filter(function filterTreeData(node: DocumentTreeNode) {
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

  public ngOnDestroy(): void {
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
    if (this.documentFilterSubscription) {
      this.documentFilterSubscription.unsubscribe();
    }
  }
}
