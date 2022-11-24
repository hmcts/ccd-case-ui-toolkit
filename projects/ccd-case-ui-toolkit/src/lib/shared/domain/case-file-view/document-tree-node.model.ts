export interface DocumentTreeNode {
  name?: string;
  type?: DocumentTreeNodeType;
  count?: number;
  children?: DocumentTreeNode[];
}

export enum DocumentTreeNodeType {
  FOLDER = 'folder',
  DOCUMENT = 'document',
}
