import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import createSpyObj = jasmine.createSpyObj;
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { ReadYesNoFieldComponent } from './read-yes-no-field.component';
import { YesNoService } from './yes-no.service';

describe('ReadYesNoFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'YesOrNo',
    type: 'YesOrNo'
  };
  const VALUE = true;
  const FIELD_ID = 'ReadOnlyFieldId';

  describe('Non-persistable readonly yes/no field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;
    const FORMATTED_VALUE = 'Yes';

    let fixture: ComponentFixture<ReadYesNoFieldComponent>;
    let component: ReadYesNoFieldComponent;
    let de: DebugElement;

    let yesNoService: jasmine.SpyObj<YesNoService>;

    beforeEach(waitForAsync(() => {
      yesNoService = createSpyObj<YesNoService>('yesNoService', ['format']);
      yesNoService.format.and.returnValue(FORMATTED_VALUE);

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadYesNoFieldComponent,
            MockRpxTranslatePipe
          ],
          providers: [
            {provide: YesNoService, useValue: yesNoService}
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadYesNoFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should set formattedValue based on YesNoService::format method', () => {
      expect(yesNoService.format).toHaveBeenCalledWith(VALUE);
      expect(yesNoService.format).toHaveBeenCalledTimes(1);
      expect(component.formattedValue).toEqual(yesNoService.format(VALUE));
    });
  });

  describe('Persistable readonly yes/no field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadYesNoFieldComponent>;
    let component: ReadYesNoFieldComponent;
    let de: DebugElement;
    let yesNoService: any;

    beforeEach(waitForAsync(() => {
      yesNoService = createSpyObj<YesNoService>('yesNoService', ['format']);

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadYesNoFieldComponent,
            MockRpxTranslatePipe
          ],
          providers: [
            {provide: YesNoService, useValue: yesNoService}
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadYesNoFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
      expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
    });
  });

});
