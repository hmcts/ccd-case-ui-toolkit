import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { CaseFileViewIconComponent } from "./case-file-view-icon.component";

describe('CaseFileViewIconComponent', () => {
  let component: CaseFileViewIconComponent;
  let fixture: ComponentFixture<CaseFileViewIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        CaseFileViewIconComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseFileViewIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
