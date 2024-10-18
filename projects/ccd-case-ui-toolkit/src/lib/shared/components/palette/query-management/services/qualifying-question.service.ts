import { Injectable } from '@angular/core';
import { QualifyingQuestion } from '../models';

@Injectable()
export class QualifyingQuestionService {
  private qualifyingQuestionSelection: QualifyingQuestion | null = null;

  // Set the selected qualifying question
  public setQualifyingQuestionSelection(selection: QualifyingQuestion): void {
    this.qualifyingQuestionSelection = selection;
  }

  // Get the selected qualifying question
  public getQualifyingQuestionSelection(): QualifyingQuestion | null {
    return this.qualifyingQuestionSelection;
  }

  // Clear the selected qualifying question (reset the selection)
  public clearQualifyingQuestionSelection(): void {
    this.qualifyingQuestionSelection = null;
  }
}

