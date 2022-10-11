import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material';
import { WriteJudicialUserFieldComponent } from './write-judicial-user-field.component';

describe('WriteJudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<WriteJudicialUserFieldComponent>;
  let component: WriteJudicialUserFieldComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [WriteJudicialUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteJudicialUserFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
