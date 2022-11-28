import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseFileViewFolderSortComponent } from './case-file-view-folder-sort.component';

describe('CaseFileViewFolderSortComponent', () => {
  let component: CaseFileViewFolderSortComponent;
  let fixture: ComponentFixture<CaseFileViewFolderSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewFolderSortComponent ],
      imports: [ OverlayModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFolderSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
