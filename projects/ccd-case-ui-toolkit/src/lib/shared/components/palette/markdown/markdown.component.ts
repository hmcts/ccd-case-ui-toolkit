import { Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import * as marked from 'marked';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html'
})
export class MarkdownComponent implements OnInit {
  @Input()
  public content: string;
  @Input()
  public markdownUseHrefAsRouterLink!: boolean;
  @Input()
  public renderUrlToTextFeature?: boolean = true;

  constructor(private router: Router, private renderer: Renderer2) { }

  public ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
    if (this.renderUrlToTextFeature) {
      this.renderUrlToText();
    }
  }

  @HostListener('click', ['$event'])
  public onMarkdownClick(event: MouseEvent) {
    // If we don't have an anchor tag, we don't need to do anything.
    if (event.target instanceof HTMLAnchorElement === false) {
      return;
    }
    return true;
  }

  private renderUrlToText(): void {
    const renderer = new marked.Renderer();

    renderer.link = (href, title, text) => {
      if (!text || text === href) {
        return this.isAllowedUrl(href) ? `<a href="${href}">${href}</a>` : href;
      }
      return this.detectMarkdownLinks(this.content) ? `<a href="${href}">${text}</a>` : text;
    };

    marked.setOptions({
      renderer: renderer
    });
  }

  private isAllowedUrl(url: string): boolean {
    const currentOrigin = window.location.origin;
    const urlOrigin = new URL(url, window.location.href).origin;

    return urlOrigin === currentOrigin || url.startsWith('/'); // Check if same origin or relative
  }

  private detectMarkdownLinks(inputString) {
    const markdownLinkRegex = /\[([^\]]+)\]\(?([^ )]+)\)/g;
    return markdownLinkRegex.test(inputString);
  }
}
