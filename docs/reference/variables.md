---
title: Variable Declarations
description: Variables are used to dynamically insert values into localized messages.
---

A declaration binds a variable identifier to a value within the scope of a message. This variable can then be used in other expressions within the same message. Declarations are optional: many messages will not contain any declarations.

An **input** declaration binds a variable to an external input value.

A **local** declaration binds a variable to the value of an expression. `.local` is like `const` in JavaScript.

<mf2-interactive>

```mf2
.input {$x :number style=percent}
.local $y = {|This is an expression|}
{{$y}}
```

</mf2-interactive>

This message works without errors as long as `x` is provided as an external input value. If so, then the annotation in the `.input` declaration is applied to the value passed in for `x`: it's formatted as a number with the style "percent".

`.input` declarations are optional, so a variable that appears without a declaration is assumed to be an external input value.

<mf2-interactive>

```mf2
{{$y}}
```

</mf2-interactive>

The formatter signals a runtime error if `y` is not provided as an external input value.

The value of a variable can't be self-referential, and a variable declared with `.local` can't be referenced before they are used. Also, the same variable can't be declared multiple times.