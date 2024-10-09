---
title: Functions
description: Function annotations enable dynamically executing code from a message to format values, or retrieve environment information.
---

When you write an annotation in your MessageFormat message, then underneath the hood, the formatter calls a function. These could either be built-in functions that aim to assist you in performing common i18n operations like formatting common data types or custom functions that are registered by the user in the function registry. The syntax for annotations is as follows, with the operand followed by the function name and finally the options.

<mf2-interactive>

```mf2
Today is {$date :datetime weekday=long}.

```

```json
{"date": "2024-06-06"}
```

</mf2-interactive>

The annotation `{$date :datetime weekday=long}` can be read as:
"Take the value of the variable `$date` and format it as a date,
using the `long` format for the weekday part of the date."
If `:datetime` is passed something that can't be parsed as a date,
a formatting error occurs:

<mf2-interactive>

```mf2
Today is {$date :datetime weekday=long}.

```

```json
{"date": "foo"}
```

</mf2-interactive>

This error message is telling you that the string "foo"
is not a valid date.

The set of meaningful options and their values is specific to
each function, as is the rule for determining which operands
are valid.

There are two types of functions: formatting functions (formatters) and selector functions.
The same function can be both a formatter and selector: for example, the built-in
`:number` function.

## Formatting functions

A formatting function takes an operand and produces a value from it.
This value can either be formatted immediately, as when using the
result in a pattern (like in the `:datetime` example above), or it
can be named and referred to in other expressions. For example:

<mf2-interactive>

```mf2
.local $date1 = {$date :datetime weekday=long}
{{Today is {$date1}.}}

```

```json
{"date": "2024-06-06"}
```

</mf2-interactive>

It would be equivalent to write:

<mf2-interactive>

```mf2
.input {$date :datetime weekday=long}
{{Today is {$date}.}}

```

```json
{"date": "2024-06-06"}
```

</mf2-interactive>


## Selector functions

Selector functions are used to customize the behavior of a matcher.
The `:string` and `:number` selector functions are built in,
but you can also write your own custom selector functions.
To understand how selectors work, look at this example:

<mf2-interactive>

```mf2
.match {foo :string}
foo  {{Foo}}
bar  {{Bar}}
*    {{No match}}

```

</mf2-interactive>

In the annotation `{foo :string}`, the operand is the literal `foo`.
Underneath the hood, the `string` function is passed in both its
operand, and a list of the keys for all the variants:
in this case, `[foo, bar]`.
It returns a list of keys sorted by preference. `string` does
exact matching, so in this case it would only return `[foo]`.
The key `*` is special and is used when the selector doesn't
return any matching keys.

## Built-in functions

### The `number` and `integer` functions

The `number` and `integer` functions both format and select on
numbers, including literals (strings) that can be parsed as numbers.
The `integer` function treats its operand as an integer,
for example:

<mf2-interactive>

```mf2
{3.14 :integer}

```
</mf2-interactive>

The formatted result when annotating `3.14` with `:integer` is `3`.
Otherwise, `number` and `integer` behave similarly.

#### Number formatting

The `number` function has many different options to control
formatting, some of which also work for `integer`. The full list
is in [the specification](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#options-1).
The following example shows how some of the options work.

<mf2-interactive>

```mf2
.local $n1 = {$num :number notation=scientific minimumSignificantDigits=5}
.local $n2 = {$num :number style=percent}
.local $n3 = {$num :number minimumIntegerDigits=4 minimumFractionDigits=4}
.local $n4 = {$num :number maximumSignificantDigits=6}
{{The number in scientific notation is {$n1}. As a percentage, it's {$n2}.
Formatted with at least four integer digits and four fractional digits, it's
{$n3}. Formatted with at most six significant digits, it's {$n4}.}}
```

```json
{ "num": 3.1415927 }
```

</mf2-interactive>

For the most part, these options can be combined arbitrarily.

#### Number selection

When used as a selector in a `.match`,
the default behavior of `number` is to find the CLDR plural
category of the operand, and compare the variants against that
category. This behavior can be customized using options.

Revisiting the Czech example from the quick start guide:

<mf2-interactive locale="cs-CZ">

```mf2
.match {$numDays :number}
one  {{{$numDays} den}}
few  {{{$numDays} dny}}
many {{{$numDays} dne}}
*    {{{$numDays} dní}}
```

```json
{ "numDays": 2 }
```

</mf2-interactive>

Notice that the value of the operand `$numDays` is 2, but
it matches with the key `few`. The `number` function uses
CLDR data for the `cs-CZ` locale to determine that
the plural category of 2 is "few".

However, `number` can also do exact matching:

<mf2-interactive locale="cs-CZ">

```mf2
.match {$numDays :number select=exact}
one  {{{$numDays} den}}
few  {{{$numDays} dny}}
many {{{$numDays} dne}}
*    {{{$numDays} dní}}
```

```json
{ "numDays": 2 }
```

</mf2-interactive>

With this option, since "2" is not literally equal to any
of the other keys, the `*` variant matches.

### The `string` function

The `string` function is both a selector and a formatter function.
It works on strings and on any operands that can be converted
to a string.

#### String selection

When used as a selector, `string` matches strings exactly.

<mf2-interactive>

```mf2
.match {$operand :string}
1    {{Number 1}}
one  {{String "one"}}
*    {{Something else}}

```

```json
{"operand": "1"}
```
</mf2-interactive>

This may not seem very useful, but anything used as a selector in
a `.match` must have an annotation, so `string` can be used to
express your intention to match on a value exactly.

#### String formatting

When used as a formatter, `string` returns a string representation
of its operand.

<mf2-interactive>

```mf2
{$operand :string}
```

```json
{"operand": {"name": "days", "value": 5}}
```
</mf2-interactive>

The exact details of how to stringify an operand are
implementation-dependent, as you can see in this example.

### The `date`, `time`, and `datetime` functions

The `date`, `time`, and `datetime` functions are formatting functions
that format dates. `date` is a version of `datetime` that ignores the
time component of a date, while `time` is a version of `datetime`
that ignores the date component.

<mf2-interactive>

```mf2
Today is {$date :datetime weekday=long}.
The time is {$date :time style=full}.
The date is {$date :date style=short}.
```

```json
{"date": "2006-01-02T15:04:06"}
```

</mf2-interactive>

If supplied as a string, the operand has to be in ISO 8601 format,
followed by an optional timezone offset. Some implementations may
also accept other date types, such as an integer timestamp:

<mf2-interactive>

```mf2
Today is {$date :datetime weekday=long}.
The time is {$date :time style=full}.
The date is {$date :date style=short}.
```

```json
{"date": 1722746637000 }
```

</mf2-interactive>

`datetime` has two kinds of options: style options and field options.
In the above example, `weekday` is an example of a field option.
There are also field options for each part of a date/time.
Their meanings are implementation-dependent. The names of all the
options can be found in the [spec](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#field-options).
The style options are either `dateStyle` or `timeStyle`, whose values
can be `full`, `long`, `medium`, or `short`. The meaning of these
values is also implementation-dependent.

<mf2-interactive>

```mf2
Today is {$date :datetime dateStyle=full timeStyle=long}.
Or: today is {$date :datetime dateStyle=long timeStyle=short}.
Or: today is {$date :datetime dateStyle=medium timeStyle=full}.
Or: today is {$date :datetime dateStyle=short}.
Or: today is {$date :datetime timeStyle=medium}.
```

```json
{"date": "2006-01-02T15:04:06"}
```

</mf2-interactive>

`date` and `time` both only have one option: `style`. The values
are the same as for `:datetime`.

<mf2-interactive>

```mf2
Today is {$date :date style=full}.
Or: today is {$date :date style=short}.
The time is {$date :time style=medium}.
Or: the time is {$date :time style=long}.
```

```json
{"date": "2006-01-02T15:04:06"}
```

</mf2-interactive>


## Custom functions

Here are some examples of what you can do with custom functions.
The examples are not interactive, because the playground doesn't
currently support supplying a custom function registry.
The details on how to write and register these functions are
implementation-dependent.

### Examples: custom formatters

#### Text transformations

A custom formatter function could stringify its argument
and apply a text transformation to it, like converting it to
uppercase:

```mf2
Check out {MessageFormat :uppercase}.
```

Result: `Check out MESSAGEFORMAT`

#### List formatting

In an implementation with a list type (such as the JavaScript
implementation), a custom formatter function could format lists:

```mf2
I know how to program in {$languages :list type=AND}
```

Parameters: `{"languages": ["JavaScript", "C++", "Python"]}`

Result: `I know how to program in JavaScript, C++, and Python`

### Examples: custom selectors

#### Selecting a field

In an implementation with an object type (such as the JavaScript
implementation), custom selectors could extract a field from
an operand and match on that:

```mf2
.match {$person :pronoun}
he {{{$person :name} won his game}}
she {{{$person :name} won her game}}
they {{{$person :name} won their game}}
* {{{$person :name} won the game}}
```

Parameters: `{"person": { "name": "Alice", "pronoun": "she", "age": 42 } }`

Result: `Alice won her game`

In this example, `pronoun` is a custom selector that extracts the
`pronoun` field from its operand if supplied an object, and
matches it against keys
`name` is a custom formatter that extracts and formats a `name`
field from its operand.

#### Range matching

```mf2
.match {$name :range}
|A-J| {{{$name} is in the first group}}
|J-P| {{{$name} is in the second group}}
|Q-Z| {{{$name} is in the third group}}
*     {{Should be unreachable}}
```

Parameters: `{"name": "Kim"}`

Result: `Kim is in the second group`

In this example, `range` is a custom selector that compares
the first letter of its string operand against alphabetic ranges.
It could be extended to support things like time and date ranges.
