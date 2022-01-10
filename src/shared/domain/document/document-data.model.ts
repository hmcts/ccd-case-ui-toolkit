export class HRef {
  href: string;
}

export class DocumentLinks {
  self: HRef;
  binary: HRef;
}

export class Document {
  _links: DocumentLinks;
  originalDocumentName: string;
  hashToken?: string;
}

export class Embedded {
  documents: Document[];
}

export class DocumentData {
  _embedded: Embedded;
  documents: Document[];
}

export class FormDocument {
  document_url: string;
  document_binary_url: string;
  document_filename: string;
  document_hash?: string;
}
