[![Downloads](https://img.shields.io/npm/dm/@codyduong/nav?style=flat-square)](https://www.npmjs.com/package/@codyduong/nav)
[![Code coverage](https://img.shields.io/codecov/c/github/codyduong/nav?style=flat-square)](https://codecov.io/gh/codyduong/nav)
[![Latest release](https://img.shields.io/github/v/release/codyduong/nav?style=flat-square)](https://github.com/codyduong/nav/releases)
[![Commits since latest release](https://img.shields.io/github/commits-since/codyduong/nav/latest?style=flat-square)](https://github.com/codyduong/nav/releases)
# Nav
A navigation utility for parsing API responses.

Written in TypeScript with strong inference engine. Handles all your data for you.

## Install
| npm  | yarn |
| ------------- | ------------- |
| `npm install @codyduong/nav`  | `yarn add @codyduong/nav` |

```typescript
import { nav } from '@codyduong/nav';
```

## Usage
```typescript
nav(root, tuplePath, default) 
```
* root - an Object to navigate through
* tuplePath - a tuple containing keys to navigate through the object with
* default - the default value to return if encountering an undefined/null value

## Patterns
API Response
```typescript
type foobarAPIReturn = Promise<{
  foo: 'bar';
  array: {
    name: `name_${string}`
    id: `ID_ABXDe_${string}`
  }[]
}>;
const foobar: foobarAPIReturn = await foobarAPI();
const results = nav(foobar, ['foo'] as const); //=> 'bar'
const foobarList = nav(foobar, ['array'] as const); //=> { name: `name_${string}`, id: `ID_ABXDe_${string}` }[]
```

## Anti-Patterns
Highly recommended to always declare the object, path, and default with `as const` or explicitly type, 
this will prevent any short circuiting or narrowing logic done by TypeScript intepreter.
```typescript
// ❌ This will work and type correctly sometimes, but will fail on larger and more complex objects, see below
nav({ foo: 'bar'}, ['foo']) //=> string

// ❌ If path is not asserted with `as const` it can fail on arrays since it short circuits to the path to (string | number)[]
const path = ['foo', 0, 'bar']
nav({ foo: [ { bar: true } ] }, ['foo', 0, 'bar']) // => { bar: boolean; }[] | { bar: boolean; }
nav({ foo: [ { bar: true } ] }, path) // <= Path! Argument of type '(string | number)[]' is not assignable to parameter of type...

// ✔️ Always assert the object and path.
const path = ['foo', 0, 'bar'] as const
nav({ foo: [ { bar: true } ] } as const, path) //=> true
nav({ foo: [ { bar: 'foobar' } ] } as const, path) //=> 'foobar'

// ✔️ Or explicitly type the object and path
type foobar = { foo: [{ bar: true }] };
type path = ['foo', 0, 'bar']
const foobar: foobar = await foobarAPI(...)
const path: path = ['foo', 0, 'bar']
nav(foobar, path) //=> true

// 🆗 Or use the built in generics (while acceptable is also extra verbose)
type foobar = { foo: [{ bar: true }] };
nav<foobar, ['foo', 0, 'bar']>(foobar, ['foo', 0, 'bar']) //=> true

// 🆗 It is OK to not assert the object, but it will be less narrow than possible
nav({ foo: 'bar' }, ['foo'] as const) //=> string
```

## Idiosyncrasies
Q: Why do we have to `as const`?<br>
A: Read more on const assertion in this [TS 3.4 Release](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) or in this [StackOverflow answer](https://stackoverflow.com/a/66993654/17954209). In short, the TS intepreter uses this to narrow types down from type `string` to something narrower such as `foobar`. It also automatically narrows objects/tuples. Since the path parameter is a tuple, we can't afford narrowing this type, otherwise it will blow up the inference engine.

## Contributing
Any contributing is welcome.
