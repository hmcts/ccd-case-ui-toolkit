import { ElementRef, Renderer2, Injectable, RendererFactory2 } from '@angular/core';
import { CaseField } from '../../../domain';

@Injectable()
export class GreyBarService {

  private fieldsShownOnParentPage: string[] = [];
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
      this.renderer = rendererFactory.createRenderer(null, null);
  }

  public fieldHasGreyBar(el: ElementRef) {
    return el.nativeElement.classList.contains('show-condition-grey-bar')
  }

  public showGreyBar(field: CaseField, el: ElementRef) {
    if (field.field_type.type !== 'Collection') {
      this.addGreyBar(el);
    }
  }

  private addGreyBar(el: ElementRef) {
    let divSelector = el.nativeElement.querySelector('div')
    if (divSelector) {
      this.renderer.addClass(divSelector, 'show-condition-grey-bar');
    }
  }

  public removeGreyBar(el: ElementRef) {
    let divSelector = el.nativeElement.querySelector('div')
    if (divSelector) {
      this.renderer.removeClass(divSelector, 'show-condition-grey-bar');
    }
  }

  addShownFromParentPage(fieldId: string) {
    this.fieldsShownOnParentPage.push(fieldId);
  }

  removeShownFromParentPage(fieldId: string) {
    this.fieldsShownOnParentPage = this.fieldsShownOnParentPage.filter(id => id !== fieldId);
  }

  wasShownFromParentPage(fieldId: string): boolean {
    return this.fieldsShownOnParentPage.find(id => id === fieldId) !== undefined;
  }

}
