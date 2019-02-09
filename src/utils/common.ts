export function escapeSelector(selector: string): string {
  return ''.replace.call(selector,
    /(^[^_a-zA-Z\u00a0-\uffff]|[^-_a-zA-Z0-9\u00a0-\uffff])/g,
    '\\$1');
}
