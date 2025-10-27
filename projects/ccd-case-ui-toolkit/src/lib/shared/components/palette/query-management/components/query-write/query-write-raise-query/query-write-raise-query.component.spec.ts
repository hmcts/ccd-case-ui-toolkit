import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryWriteRaiseQueryComponent } from './query-write-raise-query.component';
import { ActivatedRoute } from '@angular/router';
import { QueryManagementService } from '../../../services';
import { Pipe, PipeTransform } from '@angular/core';
import { QueryCreateContext } from '../../../models';
import { MockComponent } from 'ng2-mock-component';

@Pipe({
  name: 'rpxTranslate',
  standalone: false
})
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}
const queryCaseDetailsHeaderComponentMock: any = MockComponent({
  selector: 'ccd-query-case-details-header',
  inputs: ['caseDetails']
});

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
      imports: [queryCaseDetailsHeaderComponentMock],
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

  it('should call setCaseQueriesCollectionData and generateCaseQueriesCollectionData on ngOnChanges when triggerSubmission is true', () => {
    const mockGeneratedData = { fieldId: { caseMessages: [] } };
    queryManagementServiceSpy.setCaseQueriesCollectionData.and.returnValue(true);
    queryManagementServiceSpy.generateCaseQueriesCollectionData.and.returnValue(mockGeneratedData);

    spyOn(component.queryDataCreated, 'emit');

    component.triggerSubmission = true;
    component.ngOnChanges();

    expect(queryManagementServiceSpy.setCaseQueriesCollectionData).toHaveBeenCalled();
    expect(queryManagementServiceSpy.generateCaseQueriesCollectionData).toHaveBeenCalled();
    expect(component.queryDataCreated.emit).toHaveBeenCalledWith(mockGeneratedData);
  });

  it('should not call generateCaseQueriesCollectionData if triggerSubmission is false', () => {
    queryManagementServiceSpy.setCaseQueriesCollectionData.and.returnValue(true);
    component.triggerSubmission = false;

    spyOn(component.queryDataCreated, 'emit');

    component.ngOnChanges();

    expect(queryManagementServiceSpy.setCaseQueriesCollectionData).toHaveBeenCalled();
    expect(queryManagementServiceSpy.generateCaseQueriesCollectionData).not.toHaveBeenCalled();
    expect(component.queryDataCreated.emit).not.toHaveBeenCalled();
  });

  it('should not call anything if setCaseQueriesCollectionData returns false', () => {
  // Spy on the internal generateCaseQueriesCollectionData method
    const generateSpy = spyOn<any>(component, 'generateCaseQueriesCollectionData');
    const emitSpy = spyOn(component.queryDataCreated, 'emit');

    // Arrange: Make sure setCaseQueriesCollectionData returns false
    spyOn(component, 'setCaseQueriesCollectionData').and.returnValue(false);

    // Act
    component.triggerSubmission = true;
    component.ngOnChanges();

    // Assert
    expect(component.setCaseQueriesCollectionData).toHaveBeenCalled();
    expect(generateSpy).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });


  it('should warn and return false when eventData is null in setCaseQueriesCollectionData()', () => {
    spyOn(console, 'warn');
    component.eventData = null;
    const result = component.setCaseQueriesCollectionData();
    expect(console.warn).toHaveBeenCalledWith('Event data not available; skipping collection setup.');
    expect(result).toBeFalsy();
  });

  it('should correctly assign messageIdfrom route params on ngOnChanges', () => {
    component.triggerSubmission = false;
    queryManagementServiceSpy.setCaseQueriesCollectionData.and.returnValue(false);

    component.ngOnChanges();

    expect(component.messageId).toBe('mock-message-id');
  });
});
