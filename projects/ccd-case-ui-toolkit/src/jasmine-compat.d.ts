// Keeps the existing test suite compatible with newer, stricter Jasmine typings.
declare function spyOn<T>(object: T, method: string): jasmine.Spy;

declare namespace jasmine {
  interface SpyAnd<Fn extends Func> {
    returnValue(val: any): Spy<Fn>;
    returnValues(...values: any[]): Spy<Fn>;
    callFake(fn: Func): Spy<Fn>;
  }

  interface FunctionMatchers<Fn extends Func> {
    toHaveBeenCalledWith(...params: any[]): void;
    toHaveBeenCalledOnceWith(...params: any[]): void;
  }

  interface Matchers<T> {
    toBe(expected: any, expectationFailOutput?: any): void;
    toEqual(expected: any, expectationFailOutput?: any): void;
  }

  interface Calls<Fn extends Func> {
    argsFor(index: number): any[];
    allArgs(): ReadonlyArray<any[]>;
    all(): ReadonlyArray<CallInfo<Func>>;
    mostRecent(): CallInfo<Func>;
    first(): CallInfo<Func>;
  }
}
