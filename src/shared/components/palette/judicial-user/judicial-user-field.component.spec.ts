import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material';
import { JudicialUserFieldComponent } from './judicial-user-field.component';

describe('JudicialUserFieldComponent', () => {
  let fixture: ComponentFixture<JudicialUserFieldComponent>;
  let component: JudicialUserFieldComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [JudicialUserFieldComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(JudicialUserFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
