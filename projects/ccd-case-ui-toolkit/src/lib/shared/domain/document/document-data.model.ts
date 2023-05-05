// tslint:disable:variable-name
export class HRef {
  public href: string;
}

export class DocumentLinks {
  public self: HRef;
  public binary: HRef;
}

export class Document {
  public _links: DocumentLinks;
  public originalDocumentName: string;
  public hashToken?: string;
}

export class Embedded {
  public documents: Document[];
}

export class DocumentData {
  public _embedded: Embedded;
  public documents: Document[];
}

export class FormDocument {
  public document_url: string;
  public document_binary_url: string;
  public document_filename: string;
  public document_hash?: string;
}
