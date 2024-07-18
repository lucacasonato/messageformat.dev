---
title: Literals
description: Number and text literals are used as arguments to functions and matchers.
---

In the example below, `long` is a _literal_. Literals can appear in various contexts in an MF2 message. For example, the right-hand side (part appearing to the right of an '=' sign) of an option can be either a variable or a literal. You can tell that it's a literal in this case because it doesn't begin with `$`. Rarely, literals have to be quoted (enclosed in `|` / `|` characters).

```mf2
Today is {$date :datetime weekday=long}.
```

The text `|image.png|` is an example of a _quoted_ literal. It has to be quoted because it includes a '.' character. In general, literals containing non-alphanumeric characters have to be quoted.