import { describe, expect, it } from 'vitest';
import { shuffle } from 'lib/array/shuffle';
import { chunk } from 'lib/array/chunk';

describe('shuffle', () => {
  it('should shuffle an array of numbers', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffledArray = shuffle([...array]);

    expect(shuffledArray).toHaveLength(array.length);
    expect(shuffledArray).not.toEqual(array);
    expect(shuffledArray.sort()).toEqual(array.sort());
  });

  it('should shuffle an array of strings', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const shuffledArray = shuffle([...array]);

    expect(shuffledArray).toHaveLength(array.length);
    expect(shuffledArray).not.toEqual(array);
    expect(shuffledArray.sort()).toEqual(array.sort());
  });

  it('should handle an empty array', () => {
    const array: number[] = [];
    const shuffledArray = shuffle([...array]);
    expect(shuffledArray).toEqual([]);
  });

  it('should handle an array with one element', () => {
    const array = [1];
    const shuffledArray = shuffle([...array]);
    expect(shuffledArray).toEqual([1]);
  });
});

describe('chunk', () => {
  it('should chunk an array into smaller arrays of the specified size', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8];
    const chunkSize = 3;
    const result = chunk(array, chunkSize);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
  });

  it('should handle a chunk size larger than the array length', () => {
    const array = [1, 2, 3, 4, 5];
    const chunkSize = 10;
    const result = chunk(array, chunkSize);
    expect(result).toEqual([[1, 2, 3, 4, 5]]);
  });

  it('should handle an array with a length that is a multiple of the chunk size', () => {
    const array = [1, 2, 3, 4, 5, 6];
    const chunkSize = 2;
    const result = chunk(array, chunkSize);
    expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('should handle an empty array', () => {
    const array: number[] = [];
    const chunkSize = 3;
    const result = chunk(array, chunkSize);
    expect(result).toEqual([]);
  });

  it('should throw an error if the chunk size is zero', () => {
    const array = [1, 2, 3, 4, 5];
    const chunkSize = 0;
    expect(() => chunk(array, chunkSize)).toThrowError("Size must be a positive number.");
  });

  it('should throw an error if the chunk size is negative', () => {
    const array = [1, 2, 3, 4, 5];
    const chunkSize = -1;
    expect(() => chunk(array, chunkSize)).toThrowError("Size must be a positive number.");
  });
});

