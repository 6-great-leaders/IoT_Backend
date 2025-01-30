const {sortGroceriesList} = require('../controllers/controllerUtils');

describe('sortGroceriesList', () => {
    it('should sort items by the y property in ascending order', () => {
        const input = [
            { id: 1, y: 3 },
            { id: 2, y: 1 },
            { id: 3, y: 2 },
        ];

        const expected = [
            { id: 2, y: 1 },
            { id: 3, y: 2 },
            { id: 1, y: 3 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an empty array', () => {
        const input = [];
        const expected = [];
        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should not mutate the original array', () => {
        const input = [
            { id: 1, y: 3 },
            { id: 2, y: 1 },
            { id: 3, y: 2 },
        ];
        const original = [...input];

        sortGroceriesList(input);

        expect(input).toEqual(original);
    });

    it('should handle an array with one element', () => {
        const input = [{ id: 1, y: 3 }];
        const expected = [{ id: 1, y: 3 }];
        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with negative y values', () => {
        const input = [
            { id: 1, y: -3 },
            { id: 2, y: -1 },
            { id: 3, y: -2 },
        ];

        const expected = [
            { id: 1, y: -3 },
            { id: 3, y: -2 },
            { id: 2, y: -1 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with duplicate y values', () => {
        const input = [
            { id: 1, y: 3 },
            { id: 2, y: 1 },
            { id: 3, y: 3 },
        ];

        const expected = [
            { id: 2, y: 1 },
            { id: 1, y: 3 },
            { id: 3, y: 3 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with all elements having the same y value', () => {
        const input = [
            { id: 1, y: 2 },
            { id: 2, y: 2 },
            { id: 3, y: 2 },
        ];

        const expected = [
            { id: 1, y: 2 },
            { id: 2, y: 2 },
            { id: 3, y: 2 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with large y values', () => {
        const input = [
            { id: 1, y: 1000000 },
            { id: 2, y: 500000 },
            { id: 3, y: 1000001 },
        ];

        const expected = [
            { id: 2, y: 500000 },
            { id: 1, y: 1000000 },
            { id: 3, y: 1000001 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with floating point y values', () => {
        const input = [
            { id: 1, y: 3.1 },
            { id: 2, y: 1.5 },
            { id: 3, y: 2.8 },
        ];

        const expected = [
            { id: 2, y: 1.5 },
            { id: 3, y: 2.8 },
            { id: 1, y: 3.1 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with mixed positive and negative y values', () => {
        const input = [
            { id: 1, y: -3 },
            { id: 2, y: 1 },
            { id: 3, y: -2 },
        ];

        const expected = [
            { id: 1, y: -3 },
            { id: 3, y: -2 },
            { id: 2, y: 1 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with zero y values', () => {
        const input = [
            { id: 1, y: 0 },
            { id: 2, y: 1 },
            { id: 3, y: -1 },
        ];

        const expected = [
            { id: 3, y: -1 },
            { id: 1, y: 0 },
            { id: 2, y: 1 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with very small y values', () => {
        const input = [
            { id: 1, y: 0.000001 },
            { id: 2, y: 0.0000001 },
            { id: 3, y: 0.00001 },
        ];

        const expected = [
            { id: 2, y: 0.0000001 },
            { id: 1, y: 0.000001 },
            { id: 3, y: 0.00001 },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with string y values', () => {
        const input = [
            { id: 1, y: '3' },
            { id: 2, y: '1' },
            { id: 3, y: '2' },
        ];

        const expected = [
            { id: 2, y: '1' },
            { id: 3, y: '2' },
            { id: 1, y: '3' },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });

    it('should handle an array with mixed string and number y values', () => {
        const input = [
            { id: 1, y: '3' },
            { id: 2, y: 1 },
            { id: 3, y: '2' },
        ];

        const expected = [
            { id: 2, y: 1 },
            { id: 3, y: '2' },
            { id: 1, y: '3' },
        ];

        const result = sortGroceriesList(input);

        expect(result).toEqual(expected);
    });
});