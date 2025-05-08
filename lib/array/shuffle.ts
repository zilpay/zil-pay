/**
 * Shuffles the elements of an array in place using the Fisher-Yates algorithm.
 * @template T - The type of elements in the array.
 * @param array - The array to shuffle.
 */
export function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

