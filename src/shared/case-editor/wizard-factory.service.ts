import { Wizard } from './wizard.model';
import { CaseEventTrigger } from '../../shared/domain/case-view/case-event-trigger.model';

export class WizardFactoryService {
  create(eventTrigger: CaseEventTrigger): Wizard {
    return new Wizard(eventTrigger.wizard_pages);
  }
}
