import { ChangeDetectorRef, NgZone, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import * as marked from 'marked';
import { MarkdownComponent } from './markdown.component';

describe('MarkdownComponent', () => {
  let component: MarkdownComponent;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    const router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    cdr = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['markForCheck']);
    const ngZone = new NgZone({ enableLongStackTrace: false });

    component = new MarkdownComponent(router, {} as Renderer2, ngZone, cdr);
  });

  const renderMarkdown = (markdownText: string): string => {
    (component as any).renderUrlToText();
    return marked.parse(markdownText) as string;
  };

  it('should render href as link when text matches href and url is allowed', () => {
    const sameOriginLink = `${window.location.origin}/test-path`;
    component.content = `[${sameOriginLink}](${sameOriginLink})`;

    const result = renderMarkdown(component.content);

    expect(result).toContain(`<a href="${sameOriginLink}">${sameOriginLink}</a>`);
  });

  it('should render href as plain text when text matches href and url is not allowed', () => {
    const blockedLink = 'https://blocked.example.com';
    component.content = `[${blockedLink}](${blockedLink})`;

    const result = renderMarkdown(component.content);

    expect(result).toContain(`<p>${blockedLink}</p>`);
  });

  it('should render markdown link text as anchor when markdown links are detected in content', () => {
    component.content = '[Docs](https://example.com)';

    const result = renderMarkdown(component.content);

    expect(result).toContain('<a href="https://example.com">Docs</a>');
  });

  it('should render markdown link text without anchor when markdown links are not detected in content', () => {
    component.content = 'Docs';

    const result = renderMarkdown('[Docs](https://example.com)');

    expect(result).toContain('<p>Docs</p>');
  });
});
