import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pipe, PipeTransform } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryWriteRaiseQueryComponent } from './query-write-raise-query.component';

@Pipe({
    name: 'rpxTranslate',
    standalone: false
})
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryWriteRaiseQueryComponent', () => {
  let component: QueryWriteRaiseQueryComponent;
  let fixture: ComponentFixture<QueryWriteRaiseQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryWriteRaiseQueryComponent, MockRpxTranslatePipe]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRaiseQueryComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      subject: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      body: new FormControl('', Validators.required),
      isHearingRelated: new FormControl(null, Validators.required),
      attachments: new FormControl([])
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should accept subject with 200 characters', () => {
    const validSubject = 'a'.repeat(200);
    component.formGroup.get('subject').setValue(validSubject);
    expect(component.formGroup.get('subject').valid).toBeTruthy();
  });

  it('should mark subject as invalid if more than 200 characters', () => {
    const invalidSubject = 'a'.repeat(201);
    component.formGroup.get('subject').setValue(invalidSubject);
    expect(component.formGroup.get('subject').valid).toBeFalsy();
    expect(component.formGroup.get('subject').hasError('maxlength')).toBeTruthy();
  });

  it('should truncate subject value to 200 characters on input', () => {
    const tooLong = 'a'.repeat(250);
    component.formGroup.get('subject').setValue(tooLong);
    component.onSubjectInput();
    expect(component.formGroup.get('subject').value.length).toBe(200);
  });

  it('should return required error message when subject is empty', () => {
    component.formGroup.get('subject').setValue('');
    component.formGroup.get('subject').markAsTouched();
    const message = component.getSubjectErrorMessage();
    expect(message).toBe(component.raiseQueryErrorMessage.QUERY_SUBJECT);
  });

  it('should return max length error message when subject is too long', () => {
    component.formGroup.get('subject').setValue('a'.repeat(201));
    component.formGroup.get('subject').markAsTouched();
    const message = component.getSubjectErrorMessage();
    expect(message).toBe(component.raiseQueryErrorMessage.QUERY_SUBJECT_MAX_LENGTH);
  });
});
