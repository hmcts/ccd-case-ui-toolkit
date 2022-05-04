import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteLinkedCasesFieldComponent } from './write-linked-cases-field.component';

describe('WriteLinkedCasesFieldComponent', () => {
  let component: WriteLinkedCasesFieldComponent;
  let fixture: ComponentFixture<WriteLinkedCasesFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [WriteLinkedCasesFieldComponent],
      providers: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteLinkedCasesFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
