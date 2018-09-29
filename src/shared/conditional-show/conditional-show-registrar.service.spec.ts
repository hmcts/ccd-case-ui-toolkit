import { ConditionalShowDirective } from './conditional-show.directive';
import { ConditionalShowRegistrarService } from './conditional-show-registrar.service';
import { async } from '@angular/core/testing';
import createSpyObj = jasmine.createSpyObj;
import { CaseField } from '../domain/definition/case-field.model';
import { aCaseField } from '../case-editor/case-edit.spec';

let registrarService: ConditionalShowRegistrarService;
let conditionalShowDirective1: any;
let conditionalShowDirective2: any;

describe('ConditionalShowRegistrarService', () => {

  beforeEach( async(() => {
    registrarService = new ConditionalShowRegistrarService();
    conditionalShowDirective1 = createSpyObj<ConditionalShowDirective>('conditionalShowDirective1', ['refreshVisibility']);
    conditionalShowDirective2 = createSpyObj<ConditionalShowDirective>('conditionalShowDirective2', ['refreshVisibility']);
    let caseField1: CaseField = aCaseField('id1', 'label', 'Text', 'OPTIONAL', null);
    let caseField2: CaseField = aCaseField('id2', 'label', 'Text', 'OPTIONAL', null);
    conditionalShowDirective1.caseField = caseField1;
    conditionalShowDirective2.caseField = caseField2;
  }));

  it('should register', () => {
    registrarService.register(conditionalShowDirective1);
    registrarService.register(conditionalShowDirective2);
    expect(registrarService.registeredDirectives.length).toEqual(2);
  });

  it('should reset', () => {
    registrarService.register(conditionalShowDirective1);
    registrarService.register(conditionalShowDirective2);
    registrarService.reset();
    expect(registrarService.registeredDirectives.length).toEqual(0);
  });

  it('should refresh visibility of registered directives', () => {
    registrarService.register(conditionalShowDirective1);
    registrarService.register(conditionalShowDirective2);
    registrarService.refresh();
    expect(conditionalShowDirective1.refreshVisibility).toHaveBeenCalled();
    expect(conditionalShowDirective2.refreshVisibility).toHaveBeenCalled();
  });

});
