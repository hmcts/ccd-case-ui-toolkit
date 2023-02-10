import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadDemoComponent } from './lead-demo.component';

describe('LeadDemoComponent', () => {
  let component: LeadDemoComponent;
  let fixture: ComponentFixture<LeadDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
