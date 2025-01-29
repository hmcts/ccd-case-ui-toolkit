import { OverlayModule } from "@angular/cdk/overlay";
// import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
// import { By } from "@angular/platform-browser";
import { AbstractAppConfig } from "../../../../../../../app.config";
import { CaseFileViewOverlayMenuComponent } from "../../shared";
import { CaseFileViewFolderToggleComponent } from "./case-file-view-folder-toggle.component";

describe("CaseFileViewFolderToggleComponent", () => {
  let component: CaseFileViewFolderToggleComponent;
  let fixture: ComponentFixture<CaseFileViewFolderToggleComponent>;
  let mockAppConfig: any;

  beforeEach(async () => {
    mockAppConfig = jasmine.createSpyObj<AbstractAppConfig>(
      "AbstractAppConfig",
      ["getEnableCaseFileViewVersion1_1"]
    );
    await TestBed.configureTestingModule({
      declarations: [
        CaseFileViewFolderToggleComponent,
        CaseFileViewOverlayMenuComponent,
      ],
      imports: [OverlayModule],
      providers: [{ provide: AbstractAppConfig, useValue: mockAppConfig }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewFolderToggleComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
