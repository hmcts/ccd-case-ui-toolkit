import createSpyObj = jasmine.createSpyObj;
import { ShowCondition } from '../../directives/conditional-show/domain';
import { WizardPage } from './domain';

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
