import { UnionToIntersection } from 'type-fest';

// If T is `any` a union of both side of the condition is returned.
type UnionForAny<T> = T extends never ? 'A' : 'B';

// Returns true if type is any, or false for any other type.
type IsStrictlyAny<T> = UnionToIntersection<UnionForAny<T>> extends never
  ? true
  : false;

type RemoveAnyFromObject<T extends Record<string, any>> = {
  [K in keyof T as IsStrictlyAny<T[K]> extends true ? never : K]: T[K];
};

type navNode<T, Surplus = never> = IsStrictlyAny<T> extends true
  ? any
  : T extends Array<infer Item>
  ? IsStrictlyAny<Item> extends true
    ? [number?]
    : [(number | Surplus)?, ...isNavNodeable<Item>]
  : T extends Record<infer Key, infer Item>
  ? IsStrictlyAny<Item> extends true
    ? navNode<RemoveAnyFromObject<T>, Key> extends never
      ? any[]
      : navNode<RemoveAnyFromObject<T>, Key>
    : {
        [K in keyof T]: [(K | Surplus)?, ...isNavNodeable<T[K]>];
      }[keyof T]
  : [Surplus?];

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
> = IsStrictlyAny<O> extends true
  ? true // : O extends Record<string, infer OV> | Readonly<Record<string, infer OV>> ? IsStrictlyAny<OV>
  : O extends Array<infer AV> | Readonly<Array<infer AV>>
  ? IsStrictlyAny<AV>
  : false;

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
      [K in keyof O]: NonNullable<O[K]>;
    }
  : O extends Array<any> | ReadonlyArray<any>
  ? NonNullable<O>
  : NonNullable<O>;

export type navReturnNode<
  O extends Record<string, any> | Array<any> | never,
  Tuple extends ReadonlyArray<any> | undefined,
  Surplus extends Readonly<any> = never
> = isReturnNodeableAny<O> extends true
  ? any
  : isReturnNodeableAny<Tuple> extends true
  ? any
  : Tuple extends
      | [infer First, ...infer Rest]
      | Readonly<[infer First, ...infer Rest]>
  ? First extends keyof O
    ? Rest extends Array<any> | ReadonlyArray<any>
      ? navReturnNode<O[First], Rest, Surplus> //We don't check empty array here, since we actually check again 1 layer deeper below
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
 * @param {any[]} [path] A tuple to navigate down the root object
 * @param def Default if node is not found
 * @returns
 */
export function nav<
  R extends
    | Record<string, any>
    | Array<any>
    | Readonly<Record<string, any>>
    | Readonly<Array<any>> = any,
  I extends Readonly<navNode<R>> = Readonly<navNode<R>>,
  D = any
>(
  root: R,
  path: I,
  def?: D
): navReturnNode<
  typeof root,
  Readonly<typeof path> | typeof path,
  IsStrictlyAny<D> extends true ? never : D
> {
  // """Access a nested object in root by item sequence."""
  try {
    if (root) {
      for (const k of path) {
        //Handle if a user accesses negative numbers
        const accessor: typeof k =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          typeof k == 'number' ? (k < 0 ? root!.length + k : k) : k;

        // This next line is needed in TS4.6.2 but breaks ts-jest
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore: We'll catch this error anyway, or if not the end user will handle it.
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
