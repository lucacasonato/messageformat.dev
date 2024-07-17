import { MessageFormat } from "npm:messageformat@4.0.0-7";

export class Mf2Interactive extends HTMLElement {
  #locale: string = "en-US";

  #codeInput: HTMLTextAreaElement | null = null;
  #dataInput: HTMLTextAreaElement | null = null;
  #output: HTMLDivElement | null = null;
  #share: HTMLAnchorElement | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#locale = this.attributes.getNamedItem("locale")?.value ??
      this.#locale;

    console.log("locale", this.#locale);

    const codeEl = this.querySelector("code.language-mf2");
    const code = codeEl?.textContent ?? null;
    const dataEl = this.querySelector("code.language-json");
    const data = dataEl?.textContent ?? null;

    if (code !== null) {
      this.#codeInput = document.createElement("textarea");
      this.#codeInput.classList.add("code");
      this.#codeInput.value = code.replace(/\n$/, "");
      this.#codeInput.spellcheck = false;
      // temporary fix for browsers that don't have `field-sizing: content;` yet
      this.#codeInput.rows = this.#codeInput.value.split("\n").length;
      const codePreEl = codeEl!.parentElement!;
      codeEl!.remove();
      codePreEl.replaceWith(this.#codeInput);
      this.#codeInput.addEventListener("input", this.#onChange.bind(this));
    }

    if (data !== null) {
      this.#dataInput = document.createElement("textarea");
      this.#dataInput.classList.add("data");
      this.#dataInput.value = data.replace(/\n$/, "");
      this.#dataInput.spellcheck = false;
      // temporary fix for browsers that don't have `field-sizing: content;` yet
      this.#dataInput.rows = this.#dataInput.value.split("\n").length;
      const dataPreEl = dataEl!.parentElement!;
      dataEl!.remove();
      dataPreEl.replaceWith(this.#dataInput);
      this.#dataInput.addEventListener("input", this.#onChange.bind(this));
    }

    const header = document.createElement("div");
    header.classList.add("header");
    const title = document.createElement("span");
    title.classList.add("title");
    title.textContent = "TRY IT OUT";
    const actions = document.createElement("div");
    const locale = document.createElement("span");
    locale.classList.add("locale");
    locale.textContent = this.#locale;
    actions.appendChild(locale);
    this.#share = document.createElement("a");
    this.#share.classList.add("share");
    this.#share.innerHTML =
      `Playground <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 0.825rem; height: 0.825rem"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
`;
    actions.appendChild(this.#share);
    header.appendChild(title);
    header.appendChild(actions);
    this.insertBefore(header, this.firstChild);

    this.#output = document.createElement("div");
    this.#output.classList.add("output");
    this.appendChild(this.#output);

    this.#onChange();
  }

  #onChange() {
    if (
      this.#codeInput === null || this.#output === null || this.#share === null
    ) {
      return;
    }

    const code = this.#codeInput.value;
    const data = this.#dataInput?.value ?? "{}";

    this.#output.classList.remove("error");

    const encodedMessage = btoa(code);
    const encodedData = btoa(data);
    const encodedLocale = btoa(this.#locale);
    const hash = `#${encodedMessage}.${encodedData}.${encodedLocale}`
      .replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
    this.#share.href = `/playground/${hash}`;

    try {
      const mf = new MessageFormat(code, this.#locale);
      const output = mf.format(JSON.parse(data));
      this.#output.innerText = output;
    } catch (e) {
      this.#output.classList.add("error");
      this.#output.innerText = e.message;
    }
  }
}

customElements.define("mf2-interactive", Mf2Interactive);
