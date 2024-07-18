---
title: Markup
description: Markup allows localized messages to be richly formatted.
---

Another type of placeholder is a _markup placeholder_. A markup placeholder can be "open", "close", or "standalone". This example shows open and close markup placeholders.

<mf2-interactive>

```mf2
Click {#link}here{/link}. {#b}{$count}{/b}
```

</mf2-interactive>

`{#link}` is an opening markup placeholder, while `{/link}` is a closing markup placeholder.

Markup is not specific to any particular markup language such as HTML. The message formatter doesn't interpret markup. It simply passes pieces of markup through into the formatted result.