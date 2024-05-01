import { Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { NgxMdService } from 'ngx-md';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

  constructor(private _markdown: NgxMdService, private router: Router, private renderer: Renderer2) {
  }

  @HostListener('click', ['$event'])
  public routerClick($event: MouseEvent) {
    const url: string = (<any>$event.currentTarget).getAttribute('href');
    console.log('routerClick got url ' + url);
    if (false && url && url.startsWith('/')) {
      $event.stopPropagation();
      console.log('routerClick: router navigating to ' + url);
      this.router.navigateByUrl(url);
    }
  }


  public ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
/*    this._markdown.renderer.link = (href: string, title: string, text: string): string => {
      console.log(`markdown renderer link: href=${href} title=${title} text=${text}`);
      if (href.startsWith('/')) {
        // relative link
        return `<a href="${href}" (click)="routerClick('${href}', $event)">${text}</a>`
      } else {
        return `<a href="${href}">${text}</a>`;
      }
    }
 */
  }
}
