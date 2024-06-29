# MessageFormat 2.0 Specification

## Table of Contents

1. [Introduction](#introduction)
   1. [Conformance](#conformance)
   1. [Terminology and Conventions](#terminology-and-conventions)
   1. [Stability Policy](#stability-policy)
1. [Syntax](syntax.md)
   1. [Productions](syntax.md#productions)
   1. [Tokens](syntax.md#tokens)
   1. [`message.abnf`](message.abnf)
1. [Errors](errors.md)
   1. [Error Handling](errors.md#error-handling)
   1. [Syntax Errors](errors.md#syntax-errors)
   1. [Data Model Errors](errors.md#data-model-errors)
   1. [Resolution Errors](errors.md#resolution-errors)
   1. [Message Function Errors](errors.md#message-function-errors)
1. [Registry](registry.md)
   1. [`registry.dtd`](registry.dtd)
1. [Formatting](formatting.md)
1. [Interchange data model](data-model/README.md)

## Introduction

One of the challenges in adapting software to work for
users with different languages and cultures is the need for **_<dfn>dynamic messages</dfn>_**.
Whenever a user interface needs to present data as part of a larger string,
that data needs to be formatted (and the message may need to be altered)
to make it culturally accepted and grammatically correct.

> For example, if your US English (`en-US`) interface has a message like:
>
> > Your item had 1,023 views on April 3, 2023
>
> You want the translated message to be appropriately formatted into French:
>
> > Votre article a eu 1 023 vues le 3 avril 2023
>
> Or Japanese:
>
> > あなたのアイテムは 2023 年 4 月 3 日に 1,023 回閲覧されました。

This specification defines the
data model, syntax, processing, and conformance requirements
for the next generation of _dynamic messages_.
It is intended for adoption by programming languages and APIs.
This will enable the integration of
existing internationalization APIs (such as the date and number formats shown above),
grammatical matching (such as plurals or genders),
as well as user-defined formats and message selectors.

The document is the successor to ICU MessageFormat,
henceforth called ICU MessageFormat 1.0.

### Conformance

Everything in this specification is normative except for:
sections marked as non-normative,
all authoring guidelines, diagrams, examples, and notes.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED",
"MAY", and "OPTIONAL" in this document are to be interpreted as
described in BCP 14 \[[RFC2119](https://www.rfc-editor.org/rfc/rfc2119)\]
\[[RFC8174](https://www.rfc-editor.org/rfc/rfc8174)\] when, and only when, they
appear in all capitals, as shown here.

### Terminology and Conventions

A **_term_** looks like this when it is defined in this specification.

A reference to a _term_ looks like this.

> Examples are non-normative and styled like this.

### Stability Policy

> [!IMPORTANT]
> The provisions of the stability policy are not in effect until
> the conclusion of the technical preview and adoption of this specification.

Updates to this specification will not change
the syntactical meaning, the runtime output, or other behaviour
of valid messages written for earlier versions of this specification
that only use functions defined in this specification.
Updates to this specification will not remove any syntax provided in this version.
Future versions MAY add additional structure or meaning to existing syntax.

Updates to this specification will not remove any reserved keywords or sigils.

> [!NOTE]
> Future versions may define new keywords.

Updates to this specification will not reserve or assign meaning to
any character "sigils" except for those in the `reserved` production.

Updates to this specification
will not remove any functions defined in the default registry nor
will they remove any options or option values.
Additional options or option values MAY be defined.

> [!NOTE]
> This does not guarantee that the results of formatting will never change.
> Even when the specification doesn't change,
> the functions for date formatting, number formatting and so on
> will change their results over time.

Later specification versions MAY make previously invalid messages valid.

Updates to this specification will not introduce message syntax that,
when parsed according to earlier versions of this specification,
would produce syntax or data model errors.
Such messages MAY produce errors when formatted
according to an earlier version of this specification.

From version 2.0, MessageFormat will only reserve, define, or require
function names or function option names
consisting of characters in the ranges a-z, A-Z, and 0-9.
All other names in these categories are reserved for the use of implementations or users.

> [!NOTE]
> Users defining custom names SHOULD include at least one character outside these ranges
> to ensure that they will be compatible with future versions of this specification.

Later versions of this specification will not introduce changes
to the data model that would result in a data model representation
based on this version being invalid.

> For example, existing interfaces or fields will not be removed.

Later versions of this specification MAY introduce changes
to the data model that would result in future data model representations
not being valid for implementations of this version of the data model.

> For example, a future version could introduce a new keyword,
> whose data model representation would be a new interface
> that is not recognized by this version's data model.

Later specification versions will not introduce syntax that cannot be
represented by this version of the data model.

> For example, a future version could introduce a new keyword.
> The future version's data model would provide an interface for that keyword
> while this version of the data model would parse the value into
> the interface `UnsupportedStatement`.
> Both data models would be "valid" in their context,
> but this version's would be missing any functionality for the new statement type.

# DRAFT MessageFormat 2.0 Syntax

## Table of Contents

\[TBD\]

### Introduction

This section defines the formal grammar describing the syntax of a single message.

### Design Goals

_This section is non-normative._

The design goals of the syntax specification are as follows:

1. The syntax should leverage the familiarity with ICU MessageFormat 1.0
   in order to lower the barrier to entry and increase the chance of adoption.
   At the same time,
   the syntax should fix the [pain points of ICU MessageFormat 1.0](../docs/why_mf_next.md).

   - _Non-Goal_: Be backwards-compatible with the ICU MessageFormat 1.0 syntax.

1. The syntax inside translatable content should be easy to understand for humans.
   This includes making it clear which parts of the message body _are_ translatable content,
   which parts inside it are placeholders for expressions,
   as well as making the selection logic predictable and easy to reason about.

   - _Non-Goal_: Make the syntax intuitive enough for non-technical translators to hand-edit.
     Instead, we assume that most translators will work with MessageFormat 2
     by means of GUI tooling, CAT workbenches etc.

1. The syntax surrounding translatable content should be easy to write and edit
   for developers, localization engineers, and easy to parse by machines.

1. The syntax should make a single message easily embeddable inside many container formats:
   `.properties`, YAML, XML, inlined as string literals in programming languages, etc.
   This includes a future _MessageResource_ specification.

   - _Non-Goal_: Support unnecessary escape sequences, which would theirselves require
     additional escaping when embedded. Instead, we tolerate direct use of nearly all
     characters (including line breaks, control characters, etc.) and rely upon escaping
     in those outer formats to aid human comprehension (e.g., depending upon container
     format, a U+000A LINE FEED might be represented as `\n`, `\012`, `\x0A`, `\u000A`,
     `\U0000000A`, `&#xA;`, `&NewLine;`, `%0A`, `<LF>`, or something else entirely).

### Design Restrictions

_This section is non-normative._

The syntax specification takes into account the following design restrictions:

1. Whitespace outside the translatable content should be insignificant.
   It should be possible to define a message entirely on a single line with no ambiguity,
   as well as to format it over multiple lines for clarity.

1. The syntax should define as few special characters and sigils as possible.
   Note that this necessitates extra care when presenting messages for human consumption,
   because they may contain invisible characters such as U+200B ZERO WIDTH SPACE,
   control characters such as U+0000 NULL and U+0009 TAB, permanently reserved noncharacters
   (U+FDD0 through U+FDEF and U+<i>n</i>FFFE and U+<i>n</i>FFFF where <i>n</i> is 0x0 through 0x10),
   private-use code points (U+E000 through U+F8FF, U+F0000 through U+FFFFD, and
   U+100000 through U+10FFFD), unassigned code points, and other potentially confusing content.

## Messages and their Syntax

The purpose of MessageFormat is to allow content to vary at runtime.
This variation might be due to placing a value into the content
or it might be due to selecting a different bit of content based on some data value
or it might be due to a combination of the two.

MessageFormat calls the template for a given formatting operation a _message_.

The values passed in at runtime (which are to be placed into the content or used
to select between different content items) are called _external variables_.
The author of a _message_ can also assign _local variables_, including
variables that modify _external variables_.

This part of the MessageFormat specification defines the syntax for a _message_,
along with the concepts and terminology needed when processing a _message_
during the [formatting](./formatting.md) of a _message_ at runtime.

The complete formal syntax of a _message_ is described by the [ABNF](./message.abnf).

### Well-formed vs. Valid Messages

A _message_ is **_<dfn>well-formed</dfn>_** if it satisfies all the rules of the grammar.
Attempting to parse a _message_ that is not _well-formed_ will result in a _Syntax Error_.

A _message_ is **_<dfn>valid</dfn>_** if it is _well-formed_ and
**also** meets the additional content restrictions
and semantic requirements about its structure defined below for
_declarations_, _matcher_ and _options_.
Attempting to parse a _message_ that is not _valid_ will result in a _Data Model Error_.

## The Message

A **_<dfn>message</dfn>_** is the complete template for a specific message formatting request.

A **_<dfn>variable</dfn>_** is a _name_ associated to a resolved value.

An **_<dfn>external variable</dfn>_** is a _variable_ 
whose _name_ and initial value are supplied by the caller
to MessageFormat or available in the _formatting context_.
Only an _external variable_ can appear as an _operand_ in an _input declaration_.

A **_<dfn>local variable</dfn>_** is a _variable_ created as the result of a _local declaration_.

> [!NOTE]
> This syntax is designed to be embeddable into many different programming languages and formats.
> As such, it avoids constructs, such as character escapes, that are specific to any given file
> format or processor.
> In particular, it avoids using quote characters common to many file formats and formal languages
> so that these do not need to be escaped in the body of a _message_.

> [!NOTE]
> In general (and except where required by the syntax), whitespace carries no meaning in the structure
> of a _message_. While many of the examples in this spec are written on multiple lines, the formatting
> shown is primarily for readability.
>
> > **Example** This _message_:
> >
> > ```
> > .local $foo   =   { |horse| }
> > {{You have a {$foo}!}}
> > ```
> >
> > Can also be written as:
> >
> > ```
> > .local $foo={|horse|}{{You have a {$foo}!}}
> > ```
> >
> > An exception to this is: whitespace inside a _pattern_ is **always** significant.

> [!NOTE]
> The syntax assumes that each _message_ will be displayed with a left-to-right display order
> and be processed in the logical character order.
> The syntax also permits the use of right-to-left characters in _identifiers_,
> _literals_, and other values.
> This can result in confusion when viewing the _message_.
> 
> Additional restrictions or requirements,
> such as permitting the use of certain bidirectional control characters in the syntax,
> might be added during the Tech Preview to better manage bidirectional text.
> Feedback on the creation and management of _messages_
> containing bidirectional tokens is strongly desired.

A _message_ can be a _simple message_ or it can be a _complex message_.

```abnf
message = simple-message / complex-message
```

A **_<dfn>simple message</dfn>_** contains a single _pattern_,
with restrictions on its first character.
An empty string is a valid _simple message_.

```abnf
simple-message = [simple-start pattern]
simple-start   = simple-start-char / escaped-char / placeholder
```

A **_<dfn>complex message</dfn>_** is any _message_ that contains _declarations_,
a _matcher_, or both.
A _complex message_ always begins with either a keyword that has a `.` prefix or a _quoted pattern_
and consists of:

1. an optional list of _declarations_, followed by
2. a _complex body_

```abnf
complex-message = *(declaration [s]) complex-body
```

### Declarations

A **_<dfn>declaration</dfn>_** binds a _variable_ identifier to a value within the scope of a _message_.
This _variable_ can then be used in other _expressions_ within the same _message_.
_Declarations_ are optional: many messages will not contain any _declarations_.

An **_<dfn>input-declaration</dfn>_** binds a _variable_ to an external input value.
The _variable-expression_ of an _input-declaration_
MAY include an _annotation_ that is applied to the external value.

A **_<dfn>local-declaration</dfn>_** binds a _variable_ to the resolved value of an _expression_.

For compatibility with later MessageFormat 2 specification versions,
_declarations_ MAY also include _reserved statements_.

```abnf
declaration       = input-declaration / local-declaration / reserved-statement
input-declaration = input [s] variable-expression
local-declaration = local s variable [s] "=" [s] expression
```

_Variables_, once declared, MUST NOT be redeclared. 
A _message_ that does any of the following is not _valid_ and will produce a 
_Duplicate Declaration_ error during processing:
- A _declaration_ MUST NOT bind a _variable_
  that appears as a _variable_ anywhere within a previous _declaration_.
- An _input-declaration_ MUST NOT bind a _variable_
  that appears anywhere within the _annotation_ of its _variable-expression_.
- A _local-declaration_ MUST NOT bind a _variable_ that appears in its _expression_.

A _local-declaration_ MAY overwrite an external input value as long as the
external input value does not appear in a previous _declaration_.

> [!NOTE]
> These restrictions only apply to _declarations_.
> A _placeholder_ or _selector_ can apply a different annotation to a _variable_
> than one applied to the same _variable_ named in a _declaration_.
> For example, this message is _valid_:
> ```
> .input {$var :number maximumFractionDigits=0}
> .match {$var :number maximumFractionDigits=2}
> 0 {{The selector can apply a different annotation to {$var} for the purposes of selection}}
> * {{A placeholder in a pattern can apply a different annotation to {$var :number maximumFractionDigits=3}}}
> ```
> (See the [Errors](./errors.md) section for examples of invalid messages)

#### Reserved Statements

A **_<dfn>reserved statement</dfn>_** reserves additional `.keywords`
for use by future versions of this specification.
Any such future keyword must start with `.`,
followed by two or more lower-case ASCII characters.

The rest of the statement supports
a similarly wide range of content as _reserved annotations_,
but it MUST end with one or more _expressions_.

```abnf
reserved-statement = reserved-keyword [s reserved-body] 1*([s] expression)
reserved-keyword   = "." name
```

> [!NOTE]
> The `reserved-keyword` ABNF rule is a simplification,
> as it MUST NOT be considered to match any of the existing keywords
> `.input`, `.local`, or `.match`.

This allows flexibility in future standardization,
as future definitions MAY define additional semantics and constraints
on the contents of these _reserved statements_.

Implementations MUST NOT assign meaning or semantics to a _reserved statement_:
these are reserved for future standardization.
Implementations MUST NOT remove or alter the contents of a _reserved statement_.

### Complex Body

The **_<dfn>complex body</dfn>_** of a _complex message_ is the part that will be formatted.
The _complex body_ consists of either a _quoted pattern_ or a _matcher_.

```abnf
complex-body = quoted-pattern / matcher
```

## Pattern

A **_<dfn>pattern</dfn>_** contains a sequence of _text_ and _placeholders_ to be formatted as a unit.
Unless there is an error, resolving a _message_ always results in the formatting
of a single _pattern_.

```abnf
pattern = *(text-char / escaped-char / placeholder)
```
A _pattern_ MAY be empty.

A _pattern_ MAY contain an arbitrary number of _placeholders_ to be evaluated
during the formatting process.

### Quoted Pattern

A **_<dfn>quoted pattern</dfn>_** is a _pattern_ that is "quoted" to prevent 
interference with other parts of the _message_. 
A _quoted pattern_ starts with a sequence of two U+007B LEFT CURLY BRACKET `{{` 
and ends with a sequence of two U+007D RIGHT CURLY BRACKET `}}`.

```abnf
quoted-pattern = "{{" pattern "}}"
```

A _quoted pattern_ MAY be empty.

> An empty _quoted pattern_:
>
> ```
> {{}}
> ```

### Text

**_<dfn>text</dfn>_** is the translateable content of a _pattern_.
Any Unicode code point is allowed, except for U+0000 NULL
and the surrogate code points U+D800 through U+DFFF inclusive.
The characters U+005C REVERSE SOLIDUS `\`,
U+007B LEFT CURLY BRACKET `{`, and U+007D RIGHT CURLY BRACKET `}`
MUST be escaped as `\\`, `\{`, and `\}` respectively.

In the ABNF, _text_ is represented by non-empty sequences of
`simple-start-char`, `text-char`, and `escaped-char`.
The first of these is used at the start of a _simple message_,
and matches `text-char` except for not allowing U+002E FULL STOP `.`.
The ABNF uses `content-char` as a shared base for _text_ and _quoted literal_ characters.

Whitespace in _text_, including tabs, spaces, and newlines is significant and MUST
be preserved during formatting.

```abnf
simple-start-char = content-char / s / "@" / "|"
text-char         = content-char / s / "." / "@" / "|"
quoted-char       = content-char / s / "." / "@" / "{" / "}"
reserved-char     = content-char / "."
content-char      = %x01-08        ; omit NULL (%x00), HTAB (%x09) and LF (%x0A)
                  / %x0B-0C        ; omit CR (%x0D)
                  / %x0E-1F        ; omit SP (%x20)
                  / %x21-2D        ; omit . (%x2E)
                  / %x2F-3F        ; omit @ (%x40)
                  / %x41-5B        ; omit \ (%x5C)
                  / %x5D-7A        ; omit { | } (%x7B-7D)
                  / %x7E-2FFF      ; omit IDEOGRAPHIC SPACE (%x3000)
                  / %x3001-D7FF    ; omit surrogates
                  / %xE000-10FFFF
```

When a _pattern_ is quoted by embedding the _pattern_ in curly brackets, the
resulting _message_ can be embedded into
various formats regardless of the container's whitespace trimming rules.
Otherwise, care must be taken to ensure that pattern-significant whitespace is preserved.

> **Example**
> In a Java `.properties` file, the values `hello` and `hello2` both contain
> an identical _message_ which consists of a single _pattern_.
> This _pattern_ consists of _text_ with exactly three spaces before and after the word "Hello":
>
> ```properties
> hello = {{   Hello   }}
> hello2=\   Hello  \ 
> ```

### Placeholder

A **_<dfn>placeholder</dfn>_** is an _expression_ or _markup_ that appears inside of a _pattern_
and which will be replaced during the formatting of a _message_.

```abnf
placeholder = expression / markup
```

## Matcher

A **_<dfn>matcher</dfn>_** is the _complex body_ of a _message_ that allows runtime selection
of the _pattern_ to use for formatting.
This allows the form or content of a _message_ to vary based on values
determined at runtime.

A _matcher_ consists of the keyword `.match` followed by at least one _selector_
and at least one _variant_.

When the _matcher_ is processed, the result will be a single _pattern_ that serves
as the template for the formatting process.

A _message_ can only be considered _valid_ if the following requirements are
satisfied:

- The number of _keys_ on each _variant_ MUST be equal to the number of _selectors_.
- At least one _variant_ MUST exist whose _keys_ are all equal to the "catch-all" key `*`.
- Each _selector_ MUST have an _annotation_,
  or contain a _variable_ that directly or indirectly references a _declaration_ with an _annotation_.

```abnf
matcher         = match-statement 1*([s] variant)
match-statement = match 1*([s] selector)
```

> A _message_ with a _matcher_:
>
> ```
> .input {$count :number}
> .match {$count}
> one {{You have {$count} notification.}}
> *   {{You have {$count} notifications.}}
> ```

> A _message_ containing a _matcher_ formatted on a single line:
>
> ```
> .match {:platform} windows {{Settings}} * {{Preferences}}
> ```

### Selector

A **_<dfn>selector</dfn>_** is an _expression_ that ranks or excludes the
_variants_ based on the value of the corresponding _key_ in each _variant_.
The combination of _selectors_ in a _matcher_ thus determines
which _pattern_ will be used during formatting.

```abnf
selector = expression
```

There MUST be at least one _selector_ in a _matcher_.
There MAY be any number of additional _selectors_.

> A _message_ with a single _selector_ that uses a custom _function_
> `:hasCase` which is a _selector_ that allows the _message_ to choose a _pattern_
> based on grammatical case:
>
> ```
> .match {$userName :hasCase}
> vocative {{Hello, {$userName :person case=vocative}!}}
> accusative {{Please welcome {$userName :person case=accusative}!}}
> * {{Hello!}}
> ```

> A message with two _selectors_:
>
> ```
> .input {$numLikes :integer}
> .input {$numShares :integer}
> .match {$numLikes} {$numShares}
> 0   0   {{Your item has no likes and has not been shared.}}
> 0   one {{Your item has no likes and has been shared {$numShares} time.}}
> 0   *   {{Your item has no likes and has been shared {$numShares} times.}}
> one 0   {{Your item has {$numLikes} like and has not been shared.}}
> one one {{Your item has {$numLikes} like and has been shared {$numShares} time.}}
> one *   {{Your item has {$numLikes} like and has been shared {$numShares} times.}}
> *   0   {{Your item has {$numLikes} likes and has not been shared.}}
> *   one {{Your item has {$numLikes} likes and has been shared {$numShares} time.}}
> *   *   {{Your item has {$numLikes} likes and has been shared {$numShares} times.}}
> ```

### Variant

A **_<dfn>variant</dfn>_** is a _quoted pattern_ associated with a set of _keys_ in a _matcher_.
Each _variant_ MUST begin with a sequence of _keys_,
and terminate with a valid _quoted pattern_.
The number of _keys_ in each _variant_ MUST match the number of _selectors_ in the _matcher_.

Each _key_ is separated from each other by whitespace.
Whitespace is permitted but not required between the last _key_ and the _quoted pattern_.

```abnf
variant = key *(s key) [s] quoted-pattern
key     = literal / "*"
```

#### Key

A **_<dfn>key</dfn>_** is a value in a _variant_ for use by a _selector_ when ranking
or excluding _variants_ during the _matcher_ process.
A _key_ can be either a _literal_ value or the "catch-all" key `*`.

The **_<dfn>catch-all key</dfn>_** is a special key, represented by `*`,
that matches all values for a given _selector_.

## Expressions

An **_<dfn>expression</dfn>_** is a part of a _message_ that will be determined
during the _message_'s formatting.

An _expression_ MUST begin with U+007B LEFT CURLY BRACKET `{`
and end with U+007D RIGHT CURLY BRACKET `}`.
An _expression_ MUST NOT be empty.
An _expression_ cannot contain another _expression_.
An _expression_ MAY contain one more _attributes_.

A **_<dfn>literal-expression</dfn>_** contains a _literal_,
optionally followed by an _annotation_.

A **_<dfn>variable-expression</dfn>_** contains a _variable_,
optionally followed by an _annotation_.

An **_<dfn>annotation-expression</dfn>_** contains an _annotation_ without an _operand_.

```abnf
expression            = literal-expression
                      / variable-expression
                      / annotation-expression
literal-expression    = "{" [s] literal [s annotation] *(s attribute) [s] "}"
variable-expression   = "{" [s] variable [s annotation] *(s attribute) [s] "}"
annotation-expression = "{" [s] annotation *(s attribute) [s] "}"
```

There are several types of _expression_ that can appear in a _message_.
All _expressions_ share a common syntax. The types of _expression_ are:

1. The value of a _local-declaration_
2. A _selector_
3. A kind of _placeholder_ in a _pattern_

Additionally, an _input-declaration_ can contain a _variable-expression_.

> Examples of different types of _expression_
>
> Declarations:
>
> ```
> .input {$x :function option=value}
> .local $y = {|This is an expression|}
> ```
>
> Selectors:
>
> ```
> .match {$selector :functionRequired}
> ```
>
> Placeholders:
>
> ```
> This placeholder contains a literal expression: {|literal|}
> This placeholder contains a variable expression: {$variable}
> This placeholder references a function on a variable: {$variable :function with=options}
> This placeholder contains a function expression with a variable-valued option: {:function option=$variable}
> ```

### Annotation

An **_<dfn>annotation</dfn>_** is part of an _expression_ containing either
a _function_ together with its associated _options_, or
a _private-use annotation_ or a _reserved annotation_.

```abnf
annotation = function
           / private-use-annotation
           / reserved-annotation
```

An **_<dfn>operand</dfn>_** is the _literal_ of a _literal-expression_ or
the _variable_ of a _variable-expression_.

An _annotation_ can appear in an _expression_ by itself or following a single _operand_.
When following an _operand_, the _operand_ serves as input to the _annotation_.

#### Function

A **_<dfn>function</dfn>_** is named functionality in an _annotation_.
_Functions_ are used to evaluate, format, select, or otherwise process data
values during formatting.

Each _function_ is defined by the runtime's _function registry_.
A _function_'s entry in the _function registry_ will define
whether the _function_ is a _selector_ or formatter (or both),
whether an _operand_ is required,
what form the values of an _operand_ can take,
what _options_ and _option_ values are valid,
and what outputs might result.
See [function registry](./registry.md) for more information.

A _function_ starts with a prefix sigil `:` followed by an _identifier_.
The _identifier_ MAY be followed by one or more _options_.
_Options_ are not required.

```abnf
function = ":" identifier *(s option)
```

> A _message_ with a _function_ operating on the _variable_ `$now`:
>
> ```
> It is now {$now :datetime}.
> ```

##### Options

An **_<dfn>option</dfn>_** is a key-value pair
containing a named argument that is passed to a _function_.

An _option_ has an _identifier_ and a _value_.
The _identifier_ is separated from the _value_ by an U+003D EQUALS SIGN `=` along with
optional whitespace.
The value of an _option_ can be either a _literal_ or a _variable_.

Multiple _options_ are permitted in an _annotation_.
_Options_ are separated from the preceding _function_ _identifier_
and from each other by whitespace.
Each _option_'s _identifier_ MUST be unique within the _annotation_:
an _annotation_ with duplicate _option_ _identifiers_ is not valid.

The order of _options_ is not significant.

```abnf
option = identifier [s] "=" [s] (literal / variable)
```

> Examples of _functions_ with _options_
>
> A _message_ using the `:datetime` function.
> The _option_ `weekday` has the literal `long` as its value:
>
> ```
> Today is {$date :datetime weekday=long}!
> ```

> A _message_ using the `:datetime` function.
> The _option_ `weekday` has a variable `$dateStyle` as its value:
>
> ```
> Today is {$date :datetime weekday=$dateStyle}!
> ```

#### Private-Use Annotations

A **_<dfn>private-use annotation</dfn>_** is an _annotation_ whose syntax is reserved
for use by a specific implementation or by private agreement between multiple implementations.
Implementations MAY define their own meaning and semantics for _private-use annotations_.

A _private-use annotation_ starts with either U+0026 AMPERSAND `&` or U+005E CIRCUMFLEX ACCENT `^`.

Characters, including whitespace, are assigned meaning by the implementation.
The definition of escapes in the `reserved-body` production, used for the body of
a _private-use annotation_ is an affordance to implementations that
wish to use a syntax exactly like other functions. Specifically:

- The characters `\`, `{`, and `}` MUST be escaped as `\\`, `\{`, and `\}` respectively
  when they appear in the body of a _private-use annotation_.
- The character `|` is special: it SHOULD be escaped as `\|` in a _private-use annotation_,
  but can appear unescaped as long as it is paired with another `|`.
  This is an affordance to allow _literals_ to appear in the private use syntax.

A _private-use annotation_ MAY be empty after its introducing sigil.

```abnf
private-use-annotation = private-start [[s] reserved-body]
private-start          = "^" / "&"
```

> [!NOTE]
> Users are cautioned that _private-use annotations_ cannot be reliably exchanged
> and can result in errors during formatting.
> It is generally a better idea to use the function registry
> to define additional formatting or annotation options.

> Here are some examples of what _private-use_ sequences might look like:
>
> ```
> Here's private use with an operand: {$foo &bar}
> Here's a placeholder that is entirely private-use: {&anything here}
> Here's a private-use function that uses normal function syntax: {$operand ^foo option=|literal|}
> The character \| has to be paired or escaped: {&private || |something between| or isolated: \| }
> Stop {& "translate 'stop' as a verb" might be a translator instruction or comment }
> Protect stuff in {^ph}<a>{^/ph}private use{^ph}</a>{^/ph}
> ```

#### Reserved Annotations

A **_<dfn>reserved annotation</dfn>_** is an _annotation_ whose syntax is reserved
for future standardization.

A _reserved annotation_ starts with a reserved character.
The remaining part of a _reserved annotation_, called a _reserved body_,
MAY be empty or contain arbitrary text that starts and ends with
a non-whitespace character.

This allows maximum flexibility in future standardization,
as future definitions MAY define additional semantics and constraints
on the contents of these _annotations_.

Implementations MUST NOT assign meaning or semantics to
an _annotation_ starting with `reserved-annotation-start`:
these are reserved for future standardization.
Whitespace before or after a _reserved body_ is not part of the _reserved body_.
Implementations MUST NOT remove or alter the contents of a _reserved body_,
including any interior whitespace,
but MAY remove or alter whitespace before or after the _reserved body_.

While a reserved sequence is technically "well-formed",
unrecognized _reserved-annotations_ or _private-use-annotations_ have no meaning.

```abnf
reserved-annotation       = reserved-annotation-start [[s] reserved-body]
reserved-annotation-start = "!" / "%" / "*" / "+" / "<" / ">" / "?" / "~"

reserved-body             = reserved-body-part *([s] reserved-body-part)
reserved-body-part        = reserved-char / escaped-char / quoted
```

## Markup

**_<dfn>Markup</dfn>_** _placeholders_ are _pattern_ parts
that can be used to represent non-language parts of a _message_,
such as inline elements or styling that should apply to a span of parts.

_Markup_ MUST begin with U+007B LEFT CURLY BRACKET `{`
and end with U+007D RIGHT CURLY BRACKET `}`.
_Markup_ MAY contain one more _attributes_.

_Markup_ comes in three forms:

**_<dfn>Markup-open</dfn>_** starts with U+0023 NUMBER SIGN `#` and
represents an opening element within the _message_,
such as markup used to start a span.
It MAY include _options_.

**_<dfn>Markup-standalone</dfn>_** starts with U+0023 NUMBER SIGN `#`
and has a U+002F SOLIDUS `/` immediately before its closing `}`
representing a self-closing or standalone element within the _message_.
It MAY include _options_.

**_<dfn>Markup-close</dfn>_** starts with U+002F SOLIDUS `/` and
is a _pattern_ part ending a span.

```abnf
markup = "{" [s] "#" identifier *(s option) *(s attribute) [s] ["/"] "}"  ; open and standalone
       / "{" [s] "/" identifier *(s option) *(s attribute) [s] "}"  ; close
```

> A _message_ with one `button` markup span and a standalone `img` markup element:
>
> ```
> {#button}Submit{/button} or {#img alt=|Cancel| /}.
> ```

> A _message_ with attributes in the closing tag:
>
> ```
> {#ansi attr=|bold,italic|}Bold and italic{/ansi attr=|bold|} italic only {/ansi attr=|italic|} no formatting.}
> ```

A _markup-open_ can appear without a corresponding _markup-close_.
A _markup-close_ can appear without a corresponding _markup-open_.
_Markup_ _placeholders_ can appear in any order without making the _message_ invalid.
However, specifications or implementations defining _markup_ might impose requirements
on the pairing, ordering, or contents of _markup_ during _formatting_.

## Attributes

**_Attributes_ are reserved for standardization by future versions of this specification._**
Examples in this section are meant to be illustrative and
might not match future requirements or usage.

> [!NOTE]
> The Tech Preview does not provide a built-in mechanism for overriding
> values in the _formatting context_ (most notably the locale)
> Nor does it provide a mechanism for identifying specific expressions
> such as by assigning a name or id.
> The utility of these types of mechanisms has been debated.
> There are at least two proposed mechanisms for implementing support for
> these. 
> Specifically, one mechanism would be to reserve specifically-named options, 
> possibly using a Unicode namespace (i.e. `locale=xxx` or `u:locale=xxx`).
> Such options would be reserved for use in any and all functions or markup.
> The other mechanism would be to use the reserved "expression attribute" syntax
> for this purpose (i.e. `@locale=xxx` or `@id=foo`)
> Neither mechanism was included in this Tech Preview.
> Feedback on the preferred mechanism for managing these features
> is strongly desired.
> 
> In the meantime, function authors and other implementers are cautioned to avoid creating 
> function-specific or implementation-specific option values for this purpose.
> One workaround would be to use the implementation's namespace for these 
> features to insure later interoperability when such a mechanism is finalized 
> during the Tech Preview period.
> Specifically:
> - Avoid specifying an option for setting the locale of an expression as different from
>   that of the overall _message_ locale, or use a namespace that later maps to the final
>   mechanism.
> - Avoid specifying options for the purpose of linking placeholders
>   (such as to pair opening markup to closing markup).
>   If such an option is created, the implementer should use an
>   implementation-specific namespace.
>   Users and implementers are cautioned that such options might be
>   replaced with a standard mechanism in a future version.
> - Avoid specifying generic options to communicate with translators and 
>   translation tooling (i.e. implementation-specific options that apply to all
>   functions.
> The above are all desirable features.
> We welcome contributions to and proposals for such features during the
> Technical Preview.

An **_<dfn>attribute</dfn>_** is an _identifier_ with an optional value
that appears in an _expression_ or in _markup_.

_Attributes_ are prefixed by a U+0040 COMMERCIAL AT `@` sign,
followed by an _identifier_.
An _attribute_ MAY have a _value_ which is separated from the _identifier_
by an U+003D EQUALS SIGN `=` along with optional whitespace.
The _value_ of an _attribute_ can be either a _literal_ or a _variable_.

Multiple _attributes_ are permitted in an _expression_ or _markup_.
Each _attribute_ is separated by whitespace.

The order of _attributes_ is not significant.


```abnf
attribute = "@" identifier [[s] "=" [s] (literal / variable)]
```

> Examples of _expressions_ and _markup_ with _attributes_:
>
> A _message_ including a _literal_ that should not be translated:
>
> ```
> In French, "{|bonjour| @translate=no}" is a greeting
> ```
>
> A _message_ with _markup_ that should not be copied:
>
> ```
> Have a {#span @can-copy}great and wonderful{/span @can-copy} birthday!
> ```

## Other Syntax Elements

This section defines common elements used to construct _messages_.

### Keywords

A **_<dfn>keyword</dfn>_** is a reserved token that has a unique meaning in the _message_ syntax.

The following three keywords are defined: `.input`, `.local`, and `.match`.
Keywords are always lowercase and start with U+002E FULL STOP `.`.

```abnf
input = %s".input"
local = %s".local"
match = %s".match"
```

### Literals

A **_<dfn>literal</dfn>_** is a character sequence that appears outside
of _text_ in various parts of a _message_.
A _literal_ can appear
as a _key_ value,
as the _operand_ of a _literal-expression_,
or in the value of an _option_.
A _literal_ MAY include any Unicode code point
except for U+0000 NULL or the surrogate code points U+D800 through U+DFFF.

All code points are preserved.

A **_<dfn>quoted</dfn>_** literal begins and ends with U+005E VERTICAL BAR `|`.
The characters `\` and `|` within a _quoted_ literal MUST be
escaped as `\\` and `\|`.

An **_<dfn>unquoted</dfn>_** literal is a _literal_ that does not require the `|`
quotes around it to be distinct from the rest of the _message_ syntax.
An _unquoted_ MAY be used when the content of the _literal_
contains no whitespace and otherwise matches the `unquoted` production.
Any _unquoted_ literal MAY be _quoted_.
Implementations MUST NOT distinguish between _quoted_ and _unquoted_ literals
that have the same sequence of code points.

_Unquoted_ literals can contain a _name_ or consist of a _number-literal_.
A _number-literal_ uses the same syntax as JSON and is intended for the encoding 
of number values in _operands_ or _options_, or as _keys_ for _variants_.

```abnf
literal        = quoted / unquoted
quoted         = "|" *(quoted-char / escaped-char) "|"
unquoted       = name / number-literal
number-literal = ["-"] (%x30 / (%x31-39 *DIGIT)) ["." 1*DIGIT] [%i"e" ["-" / "+"] 1*DIGIT]
```

### Names and Identifiers

An **_<dfn>identifier</dfn>_** is a character sequence that
identifies a _function_, _markup_, or _option_.
Each _identifier_ consists of a _name_ optionally preceeded by
a _namespace_. 
When present, the _namespace_ is separated from the _name_ by a
U+003A COLON `:`.
Built-in _functions_ and their _options_ do not have a _namespace_ identifier.

The _namespace_ `u` (U+0075 LATIN SMALL LETTER U)
is reserved for future standardization.

_Function_ _identifiers_ are prefixed with `:`.
_Markup_ _identifiers_ are prefixed with `#` or `/`.
_Option_ _identifiers_ have no prefix.

A **_<dfn>name</dfn>_** is a character sequence used in an _identifier_ 
or as the name for a _variable_
or the value of an _unquoted_ _literal_.

_Variable_ names are prefixed with `$`.

Valid content for _names_ is based on <cite>Namespaces in XML 1.0</cite>'s 
[NCName](https://www.w3.org/TR/xml-names/#NT-NCName).
This is different from XML's [Name](https://www.w3.org/TR/xml/#NT-Name)
in that it MUST NOT contain a U+003A COLON `:`.
Otherwise, the set of characters allowed in a _name_ is large.

> [!NOTE]
> _External variables_ can be passed in that are not valid _names_.
> Such variables cannot be referenced in a _message_,
> but are not otherwise errors.

Examples:
> A variable:
>```
> This has a {$variable}
>```
> A function:
> ```
> This has a {:function}
> ```
> An add-on function from the `icu` namespace:
> ```
> This has a {:icu:function}
> ```
> An option and an add-on option:
> ```
> This has {:options option=value icu:option=add_on}
> ```

Support for _namespaces_ and their interpretation is implementation-defined
in this release.

```abnf
variable   = "$" name
option     = identifier [s] "=" [s] (literal / variable)

identifier = [namespace ":"] name
namespace  = name
name       = name-start *name-char
name-start = ALPHA / "_"
           / %xC0-D6 / %xD8-F6 / %xF8-2FF
           / %x370-37D / %x37F-1FFF / %x200C-200D
           / %x2070-218F / %x2C00-2FEF / %x3001-D7FF
           / %xF900-FDCF / %xFDF0-FFFC / %x10000-EFFFF
name-char  = name-start / DIGIT / "-" / "."
           / %xB7 / %x300-36F / %x203F-2040
```

### Escape Sequences

An **_<dfn>escape sequence</dfn>_** is a two-character sequence starting with
U+005C REVERSE SOLIDUS `\`.

An _escape sequence_ allows the appearance of lexically meaningful characters
in the body of _text_, _quoted_, or _reserved_
(which includes, in this case, _private-use_) sequences.
Each _escape sequence_ represents the literal character immediately following the initial `\`.

```abnf
escaped-char = backslash ( backslash / "{" / "|" / "}" )
backslash    = %x5C ; U+005C REVERSE SOLIDUS "\"
```

> [!NOTE]
> The `escaped-char` rule allows escaping some characters in places where
> they do not need to be escaped, such as braces in a _quoted_ _literal_.
> For example, `|foo {bar}|` and `|foo \{bar\}|` are synonymous.

When writing or generating a _message_, escape sequences SHOULD NOT be used
unless required by the syntax.
That is, inside _literals_ only escape `|` 
and inside _patterns_ only escape `{` and `}`.

### Whitespace

**_<dfn>Whitespace</dfn>_** is defined as one or more of
U+0009 CHARACTER TABULATION (tab), 
U+000A LINE FEED (new line),
U+000D CARRIAGE RETURN, 
U+3000 IDEOGRAPHIC SPACE, 
or U+0020 SPACE.

Inside _patterns_ and _quoted literals_,
whitespace is part of the content and is recorded and stored verbatim.
Whitespace is not significant outside translatable text, except where required by the syntax.

> [!NOTE]
> The character U+3000 IDEOGRAPHIC SPACE is included in whitespace for
> compatibility with certain East Asian keyboards and input methods,
> in which users might accidentally create these characters in a _message_.

```abnf
s = 1*( SP / HTAB / CR / LF / %x3000 )
```

## Complete ABNF

The grammar is formally defined in [`message.abnf`](./message.abnf)
using the ABNF notation [[STD68](https://www.rfc-editor.org/info/std68)],
including the modifications found in [RFC 7405](https://www.rfc-editor.org/rfc/rfc7405).

RFC7405 defines a variation of ABNF that is case-sensitive.
Some ABNF tools are only compatible with the specification found in
[RFC 5234](https://www.rfc-editor.org/rfc/rfc5234). 
To make `message.abnf` compatible with that version of ABNF, replace
the rules of the same name with this block:

```abnf
input = %x2E.69.6E.70.75.74  ; ".input"
local = %x2E.6C.6F.63.61.6C  ; ".local"
match = %x2E.6D.61.74.63.68  ; ".match"
```

# MessageFormat 2.0 Errors

Errors can occur during the processing of a _message_.
Some errors can be detected statically, 
such as those due to problems with _message_ syntax,
violations of requirements in the data model,
or requirements defined by a _function_.
Other errors might be detected during selection or formatting of a given _message_.
Where available, the use of validation tools is recommended,
as early detection of errors makes their correction easier.

## Error Handling

_Syntax Errors_ and _Data Model Errors_ apply to all message processors,
and MUST be emitted as soon as possible.
The other error categories are only emitted during formatting,
but it might be possible to detect them with validation tools.

During selection and formatting,
_expression_ handlers MUST only emit _Message Function Errors_.

Implementations do not have to check for or emit _Resolution Errors_
or _Message Function Errors_ in _expressions_ that are not otherwise used by the _message_,
such as _placeholders_ in unselected _patterns_
or _declarations_ that are never referenced during _formatting_.

In all cases, when encountering a runtime error,
a message formatter MUST provide some representation of the message.
An informative error or errors MUST also be separately provided.

When a message contains more than one error,
or contains some error which leads to further errors,
an implementation which does not emit all of the errors
SHOULD prioritise _Syntax Errors_ and _Data Model Errors_ over others.

When an error occurs within a _selector_,
the _selector_ MUST NOT match any _variant_ _key_ other than the catch-all `*`
and a _Resolution Error_ or a _Message Function Error_ MUST be emitted.

## Syntax Errors

**_<dfn>Syntax Errors</dfn>_** occur when the syntax representation of a message is not well-formed.

> Example invalid messages resulting in a _Syntax Error_:
>
> ```
> {{Missing end braces
> ```
>
> ```
> {{Missing one end brace}
> ```
>
> ```
> Unknown {{expression}}
> ```
>
> ```
> .local $var = {|no message body|}
> ```

## Data Model Errors

**_<dfn>Data Model Errors</dfn>_** occur when a message is invalid due to
violating one of the semantic requirements on its structure.

### Variant Key Mismatch

A **_<dfn>Variant Key Mismatch</dfn>_** occurs when the number of keys on a _variant_
does not equal the number of _selectors_.

> Example invalid messages resulting in a _Variant Key Mismatch_ error:
>
> ```
> .match {$one :func}
> 1 2 {{Too many}}
> * {{Otherwise}}
> ```
>
> ```
> .match {$one :func} {$two :func}
> 1 2 {{Two keys}}
> * {{Missing a key}}
> * * {{Otherwise}}
> ```

### Missing Fallback Variant

A **_<dfn>Missing Fallback Variant</dfn>_** error occurs when the message
does not include a _variant_ with only catch-all keys.

> Example invalid messages resulting in a _Missing Fallback Variant_ error:
>
> ```
> .match {$one :func}
> 1 {{Value is one}}
> 2 {{Value is two}}
> ```
>
> ```
> .match {$one :func} {$two :func}
> 1 * {{First is one}}
> * 1 {{Second is one}}
> ```

### Missing Selector Annotation

A **_<dfn>Missing Selector Annotation</dfn>_** error occurs when the _message_
contains a _selector_ that does not have an _annotation_,
or contains a _variable_ that does not directly or indirectly reference a _declaration_ with an _annotation_.

> Examples of invalid messages resulting in a _Missing Selector Annotation_ error:
>
> ```
> .match {$one}
> 1 {{Value is one}}
> * {{Value is not one}}
> ```
>
> ```
> .local $one = {|The one|}
> .match {$one}
> 1 {{Value is one}}
> * {{Value is not one}}
> ```
>
> ```
> .input {$one}
> .match {$one}
> 1 {{Value is one}}
> * {{Value is not one}}
> ```

### Duplicate Declaration

A **_<dfn>Duplicate Declaration</dfn>_** error occurs when a _variable_ is declared more than once.
Note that an input _variable_ is implicitly declared when it is first used,
so explicitly declaring it after such use is also an error.

> Examples of invalid messages resulting in a _Duplicate Declaration_ error:
>
> ```
> .input {$var :number maximumFractionDigits=0}
> .input {$var :number minimumFractionDigits=0}
> {{Redeclaration of the same variable}}
>
> .local $var = {$ext :number maximumFractionDigits=0}
> .input {$var :number minimumFractionDigits=0}
> {{Redeclaration of a local variable}}
>
> .input {$var :number minimumFractionDigits=0}
> .local $var = {$ext :number maximumFractionDigits=0}
> {{Redeclaration of an input variable}}
>
> .input {$var :number minimumFractionDigits=$var2}
> .input {$var2 :number}
> {{Redeclaration of the implicit input variable $var2}}
>
> .local $var = {$ext :someFunction}
> .local $var = {$error}
> .local $var2 = {$var2 :error}
> {{{$var} cannot be redefined. {$var2} cannot refer to itself}}
> ```

### Duplicate Option Name

A **_<dfn>Duplicate Option Name</dfn>_** error occurs when the same _identifier_
appears on the left-hand side of more than one _option_ in the same _expression_.

> Examples of invalid messages resulting in a _Duplicate Option Name_ error:
>
> ```
> Value is {42 :number style=percent style=decimal}
> ```
>
> ```
> .local $foo = {horse :func one=1 two=2 one=1}
> {{This is {$foo}}}
> ```

## Resolution Errors

**_<dfn>Resolution Errors</dfn>_** occur when the runtime value of a part of a message
cannot be determined.

### Unresolved Variable

An **_<dfn>Unresolved Variable</dfn>_** error occurs when a variable reference cannot be resolved.

> For example, attempting to format either of the following messages
> would result in an _Unresolved Variable_ error if done within a context that
> does not provide for the variable reference `$var` to be successfully resolved:
>
> ```
> The value is {$var}.
> ```
>
> ```
> .match {$var :func}
> 1 {{The value is one.}}
> * {{The value is not one.}}
> ```

### Unknown Function

An **_<dfn>Unknown Function</dfn>_** error occurs when an _expression_ includes
a reference to a function which cannot be resolved.

> For example, attempting to format either of the following messages
> would result in an _Unknown Function_ error if done within a context that
> does not provide for the function `:func` to be successfully resolved:
>
> ```
> The value is {horse :func}.
> ```
>
> ```
> .match {|horse| :func}
> 1 {{The value is one.}}
> * {{The value is not one.}}
> ```

### Unsupported Expression

An **_<dfn>Unsupported Expression</dfn>_** error occurs when an expression uses
syntax reserved for future standardization,
or for private implementation use that is not supported by the current implementation.

> For example, attempting to format this message
> would result in an _Unsupported Expression_ error
> because it includes a _reserved annotation_.
>
> ```
> The value is {!horse}.
> ```
>
> Attempting to format this message would result in an _Unsupported Expression_ error
> if done within a context that does not support the `^` private use sigil:
>
> ```
> .match {|horse| ^private}
> 1 {{The value is one.}}
> * {{The value is not one.}}
> ```

### Unsupported Statement

An **_<dfn>Unsupported Statement</dfn>_** error occurs when a message includes a _reserved statement_.

> For example, attempting to format this message
> would result in an _Unsupported Statement_ error:
>
> ```
> .some {|horse|}
> {{The message body}}
> ```

### Bad Selector

A **_<dfn>Bad Selector</dfn>_** error occurs when a message includes a _selector_
with a resolved value which does not support selection.

> For example, attempting to format this message
> would result in a _Bad Selector_ error:
>
> ```
> .local $day = {|2024-05-01| :date}
> .match {$day}
> * {{The due date is {$day}}}
> ```

## Message Function Errors

A **_<dfn>Message Function Error</dfn>_** is any error that occurs
when calling a message function implementation
or which depends on validation associated with a specific function.

Implementations SHOULD provide a way for _functions_ to emit 
(or cause to be emitted) any of the types of error defined in this section.
Implementations MAY also provide implementation-defined _Message Function Error_ types.

> For example, attempting to format any of the following messages
> might result in a _Message Function Error_ if done within a context that
>
> 1. Provides for the variable reference `$user` to resolve to
>    an object `{ name: 'Kat', id: 1234 }`,
> 2. Provides for the variable reference `$field` to resolve to
>    a string `'address'`, and
> 3. Uses a `:get` message function which requires its argument to be an object and
>    an option `field` to be provided with a string value.
>
> The exact type of _Message Function Error_ is determined by the message function implementation.
>
> ```
> Hello, {horse :get field=name}!
> ```
>
> ```
> Hello, {$user :get}!
> ```
>
> ```
> .local $id = {$user :get field=id}
> {{Hello, {$id :get field=name}!}}
> ```
>
> ```
> Your {$field} is {$id :get field=$field}
> ```

### Bad Operand

A **_<dfn>Bad Operand</dfn>_** error is any error that occurs due to the content or format of the _operand_,
such as when the _operand_ provided to a _function_ during _function resolution_ does not match one of the
expected implementation-defined types for that function;
or in which a literal _operand_ value does not have the required format
and thus cannot be processed into one of the expected implementation-defined types
for that specific _function_.

> For example, the following _messages_ each produce a _Bad Operand_ error
> because the literal `|horse|` does not match the `number-literal` production,
> which is a requirement of the function `:number` for its operand:
>
> ```
> .local $horse = {|horse| :number}
> {{You have a {$horse}.}}
> ```
>
> ```
> .match {|horse| :number}
> 1 {{The value is one.}}
> * {{The value is not one.}}
> ```

### Bad Option

A **_<dfn>Bad Option</dfn>_** error is an error that occurs when there is
an implementation-defined error with an _option_ or its value.
These might include:
- A required _option_ is missing.
- Mutually exclusive _options_ are supplied.
- An _option_ value provided to a _function_ during _function resolution_
   does not match one of the implementation-defined types or values for that _function_;
   or in which the literal _option_ value does not have the required format
   and thus cannot be processed into one of the expected
   implementation-defined types for that specific _function_.

> For example, the following _message_ might produce a _Bad Option_ error
> because the literal `foo` does not match the production `digit-size-option`,
> which is a requirement of the function `:number` for its `minimumFractionDigits` _option_:
>
> ```
> The answer is {42 :number minimumFractionDigits=foo}.
> ```

### Bad Variant Key

A **_<dfn>Bad Variant Key</dfn>_** error is an error that occurs when a _variant_ _key_
does not match the expected implementation-defined format.

> For example, the following _message_ produces a _Bad Variant Key_ error
> because `horse` is not a recognized plural category and
> does not match the `number-literal` production,
> which is a requirement of the `:number` function:
>
> ```
> .match {42 :number}
> 1     {{The value is one.}}
> horse {{The value is a horse.}}
> *     {{The value is not one.}}
> ```

# WIP DRAFT MessageFormat 2.0 Registry

Implementations and tooling can greatly benefit from a
structured definition of formatting and matching functions available to messages at runtime.
This specification is intended to provide a mechanism for storing such declarations in a portable manner.

## Goals

_This section is non-normative._

The registry provides a machine-readable description of MessageFormat 2 extensions (custom functions),
in order to support the following goals and use-cases:

- Validate semantic properties of messages. For example:
  - Type-check values passed into functions.
  - Validate that matching functions are only called in selectors.
  - Validate that formatting functions are only called in placeholders.
  - Verify the exhaustiveness of variant keys given a selector.
- Support the localization roundtrip. For example:
  - Generate variant keys for a given locale during XLIFF extraction.
- Improve the authoring experience. For example:
  - Forbid edits to certain function options (e.g. currency options).
  - Autocomplete function and option names.
  - Display on-hover tooltips for function signatures with documentation.
  - Display/edit known message metadata.
  - Restrict input in GUI by providing a dropdown with all viable option values.

## Conformance and Use

_This section is normative._

To be conformant with MessageFormat 2.0, an implementation MUST implement
the _functions_, _options_ and _option_ values, _operands_ and outputs
described in the section [Default Registry](#default-registry) below.

Implementations MAY implement additional _functions_ or additional _options_.
In particular, implementations are encouraged to provide feedback on proposed
_options_ and their values.

> [!IMPORTANT]
> In the Tech Preview, the [registry data model](#registry-data-model) should
> be regarded as experimental.
> Changes to the format are expected during this period.
> Feedback on the registry's format and implementation is encouraged!

Implementations are not required to provide a machine-readable registry 
nor to read or interpret the registry data model in order to be conformant.

The MessageFormat 2.0 Registry was created to describe
the core set of formatting and selection _functions_,
including _operands_, _options_, and _option_ values.
This is the minimum set of functionality needed for conformance.
By using the same names and values, _messages_ can be used interchangeably
by different implementations,
regardless of programming language or runtime environment.
This ensures that developers do not have to relearn core MessageFormat syntax
and functionality when moving between platforms
and that translators do not need to know about the runtime environment for most
selection or formatting operations.

The registry provides a machine-readable description of _functions_
suitable for tools, such as those used in translation automation, so that
variant expansion and information about available _options_ and their effects
are available in the translation ecosystem.
To that end, implementations are strongly encouraged to provide appropriately
tailored versions of the registry for consumption by tools
(even if not included in software distributions)
and to encourage any add-on or plug-in functionality to provide
a registry to support localization tooling.

## Registry Data Model

_This section is non-normative._

> [!IMPORTANT]
> This part of the specification is not part of the Tech Preview.

The registry contains descriptions of function signatures.
[`registry.dtd`](./registry.dtd) describes its data model.

The main building block of the registry is the `<function>` element.
It represents an implementation of a custom function available to translation at runtime.
A function defines a human-readable `<description>` of its behavior
and one or more machine-readable _signatures_ of how to call it.
Named `<validationRule>` elements can optionally define regex validation rules for
literals, option values, and variant keys.

MessageFormat 2 functions can be invoked in two contexts:

- inside placeholders, to produce a part of the message's formatted output;
  for example, a raw value of `|1.5|` may be formatted to `1,5` in a language which uses commas as decimal separators,
- inside selectors, to contribute to selecting the appropriate variant among all given variants.

A single _function name_ may be used in both contexts,
regardless of whether it's implemented as one or multiple functions.

A _signature_ defines one particular set of at most one argument and any number of named options
that can be used together in a single call to the function.
`<formatSignature>` corresponds to a function call inside a placeholder inside translatable text.
`<matchSignature>` corresponds to a function call inside a selector.

A signature may define the positional argument of the function with the `<input>` element.
If the `<input>` element is not present, the function is defined as a nullary function.
A signature may also define one or more `<option>` elements representing _named options_ to the function.
An option can be omitted in a call to the function,
unless the `required` attribute is present.
They accept either a finite enumeration of values (the `values` attribute)
or validate their input with a regular expression (the `validationRule` attribute).
Read-only options (the `readonly` attribute) can be displayed to translators in CAT tools, but may not be edited.

As the `<input>` and `<option>` rules may be locale-dependent,
each signature can include an `<override locales="...">` that extends and overrides
the corresponding input and options rules.
If multiple `<override>` elements would match the current locale,
only the first one is used.

Matching-function signatures additionally include one or more `<match>` elements
to define the keys against which they can match when used as selectors.

Functions may also include `<alias>` definitions,
which provide shorthands for commonly used option baskets.
An _alias name_ may be used equivalently to a _function name_ in messages.
Its `<setOption>` values are always set, and may not be overridden in message annotations.

If a `<function>`, `<input>` or `<option>` includes multiple `<description>` elements,
each SHOULD have a different `xml:lang` attribute value.
This allows for the descriptions of these elements to be themselves localized
according to the preferred locale of the message authors and editors.

## Example

The following `registry.xml` is an example of a registry file
which may be provided by an implementation to describe its built-in functions.
For the sake of brevity, only `locales="en"` is considered.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry xml:lang="en">
    <function name="platform">
        <description>Match the current OS.</description>
        <matchSignature>
            <match values="windows linux macos android ios"/>
        </matchSignature>
    </function>

    <validationRule id="anyNumber" regex="-?[0-9]+(\.[0-9]+)"/>
    <validationRule id="positiveInteger" regex="[0-9]+"/>
    <validationRule id="currencyCode" regex="[A-Z]{3}"/>

    <function name="number">
        <description>
            Format a number.
            Match a **formatted** numerical value against CLDR plural categories or against a number literal.
        </description>

        <matchSignature>
            <input validationRule="anyNumber"/>
            <option name="type" values="cardinal ordinal"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <!-- Since this applies to both cardinal and ordinal, all plural options are valid. -->
            <match locales="en" values="one two few other" validationRule="anyNumber"/>
            <match values="zero one two few many other" validationRule="anyNumber"/>
        </matchSignature>

        <formatSignature>
            <input validationRule="anyNumber"/>
            <option name="minimumIntegerDigits" validationRule="positiveInteger"/>
            <option name="minimumFractionDigits" validationRule="positiveInteger"/>
            <option name="maximumFractionDigits" validationRule="positiveInteger"/>
            <option name="minimumSignificantDigits" validationRule="positiveInteger"/>
            <option name="maximumSignificantDigits" validationRule="positiveInteger"/>
            <option name="style" readonly="true" values="decimal currency percent unit" default="decimal"/>
            <option name="currency" readonly="true" validationRule="currencyCode"/>
        </formatSignature>

        <alias name="integer">
          <description>Locale-sensitive integral number formatting</description>
          <setOption name="maximumFractionDigits" value="0" />
          <setOption name="style" value="decimal" />
        </alias>
    </function>
</registry>
```

Given the above description, the `:number` function is defined to work both in a selector and a placeholder:

```
.match {$count :number}
1 {{One new message}}
* {{{$count :number} new messages}}
```

Furthermore,
`:number`'s `<matchSignature>` contains two `<match>` elements
which allow the validation of variant keys.
The element whose `locales` best matches the current locale
using resource item [lookup](https://unicode.org/reports/tr35/#Lookup) from LDML is used.
An element with no `locales` attribute is the default
(and is considered equivalent to the `root` locale).

- `<match locales="en" values="one two few other" .../>` can be used in locales like `en` and `en-GB`
  to validate the `when other` variant by verifying that the `other` key is present
  in the list of enumarated values: `one other`.
- `<match ... validationRule="anyNumber"/>` can be used to valide the `when 1` variant
  by testing the `1` key against the `anyNumber` regular expression defined in the registry file.

---

A localization engineer can then extend the registry by defining the following `customRegistry.xml` file.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE registry SYSTEM "./registry.dtd">

<registry xml:lang="en">
    <function name="noun">
        <description>Handle the grammar of a noun.</description>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="plural" values="one other"/>
                <option name="case" values="nominative genitive" default="nominative"/>
            </override>
        </formatSignature>
    </function>

    <function name="adjective">
        <description>Handle the grammar of an adjective.</description>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="plural" values="one other"/>
                <option name="case" values="nominative genitive" default="nominative"/>
            </override>
        </formatSignature>
        <formatSignature>
            <override locales="en">
                <input/>
                <option name="article" values="definite indefinite"/>
                <option name="accord"/>
            </override>
        </formatSignature>
    </function>
</registry>
```

Messages can now use the `:noun` and the `:adjective` functions.
The following message references the first signature of `:adjective`,
which expects the `plural` and `case` options:

> ```
> You see {$color :adjective article=indefinite plural=one case=nominative} {$object :noun case=nominative}!
> ```

The following message references the second signature of `:adjective`,
which only expects the `accord` option:

>```
> .input {$object :noun case=nominative}
> {{You see {$color :adjective article=indefinite accord=$object} {$object}!}}
>```

# Default Registry

> [!IMPORTANT]
> This part of the specification is part of the Tech Preview
> and is **_NORMATIVE_**.

This section describes the functions which each implementation MUST provide
to be conformant with this specification.

> [!NOTE]
> The [Stability Policy](/spec#stability-policy) allows for updates to
> Default Registry functions to add support for new options.
> As implementations are permitted to ignore options that they do not support,
> it is possible to write messages using options not defined below
> which currently format with no error, but which could produce errors
> when formatted with a later edition of the Default Registry.
> Therefore, using options not explicitly defined here is NOT RECOMMENDED.

## String Value Selection and Formatting

### The `:string` function

The function `:string` provides string selection and formatting.

#### Operands

The _operand_ of `:string` is either any implementation-defined type
that is a string or for which conversion to a string is supported,
or any _literal_ value.
All other values produce a _Bad Operand_ error.

> For example, in Java, implementations of the `java.lang.CharSequence` interface
> (such as `java.lang.String` or `java.lang.StringBuilder`),
> the type `char`, or the class `java.lang.Character` might be considered
> as the "implementation-defined types".
> Such an implementation might also support other classes via the method `toString()`.
> This might be used to enable selection of a `enum` value by name, for example.
>
> Other programming languages would define string and character sequence types or
> classes according to their local needs, including, where appropriate,
> coercion to string.

#### Options

The function `:string` has no options.

> [!NOTE]
> Proposals for string transformation options or implementation
> experience with user requirements is desired during the Tech Preview.

#### Selection

When implementing [`MatchSelectorKeys(resolvedSelector, keys)`](/spec/formatting.md#resolve-preferences)
where `resolvedSelector` is the resolved value of a _selector_ _expression_
and `keys` is a list of strings,
the `:string` selector performs as described below.

1. Let `compare` be the string value of `resolvedSelector`.
1. Let `result` be a new empty list of strings.
1. For each string `key` in `keys`:
   1. If `key` and `compare` consist of the same sequence of Unicode code points, then
      1. Append `key` as the last element of the list `result`.
1. Return `result`.

> [!NOTE]
> Matching of `key` and `compare` values is sensitive to the sequence of code points
> in each string.
> As a result, variations in how text can be encoded can affect the performance of matching.
> The function `:string` does not perform case folding or Unicode Normalization of string values.
> Users SHOULD encode _messages_ and their parts (such as _keys_ and _operands_),
> in Unicode Normalization Form C (NFC) unless there is a very good reason
> not to.
> See also: [String Matching](https://www.w3.org/TR/charmod-norm)

> [!NOTE]
> Unquoted string literals in a _variant_ do not include spaces.
> If users wish to match strings that include whitespace
> (including U+3000 `IDEOGRAPHIC SPACE`)
> to a key, the `key` needs to be quoted.
>
> For example:
> ```
> .match {$string :string}
> | space key | {{Matches the string " space key "}}
> *             {{Matches the string "space key"}}
> ```

#### Formatting

The `:string` function returns the string value of the resolved value of the _operand_.

## Numeric Value Selection and Formatting

### The `:number` function

The function `:number` is a selector and formatter for numeric values.

#### Operands

The function `:number` requires a [Number Operand](#number-operands) as its _operand_.

#### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale, 
the value of other options, or both.

> [!NOTE]
> The names of _options_ and their _values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)
> in JavaScript's `Intl.NumberFormat`.

The following options and their values are required to be available on the function `:number`:
- `select`
   -  `plural` (default; see [Default Value of `select` Option](#default-value-of-select-option) below)
   -  `ordinal`
   -  `exact`
- `compactDisplay` (this option only has meaning when combined with the option `notation=compact`)
   - `short` (default)
   - `long`
- `notation`
   - `standard` (default)
   - `scientific`
   - `engineering`
   - `compact`
- `numberingSystem`
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
     (default is locale-specific)
- `signDisplay`
   -  `auto` (default)
   -  `always`
   -  `exceptZero`
   -  `negative`
   -  `never`
- `style`
  - `decimal` (default)
  - `percent` (see [Percent Style](#percent-style) below)
- `useGrouping`
  - `auto` (default)
  - `always`
  - `never`
  - `min2`
- `minimumIntegerDigits`
  - ([digit size option](#digit-size-options), default: `1`)
- `minimumFractionDigits`
  - ([digit size option](#digit-size-options))
- `maximumFractionDigits`
  - ([digit size option](#digit-size-options))
- `minimumSignificantDigits`
  - ([digit size option](#digit-size-options))
- `maximumSignificantDigits`
  - ([digit size option](#digit-size-options))

> [!NOTE]
> The following options and option values are being developed during the Technical Preview
> period.

The following values for the option `style` are _not_ part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `currency`
- `unit`

The following options are _not_ part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `currency`
   - valid [Unicode Currency Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCurrencyIdentifier)
     (no default)
- `currencyDisplay`
   - `symbol` (default)
   - `narrowSymbol`
   - `code`
   - `name`
- `currencySign`
  - `accounting`
  - `standard` (default)
- `unit`
   - (anything not empty)
- `unitDisplay`
   - `long`
   - `short` (default)
   - `narrow`

##### Default Value of `select` Option

The value `plural` is the default for the option `select` 
because it is the most common use case for numeric selection.
It can be used for exact value matches but also allows for the grammatical needs of 
languages using CLDR's plural rules.
This might not be noticeable in the source language (particularly English), 
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering a locale's need for a `one` plural:
> ```
> .match {$var :number}
> 1   {{You have one last chance}}
> one {{You have {$var} chance remaining}}
> *   {{You have {$var} chances remaining}}
> ```
>
> The `one` variant is needed by languages such as Polish or Russian.
> Such locales typically also require other keywords such as `two`, `few`, and `many`.

##### Percent Style
When implementing `style=percent`, the numeric value of the _operand_ 
MUST be multiplied by 100 for the purposes of formatting.

> For example,
> ```
> The total was {0.5 :number style=percent}.
> ```
> should format in a manner similar to:
> > The total was 50%.

#### Selection

The _function_ `:number` performs selection as described in [Number Selection](#number-selection) below.

### The `:integer` function

The function `:integer` is a selector and formatter for matching or formatting numeric 
values as integers.

#### Operands

The function `:integer` requires a [Number Operand](#number-operands) as its _operand_.


#### Options

Some options do not have default values defined in this specification.
The defaults for these options are implementation-dependent.
In general, the default values for such options depend on the locale, 
the value of other options, or both.

> [!NOTE]
> The names of _options_ and their _values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options)
> in JavaScript's `Intl.NumberFormat`.

The following options and their values are required in the default registry to be available on the 
function `:integer`:
- `select`
   -  `plural` (default)
   -  `ordinal`
   -  `exact`
- `numberingSystem`
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
     (default is locale-specific)
- `signDisplay`
   -  `auto` (default)
   -  `always`
   -  `exceptZero`
   -  `negative`
   -  `never`
- `style`
  - `decimal` (default)
  - `percent` (see [Percent Style](#percent-style) below)
- `useGrouping`
  - `auto` (default)
  - `always`
  - `min2`
- `minimumIntegerDigits`
  - ([digit size option](#digit-size-options), default: `1`)
- `maximumSignificantDigits`
  - ([digit size option](#digit-size-options))

> [!NOTE]
> The following options and option values are being developed during the Technical Preview
> period.

The following values for the option `style` are _not_ part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `currency`
- `unit`

The following options are _not_ part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `currency`
   - valid [Unicode Currency Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCurrencyIdentifier)
     (no default)
- `currencyDisplay`
   - `symbol` (default)
   - `narrowSymbol`
   - `code`
   - `name`
- `currencySign`
  - `accounting`
  - `standard` (default)
- `unit`
   - (anything not empty)
- `unitDisplay`
   - `long`
   - `short` (default)
   - `narrow`

##### Default Value of `select` Option

The value `plural` is the default for the option `select` 
because it is the most common use case for numeric selection.
It can be used for exact value matches but also allows for the grammatical needs of 
languages using CLDR's plural rules.
This might not be noticeable in the source language (particularly English), 
but can cause problems in target locales that the original developer is not considering.

> For example, a naive developer might use a special message for the value `1` without
> considering a locale's need for a `one` plural:
> ```
> .match {$var :integer}
> 1   {{You have one last chance}}
> one {{You have {$var} chance remaining}}
> *   {{You have {$var} chances remaining}}
> ```
>
> The `one` variant is needed by languages such as Polish or Russian.
> Such locales typically also require other keywords such as `two`, `few`, and `many`.

##### Percent Style
When implementing `style=percent`, the numeric value of the _operand_ 
MUST be multiplied by 100 for the purposes of formatting.

> For example,
> ```
> The total was {0.5 :number style=percent}.
> ```
> should format in a manner similar to:
> > The total was 50%.

#### Selection

The _function_ `:integer` performs selection as described in [Number Selection](#number-selection) below.

### Number Operands

The _operand_ of a number function is either an implementation-defined type or
a literal whose contents match the `number-literal` production in the [ABNF](/spec/message.abnf).
All other values produce a _Bad Operand_ error.

> For example, in Java, any subclass of `java.lang.Number` plus the primitive
> types (`byte`, `short`, `int`, `long`, `float`, `double`, etc.) 
> might be considered as the "implementation-defined numeric types".
> Implementations in other programming languages would define different types
> or classes according to their local needs.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as numeric values as long as their
> contents match the `number-literal` production in the [ABNF](/spec/message.abnf).
>
> For example, if the value of the variable `num` were the string
> `-1234.567`, it would behave identically to the local
> variable in this example:
> ```
> .local $example = {|-1234.567| :number}
> {{{$num :number} == {$example}}}
> ```

> [!NOTE]
> Implementations are encouraged to provide support for compound types or data structures
> that provide additional semantic meaning to the formatting of number-like values.
> For example, in ICU4J, the type `com.ibm.icu.util.Measure` can be used to communicate
> a value that includes a unit
> or the type `com.ibm.icu.util.CurrencyAmount` can be used to set the currency and related
> options (such as the number of fraction digits).

### Digit Size Options

Some _options_ of number _functions_ are defined to take a "digit size option".
Implementations of number _functions_ use these _options_ to control aspects of numeric display
such as the number of fraction, integer, or significant digits.

A "digit size option" is an _option_ value that the _function_ interprets
as a small integer value greater than or equal to zero.
Implementations MAY define an upper limit on the resolved value 
of a digit size option option consistent with that implementation's practical limits.

In most cases, the value of a digit size option will be a string that
encodes the value as a decimal integer.
Implementations MAY also accept implementation-defined types as the value.
When provided as a string, the representation of a digit size option matches the following ABNF:
>```abnf
> digit-size-option = "0" / (("1"-"9") [DIGIT])
>```


### Number Selection

Number selection has three modes:
- `exact` selection matches the operand to explicit numeric keys exactly
- `plural` selection matches the operand to explicit numeric keys exactly
  or to plural rule categories if there is no explicit match
- `ordinal` selection matches the operand to explicit numeric keys exactly
  or to ordinal rule categories if there is no explicit match

When implementing [`MatchSelectorKeys(resolvedSelector, keys)`](/spec/formatting.md#resolve-preferences)
where `resolvedSelector` is the resolved value of a _selector_ _expression_
and `keys` is a list of strings,
numeric selectors perform as described below.

1. Let `exact` be the JSON string representation of the numeric value of `resolvedSelector`.
   (See [Determining Exact Literal Match](#determining-exact-literal-match) for details)
1. Let `keyword` be a string which is the result of [rule selection](#rule-selection) on `resolvedSelector`.
1. Let `resultExact` be a new empty list of strings.
1. Let `resultKeyword` be a new empty list of strings.
1. For each string `key` in `keys`:
   1. If the value of `key` matches the production `number-literal`, then
      1. If `key` and `exact` consist of the same sequence of Unicode code points, then
         1. Append `key` as the last element of the list `resultExact`.
   1. Else if `key` is one of the keywords `zero`, `one`, `two`, `few`, `many`, or `other`, then
      1. If `key` and `keyword` consist of the same sequence of Unicode code points, then
         1. Append `key` as the last element of the list `resultKeyword`.
   1. Else, emit a _Bad Variant Key_ error.
1. Return a new list whose elements are the concatenation of the elements (in order) of `resultExact` followed by the elements (in order) of `resultKeyword`.

> [!NOTE]
> Implementations are not required to implement this exactly as written.
> However, the observed behavior must be consistent with what is described here.

#### Rule Selection

If the option `select` is set to `exact`, rule-based selection is not used.
Return the empty string.

> [!NOTE]
> Since valid keys cannot be the empty string in a numeric expression, returning the
> empty string disables keyword selection.

If the option `select` is set to `plural`, selection should be based on CLDR plural rule data
of type `cardinal`. See [charts](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
for examples.

If the option `select` is set to `ordinal`, selection should be based on CLDR plural rule data
of type `ordinal`. See [charts](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html)
for examples.

Apply the rules defined by CLDR to the resolved value of the operand and the function options,
and return the resulting keyword.
If no rules match, return `other`.

> **Example.**
> In CLDR 44, the Czech (`cs`) plural rule set can be found
> [here](https://www.unicode.org/cldr/charts/44/supplemental/language_plural_rules.html#cs).
>
> A message in Czech might be:
> ```
> .match {$numDays :number}
> one  {{{$numDays} den}}
> few  {{{$numDays} dny}}
> many {{{$numDays} dne}}
> *    {{{$numDays} dní}}
> ```
> Using the rules found above, the results of various _operand_ values might look like:
> | Operand value | Keyword | Formatted Message |
> |---|---|---|
> | 1 | `one` | 1 den |
> | 2 | `few` | 2 dny |
> | 5 | `other` | 5 dní |
> | 22 | `few` | 22 dny |
> | 27 | `other` | 27 dní |
> | 2.4 | `many` | 2,4 dne |

#### Determining Exact Literal Match

> [!IMPORTANT]
> The exact behavior of exact literal match is only defined for non-zero-filled
> integer values.
> Annotations that use fraction digits or significant digits might work in specific
> implementation-defined ways.
> Users should avoid depending on these types of keys in message selection.


Number literals in the MessageFormat 2 syntax use the 
[format defined for a JSON number](https://www.rfc-editor.org/rfc/rfc8259#section-6).
A `resolvedSelector` exactly matches a numeric literal `key`
if, when the numeric value of `resolvedSelector` is serialized using the format for a JSON number,
the two strings are equal.

> [!NOTE]
> Only integer matching is required in the Technical Preview.
> Feedback describing use cases for fractional and significant digits-based
> selection would be helpful.
> Otherwise, users should avoid using matching with fractional numbers or significant digits.

## Date and Time Value Formatting

This subsection describes the functions and options for date/time formatting.
Selection based on date and time values is not required in this release.

> [!NOTE]
> Selection based on date/time types is not required by MF2.
> Implementations should use care when defining selectors based on date/time types.
> The types of queries found in implementations such as `java.time.TemporalAccessor`
> are complex and user expectations may be inconsistent with good I18N practices.

### The `:datetime` function

The function `:datetime` is used to format date/time values, including
the ability to compose user-specified combinations of fields.

If no options are specified, this function defaults to the following:
- `{$d :datetime}` is the same as `{$d :datetime dateStyle=short timeStyle=short}`

> [!NOTE]
> The default formatting behavior of `:datetime` is inconsistent with `Intl.DateTimeFormat`
> in JavaScript and with `{d,date}` in ICU MessageFormat 1.0.
> This is because, unlike those implementations, `:datetime` is distinct from `:date` and `:time`.

#### Operands

The _operand_ of the `:datetime` function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce a _Bad Operand_ error.

#### Options

The `:datetime` function can use either the appropriate _style options_ 
or can use a collection of _field options_ (but not both) to control the formatted 
output.

If both are specified, a _Bad Option_ error MUST be emitted
and a _fallback value_ used as the resolved value of the _expression_.

> [!NOTE]
> The names of _options_ and their _values_ were derived from the
> [options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions#description)
> in JavaScript's `Intl.DateTimeFormat`.

##### Style Options

The function `:datetime` has these _style options_.
- `dateStyle`
  - `full`
  - `long`
  - `medium`
  - `short`
- `timeStyle`
  - `full`
  - `long`
  - `medium`
  - `short`

##### Field Options

_Field options_ describe which fields to include in the formatted output
and what format to use for that field.
The implementation may use this _annotation_ to configure which fields
appear in the formatted output.

> [!NOTE]
> _Field options_ do not have default values because they are only to be used
> to compose the formatter.

The _field options_ are defined as follows:

> [!IMPORTANT]
> The value `2-digit` for some _field options_ **must** be quoted
> in the MessageFormat syntax because it starts with a digit
> but does not match the `number-literal` production in the ABNF.
> ```
> .local $correct = {$someDate :datetime year=|2-digit|}
> .local $syntaxError = {$someDate :datetime year=2-digit}
> ```

The function `:datetime` has the following options:
- `weekday`
  - `long`
  - `short`
  - `narrow`
- `era`
  - `long`
  - `short`
  - `narrow`
- `year`
  - `numeric`
  - `2-digit`
- `month`
  - `numeric`
  - `2-digit`
  - `long`
  - `short`
  - `narrow`
- `day`
  - `numeric`
  - `2-digit`
- `hour`
  - `numeric`
  - `2-digit`
- `minute`
  - `numeric`
  - `2-digit`
- `second`
  - `numeric`
  - `2-digit`
- `fractionalSecondDigits`
  - `1`
  - `2`
  - `3`
- `hourCycle` (default is locale-specific)
  - `h11`
  - `h12`
  - `h23`
  - `h24`
- `timeZoneName`
  - `long`
  - `short`
  - `shortOffset`
  - `longOffset`
  - `shortGeneric`
  - `longGeneric`

> [!NOTE]
> The following options do not have default values because they are only to be used
> as overrides for locale-and-value dependent implementation-defined defaults.

The following date/time options are **not** part of the default registry.
Implementations SHOULD avoid creating options that conflict with these, but
are encouraged to track development of these options during Tech Preview:
- `calendar` (default is locale-specific)
  - valid [Unicode Calendar Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeCalendarIdentifier)
- `numberingSystem` (default is locale-specific)
   - valid [Unicode Number System Identifier](https://cldr-smoke.unicode.org/spec/main/ldml/tr35.html#UnicodeNumberSystemIdentifier)
- `timeZone` (default is system default time zone or UTC)
  - valid identifier per [BCP175](https://www.rfc-editor.org/rfc/rfc6557)
 
### The `:date` function

The function `:date` is used to format the date portion of date/time values.

If no options are specified, this function defaults to the following:
- `{$d :date}` is the same as `{$d :date style=short}`

#### Operands

The _operand_ of the `:date` function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce a _Bad Operand_ error.

#### Options

The function `:date` has these _options_:
- `style`
  - `full`
  - `long`
  - `medium`
  - `short` (default)

### The `:time` function

The function `:time` is used to format the time portion of date/time values.

If no options are specified, this function defaults to the following:
- `{$t :time}` is the same as `{$t :time style=short}`

#### Operands

The _operand_ of the `:time` function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined in [Date and Time Operand](#date-and-time-operands).
All other _operand_ values produce a _Bad Operand_ error.

#### Options

The function `:time` has these _options_:
- `style`
  - `full`
  - `long`
  - `medium`
  - `short` (default)


### Date and Time Operands

The _operand_ of a date/time function is either 
an implementation-defined date/time type
or a _date/time literal value_, as defined below.
All other _operand_ values produce a _Bad Operand_ error.

A **_<dfn>date/time literal value</dfn>_** is a non-empty string consisting of an ISO 8601 date,
or an ISO 8601 datetime optionally followed by a timezone offset.
As implementations differ slightly in their parsing of such strings,
ISO 8601 date and datetime values not matching the following regular expression MAY also be supported.
Furthermore, matching this regular expression does not guarantee validity,
given the variable number of days in each month.

```regexp
(?!0000)[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?(Z|[+-]((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?)?
```

When the time is not present, implementations SHOULD use `00:00:00` as the time.
When the offset is not present, implementations SHOULD use a floating time type
(such as Java's `java.time.LocalDateTime`) to represent the time value.
For more information, see [Working with Timezones](https://w3c.github.io/timezone).

> [!IMPORTANT]
> The [ABNF](/spec/message.abnf) and [syntax](/spec/syntax.md) of MF2
> do not formally define date/time literals. 
> This means that a _message_ can be syntactically valid but produce
> a _Bad Operand_ error at runtime.

> [!NOTE]
> String values passed as variables in the _formatting context_'s
> _input mapping_ can be formatted as date/time values as long as their
> contents are date/time literals.
>
> For example, if the value of the variable `now` were the string
> `2024-02-06T16:40:00Z`, it would behave identically to the local
> variable in this example:
> ```
> .local $example = {|2024-02-06T16:40:00Z| :datetime}
> {{{$now :datetime} == {$example}}}
> ```

> [!NOTE]
> True time zone support in serializations is expected to coincide with the adoption
> of Temporal in JavaScript.
> The form of these serializations is known and is a de facto standard.
> Support for these extensions is expected to be required in the post-tech preview.
> See: https://datatracker.ietf.org/doc/draft-ietf-sedate-datetime-extended/

