import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryWriteRaiseQueryComponent } from './query-write-raise-query.component';
import { ActivatedRoute } from '@angular/router';
import { QueryManagementService } from '../../../services';
import { of } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { QueryCreateContext } from '../../../models';

@Pipe({ name: 'rpxTranslate' })
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}

describe('QueryWriteRaiseQueryComponent', () => {
  let component: QueryWriteRaiseQueryComponent;
  let fixture: ComponentFixture<QueryWriteRaiseQueryComponent>;
  let queryManagementServiceSpy: jasmine.SpyObj<QueryManagementService>;
  let routeStub;

  beforeEach(async () => {
    routeStub = {
      snapshot: {
        params: {
          dataid: 'mock-message-id'
        }
      }
    };

    queryManagementServiceSpy = jasmine.createSpyObj('QueryManagementService', [
      'setCaseQueriesCollectionData',
      'generateCaseQueriesCollectionData'
    ]);

    await TestBed.configureTestingModule({
      declarations: [QueryWriteRaiseQueryComponent, MockRpxTranslatePipe],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: QueryManagementService, useValue: queryManagementServiceSpy }
      ]
    }).compileComponents();
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

    component.caseDetails = {} as any;
    component.queryCreateContext = QueryCreateContext.NEW_QUERY;
    component.eventData = {} as any;
    component.queryItem = {} as any;
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

  it('should correctly assign messgaeId from route params on ngOnChanges', () => {
    component.triggerSubmission = false;
    queryManagementServiceSpy.setCaseQueriesCollectionData.and.returnValue(false);

    component.ngOnChanges();

    expect(component.messgaeId).toBe('mock-message-id');
  });
});
