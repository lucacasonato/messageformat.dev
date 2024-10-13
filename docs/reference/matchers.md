---
title: Matchers
description: Matchers enable pluralization and gender selection based on message values.
---

A _matcher_ is a feature in MessageFormat that lets you group together different _variants_ of a message, in which one variant is chosen based on runtime data.

<mf2-interactive>

```mf2
.input {$count :number}
.match $count
one {{You have {$count} week.}}
*   {{You have {$count} weeks.}}
```

```json
{"count": 15}
```

</mf2-interactive>

Matchers match based on values of variables. Variables must be declared before the matcher, in a `.local` or `.input` declaration. This annotation determines how selection is done. In this case, the annotation `:number` means that `$count` is examined as a numerical value based on its plural category, which happens to be the default selection category for numbers (the other options include ordinal categories for instance). `:number` is an example of a _selector function_. You might remember that `:number` is also a _formatting function_. Some functions are both a selector and a formatter, while others can only be one or the other.

The `:number` function has the built-in ability to map values onto plural categories. This mapping is based on CLDR data and it doesn't have to be provided to the formatter explicitly.

The `.match` keyword has to be followed by a variable: in this case, `$count`. We call `$count` the _selector_ of a matcher.

`one` and `*` are both _keys_. The key `one` matches the runtime value of `$count` based on that value's plural category. The key `*` is special and matches any value.

The quoted pattern that follows each key is the pattern to use if the key matches.

More complicated matchers can have multiple keys and multiple selectors.

Let's work through how this message is formatted depending on the runtime value of `$count`. Suppose `$count` is `1`.
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

<mf2-interactive>

```mf2
.input {$count :number}
.match $count
one   {{Masz {$count} tydzień.}}
few   {{Masz {$count} tygodnie.}}
many  {{Masz {$count} tygodni.}}
other {{Masz {$count} tygodnia.}}
*     {{Masz {$count} tygodnia.}}
```

```json
{"count": 5}
```

</mf2-interactive>

This shows why the `:number` selector is useful: when translating the first example
from English to Polish, the translator knows how to create a Polish version
that covers all the plural categories. For more information, see the
[CLDR page](https://cldr.unicode.org/index/cldr-spec/plural-rules) on plural rules.

(By the way, the `*` variant is always required. This example could be rewritten
without the `other` variant, but we showed it for expository reasons.)
