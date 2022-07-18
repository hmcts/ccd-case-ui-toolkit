import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';

describe('WriteOrganisationComplexFieldComponent', () => {
  let component: WriteOrganisationComplexFieldComponent;
  let fixture: ComponentFixture<WriteOrganisationComplexFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteOrganisationComplexFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOrganisationComplexFieldComponent);
    component = fixture.componentInstance;
    const selectedOrg = {
      organisationIdentifier: 'O111111',
      name: 'Woodford solicitor',
      address: '12<br>Nithdale Role<br>Liverpool<br>Merseyside<br>UK<br>L15 5AX<br>'
    };
    component.selectedOrg$ = of(selectedOrg);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
