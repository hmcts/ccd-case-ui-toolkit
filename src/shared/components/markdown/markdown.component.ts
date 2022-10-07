import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ConvertHrefToRouterService } from '../case-editor/services';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  content: string;
  @Input()
  markdownUseHrefAsRouterLink!: boolean;

  constructor(private convertHrefToRouterService: ConvertHrefToRouterService) {}

  ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
  }

  @HostListener('click', ['$event'])
  onMarkdownClick(event: MouseEvent) {
    // If we don't have an anchor tag, we don't need to do anything.
    if (event.target instanceof HTMLAnchorElement === false) {
      return;
    }
    return true;
  }
}
