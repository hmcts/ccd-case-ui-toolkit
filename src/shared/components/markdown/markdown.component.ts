import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ConvertHrefToRouterService } from '../case-editor/services';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  public content: string;
  @Input()
  public markdownUseHrefAsRouterLink!: boolean;

  constructor(private readonly convertHrefToRouterService: ConvertHrefToRouterService) {}

  public ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
  }

  @HostListener('click', ['$event'])
  public onMarkdownClick(event: MouseEvent) {
    // If we don't have an anchor tag, we don't need to do anything.
    if (event.target instanceof HTMLAnchorElement === false) {
      return;
    }
    return this.callUpdateHrefLink((event.target as HTMLAnchorElement), event);
  }

  public callUpdateHrefLink(eventTarget, event?) {
    const targetPath = eventTarget.pathname;
    const hash = eventTarget.hash;
    const search = eventTarget.search;

    if (hash) {
      return true;
    }

    if (this.markdownUseHrefAsRouterLink === true && targetPath.indexOf('http') < 0) {
      // Prevent page from reloading
      event.preventDefault();
      this.convertHrefToRouterService.updateHrefLink(targetPath + search);
    } else {
      return true;
    }
  }
}
