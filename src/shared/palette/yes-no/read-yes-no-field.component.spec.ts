import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadYesNoFieldComponent } from './read-yes-no-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../domain/definition/field-type.model';
import createSpyObj = jasmine.createSpyObj;
import { YesNoService } from './yes-no.service';
import { CaseField } from '../../domain/definition/case-field.model';

describe('ReadYesNoFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'YesOrNo',
    type: 'YesOrNo'
  };
  const VALUE = true;
  const CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  };
  const FORMATTED_VALUE = 'Yes';

  let fixture: ComponentFixture<ReadYesNoFieldComponent>;
  let component: ReadYesNoFieldComponent;
  let de: DebugElement;

  let yesNoService: any;

  beforeEach(async(() => {
    yesNoService = createSpyObj<YesNoService>('yesNoService', ['format']);
    yesNoService.format.and.returnValue(FORMATTED_VALUE);

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadYesNoFieldComponent
        ],
        providers: [
          { provide: YesNoService, useValue: yesNoService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadYesNoFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render output of YesNoService::format method', () => {
    expect(yesNoService.format).toHaveBeenCalledWith(VALUE);
    expect(yesNoService.format).toHaveBeenCalledTimes(1);
    expect(de.nativeElement.textContent).toEqual(FORMATTED_VALUE);
  });
});
