import { Expose, Type } from 'class-transformer';
import { DocumentTreeNodeType } from './document-tree-node-type.model';

export class DocumentTreeNode {
  public name: string;
  public type: DocumentTreeNodeType;
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

  public sortChildrenAscending() {
    const sortAscending = () => {
      return (a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (a.type === DocumentTreeNodeType.FOLDER || b.type === DocumentTreeNodeType.FOLDER) {
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
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (a.type === DocumentTreeNodeType.FOLDER || b.type === DocumentTreeNodeType.FOLDER) {
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
        nodeChild.children.forEach((child) => {
            flattenedNodes.push(...flattenChildren(child));
        });
      }

      return flattenedNodes;
    };

    return [
      this,
      ...this.children?.map(item => {
        return flattenChildren(item);
      }).flat()
    ];
  }
}
