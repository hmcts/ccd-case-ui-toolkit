import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../services/loading/loading.service';

@Component({
  selector: 'app-multiple-tasks-exist',
  templateUrl: './multiple-tasks-exist.component.html',
  standalone: false
})
export class MultipleTasksExistComponent implements OnInit {

  public caseId: string;
  public jurisdiction: string;
  public caseType: string;

  constructor(private readonly route: ActivatedRoute, private readonly loadingService: LoadingService) {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.jurisdiction = this.route.snapshot.data.case.case_type.jurisdiction.id;
    this.caseType = this.route.snapshot.data.case.case_type.id;
  }

  public ngOnInit() {
    // Check if the loading service has a shared spinner
    if (this.loadingService.hasSharedSpinner()){
      this.loadingService.unregisterSharedSpinner();
    }
  }
}
