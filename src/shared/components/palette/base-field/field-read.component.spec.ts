import { Component, DebugElement, Input } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { plainToClassFromExist } from 'class-transformer';
import { CaseField } from '../../../domain/definition';
import { PaletteService } from '../palette.service';
import { FieldReadComponent } from './field-read.component';
import { PaletteContext } from './palette-context.enum';
import createSpyObj = jasmine.createSpyObj;

const $FIELD_READ_LABEL = By.css('ccd-field-read-label');
const $FIELD_TEST = By.css('ccd-field-read-label span.text-cls');

const CASE_FIELD: CaseField = plainToClassFromExist(new CaseField(), {
  _list_items: [],
  id: 'PersonFirstName',
  label: 'First name',
  field_type: {
    id: 'Text',
    type: 'Text'
  },
  _value: 'Johnny',
  display_context: 'READONLY'
});

const CLASS = 'text-cls';

const FORM_GROUP: FormGroup = new FormGroup({});

@Component({
  template: `
    <span class="${CLASS}"></span>
  `
})
class FieldTestComponent {}

@Component({
  selector: 'ccd-field-read-label',
  template: `
    <ng-content></ng-content>
  `
})
class FieldReadLabelComponent {
  @Input()
  public caseField: CaseField;

  @Input()
  public withLabel: boolean;

  @Input()
  public topLevelFormGroup: FormGroup;

  @Input()
  public markdownUseHrefAsRouterLink?: boolean;
}

describe('FieldReadComponent', () => {

  let fixture: ComponentFixture<FieldReadComponent>;
  let component: FieldReadComponent;
  let de: DebugElement;

  let paletteService: any;

  const formGroup: FormGroup = new FormGroup({});
  const caseFields: CaseField[] = [CASE_FIELD];

  beforeEach(async(() => {
    paletteService = createSpyObj<PaletteService>('paletteService', [
      'getFieldComponentClass'
    ]);
    paletteService.getFieldComponentClass.and.returnValue(FieldTestComponent);

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          FormsModule
        ],
        declarations: [
          FieldReadComponent,

          // Mock
          FieldTestComponent,
          FieldReadLabelComponent,
        ],
        providers: [
          { provide: PaletteService, useValue: paletteService }
        ]
      })
      .compileComponents();

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [FieldTestComponent]
      }
    });

    fixture = TestBed.createComponent(FieldReadComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.caseFields = caseFields;
    component.formGroup = formGroup;
    component.context = PaletteContext.CHECK_YOUR_ANSWER;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should get field read class from PaletteService', () => {
    expect(paletteService.getFieldComponentClass).toHaveBeenCalledWith(CASE_FIELD, false);
  });

  it('should inject component instance as child', () => {
    fixture.detectChanges();

    const fieldReadLabelComponent = de.query($FIELD_READ_LABEL);
    expect(fieldReadLabelComponent.children.length).toBe(1);

    const fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.caseField).toBe(CASE_FIELD);

    const fieldTestComponent = de.query($FIELD_TEST);
    expect(fieldTestComponent).toBeTruthy();

    const fieldTest = fieldTestComponent.componentInstance;
    expect(fieldTest.caseField).toEqual(CASE_FIELD);
    expect(fieldTest.caseFields).toBe(caseFields);
    expect(fieldTest.formGroup).toBe(formGroup);
  });

  it('should pass context to field instance', () => {
    fixture.detectChanges();

    const fieldTest = de.query($FIELD_TEST).componentInstance;
    expect(fieldTest.context).toBe(PaletteContext.CHECK_YOUR_ANSWER);
  });

  it('should NOT display label by default', () => {
    fixture.detectChanges();

    const fieldReadLabelComponent = de.query(By.css('ccd-field-read-label'));
    const fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.withLabel).toBe(false);
  });

  it('should display label if required', () => {
    component.withLabel = true;
    fixture.detectChanges();

    const fieldReadLabelComponent = de.query(By.css('ccd-field-read-label'));
    const fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.withLabel).toBe(true);
  });
});
