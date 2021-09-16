declare module 'eval' {
  type Evaluate = (
    content: string,
    filename?: string,
    scope?: object,
    includeGlobals?: boolean,
  ) => unknown;

  const evaluate: Evaluate;

  export default evaluate;
}
