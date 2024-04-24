import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NgxMdService } from 'ngx-md';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  public content: string;
  @Input()
  public markdownUseHrefAsRouterLink!: boolean;

  constructor(private _markdown: NgxMdService) {}

  public ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
    this._markdown.renderer.link = (href: string, title: string, text: string): string => {
      const u = new URL(href);
      if (href.startsWith("/")) {
        // relative link
        return `<a routerLink=[${href}]>${title}</a>`
      } else if (u.origin === window.origin) {
        const l = `${u.pathname}?${u.search}#${u.hash}`
        return `<a routerLink=[${l}]>${title}</a>`
      } else {
        return `<a href="${href}">${title}</a>`
      }
    }
  }
}
