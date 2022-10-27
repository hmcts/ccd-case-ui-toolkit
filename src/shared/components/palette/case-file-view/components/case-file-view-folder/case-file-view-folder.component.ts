import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';
import { CaseFileViewDocument, CategoriesAndDocuments } from '../../../../../domain/case-file-view';

interface Document {
	name?: string;
	type?: string;
	category_name?: string;
	document_filename?: string;
	children?: Document[];
}

@Component({
  selector: 'ccd-case-file-view-folder',
  styleUrls: ['./case-file-view-folder.component.scss'],
  templateUrl: './case-file-view-folder.component.html'
})
export class CaseFileViewFolderComponent {

	private readonly UNCATEGORISED_DOCUMENTS_TITLE = 'Uncategorised documents';

  @Input() public categoriesAndDocuments$: Observable<CategoriesAndDocuments>;

  public documentTree: Document[] = [];
  public nestedTreeControl: NestedTreeControl<Document>;
  public nestedDataSource: Document[];

  constructor() {
    this.nestedTreeControl = new NestedTreeControl<Document>(this._getChildren);
    this.nestedDataSource = this.documentTree;
  }

  hasNestedChild = (_: number, nodeData: Document) => nodeData.children;

  private _getChildren = (node: Document) => observableOf(node.children);
  
  public ngOnInit(): void {
  	// this.categoriesAndDocuments$.subscribe(x =>
  	// 	console.log('CATEGORIES AND DOCUMENTS INNER', x)
  	// );

		const categoriesAndDocuments = this.loadCategoriesAndDocuments();
		this.generateDocumentTree(categoriesAndDocuments);
	}

	public generateDocumentTree(categoriesAndDocuments: CategoriesAndDocuments): void {
		categoriesAndDocuments.categories.forEach(category => {
			const subCategories: Document[] = [];
			const documents: Document[] = [];
			if (category.sub_categories) {
				category.sub_categories.forEach(subCategory => {
					const children: Document[] = [];
					subCategory.documents.forEach(document => {
						children.push({ name: document.document_filename });
					});
					subCategories.push({ name: subCategory.category_name, children: children });
				});
			}
			if (category.documents) {
				category.documents.forEach(document => {
					documents.push({ name: document.document_filename });
				});
			}

			this.documentTree.push({ name: category.category_name, children: [...subCategories, ...documents] });
		});

		this.appendUncategorisedDocuments(categoriesAndDocuments.uncategorised_documents);

		console.log('DOCUMENT TREE', this.documentTree);
	}

	public appendUncategorisedDocuments(documents: CaseFileViewDocument[]) {
		if (documents && documents.length > 0) {
			const uncategorisedDocuments: Document[] = [];
			documents.forEach(document => {
				uncategorisedDocuments.push({ name: document.document_filename });
			});
			this.documentTree.push({ name: this.UNCATEGORISED_DOCUMENTS_TITLE, children: uncategorisedDocuments });
		}
	}
    
  public loadCategoriesAndDocuments(): CategoriesAndDocuments {
    return {
      case_version: 1,
      categories: [
        {
          category_id: 'C1',
          category_name: 'Category1',
          category_order: 1,
          documents: [
            {
              document_url: '/test1',
              document_filename: 'Category1 Document1',
              document_binary_url: '/test1/binary',
              attribute_path: '',
              upload_timestamp: ''
            },
            {
              document_url: '/test2',
              document_filename: 'Category1 Document2',
              document_binary_url: '/test2/binary',
              attribute_path: '',
              upload_timestamp: ''
            }
          ],
          sub_categories: [
            {
              category_id: 'S1',
              category_name: 'Category1 Sub-category1',
              category_order: 1,
              documents: [
                {
                  document_url: '/test3',
                  document_filename: 'Category1 Sub-category1 Document1',
                  document_binary_url: '/test3/binary',
                  attribute_path: '',
                  upload_timestamp: ''
                },
                {
                  document_url: '/test4',
                  document_filename: 'Category1 Sub-category1 Document2',
                  document_binary_url: '/test4/binary',
                  attribute_path: '',
                  upload_timestamp: ''
                }
              ],
              sub_categories: []
            }
          ]
        },
				{
          category_id: 'C2',
          category_name: 'Category2',
          category_order: 1,
          documents: [
            {
              document_url: '/test1',
              document_filename: 'Category2 Document1',
              document_binary_url: '/test1/binary',
              attribute_path: '',
              upload_timestamp: ''
            },
            {
              document_url: '/test2',
              document_filename: 'Category2 Document2',
              document_binary_url: '/test2/binary',
              attribute_path: '',
              upload_timestamp: ''
            }
          ],
          sub_categories: [
            {
              category_id: 'C2S1',
              category_name: 'Category2 Sub-category1',
              category_order: 1,
              documents: [
                {
                  document_url: '/test3',
                  document_filename: 'Category2 Sub-category1 Document1',
                  document_binary_url: '/test3/binary',
                  attribute_path: '',
                  upload_timestamp: ''
                },
                {
                  document_url: '/test4',
                  document_filename: 'Category2 Sub-category1 Document2',
                  document_binary_url: '/test4/binary',
                  attribute_path: '',
                  upload_timestamp: ''
                }
              ],
              sub_categories: [
								{
									category_id: 'C2S1S1',
									category_name: 'Category2 Sub-category1 Sub-category1',
									category_order: 1,
									documents: [
										{
											document_url: '/test3',
											document_filename: 'Category2 Sub-category1 Sub-category1 Document 1',
											document_binary_url: '/test3/binary',
											attribute_path: '',
											upload_timestamp: ''
										}
									],
									sub_categories: []
								}
							]
            }
          ]
        },
				{
          category_id: 'C3',
          category_name: 'Category3',
          category_order: 1,
          documents: [
            {
              document_url: '/test1',
              document_filename: 'Category3 Document1',
              document_binary_url: '/test1/binary',
              attribute_path: '',
              upload_timestamp: ''
            }
          ],
          sub_categories: []
        },
				{
          category_id: 'C4',
          category_name: 'Category4',
          category_order: 1,
          documents: [
            {
              document_url: '/test1',
              document_filename: 'Category4 Document1',
              document_binary_url: '/test1/binary',
              attribute_path: '',
              upload_timestamp: ''
            },
            {
              document_url: '/test2',
              document_filename: 'Category4 Document2',
              document_binary_url: '/test2/binary',
              attribute_path: '',
              upload_timestamp: ''
            }
          ],
          sub_categories: [
            {
              category_id: 'C4S1',
              category_name: 'Category4 Sub-category1',
              category_order: 1,
              documents: [],
              sub_categories: [
								{
									category_id: 'C4S1S1',
									category_name: 'Category4 Sub-category1 Sub-category1',
									category_order: 1,
									documents: [
										{
											document_url: '/test3',
											document_filename: 'Category4 Sub-category1 Sub-category1 Document 1',
											document_binary_url: '/test3/binary',
											attribute_path: '',
											upload_timestamp: ''
										}
									],
									sub_categories: []
								}
							]
            }
          ]
        },
				{
          category_id: 'C5',
          category_name: 'Category5',
          category_order: 1,
          documents: [],
          sub_categories: [
            {
              category_id: 'C5S1',
              category_name: 'Category5 Sub-category1',
              category_order: 1,
              documents: [],
              sub_categories: [
								{
									category_id: 'C5S1S1',
									category_name: 'Category5 Sub-category1 Sub-category1',
									category_order: 1,
									documents: [
										{
											document_url: '/test3',
											document_filename: 'Category5 Sub-category1 Sub-category1 Document 1',
											document_binary_url: '/test3/binary',
											attribute_path: '',
											upload_timestamp: ''
										}
									],
									sub_categories: []
								}
							]
            }
          ]
        }
      ],
      uncategorised_documents: [
				{
					document_url: '/test1',
					document_filename: 'Uncategorised Document1',
					document_binary_url: '/test1/binary',
					attribute_path: '',
					upload_timestamp: ''
				},
				{
					document_url: '/test1',
					document_filename: 'Uncategorised Document2',
					document_binary_url: '/test1/binary',
					attribute_path: '',
					upload_timestamp: ''
				},
				{
					document_url: '/test1',
					document_filename: 'Uncategorised Document3',
					document_binary_url: '/test1/binary',
					attribute_path: '',
					upload_timestamp: ''
				}
			]
    };
  }
}
