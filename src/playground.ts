import locales from "npm:locale-codes@1.3.1";
import { formatMessageToHTML, MessageFormat } from "./_utils/message_format.ts";

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
      const errors = formatMessageToHTML({
        output: outputArea,
        message: mf2,
        data: dataObj,
      });
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
