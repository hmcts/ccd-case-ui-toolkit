import createSpyObj = jasmine.createSpyObj;
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { WizardPage } from './domain/wizard-page.model';

export let aWizardPage = (pageId: string, label: string, order: number): WizardPage => {
    const wp = new WizardPage();
    wp.id = pageId;
    wp.label = label;
    wp.order = order;
    const parsedShowCondition = createSpyObj<ShowCondition>('parsedShowCondition', ['match']);
    parsedShowCondition.match.and.returnValue(true);
    wp.parsedShowCondition = parsedShowCondition;
    return wp;
  };
