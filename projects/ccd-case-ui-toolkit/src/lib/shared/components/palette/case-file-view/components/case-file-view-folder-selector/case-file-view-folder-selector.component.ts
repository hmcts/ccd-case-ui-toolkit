import { AfterViewInit, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentTreeNode } from '../../../../../domain/case-file-view';
import { CaseFileViewCategory } from '../../../../../domain/case-file-view/case-file-view-category.model';

@Component({
    selector: 'xui-case-file-view-folder-selector',
    templateUrl: './case-file-view-folder-selector.component.html',
    styleUrls: ['./case-file-view-folder-selector.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CaseFileViewFolderSelectorComponent implements AfterViewInit {

    public currentCategories: CaseFileViewCategory[] = [];
    public selected: string = '';

    constructor(
        public dialogRef: MatDialogRef<CaseFileViewFolderSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { categories: CaseFileViewCategory[], document: DocumentTreeNode }
    ) {
        this.currentCategories = [...this.data.categories];
    }

    public ngAfterViewInit(): void {
        const path = this.findPath();
        path.forEach(p => (document.getElementById(p) as HTMLInputElement).checked = true);
    }

    public handleChange(evt) {
        if (evt.target.checked) {
            this.select(evt.target.id);
            // get level of this checkbox so we can clear all lower levels
            let level = parseInt(evt.target.name.split('-')[1], 10) + 1;
            let nodes = document.getElementsByName(`level-${level}`);
            while (nodes.length > 0) {
                nodes.forEach((node: HTMLInputElement) => node.checked = false);
                level += 1;
                nodes = document.getElementsByName(`level-${level}`);
            }
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

    private findPath(): string[] {
        for (const c of this.data.categories) {
            const r = this.containsDocument(c, this.data.document);
            if (r) {
                return r;
            }
        }
    }

    private containsDocument(cat: CaseFileViewCategory, document: DocumentTreeNode): string[] | null {
        if (cat.documents.findIndex(doc => doc.document_binary_url === document.document_binary_url) > -1) {
            return [cat.category_id];
        }
        for (const c of cat.sub_categories) {
            const r = this.containsDocument(c, document);
            if (r) {
                return [cat.category_id, ...r];
            }
        }
        return null;
    }
}