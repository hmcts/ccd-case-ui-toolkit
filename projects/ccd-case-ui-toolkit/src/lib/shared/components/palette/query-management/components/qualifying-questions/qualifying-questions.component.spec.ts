import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QualifyingQuestionsComponent } from './qualifying-questions.component';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';

describe('QualifyingQuestionsComponent', () => {
  let component: QualifyingQuestionsComponent;
  let fixture: ComponentFixture<QualifyingQuestionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QualifyingQuestionsComponent,
        MockRpxTranslatePipe
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualifyingQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
