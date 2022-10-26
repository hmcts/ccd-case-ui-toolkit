import { ArrayDataSource } from "@angular/cdk/collections";
import { NestedTreeControl } from "@angular/cdk/tree";
import { Component, Input } from "@angular/core";
import { Observable, of } from "rxjs";
import { CaseFileViewCategory, CategoriesAndDocuments } from "../../../../../domain/case-file-view";

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruit',
    children: [
      {name: 'Apple'},
      {name: 'Banana'},
      {name: 'Fruit loops'},
    ]
  }, {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [
          {name: 'Broccoli'},
          {name: 'Brussel sprouts'},
        ]
      }, {
        name: 'Orange',
        children: [
          {name: 'Pumpkins'},
          {name: 'Carrots'},
        ]
      },
    ]
  },
];

@Component({
  selector: 'ccd-case-file-view-document-tree',
  templateUrl: './case-file-view-document-tree.component.html'
})
export class CaseFileViewDocumentTreeComponent {

  @Input() categoriesAndDocuments$: Observable<CategoriesAndDocuments>;

  treeControl = new NestedTreeControl<FoodNode> (node => node.children);
  dataSource = new ArrayDataSource(TREE_DATA);

  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;

  // public nestedTreeControl: NestedTreeControl<CaseFileViewCategory>;
  // public nestedDataSource: CaseFileViewCategory[];
  // public categoriesAndDocuments: CategoriesAndDocuments;

  // constructor() {
  //   this.categoriesAndDocuments = this.loadCategoriesAndDocuments();
  //   this.nestedTreeControl = new NestedTreeControl<CaseFileViewCategory>(this._getChildren);
  //   this.nestedDataSource = this.categoriesAndDocuments.categories;
  // }

  // hasNestedChild = (_: number, nodeData: CaseFileViewCategory) => nodeData.documents;

  // private _getChildren = (node: CaseFileViewCategory) => of(node.sub_categories);

  // public ngOnInit(): void {
  // 	this.categoriesAndDocuments$.subscribe(x =>
  // 		console.log('XXX', x)
  // 	)
    
  // 	this.dataSource = new ArrayDataSource(this.categoriesAndDocuments.categories);
  // 	this.nestedTreeControl = new NestedTreeControl<CaseFileViewCategory>(this._getChildren);
  // }

  public loadCategoriesAndDocuments(): CategoriesAndDocuments {
    return {
      case_version: 1,
      categories: [
        {
          category_id: 'C1',
          category_name: 'Category 1',
          category_order: 1,
          documents: [
            {
              document_url: '/test1',
              document_filename: 'Test1',
              document_binary_url: '/test1/binary',
              attribute_path: '',
              upload_timestamp: ''
            },
            {
              document_url: '/test2',
              document_filename: 'Test2',
              document_binary_url: '/test2/binary',
              attribute_path: '',
              upload_timestamp: ''
            }
          ],
          sub_categories: [
            {
              category_id: 'S1',
              category_name: 'Sub-category 1',
              category_order: 1,
              documents: [
                {
                  document_url: '/test3',
                  document_filename: 'Test3',
                  document_binary_url: '/test3/binary',
                  attribute_path: '',
                  upload_timestamp: ''
                },
                {
                  document_url: '/test4',
                  document_filename: 'Test4',
                  document_binary_url: '/test4/binary',
                  attribute_path: '',
                  upload_timestamp: ''
                }
              ],
              sub_categories: []
            }
          ]
        }
      ],
      uncategorised_documents: []
    };
  }
}
