import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import createSpyObj = jasmine.createSpyObj;
import { ReadLinkedCasesComponent } from './read-linked-cases.component';

describe('ReadLinkedCases', () => {
  let component: ReadLinkedCasesComponent;
  let fixture: ComponentFixture<ReadLinkedCasesComponent>;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: ''
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
      ],
      declarations: [ReadLinkedCasesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadLinkedCasesComponent);
    component = fixture.componentInstance;
  });

  it('should call reloadcurrentroute when hyperlink is being clicked', () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '?error'
    };
    component = fixture.componentInstance;
    component.serverError = {id: '', message: 'server error '};
    fixture.detectChanges();
    spyOn(component, 'reloadCurrentRoute');
    const reloadHyperlink = document.getElementById('reload-linked-cases-tab');
    reloadHyperlink.click();
    expect(component.reloadCurrentRoute).toHaveBeenCalled();
  });
});
