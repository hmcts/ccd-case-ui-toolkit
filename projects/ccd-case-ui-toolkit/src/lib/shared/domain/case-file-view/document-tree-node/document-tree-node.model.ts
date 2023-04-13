// tslint:disable:variable-name
import { Expose, Type } from 'class-transformer';
import { SortOrder } from '../../sort-order.enum';
import { CaseFileViewSortColumns } from '../case-file-view-sort-columns.enum';
import { DocumentTreeNodeType } from './document-tree-node-type.model';

export class DocumentTreeNode {
  public name: string;
  public type: DocumentTreeNodeType;
  @Type(() => DocumentTreeNode)
  public children?: DocumentTreeNode[];
  public document_filename?: string;
  public document_binary_url?: string;
  public attribute_path?: string;
  public upload_timestamp?: string;

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

  public sortChildrenAscending(column: number, sortOrder) {
    const sortAscending = () => {
      return (a, b) => {
        const nodeA = this.getNodeToSort(a, column, sortOrder);
        const nodeB = this.getNodeToSort(b, column, sortOrder);

        if (a.type === DocumentTreeNodeType.FOLDER || b.type === DocumentTreeNodeType.FOLDER) {
          return 0;
        }

        if (!nodeA || !nodeB) {
          return 0;
        }

        if (nodeA < nodeB) {
          return -1;
        }

        if (nodeA > nodeB) {
          return 1;
        }
      };
    };

    this.children?.sort(sortAscending());
    this.children?.forEach((childNodes) => {
      childNodes.sortChildrenAscending(column, sortOrder);
    });
  }

  public sortChildrenDescending(column: number, sortOrder) {
    const sortDescending = () => {
      return (a, b) => {
        const nodeA = this.getNodeToSort(a, column, sortOrder);
        const nodeB = this.getNodeToSort(b, column, sortOrder);

        if (a.type === DocumentTreeNodeType.FOLDER || b.type === DocumentTreeNodeType.FOLDER) {
          return 0;
        }

        if (!nodeA || !nodeB) {
          return 0;
        }

        if (nodeA > nodeB) {
          return -1;
        }

        if (nodeA < nodeB) {
          return 1;
        }
      };
    };

    this.children?.sort(sortDescending());
    this.children?.forEach((childNodes) => {
      childNodes.sortChildrenDescending(column, sortOrder);
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

  private getNodeToSort(node: any, column: number, sortOrder: number): Date | string {
    if (column === CaseFileViewSortColumns.DOCUMENT_NAME) {
      return node?.name
        ? node.name.toUpperCase()
        : '';
    }
    if (column === CaseFileViewSortColumns.DOCUMENT_UPLOAD_TIMESTAMP) {
      if (node?.upload_timestamp) {
        return new Date(node.upload_timestamp);
      }
      if (sortOrder === SortOrder.ASCENDING) {
        return new Date(9999, 12, 31);
      }
      if (sortOrder === SortOrder.DESCENDING) {
        return new Date(1111, 1, 1);
      }
    }
    return '';
  }
}
