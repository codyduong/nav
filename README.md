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
Returns default when it encounters an error (nonexistent node) or undefined.

```typescript
import {nav} from '@codyduong/nav';

const foobar = {
  foo: 'bar',
  node1: {
    node2: {
      node3: [{ list: true }],
    },
  },
} as const;

nav(foobar, ['foo'] as const) //=> string
nav(foobar, ['foo'] as const, true) //=> string | boolean
nav(foobar, ['foo'] as const, true as const) //=> string | true

nav({ foo: 'bar' } as const, ['foo'] as const) //=> 'bar'

nav(foobar, ['node1', 'node2', 'node3'] as const) //=> {list: boolean}[]
nav(foobar, ['node1', 'node2', 'node3', 0] as const) //=> {list: boolean}

//Workaround for non frozen object/tuple
nav<typeof foobar, ['foo']>(foobar as const, ['foo']) //=> string

// Incorrect Usage ❌

nav({ foo: 'bar' }, ['foo']) //=> { foo: 'bar' }
//This will actually return 'bar' but will be typed incorrectly.
// Due to TS inference engine, we can't parse down the object tree
// if the tuple is not readonly, alternatively use the workaround syntax.



```
We require the tuple path be frozen in order for TS engine to gurantee the navigation path.
IE. this utility works very poorly with dynamic tuples, or if you do use dynamic pathing, instead opt to seperate or freeze at
certain points in your codebase.

A frozen object is not necessary, but if it is frozen, we will be more able to gurantee the end type more specifically. 

## Contributing
Any contributing is welcome.
