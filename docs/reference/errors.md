---
title: Error Messages
description: Error messages identify problems with the syntax or meaning of a message.
---

You might encounter a number of different error messages while writing an
MF2 message. Here's a guide to those errors, with an example for each one.

> The presentation and wording of errors varies based on which implementation of MF2
> you are using. This guide is based on the error descriptions in the
> [MF2 specification](https://github.com/unicode-org/message-format-wg/blob/main/spec/errors.md);
> for each one, the error name used by the JavaScript/TypeScript implementation
> (which is used by the [playground](/playground)) is also provided.

## Syntax errors

JS name: `parse-error`

Syntax errors occur when a message has errors that prevent the message processor
from providing any more detailed information.

<mf2-interactive>

```mf2
{|missing-brace|
```

</mf2-interactive>

In this case, the error is reported as `parse-error` and provides a character
offset within the message where the parser wasn't able to make progress.

### Fixing the error

Look over the message carefully with an eye towards errors like missing
curly braces.

Corrected message:

<mf2-interactive>

```mf2
{|missing-brace|}
```

</mf2-interactive>

## Data model errors

Data model errors can be detected by the message formatter without
knowing any runtime data. It's helpful to know this distinction because
both syntax and data model errors are non-recoverable: the message
formatter won't try to provide fallback output for messages that
contain these errors.

### Variant key mismatch

JS name: `key-mismatch`

A "Variant Key Mismatch" error occurs when the number of keys in a variant
in a [matcher](/docs/reference/matcher/) differs from the number of selector variables.
Remember that all the variants have to have the same number of keys,
which has to be the same as the number of selector variables.

<mf2-interactive>

```mf2
.local $x = {1 :number}
.match $x
one * {{Too many keys}}
*   * {{Also too many keys}}
```

</mf2-interactive>

#### Fixing the error

Depending on what you intended, either change the number of selector variables
to match the number of keys in the variants, or the other way around. Make
sure that all variants have the same number of keys.

Corrected message:

<mf2-interactive>

```mf2
.local $x = {1 :number}
.match $x
one {{Correct number of keys}}
*   {{Also correct number of keys}}
```

</mf2-interactive>

### Missing fallback variant

JS name: `missing-fallback`

A "Missing Fallback Variant" error occurs when a [matcher](/docs/reference/matcher)
isn't exhaustive. To be exhaustive, it must have one variant whose keys are all
`*` (the wildcard key, which matches anything).

<mf2-interactive>

```mf2
.local $x = {1 :number}
.match $x
one * {{x is singular}}
```
</mf2-interactive>

#### Fixing the error

Add a variant where all the keys are `*`. 

<mf2-interactive>

```mf2
.local $x = {1 :number}
.match $x
one {{x is singular}}
*   {{x is plural}}
```
</mf2-interactive>

### Duplicate variant

JS name: `duplicate-variant`

A "Duplicate Variant" error occurs when more than one variant has the same
list of keys. Key lists are ordered, so the key lists `one *` and `* one`
would not be duplicates.

<mf2-interactive>

```mf2
.local $x = {1 :number}
.match $x
one {{x is singular}}
one {{x is singular.}}
*   {{x is not singular}}
```
</mf2-interactive>

This message is ambiguous because it's not clear which variant to choose
if `$x` is singular.

#### Fixing the error

Remove the extra variant(s):

<mf2-interactive>

```mf2
.local $x = {1 :number}
.match $x
one {{x is singular}}
*   {{x is not singular}}
```
</mf2-interactive>


### Missing selector annotation

JS name: `missing-selector-annotation`

<mf2-interactive>

```mf2
.match $x
one {{x is singular}}
*   {{x is plural}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

This is one of the more complicated errors to understand. Every variable
used as a selector in a `.match` has to have an _annotation_. But the
syntax doesn't allow the variable to be annotated directly. Instead,
it has to be annotated by adding a `.local` or `.input` declaration
for the variable.

#### Fixing the error

For each external variable in the `.match`, add an `.input` declaration
for it. If there are any `.local` variables in the `.match`, make sure
that they have a declaration with an annotation.

<mf2-interactive>

```mf2
.input {$x :number}
.match $x
one {{x is singular}}
*   {{x is plural}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

When checking for selector annotations, annotations are transitive.
That is, this works, even though `$y` has no explicit annotation:

<mf2-interactive>

```mf2
.input {$x :number}
.local $y = {$x}
.match $y
one {{x is singular}}
*   {{x is plural}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

It works because `$y` is bound to a variable that is in turn
bound to an expression with an annotation.

### Duplicate Declaration

JS name: `duplicate-declaration`

MF2 only allows variables to be declared once. See the reference
on [variables](/docs/reference/variables). So this is an error:

<mf2-interactive>

```mf2
.input {$x :number}
.local $x = {42}
.match $x
one {{x is singular}}
*   {{x is plural}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

#### Fixing the error

Give each variable a unique name:

<mf2-interactive>

```mf2
.input {$x :number}
.local $y = {42}
.match $x
one {{x is singular}}
*   {{x is plural}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

(This message may seem a bit silly, since `$y` is never used, but
it's just an example.)

### Duplicate Option Name

JS name: `duplicate-option-name`

When giving option to a [function](/docs/reference/functions/), the same
option name can't be repeated more than once.

<mf2-interactive>

```mf2
.input {$x :number style=percent style=decimal}
{{{$x}}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

The meaning of this message is ambiguous (which `style` did you mean?),
so the error reminds you to remove any repeated options.

#### Fixing the error

Remove the extra option names, leaving the ones with the value
that you wanted to include:

<mf2-interactive>

```mf2
.input {$x :number style=percent}
{{{$x}}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

## Resolution errors

Resolution errors happen when a part of a message has unclear
meaning due to missing or inconsistent runtime data.

### Unresolved variable

JS error message: "Variable not available"

In MF2, [variables](/docs/reference/variable/) have to be
declared before they are used. This means either declaring them with
a `.local` declaration, or providing them as an external
input variable.

<mf2-interactive>

```mf2
.input {$x :number}
{{{$x}}}
```

</mf2-interactive>

This is an error because `$x` is declared with an `.input`,
but not provided as an external variable.

#### Fixing the error

Provide either an external variable, or a `.local` declaration,
that gives meaning to the undeclared variable name.

<mf2-interactive>

```mf2
.input {$x :number}
{{{$x}}}
```

```json
{ "x": 5 }
```
</mf2-interactive>

### Unknown function

JS error message: "Unknown function"

[Functions](/docs/reference/functions/) used in annotations must
either be built into the formatter, or provided in a custom
function registry. There is no built-in function named `num`
and we have not provided a custom function registry, so this
example fails:

<mf2-interactive>

```mf2
.local $x = {1 :num}
{{{$x}}}
```

</mf2-interactive>

#### Fixing the error

Check the spelling of the function name mentioned in the error,
or provide a custom function with that name if you intended to do so.

<mf2-interactive>

```mf2
.local $x = {1 :number}
{{{$x}}}
```

</mf2-interactive>

### Bad selector

JS error message: "Selection error: bad-selector"

Some functions, like `:number`, produce a result that can be selected
on in a `.match`. Other functions, like `:datetime`, don't:

<mf2-interactive>

```mf2
.local $day = {|2024-05-01| :datetime}
.match $day
* {{The due date is {$day}}}
```
</mf2-interactive>

MF2 doesn't provide a way to select on dates. In general, depending
on how a function is written, its result might not be usable as
a selector in a `.match`. As far as the built-in functions,
`:number` and `:string` produce results that can be selected on,
while `:datetime`, `:date`, and `:time` don't. Although MF2
has no type system, it would be fair to say that numbers and
strings are selectable, while dates and times are not.

#### Fixing the error

The fix depends on what you intended to do. In this case,
maybe you just wanted to format the date, and the `.match`
isn't necessary:

<mf2-interactive>

```mf2
.local $day = {|2024-05-01| :datetime}
{{The due date is {$day}}}
```
</mf2-interactive>

If you are using a custom function, you should make sure it returns
values that can be selected on. (The details are implementation-specific.)

## Message function errors

The last category of errors are errors that are specific to a particular
built-in or custom function. It helps to know that so you can narrow
down the function that caused the error, then consult the documentation
for that function in order to fix the error.

### Bad operand

JS error message: Depends on the function; "Input is not numeric" for
`:number`, "Input is not a date" for date functions

This category of errors appears when a function is passed an argument
(operand) that it can't handle. Although MF2 is untyped, this is basically a
runtime type error.

For example, the string "horse" can't be converted
to a number or a date, so using it with a `:number` or `:date`
annotation is an error:

<mf2-interactive>

```mf2
.local $horse = {|horse| :number}
{{You have a {$horse}.}}
```

</mf2-interactive>

<mf2-interactive>

```mf2
.local $horse = {|horse| :datetime}
{{You have a {$horse}.}}
```

</mf2-interactive>

#### Fixing the error

Read the documentation for the function so you know what kind of input
it expects. For example, `:number` expects a string that can be parsed
as a number. The date functions such as `:datetime` expect a string in
ISO 8601 format ([full details](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md#date-and-time-operands)).
Both functions may also accept implementation-specific types.

<mf2-interactive>

```mf2
.input {$numHorses :number}
.match $numHorses
one {{You have a horse.}}
*   {{You have {$numHorses} horses.}}
```

```json
{ "numHorses": 42 }
```

</mf2-interactive>

### Bad option

JS error message: "Value [option name] is not valid for [function name]"

This category of errors is similar to "Bad Operand", but it means
one of the option values was wrong, rather than the argument to
the function.

<mf2-interactive>

```mf2
.local $x = {1 :number minimumFractionDigits=foo}
{{{$x}}}
```

</mf2-interactive>

This fails because `:number` requires its `minimumFractionDigits` option
to be a string that can be parsed as an integer (or possibly an
implementation-specific numeric type).

In general, the reason for the error depends on which function you
are using and what kinds of options it allows.

#### Fixing the error

For built-in functions, the [default function registry](https://github.com/unicode-org/message-format-wg/blob/main/spec/registry.md)
is the authoritative source for what options are accepted by functions
and what their values may be. For custom functions, you'll have to compare
the function's implementation with how you are using it.

<mf2-interactive>

```mf2
.local $x = {1 :number minimumFractionDigits=2}
{{{$x}}}
```

</mf2-interactive>

### Bad variant key

This error was added so recently that the current JS implementation doesn't
check for it yet, but in the future, this will be an error:

<mf2-interactive>

```mf2
.local $answer = {42 :number}
.match $answer
1     {{The value is one.}}
horse {{The value is a horse.}}
*     {{The value is not one.}}
```
</mf2-interactive>

In general, custom selector functions define what kinds of keys they can
match against. Just as the argument of `:number` has to be parseable as
a number, and some of its option values has to be number, it can only
match against numeric keys.

#### Fixing the error

In this case, the fix is to remove any variants with non-numeric keys:

<mf2-interactive>

```mf2
.local $answer = {42 :number}
.match $answer
1     {{The value is one.}}
*     {{The value is not one.}}
```
</mf2-interactive>

In general, the fix depends on which selector function is being used,
and what kinds of keys it can match against. As with the other errors in
this section, if these errors come up when using custom functions,
the solution depends on the details of how the function is implemented.
