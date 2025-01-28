const {sortGroceriesList} = require('../controllers/controllerUtils');

describe('sortGroceriesList', () => {
  it('should sort items by the x property in ascending order', () => {
    const input = [
      { id: 1, x: 3 },
      { id: 2, x: 1 },
      { id: 3, x: 2 },
    ];

    const expected = [
      { id: 2, x: 1 },
      { id: 3, x: 2 },
      { id: 1, x: 3 },
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
      { id: 1, x: 3 },
      { id: 2, x: 1 },
      { id: 3, x: 2 },
    ];
    const original = [...input];

    sortGroceriesList(input);

    expect(input).toEqual(original);
  });

  it('should handle an array with one element', () => {
    const input = [{ id: 1, x: 3 }];
    const expected = [{ id: 1, x: 3 }];
    const result = sortGroceriesList(input);

    expect(result).toEqual(expected);
  });
});