export interface IOptionsApp {
  interval: number;
  attempts?: number;
  backoffStrategy?: string;
  exponentialUnit?: number;
  randomRange?: [number, number] | number[] | undefined;
  constantTime?: number;
  backgroundPolling?: boolean;
}
