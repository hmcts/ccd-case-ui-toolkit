import { AfterViewInit, Component, Input } from '@angular/core';
import { Flags } from '../../domain';
import { CaseFlagStatus } from '../../enums';

@Component({
  selector: 'ccd-case-flag-table',
  templateUrl: './case-flag-table.component.html',
  styleUrls: ['./case-flag-table.component.scss']
})
export class CaseFlagTableComponent implements AfterViewInit {

  @Input() public flagData: Flags;
  @Input() public firstColumnHeader: string;

  public get caseFlagStatus(): typeof CaseFlagStatus {
    return CaseFlagStatus
  }

  public ngAfterViewInit(): void {
    // Hide the field label column as it pushes the case flags table to the right
    const labelField = document.getElementById('case-viewer-field-label');
    if (labelField) {
      labelField.style.display = 'none';
    }
  }
}
