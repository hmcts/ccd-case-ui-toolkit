export class CollectionsHelpers {
  constructor() { }

  flatAnArray(array) {
    return array.reduce((acc, item) => {
      return acc.concat(item);
    }, []);
  }
}
