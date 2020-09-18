import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { of } from 'rxjs';

describe('WriteOrganisationComplexFieldComponent', () => {
  let component: WriteOrganisationComplexFieldComponent;
  let fixture: ComponentFixture<WriteOrganisationComplexFieldComponent>;

  beforeEach(async(() => {
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
    }
    component.selectedOrg$ = of(selectedOrg);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
