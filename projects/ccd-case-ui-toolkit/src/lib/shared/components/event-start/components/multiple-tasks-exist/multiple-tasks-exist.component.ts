import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../services/loading/loading.service';

@Component({
  selector: 'app-multiple-tasks-exist',
  templateUrl: './multiple-tasks-exist.component.html'
})
export class MultipleTasksExistComponent implements OnInit {

  public caseId: string;

  constructor(private readonly route: ActivatedRoute, private loadingService: LoadingService) {
    this.caseId = this.route.snapshot.data.case.case_id;
  }

  public ngOnInit() {
    // Check if the loading service has a shared spinner
    if (this.loadingService.hasSharedSpinner()){
      this.loadingService.unregisterSharedSpinner();
    }
  }
}
