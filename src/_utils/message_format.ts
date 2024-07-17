import {
  MessageExpressionPart,
  MessageFormat,
} from "npm:messageformat@4.0.0-7";

export { MessageFormat };

export function formatMessageToHTML(
  { output, message, data }: {
    output: HTMLElement;
    message: MessageFormat;
    data: Record<string, unknown>;
  },
) {
  const errors: string[] = [];

  try {
    const parts = message.formatToParts(
      data,
      // deno-lint-ignore no-explicit-any
      (error) => errors.push((error as any).message),
    );
    let currentElement: HTMLElement = output;
    for (const part of parts) {
      if (part.type === "markup" && "kind" in part) {
        if (part.kind === "standalone" && part.name === "star-icon") {
          const starIcon = document.createElement("span");
          starIcon.textContent = "⭐";
          currentElement.appendChild(starIcon);
          continue;
        } else if (part.kind === "open" || part.kind === "standalone") {
          switch (part.name) {
            case "bold": {
              const bold = document.createElement("strong");
              currentElement.appendChild(bold);
              currentElement = bold;
              break;
            }
            case "italic": {
              const italic = document.createElement("em");
              currentElement.appendChild(italic);
              currentElement = italic;
              break;
            }
            case "error": {
              const errorred = document.createElement("span");
              errorred.classList.add("text-red-600");
              currentElement.appendChild(errorred);
              currentElement = errorred;
              break;
            }
            case "link": {
              const link = document.createElement("a");
              link.href = part.options?.url as string;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              currentElement.appendChild(link);
              currentElement = link;
              break;
            }
            default: {
              errors.push(`Unknown markup: ${part.name}`);
            }
          }
        }
        if (part.kind === "close" || part.kind === "standalone") {
          if (currentElement === output) {
            errors.push(`Unexpected close: ${part.name}`);
          }
          switch (part.name) {
            case "bold": {
              if (currentElement.tagName !== "STRONG") {
                errors.push(`Unexpected close: ${part.name}`);
              }
              break;
            }
            case "italic": {
              if (currentElement.tagName !== "EM") {
                errors.push(`Unexpected close: ${part.name}`);
              }
              break;
            }
            case "error": {
              if (!currentElement.classList.contains("text-red-600")) {
                errors.push(`Unexpected close: ${part.name}`);
              }
              break;
            }
            case "link": {
              if (currentElement.tagName !== "A") {
                errors.push(`Unexpected close: ${part.name}`);
              }
              break;
            }
            default: {
              errors.push(`Unknown markup: ${part.name}`);
              continue;
            }
          }
          currentElement = currentElement.parentElement!;
        }
      } else {
        const p = part as MessageExpressionPart;
        let text = "";
        if (p.parts) {
          for (const part of p.parts) {
            text += String(part.value);
          }
        } else if (p.value) {
          text = String(p.value);
        } else {
          text = p.source;
        }
        currentElement.appendChild(document.createTextNode(text));
      }
    }
    if (currentElement !== output) {
      errors.push("Unclosed markup");
    }

    return errors;
  } catch (e) {
    errors.push(e.message);
    return errors;
  }
}
