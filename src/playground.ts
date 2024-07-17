import { MessageFormat } from "npm:messageformat@4.0.0-7";
import locales from "npm:locale-codes@1.3.1";
import { MessageExpressionPart } from "npm:messageformat@4.0.0-7";

const supportedLocales = locales.all
  .map((locale) => {
    if (locale.location == null) return null;
    try {
      return {
        locale: new Intl.Locale(locale.tag),
        name: locale.name,
        region: locale.location,
      };
    } catch {
      return null;
    }
  })
  .filter((locale) => locale !== null) as {
    locale: Intl.Locale;
    name: string;
    region: string;
  }[];

document.addEventListener("DOMContentLoaded", () => {
  const localeSelect = document.getElementById("locale") as HTMLSelectElement;
  const shareButton = document.getElementById("share") as HTMLButtonElement;
  const messageArea = document.getElementById("message") as HTMLTextAreaElement;
  const messageErrors = document.getElementById(
    "message-errors",
  ) as HTMLDivElement;
  const dataArea = document.getElementById("data") as HTMLTextAreaElement;
  const dataErrors = document.getElementById("data-errors") as HTMLDivElement;
  const outputArea = document.getElementById("output") as HTMLDivElement;
  const outputErrors = document.getElementById(
    "output-errors",
  ) as HTMLDivElement;

  localeSelect.addEventListener("change", onUpdate);
  shareButton.addEventListener("click", share);
  messageArea.addEventListener("input", onUpdate);
  dataArea.addEventListener("input", onUpdate);

  localeSelect.innerHTML = "";

  for (const { locale, name, region } of supportedLocales) {
    const option = document.createElement("option");
    option.value = locale.baseName;
    option.textContent = `${name} (${region})`;
    if (locale.baseName === "en-US") {
      option.selected = true;
    }
    localeSelect.appendChild(option);
  }

  const hash = window.location.hash.slice(1);
  try {
    if (hash) {
      const [encodedMessage, encodedData, encodedLocale] = hash.split(".");
      const message = atob(encodedMessage);
      const data = atob(encodedData);
      const locale = atob(encodedLocale);
      messageArea.value = message;
      dataArea.value = data;
      localeSelect.value = locale;
      onUpdate();
    }
  } catch (_) {
    // Ignore errors
  }

  function share() {
    navigator.clipboard.writeText(window.location.href);
    shareButton.textContent = "Copied!";
    setTimeout(() => {
      shareButton.textContent = "Share";
    }, 1000);
  }

  function onUpdate() {
    const locale = localeSelect.value;
    const message = messageArea.value;
    const data = dataArea.value;

    messageErrors.textContent = "";
    messageErrors.hidden = true;
    dataErrors.textContent = "";
    dataErrors.hidden = true;
    outputArea.textContent = "";
    outputErrors.textContent = "";
    outputErrors.hidden = true;

    let mf2: MessageFormat | null = null;
    try {
      mf2 = new MessageFormat(message, locale);
    } catch (e) {
      messageErrors.textContent = e.message;
      messageErrors.hidden = false;
    }

    let dataObj: Record<string, unknown> = {};
    try {
      dataObj = JSON.parse(data);
    } catch (e) {
      dataErrors.textContent = e.message;
      dataErrors.hidden = false;
    }

    if (mf2 !== null) {
      const errors = [];
      try {
        const parts = mf2.formatToParts(
          dataObj,
          // deno-lint-ignore no-explicit-any
          (error) => errors.push((error as any).message),
        );
        let currentElement: HTMLElement = outputArea;
        for (const part of parts) {
          if (part.type === "markup" && "kind" in part) {
            if (part.kind === "open" || part.kind === "standalone") {
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
              if (currentElement === outputArea) {
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
        if (currentElement !== outputArea) {
          errors.push("Unclosed markup");
        }
      } catch (e) {
        errors.push(e.message);
      }
      if (errors.length > 0) {
        outputErrors.textContent = errors.join("\n");
        outputErrors.hidden = false;
      }
    }

    const encodedMessage = btoa(messageArea.value);
    const encodedData = btoa(dataArea.value);
    const encodedLocale = btoa(localeSelect.value);
    const hash = `#${encodedMessage}.${encodedData}.${encodedLocale}`
      .replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
    history.replaceState(null, "", hash);
  }
});
