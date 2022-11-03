import { Component, Input, OnInit } from "@angular/core";
import { DocumentTreeNodeType } from "../../../../../domain/case-file-view";

@Component({
	selector: 'ccd-case-file-view-icon',
	styleUrls: ['./case-file-view-icon.component.scss'],
	templateUrl: './case-file-view-icon.component.html'
})
export class CaseFileViewIconComponent implements OnInit {

	@Input() public type: DocumentTreeNodeType = DocumentTreeNodeType.DOCUMENT;
  
	@Input() public count: number = 0;

	constructor() {}

	public ngOnInit(): void {
	}
}
