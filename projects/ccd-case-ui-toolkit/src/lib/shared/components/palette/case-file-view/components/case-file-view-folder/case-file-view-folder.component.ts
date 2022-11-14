import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import {
  CaseFileViewCategory,
  CaseFileViewDocument,
  CategoriesAndDocuments,
  DocumentTreeNode
} from '../../../../../domain/case-file-view';
import { categoriesAndDocuments } from '../../test-data/categories-and-documents-test-data';
import { treeData } from '../../test-data/document-tree-node-test-data';

@Component({
  selector: 'ccd-case-file-view-folder',
  styleUrls: ['./case-file-view-folder.component.scss'],
  templateUrl: './case-file-view-folder.component.html'
})
export class CaseFileViewFolderComponent implements OnInit, OnDestroy {

  private static readonly UNCATEGORISED_DOCUMENTS_TITLE = 'Uncategorised documents';
  private static readonly MINIMUM_SEARCH_CHARACTERS = 2;

  @Input() public categoriesAndDocuments: Observable<CategoriesAndDocuments>;

  public nestedTreeControl: NestedTreeControl<DocumentTreeNode>;
  public nestedDataSource: DocumentTreeNode[];
  public categories: CaseFileViewCategory[] = [];
  public categoriesAndDocumentsSubscription: Subscription;
  public documentFilterFormGroup: FormGroup;
  public documentSearchFormControl: FormControl;

  private getChildren = (node: DocumentTreeNode) => of(node.children);
  public nestedChildren = (_: number, nodeData: DocumentTreeNode) => nodeData.children;

  constructor() {
    this.nestedTreeControl = new NestedTreeControl<DocumentTreeNode>(this.getChildren);
  }

  public ngOnInit(): void {
    this.documentFilterFormGroup = new FormGroup({});
    this.documentSearchFormControl = new FormControl('');
    this.documentFilterFormGroup.addControl('documentSearchFormControl', this.documentSearchFormControl);
    this.documentSearchFormControl.valueChanges.pipe(
      tap(() => console.log(this.documentFilterFormGroup.value)),
      debounceTime(300),
      filter((searchTerm: string) => searchTerm && searchTerm.length > CaseFileViewFolderComponent.MINIMUM_SEARCH_CHARACTERS),
      switchMap((searchTerm: string) => this.filter(searchTerm).pipe(
        tap(() => console.log('SEARCH TERM', searchTerm))
      ))
    ).subscribe(result => {
      console.log('RESULT', result);
    });
    this.categoriesAndDocumentsSubscription = this.categoriesAndDocuments.subscribe(categoriesAndDocumentsResult => {
      // Using the mock data for now as we have to display the documents as well for demo purpose
      const categories = categoriesAndDocuments.categories; // categoriesAndDocuments.categories;
      // Generate document tree data from categories
      const treeData = this.generateTreeData(categories);
      // Append uncategorised documents
      if (categoriesAndDocumentsResult.uncategorised_documents && categoriesAndDocumentsResult.uncategorised_documents.length > 0) {
        const uncategorisedDocuments = this.getUncategorisedDocuments(categoriesAndDocumentsResult.uncategorised_documents);
        treeData.push(uncategorisedDocuments);
      }
      // Initialise cdk tree with generated data
      this.nestedDataSource = treeData;
    });
  }

  public filter(searchTerm: string): Observable<any> {

    return of(treeData);
  };

  public generateTreeData(categories: CaseFileViewCategory[]): DocumentTreeNode[] {
    return categories.reduce((tree, node) => [
      ...tree,
      ...[
        {
          name: node.category_name,
          children: [...this.generateTreeData(node.sub_categories), ...this.getDocuments(node.documents)]
        },
      ],
    ], []);
  }

  public getDocuments(documents: CaseFileViewDocument[]): DocumentTreeNode[] {
    const documentsToReturn: DocumentTreeNode[] = [];
    documents.forEach(document => {
      documentsToReturn.push({ name: document.document_filename });
    });
    return documentsToReturn;
  }

  public getUncategorisedDocuments(uncategorisedDocuments: CaseFileViewDocument[]): DocumentTreeNode {
    const documents: DocumentTreeNode[] = [];
    uncategorisedDocuments.forEach(document => {
      documents.push({ name: document.document_filename });
    });
    return { name: CaseFileViewFolderComponent.UNCATEGORISED_DOCUMENTS_TITLE, children: documents };
  }

  public ngOnDestroy(): void {
    if (this.categoriesAndDocumentsSubscription) {
      this.categoriesAndDocumentsSubscription.unsubscribe();
    }
  }
}
