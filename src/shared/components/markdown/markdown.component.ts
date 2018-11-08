import { Component, Input } from '@angular/core';

@Component({
    selector: 'ccd-markdown',
    templateUrl: './markdown.html'
})
export class MarkdownComponent {

    @Input()
    content: string;
}
