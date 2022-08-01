import { Predicate } from '../../../domain/predicate.model';
import { OrderService } from '../../../services/order/order.service';
import { WizardPage } from './wizard-page.model';

export class Wizard {
  public pages: WizardPage[];

  private readonly orderService = new OrderService();

  constructor(wizardPages: WizardPage[]) {
    this.pages = this.orderService.sort(wizardPages);
  }

  public firstPage(canShow: Predicate<WizardPage>): WizardPage {
    return this.pages.find(page => canShow(page));
  }

  public getPage(pageId: string, canShow: Predicate<WizardPage>): WizardPage {
    const foundPage: WizardPage = this.findPage(pageId);
    if (!foundPage) {
      throw new Error(`No page for ID: ${pageId}`);
    }
    return canShow(foundPage) ? foundPage : undefined;
  }

  public findWizardPage(caseFieldId: string): WizardPage {
    return this.pages.find(wizardPage => wizardPage.case_fields &&
        wizardPage.case_fields?.filter(caseField => caseField.id === caseFieldId).length > 0);
  }

  public nextPage(pageId: string, canShow: Predicate<WizardPage>): WizardPage {
    const currentIndex = this.findExistingIndex(pageId);

    return this.pages
      .slice(currentIndex + 1)
      .find(page => canShow(page));
  }

  public previousPage(pageId: string, canShow: Predicate<WizardPage>): WizardPage {
    const currentIndex = this.findExistingIndex(pageId);

    return this.pages
      .slice(0, currentIndex)
      .reverse()
      .find(page => canShow(page));
  }

  public hasPage(pageId: string): boolean {
    return !!this.findPage(pageId);
  }

  public hasPreviousPage(pageId: string, canShow: Predicate<WizardPage>): boolean {
    return !!this.previousPage(pageId, canShow);
  }

  public reverse(): WizardPage[] {
    return this.pages.slice().reverse();
  }

  private findPage(pageId: string): WizardPage {
    return this.pages.find(page => pageId === page.id);
  }

  private findExistingIndex(pageId: string): number {
    const index = this.pages.findIndex(page => pageId === page.id);

    if (-1 === index) {
      throw new Error(`No page for ID: ${pageId}`);
    }

    return index;
  }
}
