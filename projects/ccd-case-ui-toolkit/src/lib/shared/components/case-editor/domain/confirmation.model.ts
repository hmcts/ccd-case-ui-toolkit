export class Confirmation {
  constructor(private readonly caseId: string, private readonly status: string, private readonly header: string, private readonly body: string) {
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
