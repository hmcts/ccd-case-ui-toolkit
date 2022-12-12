import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentTreeNode } from '../../../../../domain/case-file-view';
import { CaseFileViewCategory } from '../../../../../domain/case-file-view/case-file-view-category.model';

@Component({
    selector: 'xui-case-file-view-folder-selector',
    templateUrl: './case-file-view-folder-selector.component.html',
    styleUrls: ['./case-file-view-folder-selector.component.scss']
})
export class CaseFileViewFolderSelectorComponent {

    public currentCategories: CaseFileViewCategory[] = [];
    public selected: string = '';

    constructor(
        public dialogRef: MatDialogRef<CaseFileViewFolderSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { categories: CaseFileViewCategory[], document: DocumentTreeNode }
    ) {
        this.currentCategories = [...this.data.categories];
    }

    public handleChange(evt) {
        if (evt.target.checked) {
            this.select(evt.target.id);
        }
    }

    public select(categoryId: string) {
        this.selected = categoryId;
    }

    public cancel() {
        this.dialogRef.close();
    }

    public save() {
        this.dialogRef.close(this.selected.length > 0 ? this.selected : null);
    }
}