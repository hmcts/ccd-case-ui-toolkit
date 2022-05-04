import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadLinkedCasesFieldComponent } from './read-linked-cases-field.component';

describe('ReadLinkedCasesFieldComponent', () => {
  let component: ReadLinkedCasesFieldComponent;
  let fixture: ComponentFixture<ReadLinkedCasesFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ReadLinkedCasesFieldComponent],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadLinkedCasesFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
