import { MockComponent } from 'ng2-mock-component';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaletteUtilsModule } from '../utils/utils.module';
import { PaletteContext } from '../base-field/palette-context.enum';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { ReadComplexFieldComponent } from './read-complex-field.component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';

describe('ReadComplexFieldComponent', () => {

  const $COMPLEX_AS_TABLE = By.css('ccd-read-complex-field-table');
  const $COMPLEX_AS_COLLECTION_TABLE = By.css('ccd-read-complex-field-collection-table');
  const $COMPLEX_AS_RAW = By.css('ccd-read-complex-field-raw');

  const caseField: CaseField = new CaseField();

  let ReadComplexFieldRawComponent;
  let ReadComplexFieldTableComponent;
  let ReadComplexFieldNewTableComponent;

  let fixture: ComponentFixture<ReadComplexFieldComponent>;
  let component: ReadComplexFieldComponent;
  let de: DebugElement;

  const expectTable = () => {
    expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
    expect(de.query($COMPLEX_AS_TABLE)).toBeTruthy();
  };

  const expectRaw = () => {
    expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
    expect(de.query($COMPLEX_AS_RAW)).toBeTruthy();
  };

  const expectCollectionTable = () => {
    expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
    expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
    expect(de.query($COMPLEX_AS_COLLECTION_TABLE)).toBeTruthy();
  };

  const expectInputs = (componentInstance, expectedContext) => {
    expect(componentInstance.caseField).toBe(caseField);
    expect(componentInstance.context).toBe(expectedContext);
  };

  beforeEach(async(() => {

    ReadComplexFieldRawComponent = MockComponent({
      selector: 'ccd-read-complex-field-raw',
      inputs: ['caseField', 'context']
    });

    ReadComplexFieldTableComponent = MockComponent({
      selector: 'ccd-read-complex-field-table',
      inputs: ['caseField', 'context']
    });

    ReadComplexFieldNewTableComponent = MockComponent({
      selector: 'ccd-read-complex-field-collection-table',
      inputs: ['caseField', 'context']
    });

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          ConditionalShowModule
        ],
        declarations: [
          ReadComplexFieldComponent,
          FieldsFilterPipe,

          // Mock
          ReadComplexFieldRawComponent,
          ReadComplexFieldTableComponent,
          ReadComplexFieldNewTableComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadComplexFieldComponent);
    component = fixture.componentInstance;
    component.caseField = caseField;
    component.context = null;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render complex field as table by default', () => {
    expectTable();
    expectInputs(de.query($COMPLEX_AS_TABLE).componentInstance, null);
  });

  describe('when context is DEFAULT', () => {
    beforeEach(() => {
      component.caseField = caseField;
      component.context = PaletteContext.DEFAULT;
      fixture.detectChanges();
    });

    it('should render complex field as table by default', () => {
      expectTable();
      expectInputs(de.query($COMPLEX_AS_TABLE).componentInstance, PaletteContext.DEFAULT);
    });
  });

  describe('when context is CHECK_YOUR_ANSWER', () => {
    beforeEach(() => {
      component.context = PaletteContext.CHECK_YOUR_ANSWER;
      fixture.detectChanges();
    });

    it('should render complex field as table by default', () => {
      expectRaw();
      expectInputs(de.query($COMPLEX_AS_RAW).componentInstance, PaletteContext.CHECK_YOUR_ANSWER);
    });
  });

});

describe('when context is TABLE_VIEW', () => {
  const $COMPLEX_AS_TABLE = By.css('ccd-read-complex-field-table');
  const $COMPLEX_AS_COLLECTION_TABLE = By.css('ccd-read-complex-field-collection-table');
  const $COMPLEX_AS_RAW = By.css('ccd-read-complex-field-raw');

  let ReadComplexFieldRawComponent;
  let ReadComplexFieldTableComponent;
  let ReadComplexFieldNewTableComponent;

  let fixture: ComponentFixture<ReadComplexFieldComponent>;
  let component: ReadComplexFieldComponent;
  let de: DebugElement;
  const caseField_dsp: CaseField = new CaseField();

  const expectCollectionTable = () => {
    expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
    expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
    expect(de.query($COMPLEX_AS_COLLECTION_TABLE)).toBeTruthy();
  };
  const expectInputs = (componentInstance, expectedContext) => {
    expect(componentInstance.caseField).toBe(caseField_dsp);
    expect(componentInstance.context).toBe(expectedContext);
  };

  caseField_dsp.display_context_parameter = '#TABLE(AddressLine1, AddressLine2)';

  beforeEach(async(() => {

    ReadComplexFieldRawComponent = MockComponent({
      selector: 'ccd-read-complex-field-raw',
      inputs: ['caseField', 'context']
    });

    ReadComplexFieldTableComponent = MockComponent({
      selector: 'ccd-read-complex-field-table',
      inputs: ['caseField', 'context']
    });

    ReadComplexFieldNewTableComponent = MockComponent({
      selector: 'ccd-read-complex-field-collection-table',
      inputs: ['caseField', 'context']
    });

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          ConditionalShowModule
        ],
        declarations: [
          ReadComplexFieldComponent,
          FieldsFilterPipe,

          // Mock
          ReadComplexFieldRawComponent,
          ReadComplexFieldTableComponent,
          ReadComplexFieldNewTableComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadComplexFieldComponent);
    component = fixture.componentInstance;
    component.caseField = caseField_dsp;
    component.context = null;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render complex field as table by default', () => {
    expectCollectionTable();
    expectInputs(de.query($COMPLEX_AS_COLLECTION_TABLE).componentInstance, PaletteContext.TABLE_VIEW);
  });
});
