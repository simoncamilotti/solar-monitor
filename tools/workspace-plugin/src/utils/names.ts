/** Lowercase letters and digits, single dashes: a valid npm, Docker and Kubernetes name. */
const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export function assertKebabCase(value: string, label: string, maxLength = 40): void {
  if (!KEBAB_CASE.test(value) || value.length > maxLength) {
    throw new Error(
      `Invalid ${label} "${value}": lowercase letters, digits and single dashes, starting with a letter, ${maxLength} characters at most.`,
    );
  }
}

/** `solar-monitor` → `Solar Monitor`. */
export function toDisplayName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
