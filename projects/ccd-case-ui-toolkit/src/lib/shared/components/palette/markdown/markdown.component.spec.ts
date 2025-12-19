import { ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { MarkdownComponent } from './markdown.component';
import * as marked from 'marked';

class MockRouter {
  public navigateByUrl = jasmine.createSpy('navigateByUrl');
}

class MockNgZone {
  run<T>(fn: () => T): T { return fn(); }
  runOutsideAngular<T>(fn: () => T): T { return fn(); }
}

class MockChangeDetectorRef implements ChangeDetectorRef {
  markForCheck = jasmine.createSpy('markForCheck');
  detach(): void {}
  detectChanges(): void {}
  checkNoChanges(): void {}
  reattach(): void {}
}

// Ensure marked starts from a clean state for each test run
function resetMarked() {
  marked.setOptions({});
}

describe('MarkdownComponent', () => {
  let router: Router;
  let renderer: Renderer2;
  let ngZone: MockNgZone;
  let cdr: ChangeDetectorRef;

  beforeEach(() => {
    router = new MockRouter() as unknown as Router;
    renderer = {} as Renderer2; // not used by tests here
    ngZone = new MockNgZone();
    cdr = new MockChangeDetectorRef();
    resetMarked();
  });

  it('should set custom link renderer and render labeled external links as anchors', () => {
    const component = new MarkdownComponent(router, renderer, ngZone as any, cdr);
    component.content = '[Google](https://example.com)';
    component.renderUrlToTextFeature = true;

    component.ngOnInit();

    const html = marked.parse(component.content);
    expect(html).toContain('<a href="https://example.com">Google</a>');
    expect((cdr as any).markForCheck).toHaveBeenCalled();
  });

  it('should render bare external URL text (no anchor) when text equals href and domain not allowed', () => {
    const component = new MarkdownComponent(router, renderer, ngZone as any, cdr);
    component.content = '[https://example.com](https://example.com)';
    component.renderUrlToTextFeature = true;

    component.ngOnInit();

    const html = marked.parse(component.content);
    expect(html).not.toContain('<a href="https://example.com">');
    expect(html).toContain('https://example.com');
  });

  it('should render internal relative URLs as anchors even when text equals href', () => {
    const component = new MarkdownComponent(router, renderer, ngZone as any, cdr);
    component.content = '[/internal/path](/internal/path)';
    component.renderUrlToTextFeature = true;

    component.ngOnInit();

    const html = marked.parse(component.content);
    expect(html).toContain('<a href="/internal/path">/internal/path</a>');
  });

  it('should keep default behavior when renderUrlToTextFeature is false', () => {
    const component = new MarkdownComponent(router, renderer, ngZone as any, cdr);
    component.content = '[Google](https://example.com)';
    component.renderUrlToTextFeature = false;

    component.ngOnInit();

    // marked default behavior should still produce an anchor for labeled links
    const html = marked.parse(component.content);
    expect(html).toContain('<a href="https://example.com">Google</a>');
  });
});
