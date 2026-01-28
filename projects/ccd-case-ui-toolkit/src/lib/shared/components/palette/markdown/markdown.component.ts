import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnInit, Renderer2 } from '@angular/core';
import * as marked from 'marked';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-markdown',
  templateUrl: './markdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class MarkdownComponent implements OnInit {
  @Input() public content: string;
  @Input() public renderUrlToTextFeature?: boolean = true;

  constructor(private router: Router, private renderer: Renderer2, private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.content = this.content.replace(/  \n/g, '<br>');
    if (this.renderUrlToTextFeature) {
      this.renderUrlToText();
    }
    this.cdr.markForCheck(); // Mark the component for change detection
  }

  public interceptClick(event: MouseEvent): void {
    this.ngZone.runOutsideAngular(() => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a') {
        const href = target.getAttribute('href');
        const targetAttr = target.getAttribute('target'); // Check the target attribute
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          if (targetAttr === '_blank') {
            // Allow the default behavior for links opening in a new tab
            return;
          }
          const currentUrl = window.location.href;
          if (currentUrl.includes('trigger')) {
            // If we are already in an event and there is a markdown, reload the page
            this.ngZone.run(() => {
              this.router.navigateByUrl(href);
            });
          } else {
            event.preventDefault();
            this.ngZone.run(() => {
              this.router.navigateByUrl(href);
            });
          }
        }
      }
    });
  }

  private renderUrlToText(): void {
    const renderer = new marked.Renderer();

    renderer.link = ({ href, title, tokens }) => {
      const text = tokens && tokens.length > 0 ? tokens[0].raw : href;
      if (!text || text === href) {
        return this.isAllowedUrl(href) ? `<a href="${href}">${href}</a>` : href;
      }
      return this.detectMarkdownLinks(this.content) ? `<a href="${href}">${text}</a>` : text;
    };

    marked.setOptions({
      renderer: renderer
    });

    this.cdr.markForCheck();
  }

  private isAllowedUrl(url: string): boolean {
    const currentOrigin = window.location.origin;
    const urlOrigin = new URL(url, window.location.href).origin;

    return urlOrigin === currentOrigin || url.startsWith('/'); // Check if same origin or relative
  }

  private detectMarkdownLinks(inputString: string): boolean {
    const markdownLinkRegex = /\[([^\]]+)\]\(?([^ )]+)\)/g;
    return markdownLinkRegex.test(inputString);
  }
}
