import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WriteQueryManagementFieldComponent } from './write-query-management-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Pipe({ name: 'ccdCaseReference' })
class CcdCaseReferenceMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('WriteQueryManagementFieldComponent', () => {
  let component: WriteQueryManagementFieldComponent;
  let fixture: ComponentFixture<WriteQueryManagementFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule],
      declarations: [
        WriteQueryManagementFieldComponent,
        CcdCaseReferenceMockPipe,
        RpxTranslateMockPipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteQueryManagementFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialise the component and set queryItem', () => {
      component.ngOnInit();
      expect(component.queryItem).toBeDefined();
    });
  });

  describe('submitForm', () => {
    it('should set submitted to true', () => {
      component.submitForm();
      expect(component.submitted).toBe(true);
    });

    it('should set errorMessages to empty array', () => {
      component.errorMessages = [{ controlName: 'response', message: 'Some error' }];
      component.responseFormGroup.controls.response.setValue('Some response');
      component.submitForm();
      expect(component.errorMessages.length).toBe(0);
    });

    it('should set the errorMessages (i.e. one for response) if form is invalid', () => {
      component.responseFormGroup.controls.response.setValue('');
      component.submitForm();
      expect(component.errorMessages.length).toEqual(1);
      expect(component.errorMessages[0].controlName).toEqual('response');
      expect(component.errorMessages[0].message).toEqual('Add a response before continue');
    });
  });
});

