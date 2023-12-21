import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  CaseFileViewCategory,
  CaseFileViewDocument,
  CategoriesAndDocuments,
  DocumentTreeNode,
  DocumentTreeNodeType
} from '../../../../../domain/case-file-view';
import { DocumentManagementService, WindowService } from '../../../../../services';
import { CaseFileViewFolderSelectorComponent } from '../case-file-view-folder-selector/case-file-view-folder-selector.component';
export const MEDIA_VIEWER_LOCALSTORAGE_KEY = 'media-viewer-info';

@Component({
  selector: 'ccd-case-file-view-folder',
  templateUrl: './case-file-view-folder.component.html',
  styleUrls: ['./case-file-view-folder.component.scss'],
})
export class CaseFileViewFolderComponent implements OnInit, OnDestroy {
  private static readonly UNCATEGORISED_DOCUMENTS_TITLE = 'Uncategorised documents';
  private static readonly DOCUMENT_SEARCH_FORM_CONTROL_NAME = 'documentSearchFormControl';
  private static readonly MINIMUM_SEARCH_CHARACTERS = 1;

  @Input() public categoriesAndDocuments: Observable<CategoriesAndDocuments>;
  @Input() public allowMoving: boolean;
  @Output() public clickedDocument = new EventEmitter<DocumentTreeNode>();
  @Output() public moveDocument = new EventEmitter<any>();

  public nestedTreeControl: NestedTreeControl<DocumentTreeNode>;
  public nestedDataSource: DocumentTreeNode[];
  public categories: CaseFileViewCategory[] = [];
  public categoriesAndDocumentsSubscription: Subscription;
  public selectedNodeItem: DocumentTreeNode | undefined;

  public documentFilterFormGroup: FormGroup;
  public documentSearchFormControl: FormControl;
  public documentTreeData: DocumentTreeNode[];
  public documentFilterSubscription: Subscription;
  public searchTermLength: number;

  private getChildren = (node: DocumentTreeNode) => of(node.children);
  public nestedChildren = (_: number, nodeData: DocumentTreeNode) => nodeData.children;
  public get documentCount() {
    if (this.nestedDataSource?.length) {
      return this.nestedDataSource.reduce((acc, item) => {
        return acc + item.childDocumentCount;
      }, 0);
    } else {
      return 0;
    }
  }

  constructor(
    private readonly windowService: WindowService,
    private readonly router: Router,
    private readonly documentManagementService: DocumentManagementService,
    private readonly dialog: MatDialog
  ) {
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
      this.categories = categories;
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
      documentTreeNode.document_filename = document.document_filename;
      documentTreeNode.document_binary_url = document.document_binary_url;
      documentTreeNode.attribute_path = document.attribute_path;

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
      documentTreeNode.document_filename = document.document_filename;
      documentTreeNode.document_binary_url = document.document_binary_url;
      documentTreeNode.attribute_path = document.attribute_path;

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
    if (searchTerm && searchTerm.length >= CaseFileViewFolderComponent.MINIMUM_SEARCH_CHARACTERS && this.documentFilterFormGroup.controls[CaseFileViewFolderComponent.DOCUMENT_SEARCH_FORM_CONTROL_NAME].value.length > 0) {
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

  public triggerDocumentAction(
    actionType: 'changeFolder' | 'openInANewTab' | 'download' | 'print',
    documentTreeNode: DocumentTreeNode
  ): void {
    switch(actionType) {
      case('changeFolder'):
        this.openMoveDialog(documentTreeNode);
        break;
      case('openInANewTab'):
        this.windowService.setLocalStorage(MEDIA_VIEWER_LOCALSTORAGE_KEY,
          this.documentManagementService.getMediaViewerInfo({
            document_binary_url: documentTreeNode.document_binary_url,
            document_filename: documentTreeNode.document_filename
          }));

        this.windowService.openOnNewTab(
          this.router.createUrlTree(['/media-viewer'])?.toString()
        );
        break;
      case('download'):
        // Create a URL from the document_binary_url property (absolute URL) and use the path portion (relative URL).
        // This is necessary because the Manage Cases application will automatically apply a proxy to the request, with
        // the correct remote endpoint
        this.downloadFile(new URL(documentTreeNode.document_binary_url).pathname, documentTreeNode.document_filename);
        break;
      case('print'):
        this.printDocument(new URL(documentTreeNode.document_binary_url).pathname);
        break;
      default:
        return;
    }
  }

  public sortDataSourceAscAlphabetically() {
    const sortedData = this.nestedDataSource.map(item => {
      item.sortChildrenAscending();
      return item;
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

  public updateNodeData(data: DocumentTreeNode[]): void {
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

  public ngOnDestroy(): void {
    this.categoriesAndDocumentsSubscription?.unsubscribe();
    this.documentFilterSubscription?.unsubscribe();
  }

  private openMoveDialog(node: DocumentTreeNode): void {
    const dialogRef = this.dialog.open(CaseFileViewFolderSelectorComponent, {
      data: { categories: this.categories, document: node }
    });

    dialogRef.afterClosed().subscribe(newCatId => {
      if (newCatId) {
        this.moveDocument.emit({newCategory: newCatId, document: node});
      }
    });
  }

  public printDocument(url: string): void {
    const printWindow = window.open(url);
    printWindow.print();
  }

  public downloadFile(url: string, downloadFileName: string): void {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = downloadFileName;
    a.click();
    a.remove();
  }
}
