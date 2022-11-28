import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-no-linked-cases',
  templateUrl: './no-linked-cases.component.html'
})
export class NoLinkedCasesComponent {

  constructor(private readonly router: Router,
    public linkedCasesService: LinkedCasesService) {
  }

  public onBack(): void {
    this.router.navigate(['cases', 'case-details', this.linkedCasesService.caseId]).then(() => {
      window.location.hash = 'Linked cases';
    });
  }
}
