---
title: Quick Start
description: Get started with the basics of MessageFormat 2.
order: "1"
---

MessageFormat 2.0 is designed to handle dynamic messages in multiple languages
and cultures. This guide provides an overview of its syntax and features, along
with examples to help you get started.

## Basic Syntax

### Text

A simple message is just plain text. All Unicode characters can be used in text.
The only special characters are curly braces `{}` - they need to be escaped.
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

## Functions

Placeholders can be modified with functions. Functions are prefixed with a colon
`:`. Functions can be used to format numbers, dates, and other types of data.

```mf2
It is the {$today :datetime} today.
```

### Function Options

Functions can have options. Options are key-value pairs separated by an equal
sign `=`. Options are separated by spaces.

```mf2
You have {$today :datetime dateStyle=long} items.
```

## Literals

In addition to variables, placeholders can contain literals. Literals are also
used as the values of options.

### Unquoted Literals

Unquoted literals are simple strings. They can contain all characters except
whitespace or special characters.

```mf2

```

```mf2
Hello, {$name}!
```

### Escaping

Escape special characters with a backslash `\`. Only curly braces need to be
escaped in message text. All other characters are not special.

```mf2
Curly braces: \{ and \}
```

> There are no Unicode escape sequences in MessageFormat 2.0. Use the actual
> Unicode characters in your message.

## Variables

### External Variables

External variables are passed to the message from the outside context.

```mf2
Hello {$name}
```

## Annotations and Functions

Annotations modify how variables are processed and displayed. Functions are a
type of annotation prefixed with a colon `:`.

### Number Formatting

Format numbers with the `:number` function.

```plaintext
You have {count :number} items.
```

Options for number formatting:

```plaintext
You have {count :number style=decimal} items.
```

### Date Formatting

Format dates with the `:datetime` function.

```plaintext
Today is {date :datetime}.
```

Options for date formatting:

```plaintext
Today is {date :datetime dateStyle=long}.
```

## Matchers and Selectors

Matchers allow the message to change based on the value of a variable. Use the
`.match` keyword followed by selectors and variants.

### Simple Matcher

```plaintext
.match {count :number}
0 {You have no items.}
1 {You have one item.}
* {You have {count} items.}
```

### Complex Matcher

Matchers can have multiple selectors.

```plaintext
.input {$numLikes :integer}
.input {$numShares :integer}
.match {$numLikes} {$numShares}
0 0 {Your item has no likes and has not been shared.}
0 one {Your item has no likes and has been shared once.}
0 * {Your item has no likes and has been shared {numShares} times.}
one 0 {Your item has one like and has not been shared.}
one one {Your item has one like and has been shared once.}
one * {Your item has one like and has been shared {numShares} times.}
* 0 {Your item has {numLikes} likes and has not been shared.}
* one {Your item has {numLikes} likes and has been shared once.}
* * {Your item has {numLikes} likes and has been shared {numShares} times.}
```

## Markup

Markup is used to represent non-language parts of a message, such as HTML
elements or styling.

### Open and Close Markup

```plaintext
{#b}Bold text{/b}
```

### Standalone Markup

```plaintext
{#img src=|logo.png| /}
```

### Markup with Attributes

```plaintext
{#button class=|primary|}Click me{/button}
```

## Error Handling

### Syntax Errors

Occurs when the message is not well-formed.

```plaintext
{{Missing end brace}
```

### Data Model Errors

Occurs when the message violates semantic requirements.

```plaintext
.match {count :number}
1 {One item}
two {Two items}  <!-- 'two' is not a valid numeric key -->
```

## Complete Example

Here’s a complete example that combines several features:

```plaintext
.input {$userName}
.input {$loginDate :datetime}
.local $greeting = {Hello}

{#greeting} {$userName},

.match {$loginDate :datetime}
{2024-01-01T00:00:00Z} {Welcome back!}
* {You last logged in on {loginDate}.}

Thank you for visiting.
```

In this example:

- The message greets the user.
- It checks if the login date is January 1, 2024, and provides a special welcome
  message for that date.
- If the login date is not January 1, 2024, it shows the date of the last login.

This guide provides a foundation to start using MessageFormat 2.0. Explore more
features and options to fully utilize its power for internationalizing your
applications.
