export default function uniq<T extends unknown>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
