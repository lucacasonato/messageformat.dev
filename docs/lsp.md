---
title: Using MF2 in editors and IDEs
sidebar_title: Editors and IDEs
description: The MF2 language server provides code completion, diagnostics, and other features for editors and IDEs.
---

MessageFormat 2 is a programming language, and as such, it can be helpful to
have tooling support in editors and IDEs. The
[MF2 tools](https://github.com/lucacasonato/mf2-tools) project (not affiliated
with Unicode) provides a language server and syntax highlighting grammar that
can be used in various editors and IDEs.

This page provides instructions for setting up the MF2 language server in
various editors and IDEs.

## Features

The MF2 language server and TextMate grammar provide the following features:

- Syntax and semantic highlighting
- Diagnostics (syntax errors, early errors)
- Variable completion
- Variable rename
- Go to definition for variables
- Quick fixes for some errors
- Formatting

## Editors and IDEs

### Visual Studio Code

To use the MF2 language server in Visual Studio Code, install the extension from
the Visual Studio Code Marketplace.

[Install the MF2 extension for Visual Studio Code.](https://marketplace.visualstudio.com/items?itemName=nicolo-ribaudo.vscode-mf2)

Once installed, the extension will automatically start the language server when
a `.mf2` file is opened. The extension provides all features available in the
MF2 language server.

<table><tr><td style="width:50%">

```mf2
.input {$pronoun :string}
.input {$name :string}
.match $pronoun
he {{His name is {$name}.}}
she {{Her name is {$name}.}}
* {{Their name is {$name}.}}
```

</td><td>

![screenshot](https://raw.githubusercontent.com/lucacasonato/mf2-tools/main/vscode/media/formatting.png)

_Syntax highlighting, and formatting_

</td></tr><tr><td>

![screenshot](https://raw.githubusercontent.com/lucacasonato/mf2-tools/main/vscode/media/js_constructor.png)

_Syntax highlighting in Intl.MessageFormat constructor_

</td><td>

![screenshot](https://raw.githubusercontent.com/lucacasonato/mf2-tools/main/vscode/media/js_template.png)

_Syntax highlighting in JavaScript template string_

</td></tr><tr><td>

![screenshot](https://raw.githubusercontent.com/lucacasonato/mf2-tools/main/vscode/media/rename.png)

_Variable rename_

</td><td>

![screenshot](https://raw.githubusercontent.com/lucacasonato/mf2-tools/main/vscode/media/diagnostic.png)

_Diagnostics for syntax errors_

</td></tr></table>

### Other editors and IDEs

The MF2 language server can be used in other editors and IDEs that support the
Language Server Protocol. The language server is available in binary form from
the
[MF2 tools releases page](https://github.com/lucacasonato/mf2-tools/releases/tag/0.1.1).

The TextMate grammar is available in the repository at
[`vscode/syntaxes/mf2.tmLanguage.json`](https://github.com/lucacasonato/mf2-tools/blob/main/vscode/syntaxes/mf2.tmLanguage.json).

To configure your editor or IDE to use the MF2 language server and TextMate
grammar, follow the instructions for your specific editor or IDE.
