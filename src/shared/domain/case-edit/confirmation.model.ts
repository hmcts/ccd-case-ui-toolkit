export class Confirmation {
  constructor(private caseId: string, private status: string, private header: string, private body: string) {
  }

  public getCaseId(): string {
    return this.caseId;
  }

  public getStatus(): string {
    return this.status;
  }

  public getHeader(): string {
    return this.header;
  }

  public getBody(): string {
    return this.body;
  }
}
