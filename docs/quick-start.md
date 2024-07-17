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

You can also try out Message Format 2 in the online playground:

<a href="/playground/" class="button mb-8">Try in Playground</a>

## Basic Syntax

### Text

A simple message is just plain text. All Unicode characters can be used in text.
The only special characters are curly braces `{}` — they need to be escaped.
Messages can also not start with the `.` character.

<mf2-interactive>

```mf2
Hello, World!
```

</mf2-interactive>

### Escapes

Escape special characters with a backslash `\`. In text, only curly braces need
to be escaped. In literal quotes, `|` may also be escaped.

<mf2-interactive>

```mf2
Curly braces: \{ and \}
```

</mf2-interactive>

## Placeholders

Placeholders are used to dynamically insert values into messages. Placeholders
are enclosed in curly braces `{}`.

To insert a variable into a message, use the variable name inside curly braces,
preceded by a dollar sign `$`.

<mf2-interactive>

```mf2
Hello, {$name}!
```

```json
{ "name": "World" }
```

</mf2-interactive>

The values for variables are provided by the invoker of the message. They could
be numbers, strings, dates, or even lists.

## Functions

How placeholders behave can be modified with {functions}. Functions are prefixed
with a colon `:`. Functions are often used to format values in particular ways.

<mf2-interactive>

```mf2
It is the {$today :datetime} today.
```

```json
{ "today": "2024-07-01T12:00:00Z" }
```

</mf2-interactive>

Message Format 2 has multiple built in functions. These allow you, for example,
to format numbers in a locale appropriate way. See the
[full list of built-in functions](/docs/reference/functions/).

### Function Options

Functions can have options (arguments). Options are key-value pairs separated by
an equal sign `=`. Options are separated by spaces.

<mf2-interactive>

```mf2
It is the {$today :datetime dateStyle=long timeStyle=long} today.
```

```json
{ "today": "2024-07-01T12:00:00Z" }
```

</mf2-interactive>

Options can be used to modify the behaviour of functions, for example changing
whether time formatting should use AM/PM, or the 24 hour clock.

## Literals

In addition to variables, placeholders can contain literals. Literals are also
used as the values of options. Literals can be text or numbers.

### Number

Number literals can represent any integer or decimal number at arbitrary
precision.

<mf2-interactive>

```mf2
I eat {1.5} bananas.
```

</mf2-interactive>

Number literals are often useful when combined with the built-in `:number` or
`:integer` functions, enabling formatting in a locale aware way:

<mf2-interactive>

```mf2
The total was {0.5 :number style=percent}.
```

</mf2-interactive>

Decimals, and scientific notation are also supported in number literals:

<mf2-interactive>

```mf2
{1.3e-10 :number notation=engineering}
```

</mf2-interactive>

### Unquoted Text

Unquoted text literals are simple strings. They can contain all characters
except whitespace or special characters.

<mf2-interactive>

```mf2
Hello, {world}!
```

</mf2-interactive>

This is most often useful when passing a simple string as the value to a
function option - here it is `h12`:

<mf2-interactive>

```mf2
It is {$now :datetime hourCycle=h12}
```

```json
{ "now": "2024-07-01T12:00:00Z" }
```

</mf2-interactive>

> There is no boolean literal in Message Format 2. Options with boolean values
> usually use the text literals `true` and `false` to represent the two boolean
> states.

### Quoted Text

Text literals that need to contain spaces or special characters like `{` or `@`
can be wrapped in `|`, the quote character in Message Format 2 syntax.

<mf2-interactive>

```mf2
My name is {|John Doe|}.
```

</mf2-interactive>

Quoted text can also contain escapes, just like in simple messages. In quoted
text, only `|` must be escaped.

<mf2-interactive>

```mf2
This is the {|pipe \| character|}.
```

</mf2-interactive>

## Markup

Markup tags can be used to add rich text formatting to messages. There are three
types of markup tags: opening, closing, and self-closing.

```mf2
This is {#bold}bold{/bold}.
```

```mf2
This is a star: {#star-icon /}
```

Message Format 2 does not define any specific markup tags. Instead, it is up to
the application to define the tags that are used in messages. There is also no
requirement that opening and closing tags must match, or that they are used in a
hierarchical way.

> Good to know: Because markup tags are defined by the application, they enable
> portable rich text formatting across different platforms. For example, a
> `{#bold}` tag could be rendered as a `<b>` tag in HTML, as a `bold` font style
> in a terminal application, or as a bold text node in a mobile app.

### Markup Options

Markup tags can have options, just like functions. Options are key-value pairs
separated by an equal sign `=`. Options are separated by spaces. Options can be
used to modify the behaviour of markup tags, for example changing the target of
a link.

```mf2
This is a {#link to="home"}link{/link}.
```

It is best practice to not mix styles into messages too much - instead, use
markup tags to add semantic meaning and selectors to text, and let the
application decide how to render the message. This makes it easier to change the
styling of messages across an application without having to modify all
translations of all messages in the application.

```mf2
This is a {#error}critical{/error} message.
```

## Matchers

Matchers are used to select different variants of a message based on a value.

<mf2-interactive>

```mf2
.match {$count :integer}
one {{You have {$count} notification.}}
*   {{You have {$count} notifications.}}
```

```json
{ "count": 1 }
```

</mf2-interactive>

Matchers start with a `.match` keyword, followed by the value to match on, in
curly braces `{}`. The value can be a literal or variable. An annotation is
required to specify the type of the value to match on.

After the match value, there is a block of variants. Each variant starts with
the value to match on, followed by a message enclosed in double curly braces
`{{}}`. The special value `*` is used to match any value.

### String Matching

The match behaviour for a given value is based on the type of the value. For
strings, a literal case-sensitive match is used. This is useful for matching on
enum-like values, like pronouns in English:

<mf2-interactive>

```mf2
.match {$pronoun :string}
he  {{He is a good person.}}
she {{She is a good person.}}
*   {{They are a good person.}}
```

```json
{ "pronoun": "they" }
```

</mf2-interactive>

Values in selectors are literals. This means to have a selector that matches on
a space or special character, it must be quoted.

<mf2-interactive>

```mf2
.match {$char :string}
| |  {{You entered a space character.}}
|\|| {{You entered a pipe character.}}
*    {{You entered something else.}}
```

```json
{ "char": "|" }
```

</mf2-interactive>

### Number Matching

Other values can have more complex match behaviours. Numbers can match on exact
values, but also on locale specific plural categories:

<mf2-interactive>

```mf2
.match {$count :number}
one {{You have {$count} notification.}}
*   {{You have {$count} notifications.}}
```

```json
{ "count": 1 }
```

</mf2-interactive>

This is specifically useful for languages with complex plural rules, like Czech:

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

In addition to plural rules, numbers can also match on ordinal rules, or just on
exact values:

<mf2-interactive>

```mf2
.match {$count :number select=ordinal}
one {{You are {$count}st.}}
two {{You are {$count}nd.}}
few {{You are {$count}rd.}}
*   {{You are {$count}th.}}
```

```json
{ "count": 3 }
```

</mf2-interactive>

### Muli-Value Matching

Matchers can also match on multiple values. This is useful when a message needs
to be selected based on multiple different values:

<mf2-interactive>

```mf2
.match {$pronoun :string} {$count :number}
he one   {{He has {$count} notification.}}
he *     {{He has {$count} notifications.}}
she one  {{She has {$count} notification.}}
she *    {{She has {$count} notifications.}}
* one    {{They have {$count} notification.}}
* *      {{They have {$count} notifications.}}
```

```json
{ "pronoun": "she", "count": 3 }
```

</mf2-interactive>

When specifying multiple values to match on, the values are separated by spaces.
Selectors also need to be separated by spaces.

Only a single matcher can be used in a message. Matchers can contain multiple
values to match against, and can contain multiple variants.

## Local Declarations

A **local** declaration binds a variable to the value of an expression. `.local` is like `const` in JavaScript. Think of it as a convenient way to reuse the result of an operation without repeating it.

```mf2
.local $x = {|This is an expression|}
.local $y = {$now :datetime dateStyle=long}
{{$y}}
```

An interesting case that demonstrates the usefulness of `.local` is `.match` statements with multiple variants where you need to reuse a value.

```mf2
.local $date = {$dt :datetime dateStyle=long}
.match {$pronouns :string}
he  {{He joined on {$date}.}}
she {{She joined on {$date}.}}
*   {{They joined on {$date}.}}
```

## Input Declarations

An **input** declaration binds a variable to an external input value. It's not required in order to use external input but is a declarative way to verify the presence of (and even the type of) any input.

```mf2
.input {$count :number}
```

Furthermore, it's really useful when you want to apply certain formatting options onto an input value everytime it's used within the message.

```mf2
.input {$x :number style=percent}
```