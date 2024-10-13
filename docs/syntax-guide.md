---
title: Syntax Guide
description: A guide to the various syntactic features of MF2
---

<!-- NOTE: This document is not officially included in the rendered version of the docs, it's supposed to be eventually removed once all of its content ends up elsewhere -->

`MessageFormat` is a new functionality that can act as a Swiss Army knife for
many of your i18n needs, allowing you to localize interfaces with great ease.
`MessageFormat` is currently in "tech preview" mode, with an alpha release.

## What is a "Message"?

Messages are user-visible strings, often with variable elements like names,
numbers and dates. Message strings are typically translated into the different
languages of a UI, and translators rearrange the variable elements according to
the grammar of the target language.

The simplest and most common use-case of such applications is to replace
placeholders in applications with locale-specific messages.

## Simple Messages

Simple (static) messages can be written without utilizing special syntax, since
the default mode is "text mode".

**EXAMPLE**

```
This is a message.
```

### Placeholders

A _placeholder_ can either be an _expression_ or a _markup placeholder_. We'll
talk about expressions first.

### Expressions

An expression represents a dynamic part of a message that will be determined
during the message's formatting at runtime. Expressions are enclosed within a
single set of braces (`{...}`). The two kinds of expressions you could have in
your messages are:

#### Variable Replacement

The most common way to use `MessageFormat` is for simple variable replacement
within messages.

**EXAMPLE**

```
Hello, {$userName}!
```

#### Annotations

Variables can also be decorated with annotations.

**EXAMPLE**

```
Today is {$date :datetime weekday=long}.
```

Because it begins with a `:`, you can tell that `:datetime` is the name of a
_function_. In MessageFormat, we say that `$date` is _annotated_ with the
annotation `:datetime weekday=long`. This is analogous to a function call, with
`:datetime` as the function and the runtime value of `$date` as the argument. In
this annotation, we say that `$date` is the _operand_ of `:datetime`. The
annotation can also have any number of named options. In this case, there is one
named option: the literal string `long`, associated with the name `weekday`.

In general, an annotation is a part of an expression containing either a
function call together with its associated options, or a private-use or reserved
sequence.

An annotation can appear in an expression by itself or following a single
operand. If an operand is present, that operand serves as input to the
annotation. (Currently, all the built-in functions in MessageFormat are required
to have an operand.)

#### Literals

## Markup

## Complex Messages

More complex messages begin with a keyword. All keywords begin with a '.'
character. Complex messages can include variants, declarations, or both.

### Variants

Here is a message with variants:

**EXAMPLE**

```
.match {$userType :string}
guest {{Welcome Guest!}}
registered {{Welcome {$username}!}}
```

Because this message begins with the keyword `.match`, you can tell that it's a
`matcher`. We'll explain matchers in more details later. For now, notice that
there are two different patterns, `{{Welcome Guest!}}` and
`{{Welcome {$username}!}}`. These patterns are enclosed in double sets of curly
braces. This is syntax you might be familiar with from templating languages.

### Declarations

## Built-in Formatters

A number of commonly used formatters are built into all `MessageFormat`
implementations for easy access. Formatters are simple in that they format a
given locale-independent value (like a standardized date or a number) into a
localized string ready to be presented to the user.

### Date and Time Formatting

A date and time formatter that closely mimics JavaScript Intl's
[DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
is available as the `:datetime` function in `MessageFormat`. Two more functions,
`:date` and `:time`, are included. `:date` only formats the date, while `:time`
formats the time.

**EXAMPLE**

```
The match on {$date :datetime dateStyle=long} is cancelled.
```

**EXAMPLE**

```
The match on {$date :date style=long} is cancelled.
```

**EXAMPLE**

```
The match at {$date :time style=medium} is cancelled.
```

**OPTIONS**

- `style`: The base display style to be used across the entire date time,
  possible values: `full`, `long`, `medium`, and `short`.
- `dateStyle`: The base display style to be used for the date component,
  possible values: `full`, `long`, `medium`, and `short`.
- `timeStyle`: The base display style to be used for the time component,
  possible values: `full`, `long`, `medium`, and `short`.

`:datetime` can also accept a number of _field options_. The entire list of
options is in
[the specification](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#the-datetime-function).

### Number Formatting

A number formatter that closely mimics JavaScript Intl's
[NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
is available as the `:number` function in `MessageFormat`. A second function,
`:integer`, is similar to `:number` but always formats is input as an integer.

**EXAMPLE**

```
The average number of plants per household is {$amount :number minimumFractionDigits=2}.
```

**EXAMPLE**

```
The median number of plants per household is {$amount :integer}.
```

**OPTIONS**

The entire list of options is in
[the specification](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#the-number-function).

## Selectors

The second class of functions, apart from formatters, are selectors. As opposed
to formatters which format an input value inside a pattern, selectors allow you
to "select" one of many patterns based on performing some kind of
locale-sensitive operation on a value.

Selectors always have to be specified explicitly; you can't write
`.match {$x} ...`, because `$x` is not declared explicitly. You could fix this
message by writing either: `.match {$x :number} ...`;
`.input {$x :number} .match {$x} ...`; or
`.local $x = {1: number} .match {$x} ...`.

### Plural Selection

A plural selector that closely mimics JavaScript Intl's
[PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)
is available as the `:number` function in `MessageFormat`. Notice that `:number`
has two meanings: as a formatting annotation, and as a selector annotation. The
meaning is disambiguated based on context.

**EXAMPLE**

```
.match {$count :number}
one {{One new message}}
*   {{{$count :number} new messages}}
```

### String Selection

A selector named `:string` that just does literal string comparison is provided.

**EXAMPLE**

```
.match {$pronoun :string}
she {{{$user} added you to her friends list.}}
he  {{{$user} added you to his friends list.}}
*   {{{$user} added you to their friends list.}}
```

In this example, the runtime value of `$pronoun` is treated as a string and
literally compared to the strings `she` and `he`. If it's not equal to any of
the other strings, then the `*` variant is used.
