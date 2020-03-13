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
  hashedToken?: string;
}

export class Embedded {
  documents: Document[];
}

export class DocumentData {
  _embedded: Embedded;
}
