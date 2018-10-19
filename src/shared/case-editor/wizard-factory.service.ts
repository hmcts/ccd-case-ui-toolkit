import { CaseEventTrigger } from '../../shared/domain/case-view/case-event-trigger.model';
import { Wizard } from '../domain';

export class WizardFactoryService {
  create(eventTrigger: CaseEventTrigger): Wizard {
    return new Wizard(eventTrigger.wizard_pages);
  }
}
