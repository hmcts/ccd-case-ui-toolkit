export class ContextMap {
    public static readonly PAYMENTS_BASE_URL_KEY = 'payments_url';
    public static readonly CASE_REFERENCE_KEY = 'case_reference';

    private data: { [key: string]: string };

    public constructor() {
        this.data = Object.create(null);
    }

    public set(key: string, value: string): void {
        this.data[key] = value;
    }

    public get(key: string): string {
        return this.data[key];
    }

    public remove(key: string): string {
        let value = this.get(key);
        delete this.data[key];
        return value;
    }
}
