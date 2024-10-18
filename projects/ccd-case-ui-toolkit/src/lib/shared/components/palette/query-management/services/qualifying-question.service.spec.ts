import { TestBed } from '@angular/core/testing';
import { QualifyingQuestionService } from './qualifying-question.service';
import { QualifyingQuestion } from '../models';

describe('QualifyingQuestionService', () => {
  let service: QualifyingQuestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QualifyingQuestionService]
    });

    service = TestBed.inject(QualifyingQuestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get the selected qualifying question', () => {
    const mockQuestion: QualifyingQuestion = {
      name: 'Sample Question',
      markdown: 'This is a sample question in markdown format',
      url: 'https://example.com/sample-question'
    };

    expect(service.getQualifyingQuestionSelection()).toBeNull();

    service.setQualifyingQuestionSelection(mockQuestion);

    expect(service.getQualifyingQuestionSelection()).toEqual(mockQuestion);
  });

  it('should return null after resetting qualifying question selection', () => {
    const mockQuestion: QualifyingQuestion = {
      name: 'Sample Question',
      markdown: 'This is a sample question in markdown format',
      url: 'https://example.com/sample-question'
    };

    service.setQualifyingQuestionSelection(mockQuestion);

    service.setQualifyingQuestionSelection(null);

    expect(service.getQualifyingQuestionSelection()).toBeNull();
  });
});
