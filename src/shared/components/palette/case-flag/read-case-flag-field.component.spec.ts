import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadCaseFlagFieldComponent } from './read-case-flag-field.component';

describe('ReadCaseFlagFieldComponent', () => {
  let component: ReadCaseFlagFieldComponent;
  let fixture: ComponentFixture<ReadCaseFlagFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ReadCaseFlagFieldComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadCaseFlagFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: More tests will be added during further development of this component using real data
});
