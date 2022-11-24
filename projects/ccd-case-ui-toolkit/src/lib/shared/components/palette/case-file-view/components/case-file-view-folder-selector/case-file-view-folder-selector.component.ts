import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timeStamp } from 'console';
import { CaseFileViewCategory, CaseFileViewDocument } from 'projects/ccd-case-ui-toolkit/src/lib/shared/domain/case-file-view';

@Component({
    selector: 'xui-case-file-view-folder-selector'
})
export class CaseFileViewFolderSelectorComponent {

    public currentCategories: CaseFileViewCategory[] = [];
    public selected: string = '';

    constructor(
        public dialogRef: MatDialogRef<CaseFileViewFolderSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { categories: CaseFileViewCategory[], document: CaseFileViewDocument }
    ) {
        this.currentCategories = [...this.data.categories];
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