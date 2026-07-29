declare global {
  var onunhandledrejection: ((this: Window, ev: PromiseRejectionEvent) => any) | null;
}

export {};
