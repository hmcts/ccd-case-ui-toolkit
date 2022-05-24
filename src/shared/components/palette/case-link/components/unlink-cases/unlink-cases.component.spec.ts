import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CasesService } from '../../../../case-editor';
import { LinkedCasesService } from '../../services';
import { UnLinkCasesComponent } from './unlink-cases.component';
import createSpyObj = jasmine.createSpyObj;

describe('UnLinkCasesComponent', () => {
  let component: UnLinkCasesComponent;
  let fixture: ComponentFixture<UnLinkCasesComponent>;
  let casesService: any;
  let nativeElement: any;

  const caseInfo = {
    case_id: '1682374819203471',
    case_type: {
      name: 'SSCS type',
      jurisdiction: { name: '' }
    }, state: { name: 'With FTA' }
  }

  beforeEach(async(() => {
    casesService = createSpyObj('casesService', ['getCaseViewV2']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UnLinkCasesComponent],
      providers: [
        LinkedCasesService,
        { provide: CasesService, useValue: casesService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnLinkCasesComponent);
    casesService.getCaseViewV2.and.returnValue(of(caseInfo));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
})
