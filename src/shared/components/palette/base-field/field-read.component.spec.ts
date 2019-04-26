import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldReadComponent } from './field-read.component';
import { PaletteService } from '../palette.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { CaseField } from '../../../domain/definition';
import { By } from '@angular/platform-browser';
import createSpyObj = jasmine.createSpyObj;
import { PaletteContext } from './palette-context.enum';

const $FIELD_READ_LABEL = By.css('ccd-field-read-label');
const $FIELD_TEST = By.css('ccd-field-read-label span.text-cls');

const CASE_FIELD: CaseField = {
  id: 'PersonFirstName',
  label: 'First name',
  field_type: {
    id: 'Text',
    type: 'Text'
  },
  value: 'Johnny',
  display_context: 'READONLY'
};
const CLASS = 'text-cls';

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
  caseField: CaseField;

  @Input()
  withLabel: boolean;
}

describe('FieldReadComponent', () => {

  let fixture: ComponentFixture<FieldReadComponent>;
  let component: FieldReadComponent;
  let de: DebugElement;

  let paletteService: any;

  let formGroup: FormGroup;
  let caseFields: CaseField[] = [CASE_FIELD];

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

    let fieldReadLabelComponent = de.query($FIELD_READ_LABEL);
    expect(fieldReadLabelComponent.children.length).toBe(1);

    let fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.caseField).toBe(CASE_FIELD);

    let fieldTestComponent = de.query($FIELD_TEST);
    expect(fieldTestComponent).toBeTruthy();

    let fieldTest = fieldTestComponent.componentInstance;
    expect(fieldTest.caseField).toBe(CASE_FIELD);
    expect(fieldTest.caseFields).toBe(caseFields);
    expect(fieldTest.formGroup).toBe(formGroup);
  });

  it('should pass context to field instance', () => {
    fixture.detectChanges();

    let fieldTest = de.query($FIELD_TEST).componentInstance;
    expect(fieldTest.context).toBe(PaletteContext.CHECK_YOUR_ANSWER);
  });

  it('should NOT display label by default', () => {
    fixture.detectChanges();

    let fieldReadLabelComponent = de.query(By.css('ccd-field-read-label'));
    let fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.withLabel).toBe(false);
  });

  it('should display label if required', () => {
    component.withLabel = true;
    fixture.detectChanges();

    let fieldReadLabelComponent = de.query(By.css('ccd-field-read-label'));
    let fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.withLabel).toBe(true);
  });
});
