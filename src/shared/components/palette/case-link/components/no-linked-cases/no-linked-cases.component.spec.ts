import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { NoLinkedCasesComponent } from './no-linked-cases.component';

describe('NoLinkedCasesComponent', () => {
  let component: NoLinkedCasesComponent;
  let fixture: ComponentFixture<NoLinkedCasesComponent>;
  let router: any;
  let linkedCasesService: any;
  let caseId = '1682374819203471';

  router = {
    navigate: jasmine.createSpy('navigate'),
    url: ''
  };
  router.navigate.and.returnValue({then: f => f()});

  linkedCasesService = {
    caseId: '1682374819203471'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [NoLinkedCasesComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: LinkedCasesService, useValue: linkedCasesService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoLinkedCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should back button navigate to linked cases tab', () => {
    component.onBack();
    expect(router.navigate).toHaveBeenCalledWith(['cases', 'case-details', caseId]);
  });
})
