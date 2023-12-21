import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-no-linked-cases',
  templateUrl: './no-linked-cases.component.html'
})
export class NoLinkedCasesComponent implements OnInit {

  public serverLinkedApiError: { id: string, message: string };

  constructor(private readonly router: Router,
    private readonly linkedCasesService: LinkedCasesService) {
  }

  public ngOnInit(): void {
    this.serverLinkedApiError = this.linkedCasesService.serverLinkedApiError;
  }

  public onBack(): void {
    this.router.navigate(['cases', 'case-details', this.linkedCasesService.caseId]).then(() => {
      window.location.hash = 'Linked cases';
    });
  }
}
