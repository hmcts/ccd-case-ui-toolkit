import { MockComponent } from 'ng2-mock-component';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaletteUtilsModule } from '../utils/utils.module';
import { PaletteContext } from '../base-field/palette-context.enum';
import { ConditionalShowModule } from '../../conditional-show/conditional-show.module';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { ReadComplexFieldComponent } from './read-complex-field.component';
import { CaseField } from '../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';

describe('ReadComplexFieldComponent', () => {

  const $COMPLEX_AS_TABLE = By.css('ccd-read-complex-field-table');
  const $COMPLEX_AS_RAW = By.css('ccd-read-complex-field-raw');

  const caseField: CaseField = new CaseField();

  let ReadComplexFieldRawComponent;
  let ReadComplexFieldTableComponent;

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
