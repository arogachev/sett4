# sett4

Sum of numbers stored as strings.

## Features

- Support of numbers in decimal numeral system
- Support of integer and float numbers
- Support of negative numbers
- Support of big numbers (> `Number.MAX_SAFE_INTEGER`)

## Example

```js
const sum = require('./index')
console.log(sum('1.2', '-2.3')) // Outputs "-1.1"
```

## Running tests

```
npm install
npm test
```
