import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { AbstractJourneyComponent } from '../../../base-field';
import { MultipageComponentStateService } from '../../../../../services';
import { Journey } from '../../../../../domain';

@Component({
    selector: 'ccd-no-linked-cases',
    templateUrl: './no-linked-cases.component.html',
    standalone: false
})
export class NoLinkedCasesComponent extends AbstractJourneyComponent implements OnInit, Journey {

  public serverLinkedApiError: { id: string, message: string };

  constructor(private readonly router: Router,
    private readonly linkedCasesService: LinkedCasesService,
    multipageComponentStateService: MultipageComponentStateService) {
      super(multipageComponentStateService);
  }

  public ngOnInit(): void {
    this.serverLinkedApiError = this.linkedCasesService.serverLinkedApiError;
  }

  public onBack(): void {
    this.router.navigate(['cases', 'case-details', this.linkedCasesService.caseId], { fragment: 'Linked cases' });
  }
}
