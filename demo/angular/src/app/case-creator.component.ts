import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Profile } from '@hmcts/ccd-case-ui-toolkit';

@Component({
  templateUrl: 'case-creator.component.html'
})
export class CaseCreatorComponent implements OnInit {

  profile: Profile;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.profile = this.route.parent.parent.snapshot.data.profile;
  }

}
