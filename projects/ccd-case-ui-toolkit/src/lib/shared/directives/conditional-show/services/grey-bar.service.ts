import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';

/** Keeps track of initially hidden fields that toggle to show on the page (parent page).
 *  Used to decide whether to redisplay the grey bar when returning to the page during
 *  navigation between pages.
 */
@Injectable()
export class GreyBarService {

  private fieldsToggledToShow: string[] = [];
  private readonly renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
      this.renderer = rendererFactory.createRenderer(null, null);
  }

  public showGreyBar(field: CaseField, el: ElementRef) {
    if (!field.isCollection()) {
      this.addGreyBar(el);
    }
  }

  public removeGreyBar(el: ElementRef) {
    const divSelector = el.nativeElement.querySelector('div');
    if (divSelector) {
      this.renderer.removeClass(divSelector, 'show-condition-grey-bar');
    }
  }

  public addToggledToShow(fieldId: string) {
    this.fieldsToggledToShow.push(fieldId);
  }

  public removeToggledToShow(fieldId: string) {
    this.fieldsToggledToShow = this.fieldsToggledToShow.filter(id => id !== fieldId);
  }

  public wasToggledToShow(fieldId: string): boolean {
    return this.fieldsToggledToShow.find(id => id === fieldId) !== undefined;
  }

  public reset() {
    this.fieldsToggledToShow = [];
  }

  private addGreyBar(el: ElementRef) {
    const divSelector = el.nativeElement.querySelector('div');
    if (divSelector) {
      this.renderer.addClass(divSelector, 'show-condition-grey-bar');
    }
  }
}
