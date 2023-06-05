import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pipe, PipeTransform } from '@angular/core';
import { QueryListItem } from '../../../models';
import { QueryWriteRespondToQueryComponent } from './query-write-respond-to-query.component';

@Pipe({ name: 'rpxTranslate' })
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryWriteRespondToQueryComponent', () => {
  let component: QueryWriteRespondToQueryComponent;
  let fixture: ComponentFixture<QueryWriteRespondToQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteRespondToQueryComponent, MockRpxTranslatePipe ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRespondToQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit back clicked event', () => {
    component.queryItem = new QueryListItem();
    spyOn(component.confirmDetails, 'emit');
    component.submitForm();
    expect(component.confirmDetails.emit).toHaveBeenCalled();
  });
});
