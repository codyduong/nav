import { UnionToIntersection } from 'type-fest';

// If T is `any` a union of both side of the condition is returned.
type UnionForAny<T> = T extends never ? 'A' : 'B';

// Returns true if type is any, or false for any other type.
type IsStrictlyAny<T> = UnionToIntersection<UnionForAny<T>> extends never
  ? true
  : false;

// Good enough recursive type... Correctly places all keys at correct depth,
// but is still possible to call keys on the wrong values.
// This is a limitation of the keyof T, which unions all the properties at that depth.
type navNode<T> = IsStrictlyAny<T> extends true
  ? any
  : T extends Array<infer Item>
  ? [number?, ...isNavNodeable<Item>]
  : T extends Record<infer Key, infer Item>
  ? [Key?, ...isNavNodeable<Item>]
  : [];

type isNavNodeable<T> = T extends Array<any>
  ? navNode<T>
  : T extends Record<string, any>
  ? navNode<T>
  : [];

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? undefined
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
  ? I
  : [];

type isReturnNodeableAny<
  O extends
    | Record<string, any>
    | Array<any>
    | ReadonlyArray<any>
    | never
    | undefined
> = O extends Record<string, infer OV> | Readonly<Record<string, infer OV>>
  ? IsStrictlyAny<OV>
  : O extends Array<infer AV> | Readonly<Array<infer AV>>
  ? IsStrictlyAny<AV>
  : IsStrictlyAny<O>;

type IsRestEmpty<Rest> = Rest extends any[]
  ? RemoveFirstFromTuple<Rest> extends {
      length: 0;
    }
    ? true
    : RemoveFirstFromTuple<Rest> extends undefined
    ? true
    : false
  : Exclude<Rest, undefined> extends never
  ? true
  : false;

type NonNullableExtended<O> = IsStrictlyAny<O> extends true
  ? never
  : O extends Record<string, any> | Readonly<Record<string, any>>
  ? {
      -readonly [K in keyof O]: NonNullable<O[K]>;
    }
  : O extends Array<any> | ReadonlyArray<any>
  ? NonNullable<O>
  : NonNullable<O>;

export type navReturnNode<
  O extends Record<string, any> | Array<any> | never,
  Tuple extends ReadonlyArray<any> | undefined,
  Surplus extends Readonly<any> = never
> = isReturnNodeableAny<O> extends true
  ? true
  : isReturnNodeableAny<Tuple> extends true
  ? true
  : Tuple extends
      | [infer First, ...infer Rest]
      | Readonly<[infer First, ...infer Rest]>
  ? First extends keyof O
    ? Rest extends Array<any> | ReadonlyArray<any>
      ? navReturnNode<O[First], Rest, Surplus>
      : O[First]
    : undefined
  : Tuple extends [...infer Rest] | Readonly<[...infer Rest]>
  ? //Handle unioned tuple (ie. ['layer1' | 'layer1b', 1 | 2])
    Rest extends Array<any> | ReadonlyArray<any>
    ? Exclude<Rest[0], undefined> extends keyof O
      ? IsRestEmpty<Rest> extends true
        ? NonNullableExtended<O> | NonNullableExtended<Surplus>
        : navReturnNode<
            O[Exclude<Rest[0], undefined>],
            RemoveFirstFromTuple<Rest>,
            O
          >
      : IsRestEmpty<Rest> extends true
      ? //This is for generic types and non specific
        navReturnNode<
          NonNullableExtended<O> &
            UnionToIntersection<O>[Exclude<Rest[0], undefined>],
          RemoveFirstFromTuple<Rest>,
          O
        >
      : navReturnNode<
          UnionToIntersection<O>[Exclude<Rest[0], undefined>],
          RemoveFirstFromTuple<Rest>,
          O
        >
    : undefined
  : O | NonNullableExtended<Surplus>;

/**
 *
 * @param {Object} [root] The object
 * @param {any[]} [path] A tuple to navigate down the root object, must be readonly for Type Inference
 * @param def Default path to navigate to
 * @returns
 */
export function nav<
  R extends
    | Record<string, any>
    | Array<any>
    | Readonly<Record<string, any>>
    | Readonly<Array<any>> = any,
  I extends Readonly<[...navNode<R>]> = Readonly<[...navNode<R>]>,
  D = any
>(
  root: R,
  path: I,
  def?: D
): navReturnNode<typeof root, Readonly<typeof path>, NonNullable<typeof def>> {
  // """Access a nested object in root by item sequence."""
  try {
    if (root) {
      for (const k of path) {
        //Handle if a user accesses negative numbers
        const accessor: typeof k =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          typeof k == 'number' ? (k < 0 ? root!.length + k : k) : k;

        root = root[accessor];
      }
      if (root === undefined || root === null) {
        return def as any;
      } else {
        return root as any;
      }
    }
  } catch (e) {
    if (
      typeof def !== 'undefined' &&
      (e instanceof ReferenceError || e instanceof TypeError)
    ) {
      return def as any;
    } else {
      throw e;
    }
  }
  return def as any;
}

const navNodeTestObj: navNodeTestObj = {
  matrix: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ],
  nestedObj: {
    nestedObj2a: 'a',
    nestedObj2b: 'b',
    boolean: true,
  },
  objectInArray: [],
};
type navNodeTestObj = {
  matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  nestedObj: {
    nestedObj2a: 'a';
    nestedObj2b: 'b';
    boolean: boolean;
  };
  objectInArray: Array<{ object: { objectChild: 'deep!' } }>;
};
type navNodeTest = navNode<navNodeTestObj>;
const _navNodeTest1: navNodeTest = ['matrix', 1, 2];
const _navNodeTest2: navNodeTest = ['nestedObj', 'nestedObj2a'];
const _navNodeTest3: navNodeTest = [
  'objectInArray',
  1,
  'object',
  'objectChild',
];
const _navNodeTest4 = nav<navNodeTestObj, ['matrix', 1]>(navNodeTestObj, [
  'matrix',
  1,
]);
const _navNodeTest5 = nav(
  navNodeTestObj,
  ['matrix', 1] as const,
  'what' as const
);
const _navNodeTest6 = nav({ foo: 'bar' }, ['foo']);
const foobar = { foo: 'bar' };
const _navNodeTest7 = nav<typeof foobar, ['foo']>({ foo: 'bar' }, ['foo']);
const _navNodeTest8 = nav<typeof foobar, ['foo']>({ foo: 'bar' }, ['foo']);
const foobar2 = {
  foo: 'bar',
  node1: {
    node2: {
      node3: [{ list: true }],
    },
  },
};
const _navNodeTest9 = nav(foobar2, ['node1', 'node2', 'node3'] as const);

type testArray = ['error', 1, 'five'];

export type TupleToPath<Tuple extends any[]> = Tuple extends [
  infer First,
  ...infer Rest
]
  ? First extends string | number
    ? Rest extends Array<string | number>
      ? `${First}${TupleToPath<Rest> extends string | number
          ? `.${TupleToPath<Rest>}`
          : ''}`
      : `${First}`
    : undefined
  : Tuple extends [...infer Rest]
  ? Rest[0]
  : false;

type _testResult = TupleToPath<testArray>;
//type _testResult2 = TupleToPath<navNode<navNodeTestObj>>;
