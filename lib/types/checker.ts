type Arg = unknown;

export const TypeOf = Object.freeze({
    /**
     * Checks if the given argument is an array.
     * @param arg The argument to check.
     * @returns True if the argument is an array, false otherwise.
     */
    isArray(arg: Arg): boolean {
        return Array.isArray(arg);
    },

    /**
     * Checks if the given argument is a plain object.
     * @param arg The argument to check.
     * @returns True if the argument is a plain object, false otherwise.
     */
    isObject(arg: Arg): boolean {
        return typeof arg === 'object' && arg !== null && !Array.isArray(arg) && !(arg instanceof Date) && !(arg instanceof Error) && Object.getPrototypeOf(arg) === Object.prototype;
    },

    /**
     * Checks if the given argument is a number.
     * @param arg The argument to check.
     * @returns True if the argument is a number, false otherwise.
     */
    isNumber(arg: Arg): boolean {
        return typeof arg === 'number' && !isNaN(arg as number);
    },

    /**
     * Checks if the given argument is an integer.
     * @param arg The argument to check.
     * @returns True if the argument is an integer, false otherwise.
     */
    isInt(arg: Arg): boolean {
        return Number.isInteger(arg as number);
    },

    /**
     * Checks if the given argument is a BigInt.
     * @param arg The argument to check.
     * @returns True if the argument is a BigInt, false otherwise.
     */
    isBigInt(arg: Arg): boolean {
        return typeof arg === 'bigint';
    },

    /**
     * Checks if the given argument is an error object.
     * @param arg The argument to check.
     * @returns True if the argument is an error object, false otherwise.
     */
    isError(arg: Arg): boolean {
        return arg instanceof Error;
    },

    /**
     * Checks if the given argument is a string.
     * @param arg The argument to check.
     * @returns True if the argument is a string, false otherwise.
     */
    isString(arg: Arg): boolean {
        return typeof arg === 'string' || arg instanceof String;
    },

    /**
     * Checks if the given argument is a boolean.
     * @param arg The argument to check.
     * @returns True if the argument is a boolean, false otherwise.
     */
    isBoolean(arg: Arg): boolean {
        return typeof arg === 'boolean' || arg instanceof Boolean;
    },

    /**
     * Checks if the given argument is null.
     * @param arg The argument to check.
     * @returns True if the argument is null, false otherwise.
     */
    isNull(arg: Arg): boolean {
        return arg === null;
    },

    /**
     * Checks if the given argument is undefined.
     * @param arg The argument to check.
     * @returns True if the argument is undefined, false otherwise.
     */
    isUndefined(arg: Arg): boolean {
        return arg === undefined;
    },

    /**
     * Checks if the given argument is an empty object.
     * @param arg The argument to check.
     * @returns True if the argument is an empty object, false otherwise.
     */
    isEmptyObject(arg: Arg): boolean {
        return this.isObject(arg) && Object.keys(arg as object).length === 0;
    },

    /**
     * Checks if the given argument is an empty array.
     * @param arg The argument to check.
     * @returns True if the argument is an empty array, false otherwise.
     */
    isEmptyArray(arg: Arg): boolean {
        return this.isArray(arg) && (arg as Array<unknown>).length === 0;
    },
});

