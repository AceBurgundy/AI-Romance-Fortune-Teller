/**
 * Selects a random element from the given array based on the current time's decimal part.
 *
 * @param {Array} iterable - The array from which to select a random element.
 * @returns {*} A randomly selected element from the iterable.
 * @throws {Error} If the iterable is empty.
 */
export function random(iterable) {
  if (iterable.length === 0) {
    throw new Error('Cannot choose from an empty array');
  }

  return iterable[Math.floor(Math.random() * iterable.length)];
}
