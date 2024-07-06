---
title: Quick Start
description: Get started with the basics of MessageFormat 2.
---

MessageFormat 2.0 is designed to enable localization of dynamic messages across
different human languages. This page walks through the syntax of Message Format
2 messages, giving an overview of what Message Format 2 is capable of.

To use Message Format 2.0 in a project, follow these guides to set up Message
Format 2:

- [JavaScript/Typescript](/docs/integration/js)
- [Java](/docs/integration/java)
- [C](/docs/integration/c)
- [C++](/docs/integration/cpp)

> Good to know: you can write Message Format 2 messages once, and re-use them
> across different applications, written in different programming languages.

## Basic Syntax

### Text

A simple message is just plain text. All Unicode characters can be used in text.
The only special characters are curly braces `{}` — they need to be escaped.
Messages can also not start with the `.` character.

```mf2
Hello, World!
```

### Escapes

Escape special characters with a backslash `\`. In text, only curly braces need
to be escaped. In literal quotes, `|` may also be escaped.

```mf2
Curly braces: \{ and \}
```

## Placeholders

Placeholders are used to dynamically insert values into messages. Placeholders
are enclosed in curly braces `{}`.

To insert a variable into a message, use the variable name inside curly braces,
preceded by a dollar sign `$`.

```mf2
Hello, {$name}!
```

The values for variables are provided by the invoker of the message. They could
be numbers, strings, dates, or even lists.

## Functions

How placeholders behave can be modified with functions. Functions are prefixed
with a colon `:`. Functions are often used to format values in particular ways.

```mf2
It is the {$today :datetime} today.
```

Message Format 2 has multiple built in functions. These allow you, for example,
to format numbers in a locale appropriate way. See the
[full list of built-in functions](/docs/reference/functions/).

### Function Options

Functions can have options (arguments). Options are key-value pairs separated by
an equal sign `=`. Options are separated by spaces.

```mf2
You have {$today :datetime dateStyle=long} items.
```

Options can be used to modify the behaviour of functions, for example changing
whether time formatting should use AM/PM, or the 24 hour clock.

## Literals

In addition to variables, placeholders can contain literals. Literals are also
used as the values of options. Literals can be text or numbers.

### Number

Number literals can represent any integer or decimal number at arbitrary
precision.

```mf2
I eat {1.5} bananas.
```

Number literals are often useful when combined with the built-in `:number` or
`:integer` functions, enabling formatting in a locale aware way:

```mf2
The total was {0.5 :number style=percent}.
```

Decimals, and scientific notation are also supported in number literals:

```
{1.3e-10 :number notation=engineering}
```

### Unquoted Text

Unquoted text literals are simple strings. They can contain all characters
except whitespace or special characters.

```mf2
Hello, {world}!
```

This is most often useful when passing a simple string as the value to a
function option - here it is `h12`:

```mf2
It is {$now :datetime hourCycle=h12}
```

> There is no boolean literal in Message Format 2. Options with boolean values
> usually use the text literals `true` and `false` to represent the two boolean
> states.

### Quoted Text

Text literals that need to contain spaces or special characters like `{` or `@`
can be wrapped in `|`, the quote character in Message Format 2 syntax.

```mf2
My name is {|John Doe|}.
```

Quoted text can also contain escapes, just like in simple messages. In quoted
text, `|` must be escaped.

```mf2
This is the {|pipe \| character|}.
```

## Markup

TODO

## Annotations

TODO

## Matchers

TODO

## Local Declarations

TODO

## Input Declarations

TODO
