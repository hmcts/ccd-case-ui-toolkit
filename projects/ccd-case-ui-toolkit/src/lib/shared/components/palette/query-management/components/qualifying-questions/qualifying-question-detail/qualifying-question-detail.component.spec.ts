import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockRpxTranslatePipe } from '../../../../../../../shared/test/mock-rpx-translate.pipe';
import { QualifyingQuestionDetailComponent } from './qualifying-question-detail.component';

describe('QualifyingQuestionDetailComponent', () => {
  let component: QualifyingQuestionDetailComponent;
  let fixture: ComponentFixture<QualifyingQuestionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        QualifyingQuestionDetailComponent,
        MockRpxTranslatePipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualifyingQuestionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
