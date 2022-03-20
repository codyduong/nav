import { nav } from '../src/index';

const Bar = 'bar' as const;
const Root = {
  foo: {
    bar: Bar,
  },
  matrix: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ],
  objectInArray: [
    {
      foo: 'bar',
    },
  ],
  undefined: undefined,
  null: null,
  falsyBoolean: false,
  falsyString: '',
  falsyNumber: 0,
} as const;

describe('Navigation', () => {
  test('Simple Nav #1', () => {
    expect(nav(Root, ['foo'] as const)).toStrictEqual({ bar: Bar } as const);
  });
  test('Simple Nav #2', () => {
    expect(nav(Root, ['foo', 'bar'] as const)).toStrictEqual('bar' as const);
  });
  test('Matrix', () => {
    expect(nav(Root, ['matrix'] as const)).toStrictEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ] as const);
  });
  test('Matrix Row', () => {
    expect(nav(Root, ['matrix', 0] as const)).toStrictEqual([1, 2, 3] as const);
  });
  test('Matrix Element', () => {
    expect(nav(Root, ['matrix', 0, 0])).toStrictEqual(1 as const);
  });
  test('Object Array', () => {
    expect(nav(Root, ['objectInArray', 0, 'foo'])).toStrictEqual(
      'bar' as const
    );
  });
  test('Default Nonexistent', () => {
    expect(
      nav<typeof Root, any>(Root, ['foobar'] as const, 'fubar' as const)
    ).toBe('fubar');
  });
  test('Undefined Default', () => {
    expect(nav(Root, ['undefined'] as const, 'fubar' as const)).toBe('fubar');
  });
  test('Null Default', () => {
    expect(nav(Root, ['null'] as const, 'fubar' as const)).toBe('fubar');
  });
  test('Boolean Falsy Handling', () => {
    expect(nav(Root, ['falsyBoolean'] as const, 'fubar' as const)).toBe(false);
  });
  test('String Falsy Handling', () => {
    expect(nav(Root, ['falsyString'] as const, 'fubar' as const)).toBe('');
  });
  test('Number Falsy Handling', () => {
    expect(nav(Root, ['falsyNumber'] as const, 'fubar' as const)).toBe(0);
  });
  test('Deep Accessor into Undefined Key/Value', () => {
    expect(nav(Root, ['undefined', 'null'] as any, 'fubar' as const)).toBe(
      'fubar'
    );
  });
  test('Deep Accessor into Undefined Key/Value w/ Error', () => {
    try {
      nav(Root, ['undefined', 'null'] as any);
    } catch (e) {
      expect(e instanceof TypeError).toBe(true);
    }
  });
  test('Undefined Root', () => {
    expect(nav(undefined, ['undefined', 'null'] as const)).toBe(undefined);
  });
});
