---
title: Syntax Guide
description: A guide to the various syntactic features of MF2
---

`MessageFormat` is a new functionality that can act as a Swiss Army knife for many of your i18n needs, allowing you to localize interfaces with great ease. `MessageFormat` is currently in "tech preview" mode, with an alpha release.

## What is a "Message"?

Messages are user-visible strings, often with variable elements like names, numbers and dates. Message strings are typically translated into the different languages of a UI, and translators rearrange the variable elements according to the grammar of the target language.

The simplest and most common use-case of such applications is to replace placeholders in applications with locale-specific messages.

## Simple Messages

Simple (static) messages can be written without utilizing special syntax, since the default mode is "text mode".

**EXAMPLE**
```
This is a message.
```

### Placeholders

A _placeholder_ can either be an _expression_ or a _markup placeholder_. We'll talk about expressions first.

### Expressions

An expression represents a dynamic part of a message that will be determined during the message's formatting at runtime. Expressions are enclosed within a single set of braces (`{...}`). The two kinds of expressions you could have in your messages are:

#### Variable Replacement

The most common way to use `MessageFormat` is for simple variable replacement within messages.

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

Because it begins with a `:`, you can tell that `:datetime` is the name of a _function_. In MessageFormat, we say that `$date` is _annotated_ with the annotation `:datetime weekday=long`. This is analogous to a function call, with `:datetime` as the function and the runtime value of `$date` as the argument. In this annotation, we say that `$date` is the _operand_ of `:datetime`. The annotation can also have any number of named options. In this case, there is one named option: the literal string `long`, associated with the name `weekday`.

In general, an annotation is a part of an expression containing either a function call together with its associated options, or a private-use or reserved sequence.

An annotation can appear in an expression by itself or following a single operand. If an operand is present, that operand serves as input to the annotation. (Currently, all the built-in functions in MessageFormat are required to have an operand.)

#### Literals

In the example above, `long` is a _literal_. Literals can appear in various contexts in an MF2 message. For example, the right-hand side (part appearing to the right of an '=' sign) of an option can be either a variable or a literal. You can tell that it's a literal in this case because it doesn't begin with `$`. Rarely, literals have to be quoted (enclosed in `|` / `|` characters).

#### Functions

When you write an annotation in your MessageFormat message, then underneath the hood, the formatter calls a function. These could either be built-in functions that aim to assist you in performing common i18n operations like formatting common data types or custom functions that are registered by the user in the function registry. The syntax for making function calls is as follows, with the operand followed by the function name and finally the options.

**EXAMPLE**
```
Today is {$date :datetime weekday=long}.

Check out {:img src=|image.png|}.
```

The text `|image.png|` is an example of a _quoted_ literal. It has to be quoted because it includes a '.' character. In general, literals containing non-alphanumeric characters have to be quoted.

## Markup

Another type of placeholder is a _markup placeholder_. A markup placeholder can be "open", "close", or "standalone". This example shows open and close markup placeholders.

**EXAMPLE**
```
Click {#link}here{/link}. {#b}{$count}{/b}
```

`{#link}` is an opening markup placeholder, while `{/link}` is a closing markup placeholder.

Markup is not specific to any particular markup language such as HTML. The message formatter doesn't interpret markup. It simply passes pieces of markup through into the formatted result.

## Complex Messages
More complex messages begin with a keyword. All keywords begin with a '.' character. Complex messages can include variants, declarations, or both.

### Variants

Here is a message with variants:

**EXAMPLE**
```
.match {$userType :string}
guest {{Welcome Guest!}}
registered {{Welcome {$username}!}}
```

Because this message begins with the keyword `.match`, you can tell that it's a `matcher`. We'll explain matchers in more details later. For now, notice that there are two different patterns, `{{Welcome Guest!}}` and `{{Welcome {$username}!}}`. These patterns are enclosed in double sets of curly braces. This is syntax you might be familiar with from templating languages.

### Declarations

A declaration binds a variable identifier to a value within the scope of a message. This variable can then be used in other expressions within the same message. Declarations are optional: many messages will not contain any declarations.

An **input** declaration binds a variable to an external input value.

A **local** declaration binds a variable to the value of an expression. `.local` is like `const` in JavaScript.

**EXAMPLE**
```
.input {$x :number style=percent}
.local $y = {|This is an expression|}
{{$y}}
```

This message works without errors as long as `x` is provided as an external input value. If so, then the annotation in the `.input` declaration is applied to the value passed in for `x`: it's formatted as a number with the style "percent".

`.input` declarations are optional, so a variable that appears without a declaration is assumed to be an external input value.

**EXAMPLE**
```
{{$y}}
```

The formatter signals a runtime error if `y` is not provided as an external input value.

The value of a variable can't be self-referential, and a variable declared with `.local` can't be referenced before they are used. Also, the same variable can't be declared multiple times.

## Patterns

A pattern is a sequence of text and placeholders to be formatted as a unit. Unless there is an error, the result of formatting a message is always the result of formatting a single pattern: either the single pattern that makes up a simple message, or the pattern of the matching variant in a complex message.

Almost anything not beginning with a `.` or a `{{` is an _unquoted pattern_ in MessageFormat. An unquoted pattern, on its own, is a simple message.

**EXAMPLE**
```
This is a pattern. It can include expressions like {$v} and {#b}markup{/b}.
```

There are certain characters that can't appear in an unquoted pattern. You probably won't run into these at first.

### Quoted Patterns

A quoted pattern is a pattern that is enclosed in double braces (`{{...}}`). Quoting may be necessary because a pattern may contain characters that have a special meaning in the MessageFormat syntax, and the quotes make it clear that these characters should be interpreted literally.

Also, *all* patterns that appear in complex messages must be quoted. So in a message that has declarations:

**EXAMPLE**
```
.local $y = {1}
{{This pattern must be quoted.}}
```

Patterns in a _matcher_ must also be quoted. We'll talk about matchers later.

### Text

Text is the translatable content of a pattern. Any Unicode code point is allowed, except for surrogate code points U+D800 through U+DFFF inclusive. The characters `\`, `{`, and `}` must be escaped.

Note that whitespace in text, including tabs, spaces, and newlines is significant and will be preserved during formatting.

**EXAMPLE**
```
.input {$num :number}
{{   This is the {$num} pattern   }}
```

An example with escaped characters:

**EXAMPLE**
```
Backslash: \\, left curly brace \{, right curly brace \}
```

This example formats to the string:

```
Backslash: \, left curly brace {, right curly brace }
```

## Matchers

A _matcher_ is a feature in MessageFormat that lets you group together different _variants_ of a message, in which one variant is chosen based on runtime data.

**EXAMPLE**
```
.match {$count :number}
one {{You have {$count} week.}}
*   {{You have {$count} weeks.}}
```

The annotation on the variable `$count` determines how selection is done. In this case, the annotation `:number` means that `$count` is examined as a numerical value based on its plural category, which happens to be the default selection category for numbers (the other options include ordinal categories for instance). `:number` is an example of a _selector function_. You might remember that `:number` is also a _formatting function_. Some functions are both a selector and a formatter, while others can only be one or the other.

The `:number` function has the built-in ability to map values onto plural categories. This mapping is based on CLDR data and it doesn't have to be provided to the formatter explicitly.

The `.match` keyword has to be followed by an expression: in this case, `{$count}`. We call `{$count}` the _selector_ of a matcher.

`one` and `*` are both _keys_. The key `one` matches the runtime value of `$count` based on that value's plural category. The key `*` is special and matches any value.

The quoted pattern that follows each key is the pattern to use if the key matches.

More complicated matchers can have multiple keys and multiple selectors.

Let's work through how this message is formatted depending on the runtime value of `{$count}`. Suppose `$count` is `1`.
* The `:number` selector looks at the value (`1`) and the keys (`one` and `*`). It determines that `one` is the best match.
* The pattern `{{You have {$count} week.}}` is chosen.
* The variable is replaced with its value, and the result is `You have 1 week.`

Now let's suppose `$count` is `42`.
* The `:number` selector looks at the value (`42`) and the keys (`one` and `*`). The only key that can match in this case is the wildcard, `*`.
* The pattern `{{You have {$count} weeks.}}` is chosen.
* The variable is replaced with its value, and the result is `You have 42 weeks.`

The details of how values are matched again keys depend on the annotation of the selector. `:number` is just one example.

### Number selection in other languages

While English only has two plural categories, there are other natural languages that
have more categories. Consider translating the example into Polish:

**EXAMPLE**
```
.match {$count :number}
one {{Masz {$count} tydzień.}}
few {{Masz {$count} tygodnie.}}
many {{Masz {$count} tygodni.}}
other {{Masz {$count} tygodnia.}}
* {{Masz {$count} tygodnia.}}
```

This shows why the `:number` selector is useful: when translating the first example
from English to Polish, the translator knows how to create a Polish version
that covers all the plural categories. For more information, see the
[CLDR page](https://cldr.unicode.org/index/cldr-spec/plural-rules) on plural rules.

(By the way, the `*` variant is always required. This example could be rewritten
without the `other` variant, but we showed it for expository reasons.)

## Built-in Formatters

A number of commonly used formatters are built into all `MessageFormat` implementations for easy access. Formatters are simple in that they format a given locale-independent value (like a standardized date or a number) into a localized string ready to be presented to the user.

### Date and Time Formatting

A date and time formatter that closely mimics JavaScript Intl's [DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) is available as the `:datetime` function in `MessageFormat`. Two more functions, `:date` and `:time`, are included. `:date` only formats the date, while `:time` formats the time.

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
* `style`: The base display style to be used across the entire date time, possible values: `full`, `long`, `medium`, and `short`.
* `dateStyle`: The base display style to be used for the date component, possible values: `full`, `long`, `medium`, and `short`.
* `timeStyle`: The base display style to be used for the time component, possible values: `full`, `long`, `medium`, and `short`.

`:datetime` can also accept a number of _field options_. The entire list of options is in [the specification](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#the-datetime-function).

### Number Formatting

A number formatter that closely mimics JavaScript Intl's [NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) is available as the `:number` function in `MessageFormat`. A second function, `:integer`, is similar to `:number` but always formats is input as an integer.

**EXAMPLE**
```
The average number of plants per household is {$amount :number minimumFractionDigits=2}.
```

**EXAMPLE**
```
The median number of plants per household is {$amount :integer}.
```

**OPTIONS**

The entire list of options is in [the specification](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#the-number-function).

## Selectors

The second class of functions, apart from formatters, are selectors. As opposed to formatters which format an input value inside a pattern, selectors allow you to "select" one of many patterns based on performing some kind of locale-sensitive operation on a value.

Selectors always have to be specified explicitly; you can't write `.match {$x} ...`, because `$x` is not declared explicitly. You could fix this message by writing either: `.match {$x :number} ...`; `.input {$x :number} .match {$x} ...`; or `.local $x = {1: number} .match {$x} ...`.

### Plural Selection

A plural selector that closely mimics JavaScript Intl's [PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) is available as the `:number` function in `MessageFormat`. Notice that `:number` has two meanings: as a formatting annotation, and as a selector annotation. The meaning is disambiguated based on context.

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

In this example, the runtime value of `$pronoun` is treated as a string and literally compared to the strings `she` and `he`. If it's not equal to any of the other strings, then the `*` variant is used.
