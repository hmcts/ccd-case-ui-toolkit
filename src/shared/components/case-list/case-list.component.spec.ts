import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CaseListComponent, TableConfig } from './case-list.component';

describe('CaseListComponent', () => {
  const cases: any[] = [
    {
      caseCreatedDate: '2020-03-19T07:13:35.151Z',
      caseDueDate: '2021-04-17T23:58:28.201Z',
      caseRef: 'd2e373c6-4e6a-4a01-88b1-983b4a6bdbd7',
      petFirstName: 'Vaughn',
      petLastName: 'Nikolaus',
      respFirstName: 'Nathen',
      respLastName: 'Gusikowski',
      sRef: 'a571547f-3e56-4905-aa57-d7870e18d1dd'
    },
    {
      caseCreatedDate: '2019-12-14T16:19:29.379Z',
      caseDueDate: '2021-03-31T15:10:55.597Z',
      caseRef: '5f5f0779-a71f-49c7-991b-fb2bedd41a94',
      petFirstName: 'Tamara',
      petLastName: 'Hodkiewicz',
      respFirstName: 'Savannah',
      respLastName: 'VonRueden',
      sRef: '1160be3b-e7eb-4425-afc9-a8f42d0a000f'
    }
  ];

  const tableConfig: TableConfig = {
    idField: 'caseRef',
    columnConfigs: [
      { header: 'Case created date', key: 'caseCreatedDate', type: 'date' },
      { header: 'Case due date', key: 'caseDueDate', type: 'date' },
      { header: 'Case reference', key: 'caseRef' },
      { header: 'Pet. First name', key: 'petFirstName' },
      { header: 'Pet. Last name', key: 'petLastName' },
      { header: 'Resp. First name', key: 'respFirstName' },
      { header: 'Resp. Last name', key: 'respLastName' },
      { header: 'Solicitor reference', key: 'sRef' }
    ] as any[]
  };

  let component: CaseListComponent;
  let fixture: ComponentFixture<CaseListComponent>;
  let de: DebugElement

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule ],
      declarations: [ CaseListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseListComponent);
    component = fixture.componentInstance;

    component.cases = cases;
    component.tableConfig = tableConfig;

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a table <thead> and <tbody>', () => {
    let table = de.query(By.css('div>table'));
    expect(table.nativeElement.tagName).toBe('TABLE');
    expect(table.children.length).toBe(3);
    let thead = de.query(By.css('div>table>thead'));
    expect(thead.nativeElement.tagName).toBe('THEAD');
    expect(thead.children.length).toBe(1);
    let tbody = de.query(By.css('div>table>tbody'));
    expect(tbody.nativeElement.tagName).toBe('TBODY');
  });
});
