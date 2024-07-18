---
title: Functions
description: Function annotations enable dynamically executing code from a message to format values, or retrieve environment information.
---

When you write an annotation in your MessageFormat message, then underneath the hood, the formatter calls a function. These could either be built-in functions that aim to assist you in performing common i18n operations like formatting common data types or custom functions that are registered by the user in the function registry. The syntax for making function calls is as follows, with the operand followed by the function name and finally the options.

```mf2
Today is {$date :datetime weekday=long}.

Check out {:img src=|image.png|}.
```