import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseFileViewOverlayMenuComponent } from './case-file-view-overlay-menu.component';

describe('CaseFileViewOverlayMenuComponent', () => {
  let component: CaseFileViewOverlayMenuComponent;
  let fixture: ComponentFixture<CaseFileViewOverlayMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseFileViewOverlayMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFileViewOverlayMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
