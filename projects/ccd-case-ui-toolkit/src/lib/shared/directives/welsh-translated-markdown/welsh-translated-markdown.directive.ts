import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Subscription } from 'rxjs';

/**
 * @directive TranslatedMarkdownDirective
 *
 * @description
 * Structural directive that emits language-appropriate markdown content based on the user's UI language.
 * It is designed for service-supplied content that optionally includes a Welsh (`markdown_cy`) version.
 *
 * The directive:
 * - Emits `markdown_cy` if the UI language is Welsh and the field exists
 * - Emits `markdown` otherwise (no translation is applied within the directive)
 * - Leaves it up to the consuming template to apply fallback translation (e.g. via `rpxTranslate`)
 *
 * This allows cleaner templates and better separation of content choice vs. translation logic.
 *
 * @usage
 * ```html
 * <div *ngFor="let qq of qualifyingQuestions">
 *   <ng-container *translatedMarkdown="qq; let content">
 *     <markdown [data]="qq ? content : (qq.markdown | rpxTranslate)"></markdown>
 *   </ng-container>
 * </div>
 * ```
 *
 * @input dataItem - An object expected to contain:
 * - `markdown` (string): the default English content
 * - `markdown_cy` (string | optional): the Welsh version of the content
 * - Any additional metadata used in context
 *
 * @example
 * // --- LaunchDarkly JSON format ---
 * {
 *   "UNSPEC_CLAIM": [
 *     {
 *       "name": "Raise a query",
 *       "url": "http://...",
 *       "markdown": "### Raise a query\nUse this to raise a new query.",
 *       "markdown_cy": "### Codwch ymholiad\nDefnyddiwch hwn i godi ymholiad newydd."
 *     }
 *   ]
 * }
 *
 * // --- Input object in component after processing ---
 * const dataItem = {
 *   name: 'Raise a query',
 *   url: 'http://...',
 *   markdown: '### Raise a query\nUse this to raise a new query.',
 *   markdown_cy: '### Codwch ymholiad\nDefnyddiwch hwn i godi ymholiad newydd.'
 * };
 *
 * // --- Template usage ---
 * <ng-container *translatedMarkdown="dataItem; let content">
 *   <markdown [data]="dataItem ? content : (dataItem.markdown | rpxTranslate)"></markdown>
 * </ng-container>
 */

/**
 * @directive TranslatedMarkdownDirective
 *
 * Renders Welsh markdown (`markdown_cy`) if the UI language is Welsh,
 * otherwise uses English (`markdown`). Reactively updates when the language changes.
 */
@Directive({
  selector: '[translatedMarkdown]',
  standalone: false
})
export class TranslatedMarkdownDirective implements OnInit, OnDestroy {
  @Input('translatedMarkdown') dataItem: any;

  private subscription: Subscription;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private translationService: RpxTranslationService
  ) {}

  ngOnInit(): void {
    this.subscription = this.translationService.language$.subscribe((lang) => {
      const isWelsh = lang === 'cy';
      const content =
        isWelsh && this.dataItem?.markdown_cy
          ? this.dataItem.markdown_cy
          : this.dataItem?.markdown ?? '';

      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef, {
        $implicit: content,
        translatedMarkdown: this.dataItem
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
