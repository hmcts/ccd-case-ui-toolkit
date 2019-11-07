export class CollectionsHelpers {
  constructor() {
  }

  filterElement(el) {
    return el != null;
  }

  flatAnArray(array) {
    return array.reduce((acc, item) => {
      return acc.concat(item);
    }, []);
  }
}
