import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CaseFileViewService } from '../../../services';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';

import createSpyObj = jasmine.createSpyObj;

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;
  let mockCaseFileViewService: jasmine.SpyObj<CaseFileViewService>;
  const mockSnapshot = {
    paramMap: createSpyObj('paramMap', ['get']),
  };
  const mockRoute = {
    params: of({cid: '1234123412341234'}),
    snapshot: mockSnapshot
  };

  beforeEach(async(() => {
    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService', ['getCategoriesAndDocuments']);
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(of(null));
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        CaseFileViewFieldComponent
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseFileViewService, useValue: mockCaseFileViewService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
    expect(mockCaseFileViewService.getCategoriesAndDocuments).toHaveBeenCalled();
    expect(component.getCategoriesAndDocumentsError).toBe(false);
    const nativeElement = fixture.debugElement.nativeElement;
    const errorMessageHeadingElement = nativeElement.querySelector('.govuk-heading-xl');
    expect(errorMessageHeadingElement).toBeNull();
    const errorMessageBodyElement = nativeElement.querySelector('.govuk-body');
    expect(errorMessageBodyElement).toBeNull();
    const caseFileViewHeadingElement = nativeElement.querySelector('.govuk-heading-l');
    expect(caseFileViewHeadingElement).toBeTruthy();
    const caseFileViewElement = nativeElement.querySelector('#case-file-view');
    expect(caseFileViewElement).toBeTruthy();
  });

  it('should display an error message if the service is unavilable to get categories and documents', () => {
    mockCaseFileViewService.getCategoriesAndDocuments.and.returnValue(throwError(new Error('Unable to retrieve data')));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.getCategoriesAndDocumentsError).toBe(true);
    const nativeElement = fixture.debugElement.nativeElement;
    const errorMessageHeadingElement = nativeElement.querySelector('.govuk-heading-xl');
    expect(errorMessageHeadingElement).toBeTruthy();
    const errorMessageBodyElement = nativeElement.querySelector('.govuk-body');
    expect(errorMessageBodyElement).toBeTruthy();
    const caseFileViewHeadingElement = nativeElement.querySelector('.govuk-heading-l');
    expect(caseFileViewHeadingElement).toBeNull();
    const caseFileViewElement = nativeElement.querySelector('#case-file-view');
    expect(caseFileViewElement).toBeNull();
  });
});
