import { Component, Input, OnInit } from '@angular/core';
import { CaseField } from '../../../../../domain';
import { LinkedCase } from '../../domain';

@Component({
  selector: 'ccd-linked-cases-check-your-answers',
  templateUrl: './check-your-answers.component.html'
})
export class CheckYourAnswersComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];
	linkedCases: LinkedCase[];

  public ngOnInit(): void {
    console.log('CASE FIELDS', this.caseFields);
		this.generateData();
		console.log('LINKED CASES', this.linkedCases);
  }

	public generateData(): void {
		this.linkedCases = [
			{
				caseLink: {
					caseReference: '5283-8196-7254-2864',
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
