/**
 * Splits an array into chunks of a specified size.
 * @template T - The type of elements in the input array.
 * @param array - The input array to be chunked.
 * @param size - The size of each chunk (must be greater than 0).
 * @returns A new array containing the chunks.
 * @throws {Error} If the size is not a positive number.
 */
export function chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) {
        throw new Error("Size must be a positive number.");
    }

    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

