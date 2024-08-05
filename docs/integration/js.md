---
title: Using MF2 with JavaScript
sidebar_title: JavaScript
---

The following guide explains how to use the `mf2-messageformat` package to format MF2 messages.
For full API documentation, see the [API documentation site](https://messageformat.github.io/messageformat/api/messageformat/)
for the package. This guide shows the simplest use cases for the API.
More advanced uses are possible, which are documented in the API documentation.

## Installation and setup

Install/add the package to your project. If you're using Node.js with npm, you can do this by running

```sh
npm install --save-exact messageformat@next
```

or use the corresponding operation for your preferred package manager. For instance, for Deno projects, you can run

```sh
deno add npm:messageformat@next
```

once that's done, you can import the contructor in your code like

```js
import { MessageFormat } from 'messageformat';
```

## The `MessageFormat` class

The main class for formatting messages is `MessageFormat`.
The class has two methods you are likely to call:
`format()` and `formatToParts()`.

### The `MessageFormat` constructor

The constructor takes a message string and one or more locales. Example:

```js
const mf = new MessageFormat("Hello {$user}", ["en", "fr"]);
```

`mf` is now a message formatter object that can be re-used to format the same
message with different arguments.

The constructor has an optional third argument,
which can be used to specify custom functions (not covered in this document). The [full documentation](https://messageformat.github.io/messageformat/api/messageformat.messageformat._constructor_/) covers
custom functions.

### The `format()` method

The `format()` method formats the message formatter's message as a string.
Example:

```js
const mf = new MessageFormat("Hello {$user}", "en");
const result = mf.format({"user": "Bob"});
// result === "Hello Bob"
```

The first argument to `format()` is an object that specifies values
for any external variables mentioned in the message.

`format()` has an optional second argument, which is used
for reporting errors.

```js
const mf = new MessageFormat("Hello {$user}", "en");
const result = mf.format({"us3r": "Bob"}, (error) => console.log(error.type));
// result === "Hello {$user}"
// Logs the string "unresolved-var" to the console
```

Messages can contain errors. In this case, `format()` returns a best-effort
result: in this case, `"Hello {$user}"`, because no value was given for `"user"`.
Passing in a callback gives the caller a way to check for errors.
In this case, the error is an "unresolved variable" error.
In this example, the error handling callback just logs
the type of the error, for brevity. The full error could
also be logged. The `MessageError` class defines
the structure of errors:
see [the API documentation](https://messageformat.github.io/messageformat/api/messageformat.messageerror/).

### The `formatToParts()` method

The `formatToParts()` method is useful
when different pieces of the formatted message need to be
extracted and processed separately. It avoids the need to re-parse
the formatted string, which is useful for frameworks like React where
you might want to preprocess the formatted result before
rendering it.

Example:

```js
const mf = new MessageFormat("{#b}Hello {$user}{/b}", "en");
const result = mf.formatToParts({"user": "Bob"});
}
```

Unlike with `format()`, `result` is an array of `MessagePart`s.
In this case, it looks like:

```js
[
  { type: 'markup', kind: 'open', source: '#b', name: 'b' },
  { type: 'literal', value: 'Hello ' },
  { type: 'string', source: '$user', locale: 'en', value: 'Bob' },
  { type: 'markup', kind: 'close', source: '/b', name: 'b' }
]
```

Each part is the formatted representation of one of the parts
of the source message.

In this case, there are four parts, representing:
1. The opening `b` markup placeholder.
2. The literal part "Hello ", which appeared literally in the source message.
3. The expression part, representing an expression in the source message (`$user`)
   along with its formatted value, `"Bob"`.
4. The closing `b` markup placeholder.

As with `format()`, `formatToParts()` can take an optional error callback
as its second argument.

## The `MessagePart` type

MessagePart is defined as follows ([full documentation](https://messageformat.github.io/messageformat/api/messageformat.messagepart/)):

```ts
export type MessagePart = MessageExpressionPart | MessageLiteralPart | MessageMarkupClosePart | MessageMarkupPart;
```

In the `formatToParts()` example, part 1 is a `MessageMarkupPart`;
part 2 is a `MessageLiteralPart`; part 3 is a `MessageExpressionPart`;
and part 4 is a `MessageMarkupClosePart`.

### The `MessageMarkupPart` interface

A `MessageMarkupPart` has `'markup'` as its `type` property.
Its other properties are:
* `kind`: Either `"open"` (like `{#b}`) or `"standalone"` (like `{#b/}`).
* `name`: The name of the markup placeholder (`"b"` in the example).
* `source`: A string representation of the source markup placeholder.
* `options`: The formatted options of this markup placeholder
  (an advanced feature).

### The `MessageMarkupClosePart` interface

Same as `MessageMarkupPart`, but `kind` is always `"close"`.

### The `MessageLiteralPart` interface

The `type` property is `'literal'`.
It has one other property, `value`. For literal parts,
the source representation and the formatted value are identical
to each other.

### The `MessageExpressionPart` interface

The `type` property is a string representation
of the type of this expression. In the above example,
it's `'string'`, because the runtime value of `{$user}`
is a string (a string value was provided for the value
of the external variable `$user`.)

The other properties are `source` (as with `MessageMarkupPart`)
and `value` (as with `MessageLiteralPart`).
Since an expression's contents vary depending on input,
`source` and `value` are usually different from each other.

See the full [MessageExpressionPart](https://messageformat.github.io/messageformat/api/messageformat.messageexpressionpart/)
documentation for more.
