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

## Usage
```typescript
nav(root, tuplePath, default) 
```
* root - an Object to navigate through
* tuplePath - a tuple containing keys to navigate through the object with
* default - the default value to return if encountering an undefined/null value

```typescript
import {nav} from '@codyduong/nav';

const foobar = { foo: 'bar' }
const foobarAsserted = { foo: 'bar' } as const

// Regular parameters can't gurantee the narrowest type
nav({ foo: 'bar' }, ['foo']) //=> string
nav({ foo: 'bar' }, ['foo'], true) //=> string | boolean

// Const assertioned object/default parameters will return the narrowest types.
nav({ foo: 'bar' } as const, ['foo'] as const) //=> 'bar'
nav(foobarAsserted as const, ['foo'] as const) //=> 'bar'
nav(foobarAsserted, ['foo'] as const, true as const) //=> 'bar' | true

// The tuple path is the only parameter that is narrowed that can
// be automatically narrowed by the library. This is a unique result of tuple implemntation in TS.
// But it is recommended to stick to asserting to the tuple path, see below example
nav(foobarAsserted, ['foo'], true as const) //=> 'bar' | true

// However! This is currently broken on navigating through arrays/tuples
nav({ foo: [ { bar: true } ] } as const, ['foo', 0, 'bar']) //=> undefined
nav({ foo: [ { bar: true } ] } as const, ['foo', 0, 'bar'] as const) //=> true
```

## Idiosyncrasies
Q: Why do we have to `as const`?<br>
A: Read more on const assertion in this [TS 3.4 Release](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) or in this [StackOverflow answer](https://stackoverflow.com/a/66993654/17954209). In short, the TS intepreter uses this to narrow types down from type `string` to something narrower such as `foobar`

Q: Why does the tuple not have to be type assertioned?<br>
A: This is because the tuple is the only type that is dependent on another type, instead derived from the keys of the object.

## Contributing
Any contributing is welcome.
