import { Expose, Type } from 'class-transformer';

export class DocumentTreeNode {
  public name: string;
  public type: DocumentTreeNodeType;
  @Type(() => DocumentTreeNode)
  public children?: DocumentTreeNode[];
  public document_filename?: string;
  public document_binary_url?: string;

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

  public sortChildrenAscending() {
    const sortAscending = () => {
      return (a, b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase

        if (a.type === 'category' || b.type === 'category') {
          return 0;
        }

        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }
      };
    };

    this.children?.sort(sortAscending());
    this.children?.forEach((childNodes) => {
      childNodes.sortChildrenAscending();
    });
  }

  public sortChildrenDescending() {
    const sortDescending = () => {
      return (a, b) => {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase

        if (a.type === 'category' || b.type === 'category') {
          return 0;
        }

        if (nameA > nameB) {
          return -1;
        }

        if (nameA < nameB) {
          return 1;
        }
      };
    };

    this.children?.sort(sortDescending());
    this.children?.forEach((childNodes) => {
      childNodes.sortChildrenDescending();
    });
  }

  public get flattenedAll(): DocumentTreeNode[] {
    const flattenChildren = (nodeChild: DocumentTreeNode): DocumentTreeNode[] => {
      const flattenedNodes = [];
      flattenedNodes.push(nodeChild);

      if (nodeChild.children?.length > 0) {
        // flattenedNodes.push(nodeChild);
        nodeChild.children.forEach((child) => {
            flattenedNodes.push(flattenChildren(child));
        });
      }

      return flattenedNodes.flat();
    };

    return [
      this,
      ...this.children?.map(item => {
        return flattenChildren(item);
      }).flat()
    ];
  }
}

export enum DocumentTreeNodeType {
  FOLDER = 'folder',
  DOCUMENT = 'document',
}
