import { OrderService } from './order.service';
import { createCaseField, createFieldType, createFixedListFieldType, textFieldType } from '../../fixture/shared.test.fixture';

describe('OrderService', () => {

  let orderService: OrderService;

  const ITEM_X = { id: 1, order: undefined };
  const ITEM_0 = { id: 0, order: 0 };
  const ITEM_1 = { id: 1, order: 1 };
  const ITEM_2 = { id: 2, order: 2 };

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('sortAsc', () => {

    it('should sort in ascending order', () => {
      expect(orderService.sortAsc(ITEM_1, ITEM_2)).toBe(-1);
      expect(orderService.sortAsc(ITEM_2, ITEM_1)).toBe(1);
    });

    it('should keep order of items with same order', () => {
      expect(orderService.sortAsc(ITEM_1, ITEM_1)).toBe(0);
    });

    it('should sort items without order at the end', () => {
      expect(orderService.sortAsc(ITEM_X, ITEM_1)).toBe(1);
    });

    it('should keep order of items without order', () => {
      expect(orderService.sortAsc(ITEM_X, ITEM_X)).toBe(0);
    });

    it('should consider 0 as a lower order', () => {
      expect(orderService.sortAsc(ITEM_1, ITEM_0)).toBe(1);
    });
  });

  describe('sort', () => {
    it('should return cloned array', () => {
      let array = [ITEM_0, ITEM_1, ITEM_2];
      let arrayClone = [ITEM_0, ITEM_1, ITEM_2];

      spyOn(array, 'slice').and.returnValue(arrayClone);

      let sortedArray = orderService.sort(array);

      expect(array.slice).toHaveBeenCalledWith();
      expect(sortedArray).toEqual(arrayClone);
    });

    it('should sort cloned array by ascending order', () => {
      let array = [ITEM_2, ITEM_1, ITEM_0];
      let arrayClone = [ITEM_2, ITEM_1, ITEM_0];
      let arrayExpected = [ITEM_0, ITEM_1, ITEM_2];

      spyOn(array, 'slice').and.returnValue(arrayClone);
      spyOn(arrayClone, 'sort').and.returnValue(arrayExpected);

      let sortedArray = orderService.sort(array);

      expect(arrayClone.sort).toHaveBeenCalledWith(orderService.sortAsc);
      expect(sortedArray).toBe(arrayExpected);
    });
  });

  describe('should sort caseFields', () => {
    it('should keep the order of the fixedlist items', () => {
      const CASE_FIELDS = [
        createCaseField('testField1', 'Debtor name', '', createFixedListFieldType('fixedList1', [{code:'c1', label: 'l1', order: 2}, {code:'c2', label: 'l2', order: 1}]), null, 3),
        createCaseField('testField2', 'Debtor name', '', textFieldType(), null, 5)];

      let caseFieldsOrdered = orderService.deepSort(CASE_FIELDS);

      expect(caseFieldsOrdered[0].order).toEqual(3);
      expect(caseFieldsOrdered[0].id).toEqual('testField1');
      expect(caseFieldsOrdered[0].field_type.fixed_list_items[0].code).toEqual('c2');
      expect(caseFieldsOrdered[0].field_type.fixed_list_items[0].order).toEqual(1);
      expect(caseFieldsOrdered[0].field_type.fixed_list_items[1].code).toEqual('c1');
      expect(caseFieldsOrdered[0].field_type.fixed_list_items[1].order).toEqual(2);

      expect(caseFieldsOrdered[1].order).toEqual(5);
      expect(caseFieldsOrdered[1].id).toEqual('testField2');


    });

    it('should keep the order of the fields if already sorted', () => {
      const CASE_FIELDS = [
        createCaseField('testField1', 'Debtor name', '', textFieldType(), null, 3),
        createCaseField('testField2', 'Debtor name', '', textFieldType(), null, 5)];

      let caseFieldsOrdered = orderService.deepSort(CASE_FIELDS);

      expect(caseFieldsOrdered[0].order).toEqual(3);
      expect(caseFieldsOrdered[0].id).toEqual('testField1');
      expect(caseFieldsOrdered[1].order).toEqual(5);
      expect(caseFieldsOrdered[1].id).toEqual('testField2');
    });

    it('should sort fields in order', () => {
      const CASE_FIELDS = [
        createCaseField('testField1', 'Debtor name', '', textFieldType(), null, 5),
        createCaseField('testField2', 'Debtor name', '', textFieldType(), null, 3)];

      let caseFieldsOrdered = orderService.deepSort(CASE_FIELDS);

      expect(caseFieldsOrdered[0].order).toEqual(3);
      expect(caseFieldsOrdered[0].id).toEqual('testField2');
      expect(caseFieldsOrdered[1].order).toEqual(5);
      expect(caseFieldsOrdered[1].id).toEqual('testField1');
    });

    it('fields without order should end up on the bottom', () => {
      const CASE_FIELDS = [
        createCaseField('testField1', 'Debtor name', '', textFieldType(), null),
        createCaseField('testField2', 'Debtor name', '', textFieldType(), null, 3)];

      let caseFieldsOrdered = orderService.deepSort(CASE_FIELDS);

      expect(caseFieldsOrdered[0].order).toEqual(3);
      expect(caseFieldsOrdered[0].id).toEqual('testField2');
      expect(caseFieldsOrdered[1].order).toBeUndefined();
      expect(caseFieldsOrdered[1].id).toEqual('testField1');
    });

    it('should sort caseFields with Complex type - order is defined only on the Complex type leafs', () => {
      const CASE_FIELDS_WITH_COMPLEX_TYPE = [
        createCaseField('testField1', 'Test field 1', '', textFieldType(), null, 1),
        createCaseField('finalReturn', 'Final return', '',
          createFieldType('Return', 'Complex', [
            createCaseField('addressAttended',
              'Address Attended',
              'Address Attended hint text',
              createFieldType('AddressUK', 'Complex', [
                createCaseField('AddressLine1', 'Building and Street', 'hint 1', createFieldType('TextMax150', 'Text', []), null, 2),
                createCaseField('AddressLine2', '', 'hint 2', createFieldType('TextMax50', 'Text', []), null),
                createCaseField('PostCode', 'Postcode/Zipcode', 'hint 3', createFieldType('TextMax14', 'Text', []), null, 3)
              ]),
              null
            )
          ]), 'COMPLEX'),
        createCaseField('testField2', 'Test field 2', '', textFieldType(), null, 4)
      ];

      let caseFieldsOrdered = orderService.deepSort(CASE_FIELDS_WITH_COMPLEX_TYPE);

      let testField1 = caseFieldsOrdered[0];

      let finalReturn = caseFieldsOrdered[1];
      let addressAttended = finalReturn.field_type.complex_fields[0];
      // console.log('finalReturn', JSON.stringify(finalReturn, null, 2));
      // console.log('addressAttended', JSON.stringify(addressAttended, null, 2));
      let addressLine1 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine1');
      let addressLine2 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine2');
      let postCode = addressAttended.field_type.complex_fields.find(e => e.id === 'PostCode');

      let testField2 = caseFieldsOrdered[2];

      expect(testField1.id).toEqual('testField1');
      expect(testField1.order).toEqual(1);
      expect(finalReturn.id).toEqual('finalReturn');
      expect(finalReturn.order).toEqual(2);
      expect(addressAttended.order).toEqual(addressLine1.order);
      expect(addressLine2.order).toBeUndefined();
      expect(postCode.order).toEqual(3);

      expect(testField2.id).toEqual('testField2');
      expect(testField2.order).toEqual(4);
    });

    it('should sort Collection type and fixed lists in collection type containing Complex type', () => {
      const CASE_FIELDS_WITH_COMPLEX_TYPE_IN_COLLECTION = [
        createCaseField('debtorName', 'Debtor name', '', textFieldType(), null, 1),
        createCaseField('interimReturns', 'Interim returns', '',
          createFieldType('interimReturns', 'Collection', [],
            createFieldType('Return', 'Complex', [
              createCaseField('addressAttended',
                'Address Attended',
                'Address Attended hint text',
                createFieldType('AddressUK', 'Complex', [
                  createCaseField('AddressLine1', 'Building and Street', 'hint 1', createFieldType('TextMax150', 'Text', []), null, 2),
                  createCaseField('AddressLine2', '', 'hint 2', createFieldType('TextMax50', 'Text', []), null),
                  createCaseField('County', '', 'hint 2', createFixedListFieldType('countylist', [{code:'Somerset', label: 'Somerset', order: 2}, {code:'Avon', label: 'Avon', order: 1}]), null),
                  createCaseField('PostCode', 'Postcode/Zipcode', 'hint 3', createFieldType('TextMax14', 'Text', []), null, 3)
                ]),
                null
              )
            ])
          ), 'COMPLEX')
      ];

      let caseFieldsOrdered = orderService.deepSort(CASE_FIELDS_WITH_COMPLEX_TYPE_IN_COLLECTION);

      let debtorName = caseFieldsOrdered[0];
      let interimReturns = caseFieldsOrdered[1];

      let addressAttended = interimReturns.field_type.collection_field_type.complex_fields[0];
      let addressLine1 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine1');
      let addressLine2 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine2');
      let county = addressAttended.field_type.complex_fields.find(e => e.id === 'County');
      let postCode = addressAttended.field_type.complex_fields.find(e => e.id === 'PostCode');

      expect(debtorName.id).toEqual('debtorName');
      expect(debtorName.order).toEqual(1);
      expect(interimReturns.id).toEqual('interimReturns');
      expect(interimReturns.order).toEqual(addressLine1.order);
      expect(addressLine1.order).toEqual(2);
      expect(addressAttended.order).toEqual(addressLine1.order);
      expect(addressLine2.order).toBeUndefined();
      expect(postCode.order).toEqual(3);
      expect(county.field_type.fixed_list_items[0].code).toEqual('Avon');
      expect(county.field_type.fixed_list_items[0].order).toEqual(1);
      expect(county.field_type.fixed_list_items[1].code).toEqual('Somerset');
      expect(county.field_type.fixed_list_items[1].order).toEqual(2);
    });
  });
});
