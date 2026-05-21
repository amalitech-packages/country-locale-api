/**
 * @amali-tech/PACKAGE_NAME
 *
 * Entry point for the package. Replace the example below with your real
 * exports. Keep named exports only — avoid `export default`.
 */

export const version: string = '0.0.0';

export interface GreetOptions {
  readonly name: string;
}

export function greet(options: GreetOptions): string {
  return `Hello, ${options.name}!`;
}
