import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { CaseFileViewFolderSelectorComponent } from './case-file-view-folder-selector.component';
import { categoriesAndDocumentsTestData } from '../../test-data/categories-and-documents-test-data';

describe('CaseFileViewFolderSelectorComponent', () => {
  let component: CaseFileViewFolderSelectorComponent;
  let fixture: ComponentFixture<CaseFileViewFolderSelectorComponent>;
  let matDialogRef: jasmine.SpyObj<MatDialogRef<CaseFileViewFolderSelectorComponent>>;

  beforeEach(() => {
    matDialogRef = jasmine.createSpyObj<MatDialogRef<CaseFileViewFolderSelectorComponent>>('matDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [CaseFileViewFolderSelectorComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: matDialogRef
        },
        {
          provide: MAT_LEGACY_DIALOG_DATA,
          useValue: { categories: categoriesAndDocumentsTestData.categories, document: categoriesAndDocumentsTestData.uncategorised_documents }
        }
      ]
    });
    fixture = TestBed.createComponent(CaseFileViewFolderSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
  it('should close the dialog on cancel', () => {
    component.cancel();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  it('should close the dialog with null on save if selected is empty', () => {
    component.selected = '';
    component.save();
    expect(component.dialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should select the checkbox and clear lower levels when radio is checked', () => {
    const event = {
      target: {
        checked: true,
        id: 'TestId',
        name: 'level-2'
      }
    };

    component.handleChange(event);

    expect(component.selected).toBe('TestId');
  });
});
