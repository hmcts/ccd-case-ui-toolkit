import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of } from 'rxjs';
import { ConditionalShowRegistrarService } from '../../../directives';
import { FieldType, Profile } from '../../../domain';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { createCaseEventTrigger } from '../../../fixture/shared.test.fixture';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FieldsPurger, FieldsUtils, SessionStorageService, WindowService } from '../../../services';
import { FormErrorService, FormValueService } from '../../../services/form';
import { PaletteUtilsModule } from '../../palette';
import { Wizard, WizardPage, WizardPageField } from '../domain';
import { WizardFactoryService } from '../services/wizard-factory.service';
import { CaseEditGenericErrorsComponent } from './case-edit-generic-errors.component';
import createSpyObj = jasmine.createSpyObj;

xdescribe('CaseEditGenericErrorsComponent', () => {

  let fixture: ComponentFixture<CaseEditGenericErrorsComponent>;
  let component: CaseEditGenericErrorsComponent;
  let de: DebugElement;

  const EventTriggerHeaderComponent: any = MockComponent({
    selector: 'ccd-event-trigger-header',
    inputs: ['eventTrigger']
  });

  const FieldRead: any = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField']
  });

  const FieldWrite: any = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'formGroup', 'idPrefix', 'isExpanded', 'parent']
  });

  const RouterLinkComponent: any = MockComponent({
    selector: 'a',
    inputs: ['routerLink']
  });

  let cancelHandler: any;
  let submitHandler: any;
  let formErrorService: jasmine.SpyObj<FormErrorService>;
  let formValueService: jasmine.SpyObj<FormValueService>;
  let callbackErrorsSubject: any;
  let wizard: jasmine.SpyObj<Wizard>;
  let routerStub: any;
  const fieldsUtils = new FieldsUtils();
  const fieldsPurger = new FieldsPurger(fieldsUtils);
  const registrarService = new ConditionalShowRegistrarService();
  let route: any;
  let mockSessionStorageService: jasmine.SpyObj<SessionStorageService>;

  describe('profile available in route', () => {
    routerStub = {
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
      routerState: {}
    };

    const USER = {
      idam: {
        id: 'userId',
        email: 'string',
        forename: 'string',
        surname: 'string',
        roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
      }
    };
    const FUNC = () => false;
    const PROFILE: Profile = {
      channels: [],
      jurisdictions: [],
      default: {
        workbasket: {
          case_type_id: '',
          jurisdiction_id: '',
          state_id: ''
        }
      },
      user: USER,
      isSolicitor: FUNC,
      isCourtAdmin: FUNC
    };

    beforeEach(waitForAsync(() => {
      cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
      cancelHandler.applyFilters.and.returnValue();

      submitHandler = createSpyObj('submitHandler', ['applyFilters']);
      submitHandler.applyFilters.and.returnValue();

      callbackErrorsSubject = createSpyObj('callbackErrorsSubject', ['next']);
      wizard = createSpyObj<Wizard>('wizard', ['getPage', 'firstPage', 'nextPage', 'previousPage', 'hasPreviousPage']);
      wizard.pages = [];
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);

      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);
      mockSessionStorageService = createSpyObj<SessionStorageService>('SessionStorageService', ['getItem', 'removeItem', 'setItem']);

      route = {
        queryParams: of({Origin: 'viewDraft'}),
        snapshot: {
          data: {},
          params: {},
          pathFromRoot: [
            {},
            {
              data: {
                profile: PROFILE
              }
            }
          ]
        },
        params: of({})
      };

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            PaletteUtilsModule,
            RouterTestingModule
          ],
          declarations: [
            CaseEditGenericErrorsComponent,

            // Mock
            EventTriggerHeaderComponent,
            RouterLinkComponent,
            FieldsFilterPipe,
            FieldRead,
            FieldWrite
          ],
          providers: [
            WizardFactoryService,
            {provide: FormErrorService, useValue: formErrorService},
            {provide: FormValueService, useValue: formValueService},
            {provide: FieldsUtils, useValue: fieldsUtils},
            {provide: FieldsPurger, useValue: fieldsPurger},
            {provide: ConditionalShowRegistrarService, useValue: registrarService},
            {provide: Router, useValue: routerStub},
            {provide: ActivatedRoute, useValue: route},
            SessionStorageService,
            WindowService
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseEditGenericErrorsComponent);
      component = fixture.componentInstance;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    beforeEach(() => {
    });
  });
});
