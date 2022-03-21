import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleDemoComponent } from './multiple-demo.component';

describe('MultipleDemoComponent', () => {
  let component: MultipleDemoComponent;
  let fixture: ComponentFixture<MultipleDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
