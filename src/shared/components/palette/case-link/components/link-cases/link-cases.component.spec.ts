import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkCaseReason } from '../../domain';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { LinkCasesComponent } from './link-cases.component';
import createSpyObj = jasmine.createSpyObj;

describe('LinkCasesComponent', () => {
  let component: LinkCasesComponent;
  let fixture: ComponentFixture<LinkCasesComponent>;
  let nextButton: any;
  let casesService: any;

  beforeEach(async(() => {
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        LinkedCasesService,
        { provide: CasesService, useValue: casesService },
      ],
      declarations: [LinkCasesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkCasesComponent);
    component = fixture.componentInstance;
    casesService.getCaseLinkResponses.and.returnValue(of([] as LinkCaseReason[]));
    spyOn(component.linkedCasesStateEmitter, 'emit');
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
