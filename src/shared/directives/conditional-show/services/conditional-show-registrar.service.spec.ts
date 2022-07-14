import { async } from '@angular/core/testing';
import createSpyObj = jasmine.createSpyObj;
import { CaseField } from '../../../domain/definition';
import { aCaseField } from '../../../fixture';
import { ConditionalShowFormDirective } from '../conditional-show-form.directive';
import { ConditionalShowRegistrarService } from './conditional-show-registrar.service';

let registrarService: ConditionalShowRegistrarService;
let conditionalShowFormDirective1: any;
let conditionalShowFormDirective2: any;

describe('ConditionalShowRegistrarService', () => {

  beforeEach( async(() => {
    registrarService = new ConditionalShowRegistrarService();
    conditionalShowFormDirective1 = createSpyObj<ConditionalShowFormDirective>('conditionalShowFormDirective1', ['ngAfterViewInit']);
    conditionalShowFormDirective2 = createSpyObj<ConditionalShowFormDirective>('conditionalShowFormDirective2', ['ngAfterViewInit']);
    const caseField1: CaseField = aCaseField('id1', 'label', 'Text', 'OPTIONAL', null);
    const caseField2: CaseField = aCaseField('id2', 'label', 'Text', 'OPTIONAL', null);
    conditionalShowFormDirective1.caseField = caseField1;
    conditionalShowFormDirective2.caseField = caseField2;
  }));

  it('should register', () => {
    registrarService.register(conditionalShowFormDirective1);
    registrarService.register(conditionalShowFormDirective2);
    expect(registrarService.registeredDirectives.length).toEqual(2);
  });

  it('should reset', () => {
    registrarService.register(conditionalShowFormDirective1);
    registrarService.register(conditionalShowFormDirective2);
    registrarService.reset();
    expect(registrarService.registeredDirectives.length).toEqual(0);
  });
});
