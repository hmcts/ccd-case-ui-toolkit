export interface DocumentTreeNode {
  name?: string;
  children?: DocumentTreeNode[];
}

export enum DocumentTreeNodeType {
  FOLDER = 'folder',
  DOCUMENT = 'document'
}
