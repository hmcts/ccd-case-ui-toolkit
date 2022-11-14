import { Expose, Type } from 'class-transformer';

export class DocumentTreeNode {
  public name: string;
  public type: 'document' | 'category';
  @Type(() => DocumentTreeNode)
  public children?: DocumentTreeNode[];

  @Expose()
  public get childDocumentCount() {
    const countChildren = (childNodes: DocumentTreeNode[] | undefined) => {
      let count = 0;
      if (childNodes?.length) {
        const documents = childNodes.filter(item => item.type === 'document');
        count += documents.length;
        childNodes.forEach((children) => {
          count += countChildren(children.children);
        });
      }

      return count;
    };

    return countChildren(this.children);
  }
}
