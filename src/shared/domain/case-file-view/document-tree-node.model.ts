export interface DocumentTreeNode {
  name?: string;
  type?: string;
  count?: number;
  children?: DocumentTreeNode[];
}

export enum DocumentTreeNodeType {
  FOLDER = 'folder',
  DOCUMENT = 'document'
}
