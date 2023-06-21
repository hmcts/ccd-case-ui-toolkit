import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualifyingQuestionOptionsComponent } from './qualifying-question-options.component';

describe('QualifyingQuestionOptionsComponent', () => {
  let component: QualifyingQuestionOptionsComponent;
  let fixture: ComponentFixture<QualifyingQuestionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualifyingQuestionOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualifyingQuestionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
