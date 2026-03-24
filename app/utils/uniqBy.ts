export default function uniqBy<T extends unknown>(
  arr: T[],
  comp: (item: T) => undefined | string
): T[] {
  const map = new Map();
  arr.forEach((item) => {
    const key = comp(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}
