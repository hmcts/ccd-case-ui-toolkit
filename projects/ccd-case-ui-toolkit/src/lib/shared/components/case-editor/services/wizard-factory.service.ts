import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { Wizard } from '../domain/wizard.model';

export class WizardFactoryService {
  public create(eventTrigger: CaseEventTrigger): Wizard {
    return new Wizard(eventTrigger.wizard_pages);
  }
}
