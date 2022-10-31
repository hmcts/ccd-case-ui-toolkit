import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CaseFileViewCategory, CaseFileViewDocument, CategoriesAndDocuments } from '../../../../../domain/case-file-view';

interface TreeNode {
  name?: string;
  children?: TreeNode[];
}

@Component({
  selector: 'ccd-case-file-view-folder',
  styleUrls: ['./case-file-view-folder.component.scss'],
  templateUrl: './case-file-view-folder.component.html'
})
export class CaseFileViewFolderComponent {

  private readonly UNCATEGORISED_DOCUMENTS_TITLE = 'Uncategorised documents';

  @Input() public categoriesAndDocuments$: Observable<CategoriesAndDocuments>;

  public documentTree: TreeNode[] = [];
  public subcategoriesTree: TreeNode[] = [];
  public nestedTreeControl: NestedTreeControl<TreeNode>;
  public nestedDataSource: TreeNode[];
  public categories: CaseFileViewCategory[] = [];
  public uncategorisedDocuments: CaseFileViewDocument[] = [];

  private _getChildren = (node: TreeNode) => of(node.children);
  public hasNestedChild = (_: number, nodeData: TreeNode) => nodeData.children;

  constructor() {
    this.nestedTreeControl = new NestedTreeControl<TreeNode>(this._getChildren);
  }
  
  public ngOnInit(): void {
    this.categoriesAndDocuments$.subscribe(categoriesAndDocuments => {
      this.categories = categoriesAndDocuments.categories;
      this.uncategorisedDocuments = categoriesAndDocuments.uncategorised_documents;
      this.generateDocumentTreeData();
    });	
  }

  public generateDocumentTreeData(): void {
    this.categories.forEach(category => {
      let subCategories: TreeNode[] = [];
      const documents: TreeNode[] = [];
      if (category.sub_categories) {
        subCategories = this.appendSubCategories(category.sub_categories);
        this.subcategoriesTree = [];
      }
      if (category.documents) {
        category.documents.forEach(document => {
          documents.push({ name: document.document_filename });
        });
      }

      this.documentTree.push({ name: category.category_name, children: [...subCategories, ...documents] });
    });

    // Append uncategorised documents
    this.appendUncategorisedDocuments();

    // Initialise cdk tree with generated data
    this.nestedDataSource = this.documentTree;

    console.log('DOCUMENT TREE', this.documentTree);
  }

  public appendSubCategories(subcategories: CaseFileViewCategory[], recursiveCall?: boolean): TreeNode[] {
    return subcategories.reduce((previousSubcategory, currentSubcategory) => {     
      if (currentSubcategory.sub_categories && currentSubcategory.sub_categories.length > 0) {
        if (this.subcategoriesTree && this.subcategoriesTree.length > 0) {
          const subcategory: TreeNode[] = [{ name: currentSubcategory.category_name, children: [] }];
          this.subcategoriesTree[0].children = [...this.subcategoriesTree[0].children, ...subcategory];
        } else {
          this.subcategoriesTree.push({ name: currentSubcategory.category_name, children: [] });
        }
        this.appendSubCategories(currentSubcategory.sub_categories, true);
      } else {
        if (recursiveCall) {
          const subcategory: TreeNode[] = [{ name: currentSubcategory.category_name, children: [] }];
          this.subcategoriesTree[0].children = [...this.subcategoriesTree[0].children, ...subcategory];
        } else {
          this.subcategoriesTree.push({ name: currentSubcategory.category_name, children: [] });
        }
      }
      return this.subcategoriesTree;
    }, []);
  }

  public appendUncategorisedDocuments() {
    const uncategorisedDocuments: TreeNode[] = [];
    if (this.uncategorisedDocuments && this.uncategorisedDocuments.length > 0) {
      const uncategorisedDocuments: TreeNode[] = [];
      this.uncategorisedDocuments.forEach(document => {
        uncategorisedDocuments.push({ name: document.document_filename });
      });
    }
    this.documentTree.push({ name: this.UNCATEGORISED_DOCUMENTS_TITLE, children: uncategorisedDocuments });
  }
}
