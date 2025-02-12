/**
 * Selects a random element from the given array based on the current time's decimal part.
 *
 * @param {Array} iterable - The array from which to select a random element.
 * @returns {*} A randomly selected element from the iterable.
 * @throws {Error} If the iterable is empty.
 */
export function random(iterable) {
  if (iterable.length === 0) {
    throw new Error("Cannot choose from an empty array");
  }

  const time = (Date.now() / 1000).toString(); // Get current time in seconds
  const decimal = time.split(".")[1] || ""; // Extract decimal part

  for (let iteration = decimal.length - 1; iteration >= 0; iteration--) {
    const index = parseInt(decimal[iteration], 10);

    if (index < iterable.length) {
      return iterable[index];
    }
  }

  return iterable[0]; // Fallback if all digits are too high
}