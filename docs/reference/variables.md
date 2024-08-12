---
title: Variables
description: Variables are used to dynamically reference runtime data in localized messages.
---

Variables are used to reference data that is not known at the time the message
is authored, but is passed to the message at runtime (when it is displayed).

In a message, variables are always prefixed with a `$` character. The variable
name can contain almost all characters that are not spaces or punctuation. A
variable name can't start with a number.

## Usage

Variables can be interpolated into a message using a {placeholder expression}.

<mf2-interactive>

```mf2
Your name is {$name}.
```

```json
{ "name": "Alice" }
```

</mf2-interactive>

Variables can be used in {function options} and {markup options}.

<mf2-interactive>

```mf2
You have {42 :number style=currency currency=$currency}.
```

```json
{ "currency": "USD" }
```

</mf2-interactive>

## Declarations

In addition to referring to external input values, variables can be declared
within a message. A declaration binds a variable to a value within the scope of
a message. This variable can then be used in other expressions within the same
message. Declarations are useful for breaking down complex messages into smaller
parts, or for reusing values multiple times.

### Local declarations

Variables can be declared within a message using a `.local` statement. The
declaration is followed by the variable name, an equals sign, and an expression
that evaluates to the value of the variable.

<mf2-interactive>

```mf2
.local $count = {42}
{{The count is: {$count}}}
```

</mf2-interactive>

Expressions inside of a `.local` statement can contain contain literals and
functions. They can also reference other variables (local and external ones).
When referencing a variable, they can not reference themselves or variables that
are declared syntactically _after_ them — only variables that are declared
_before_ them.

<mf2-interactive>

<!-- TODO: this should work -->

```mf2
.local $score = {0.42}
.local $score_percent = {$score :number style=percent}
{{Your score was {$score_percent}.}}
```

</mf2-interactive>

### Input declarations

Input declarations are similar to local declarations, but they are used to
redeclare external input values as local variables. This can be useful to assert
a specific type or format for an input value (e.g. to ensure that a passed value
is always an integer). It can also be useful to ensure that an input variable is
always formatted in a specific way.

Input declarations are declared using a `.input` statement. The declaration is
followed by an {expression}, specifically a variable expression. The variable in
this expression is both the input variable being referenced, and the name of the
local variable being declared.

<mf2-interactive>

```mf2
.input {$count}
{{The count is: {$count}}}
```

```json
{ "count": 32 }
```

</mf2-interactive>

In the above example, `.input` is just being used to ensure that the `count` is
always passed. It acts as a form of documentation for both the developer and the
translator: it tells the developer that the message expects a `count` variable,
and it tells the translator that the message gets a `count` variable passed in.

Ideally expressions in `.input` should also specify a {function} like `:string`,
`:number`, or `:datetime`. These functions are not type assertions. They act as
type coercions, converting the external input value to the specified type, by
passing the value through the specified function (creating a new {resolved
value}). This also means that formatting options can be specified in the
function.

<mf2-interactive>

```mf2
.input {$amount :number style=currency currency=USD}
{{The price is: {$amount}.}}
```

```json
{ "amount": 32 }
```

</mf2-interactive>

### Shadowing and redeclaration

Declared variables shadow external input values with the same name.

<mf2-interactive>

```mf2
.local $count = {42}
{{The count is: {$count}}}
```

```json
{ "count": 32 }
```

</mf2-interactive>

Variables can also only be declared once within a message. Redeclaring a
variable will result in an error.

<mf2-interactive>

```mf2
.local $count = {42}
.local $count = {32}
{{The count is: {$count}}}
```

</mf2-interactive>
