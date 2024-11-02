import type { HighlightToken } from "../textarea.ts";

export function* jsonHighlight(text: string): Generator<HighlightToken> {
  type State =
    | "start"
    | "object"
    | "object-after-key"
    | "object-after-colon"
    | "object-after-value"
    | "array"
    | "array-after-value"
    | "done";

  let index = 0;
  let state: State = "start";
  const stack: State[] = [];

  function error(length: number, diagnostic: string) {
    return {
      label: "error",
      start: index,
      end: index + length,
      diagnostic,
      priority: 1,
      hoverable: true,
    };
  }

  function bracket(length: number) {
    const i = (stack.length % 3) + 1;

    return {
      label: "brackets" + i,
      start: index,
      end: index + length,
      priority: 2,
      hoverable: false,
    };
  }

  while (index < text.length) {
    const char = text[index];

    switch (char) {
      case "{":
        if (state === "start" || state === "array") {
          yield bracket(1);
          stack.push(state);
          state = "object";
        } else {
          yield error(1, `Unexpected character ${char}`);
        }
        index++;
        break;
      case "}":
        if (state === "object" || state === "object-after-value") {
          state = stack.pop()!;
          yield bracket(1);
        } else {
          yield error(1, `Unexpected character ${char}`);
        }
        index++;
        break;
      case "[":
        if (
          state === "start" || state === "array" ||
          state === "object-after-colon"
        ) {
          yield bracket(1);
          stack.push(state);
          state = "array";
        } else {
          yield error(1, `Unexpected character ${char}`);
        }
        index++;
        break;
      case "]":
        if (state === "array" || state === "array-after-value") {
          state = stack.pop()!;
          if (state === "object-after-colon") state = "object-after-value";
          else if (state === "array") state = "array-after-value";
          else if (state === "start") state = "done";
          yield bracket(1);
        } else {
          yield error(1, `Unexpected character ${char}`);
        }
        index++;
        break;
      case ",":
        if (state === "object-after-value") {
          state = "object";
        } else if (state === "array-after-value") {
          state = "array";
        } else if (state === "object-after-colon") {
          state = "object";
          yield error(1, `Unexpected character ${char}`);
        } else {
          yield error(1, `Unexpected character ${char}`);
        }
        index++;
        break;
      case ":":
        if (state === "object-after-key") {
          state = "object-after-colon";
        } else {
          yield error(1, `Unexpected character ${char}`);
        }
        index++;
        break;
      case '"': {
        const start = index;
        index++;
        while (index < text.length && text[index] !== '"') {
          if (text[index] === "\\") {
            index++;
            index++;
          } else {
            index++;
          }
        }
        index++;
        if (index > text.length) {
          yield {
            label: "error",
            start,
            end: index - 1,
            diagnostic: "Unterminated string literal",
            priority: 1,
          };
          break;
        }
        yield {
          label: "string",
          start,
          end: index,
          priority: 2,
        };
        if (state === "start") state = "done";
        else if (state === "object") state = "object-after-key";
        else if (state === "object-after-colon") state = "object-after-value";
        else if (state === "array") state = "array-after-value";
        else yield error(1, `Unexpected character ${char}`);
        break;
      }
      case "t":
      case "f":
      case "n": {
        const start = index;
        let errored = false;
        if (text.slice(index, index + 4) === "true") {
          index += 4;
          yield {
            label: "boolean",
            start,
            end: index,
            priority: 2,
          };
        } else if (text.slice(index, index + 5) === "false") {
          index += 5;
          yield {
            label: "boolean",
            start,
            end: index,
            priority: 2,
          };
        } else if (text.slice(index, index + 4) === "null") {
          index += 4;
          yield {
            label: "boolean",
            start,
            end: index,
            priority: 2,
          };
        } else {
          const start = index;
          while (
            text[index] !== "," && text[index] !== "}" && text[index] !== "]"
          ) {
            index++;
          }
          yield {
            label: "error",
            start,
            end: index,
            diagnostic: "Unexpected token",
            priority: 1,
          };
          errored = true;
        }
        if (!errored) {
          if (state === "start") state = "done";
          else if (state === "object-after-colon") state = "object-after-value";
          else if (state === "array") state = "array-after-value";
          else {yield {
              label: "error",
              start,
              end: index,
              diagnostic: "Unexpected token",
              priority: 1,
            };}
        }
        break;
      }
      case " ":
      case "\t":
      case "\n":
      case "\r":
        index++;
        break;
      case "-":
      case ".":
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        const start = index;
        index++;
        while (
          /[0-9.]/.test(text[index]) && index < text.length
        ) {
          index++;
        }
        yield {
          label: "number",
          start,
          end: index,
          priority: 2,
        };
        if (state === "start") state = "done";
        else if (state === "object-after-colon") state = "object-after-value";
        else if (state === "array") state = "array-after-value";
        else yield error(1, `Unexpected character ${char}`);
        break;
      }
      default:
        yield error(1, `Unexpected character ${char}`);
        index++;
        break;
    }
  }
}
