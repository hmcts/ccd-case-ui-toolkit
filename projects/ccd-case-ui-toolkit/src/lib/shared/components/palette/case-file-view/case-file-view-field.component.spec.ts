import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseFileViewService } from '../../../services';
import { CaseFileViewFieldComponent } from './case-file-view-field.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseFileViewFieldComponent', () => {
  let component: CaseFileViewFieldComponent;
  let fixture: ComponentFixture<CaseFileViewFieldComponent>;
  let mockCaseFileViewService: any;
  const mockSnapshot = {
    paramMap: createSpyObj('paramMap', ['get']),
  };
  const mockRoute = {
    params: of({cid: '1234123412341234'}),
    snapshot: mockSnapshot
  };

  beforeEach(async(() => {
    mockCaseFileViewService = createSpyObj<CaseFileViewService>('CaseFileViewService', ['getCategoriesAndDocuments']);
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

    fixture = TestBed.createComponent(CaseFileViewFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mockCaseFileViewService.getCategoriesAndDocuments).toHaveBeenCalled();
  });
});
