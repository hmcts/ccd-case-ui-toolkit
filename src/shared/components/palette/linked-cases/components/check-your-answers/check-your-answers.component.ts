import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../../../domain';
import { LinkedCase, LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-linked-cases-check-your-answers',
  templateUrl: './check-your-answers.component.html'
})
export class CheckYourAnswersComponent implements OnInit {

  @Input()
  formGroup: FormGroup;

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  linkedCases: LinkedCase[];

  constructor(private linkedCasesService: LinkedCasesService) {}

  public ngOnInit(): void {
    console.log('FORM GROUP', this.formGroup);
    this.generateData();
    console.log('LINKED CASES', this.linkedCases);
    this.linkedCases = this.linkedCasesService.linkedCases;
    console.log('LINKED CASES FROM SERVICE', this.linkedCases);
  }

  public onChange(): void {
    this.linkedCasesStateEmitter.emit(
      { currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS, errorMessages: [], navigateToPreviousPage: true });
  }

  public generateData(): void {
    this.linkedCases = [
      {
        caseLink: {
          caseReference: '5283-8196-7254-2864',
          caseName: '',
          caseService: '',
          caseState: '',
          caseType: '',
          createdDateTime: '11/05/2022',
          linkReason: [
            {
              reason: 'Progressed as part of this lead case'
            },
            {
              reason: 'Linked for a hearing'
            }
          ]
        }
      },
      {
        caseLink: {
          caseReference: '8254-9025-7233-6147',
          caseName: '',
          caseService: '',
          caseState: '',
          caseType: '',
          createdDateTime: '11/05/2022',
          linkReason: [
            {
              reason: 'Case consolidated Familial Guardian Linked for a hearing'
            }
          ]
        }
      },
      {
        caseLink: {
          caseReference: '4652-7249-0269-6213',
          caseName: '',
          caseService: '',
          caseState: '',
          caseType: '',
          createdDateTime: '11/05/2022',
          linkReason: [
            {
              reason: 'Familial'
            }
          ]
        }
      }
    ];
  }
}
