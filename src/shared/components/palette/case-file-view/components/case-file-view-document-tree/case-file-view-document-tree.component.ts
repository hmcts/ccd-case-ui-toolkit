import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { CategoriesAndDocuments } from "../../../../../domain/case-file-view";

@Component({
	selector: 'ccd-case-file-view-document-tree',
	templateUrl: './case-file-view-document-tree.component.html'
})
export class CaseFileViewDocumentTreeComponent implements OnInit {

	@Input() categoriesAndDocuments$: Observable<CategoriesAndDocuments>;

	public ngOnInit(): void {
		this.categoriesAndDocuments$.subscribe(x =>
			console.log('XXX', x)
		)
	}
}
