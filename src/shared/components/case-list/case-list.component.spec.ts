import { formatDate } from '@angular/common';
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

  describe('With Case Selection enabled', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CaseListComponent);
      component = fixture.componentInstance;

      component.cases = cases;
      component.tableConfig = tableConfig;
      // Enable selection (false by default)
      component.selectionEnabled = true;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should render a table <thead> and <tbody>', () => {
      const table = de.query(By.css('div>table'));
      expect(table.nativeElement.tagName).toBe('TABLE');
      expect(table.children.length).toBe(3);
      const thead = de.query(By.css('div>table>thead'));
      expect(thead.nativeElement.tagName).toBe('THEAD');
      expect(thead.children.length).toBe(1);
      const tbody = de.query(By.css('div>table>tbody'));
      expect(tbody.nativeElement.tagName).toBe('TBODY');
    });

    it('should render columns based on TableConfig', () => {
      const headRow = de.query(By.css('div>table>thead>tr'));
      // Added +1 for checkbox column
      expect(headRow.children.length).toBe(tableConfig.columnConfigs.length + 1);
      tableConfig.columnConfigs.forEach(col => {
        expect(headRow.children.find(c => c.nativeElement.textContent.trim().startsWith(col.header)))
          .toBeTruthy(`Could not find header ${col.header}`);
      });
    });

    it('should render one row for each Case', () => {
      const tbody = de.query(By.css('div>table>tbody'));
      expect(tbody.children.length).toEqual(cases.length);
    });

    it('should render required columns for each Case row, with a checkbox in the first column', () => {
      const firstRow = de.query(By.css('div>table>tbody tr:nth-child(1)'));
      // Added +1 for checkbox column
      expect(firstRow.children.length).toBe(tableConfig.columnConfigs.length + 1);

      const firstRowFirstCol = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(firstRowFirstCol.nativeElement.tagName).toBe('INPUT');
      expect(firstRowFirstCol.nativeElement.getAttribute('type')).toBe('checkbox');

      const firstRowData = firstRow.children.slice(1, 4);
      const firstRowExpectedResult = cases[0];

      // Check the data rendered is as expected, bearing in mind the dates should be formatted to the en-GB locale
      expect(firstRowData[0].nativeElement.textContent.trim()).toEqual(
        formatDate(firstRowExpectedResult.caseCreatedDate, 'dd MMM yyyy', 'en-GB)'));
      expect(firstRowData[1].nativeElement.textContent.trim()).toEqual(
        formatDate(firstRowExpectedResult.caseDueDate, 'dd MMM yyyy', 'en-GB'));
      expect(firstRowData[2].nativeElement.textContent.trim()).toEqual(firstRowExpectedResult.caseRef);
    });

    it('should allow a Case to be shared', () => {
      expect(component.canBeShared(cases[0])).toBe(true);
      const checkbox = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(checkbox.nativeElement.disabled).toBe(false);
    });

    it('should enable the "select all" checkbox when there is at least one shareable Case', () => {
      expect(component.canAnyBeShared()).toBe(true);
      const selectAllCheckbox = de.query(By.css('div>table>thead tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(selectAllCheckbox.nativeElement.disabled).toBe(false);
    });

    it('should disable the "select all" checkbox when there are no shareable Cases', () => {
      component.cases = [];
      expect(component.canAnyBeShared()).toBe(false);
      // Update the view
      fixture.detectChanges();
      const selectAllCheckbox = de.query(By.css('div>table>thead tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(selectAllCheckbox.nativeElement.disabled).toBe(true);
    });

    it('should check the checkbox if a Case is selected', () => {
      component.selectedCases.push(cases[0]);
      expect(component.isSelected(cases[0])).toBe(true);
      // Update the view
      fixture.detectChanges();
      const checkbox = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(checkbox.nativeElement.checked).toBe(true);
    });

    it('should not check the checkbox if a Case is not selected', () => {
      component.selectedCases.push(cases[0]);
      expect(component.isSelected(cases[1])).toBe(false);
      // Update the view
      fixture.detectChanges();
      const checkbox = de.query(By.css('div>table>tbody tr:nth-child(2) th:nth-child(1) div:nth-child(1) input'));
      expect(checkbox.nativeElement.checked).toBe(false);
    });

    it('should select all Cases', () => {
      component.selectedCases.push(cases[0]);
      expect(component.allOnPageSelected()).toBe(false);
      component.selectAll();
      expect(component.allOnPageSelected()).toBe(true);
      expect(component.selectedCases.length).toEqual(2);
      // Update the view
      fixture.detectChanges();
      const firstRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(firstRowCheckbox.nativeElement.checked).toBe(true);
      const secondRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(2) th:nth-child(1) div:nth-child(1) input'));
      expect(secondRowCheckbox.nativeElement.checked).toBe(true);
    });

    it('should unselect all Cases', () => {
      component.selectedCases = cases;
      expect(component.allOnPageSelected()).toBe(true);
      component.selectAll();
      expect(component.allOnPageSelected()).toBe(false);
      expect(component.selectedCases.length).toEqual(0);
      // Update the view
      fixture.detectChanges();
      const firstRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(firstRowCheckbox.nativeElement.checked).toBe(false);
      const secondRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(2) th:nth-child(1) div:nth-child(1) input'));
      expect(secondRowCheckbox.nativeElement.checked).toBe(false);
    });

    it('should select a Case', () => {
      expect(component.selectedCases.length).toEqual(0);
      component.changeSelection(cases[0]);
      expect(component.selectedCases.length).toEqual(1);
      // Update the view
      fixture.detectChanges();
      const firstRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(firstRowCheckbox.nativeElement.checked).toBe(true);
      const secondRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(2) th:nth-child(1) div:nth-child(1) input'));
      expect(secondRowCheckbox.nativeElement.checked).toBe(false);
    });

    it('should unselect a Case', () => {
      component.selectedCases.push(cases[0]);
      expect(component.selectedCases.length).toEqual(1);
      // Update the view
      fixture.detectChanges();
      const firstRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(1) th:nth-child(1) div:nth-child(1) input'));
      expect(firstRowCheckbox.nativeElement.checked).toBe(true);
      component.changeSelection(cases[0]);
      expect(component.selectedCases.length).toEqual(0);
      // Update the view
      fixture.detectChanges();
      expect(firstRowCheckbox.nativeElement.checked).toBe(false);
      const secondRowCheckbox = de.query(By.css('div>table>tbody tr:nth-child(2) th:nth-child(1) div:nth-child(1) input'));
      expect(secondRowCheckbox.nativeElement.checked).toBe(false);
    });
  });

  describe('With Case Selection disabled (default)', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CaseListComponent);
      component = fixture.componentInstance;

      component.cases = cases;
      component.tableConfig = tableConfig;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should render a table <thead> and <tbody>', () => {
      const table = de.query(By.css('div>table'));
      expect(table.nativeElement.tagName).toBe('TABLE');
      expect(table.children.length).toBe(3);
      const thead = de.query(By.css('div>table>thead'));
      expect(thead.nativeElement.tagName).toBe('THEAD');
      expect(thead.children.length).toBe(1);
      const tbody = de.query(By.css('div>table>tbody'));
      expect(tbody.nativeElement.tagName).toBe('TBODY');
    });

    it('should render columns based on TableConfig', () => {
      const headRow = de.query(By.css('div>table>thead>tr'));
      expect(headRow.children.length).toBe(tableConfig.columnConfigs.length);
      tableConfig.columnConfigs.forEach(col => {
        expect(headRow.children.find(c => c.nativeElement.textContent.trim().startsWith(col.header)))
          .toBeTruthy(`Could not find header ${col.header}`);
      });
    });

    it('should not render a "select all" checkbox element', () => {
      const headRowFirstCol = de.query(By.css('div>table>thead>tr th:nth-child(1)'));
      // Expecting this <th> element to have no children (the checkbox would have a <div> containing the <input> element)
      expect(headRowFirstCol.children.length).toBe(0);
    });

    it('should not render a checkbox selection element for a data row', () => {
      const firstRow = de.query(By.css('div>table>tbody tr:nth-child(1)'));
      expect(firstRow.children.length).toBe(tableConfig.columnConfigs.length);
      // Expecting first child to be a <td> element (as opposed to a <th> if it had been a checkbox selection)
      expect(firstRow.children[0].nativeElement.tagName).toBe('TD');
    });
  });
});
