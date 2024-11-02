import { LocalHighlightRegistry } from "@nic/local-highlight-registry";

export type Highlighter = (code: string) => Iterable<HighlightToken>;

export interface HighlightToken {
  start: number;
  end: number;
  label: string;
  priority: number;
  diagnostic?: string;
  hoverable?: boolean;
}

export interface HighlightTokenInternal {
  start: { node: Text; offset: number };
  end: { node: Text; offset: number };
  label: string;
  priority: number;
  hoverable: boolean;
  inputToken: HighlightToken | null;
}

interface InternalLocation {
  node: Text;
  offset: number;
}

const domReady = new Promise<void>((resolve) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => resolve(), {
      once: true,
    });
  } else {
    resolve();
  }
});

export declare namespace HighlightedTextarea {
  export type HoverChangeEvent = CustomEvent<{
    added: Map<HighlightToken, Range>;
    removed: Map<HighlightToken, Range>;
    preserved: Map<HighlightToken, Range>;
  }>;

  export interface EventMap {
    hoverchange: HoverChangeEvent;
    error: ErrorEvent;
  }
}

export interface HighlightedTextarea {
  addEventListener<K extends keyof HighlightedTextarea.EventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HighlightedTextarea.EventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

export class HighlightedTextarea extends HTMLElement {
  #textarea: HTMLDivElement;
  #highlighter: Highlighter | null = null;

  #highlights = new LocalHighlightRegistry();

  #hoverableRanges: Map<Range, HighlightToken> = new Map();

  constructor() {
    super();
    this.#textarea = document.createElement("div");
    this.#textarea.dataset.textarea = "";
    this.#textarea.role = "textbox";
    this.#textarea.textContent = "";
    this.#textarea.setAttribute("contenteditable", "plaintext-only");

    let isInteracting = false;
    this.#textarea.addEventListener("input", () => isInteracting = true);
    this.#textarea.addEventListener("focusout", () => isInteracting = false);
    this.#textarea.addEventListener("click", () => isInteracting = true);
    this.#textarea.addEventListener("keydown", (e) => {
      console.log(isInteracting);
      if (e.key === "Escape") this.#textarea.blur();
      if (
        e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) isInteracting = true;
      if (e.key === "Tab" && isInteracting && !e.ctrlKey && !e.metaKey) {
        const selection = getSelection();
        if (!selection) return;
        if (selection.rangeCount !== 1) return;
        const range = selection.getRangeAt(0);
        if (
          !this.#textarea.contains(range.startContainer) ||
          !this.#textarea.contains(range.endContainer) ||
          range.startContainer.nodeType !== 3 ||
          range.endContainer.nodeType !== 3
        ) return;
        e.preventDefault();
        if (range.collapsed) {
          // insert a tab character at the caret position
          document.execCommand("insertText", false, "\t");
          this.#tryHighlight();
        } else {
          // todo: indent the lines contained in the selection
        }
      }
    });
  }

  get value(): string {
    return this.#textarea.textContent!;
  }

  set value(value: string) {
    this.#textarea.textContent = value;
    this.#tryHighlight();
  }

  set highlighter(highlighter: Highlighter | null) {
    this.#highlighter = highlighter;
    this.#tryHighlight();
  }

  async connectedCallback() {
    await domReady;

    const textarea = this.querySelector("textarea");
    if (textarea) {
      this.removeChild(textarea);
      for (const { name, value } of textarea.attributes) {
        this.#textarea.setAttribute(name, value);
      }
      this.#textarea.textContent = textarea.value;
    }
    this.appendChild(this.#textarea);

    this.#tryHighlight();
    this.#textarea.addEventListener(
      "input",
      this.#tryHighlight.bind(this),
    );
    this.#textarea.addEventListener(
      "mousemove",
      this.#handleMouseMove.bind(this),
    );
    this.#textarea.addEventListener(
      "mouseout",
      this.#handleMouseOut.bind(this),
    );
  }

  #tryHighlight() {
    if (!this.#highlighter) return;

    try {
      this.#highlight();
    } catch (error) {
      this.#dispatchError(error);
    }
  }

  #highlight() {
    const tokens = this.#highlighter!(this.value);

    this.#highlights.clear();
    this.#hoverableRanges.clear();

    for (const token of this.#locationizeTokens(tokens)) {
      const range = document.createRange();
      range.setStart(token.start.node, token.start.offset);
      range.setEnd(token.end.node, token.end.offset);

      this.#highlights.add(token.label, range, token.priority);

      if (token.hoverable) this.#hoverableRanges.set(range, token.inputToken!);
    }
  }

  *#locationizeTokens(
    tokens: Iterable<HighlightToken>,
  ): Iterable<HighlightTokenInternal> {
    let node: Text = this.#textarea.firstChild as Text;
    let offset = 0;
    let lastIndex = 0;

    const advance = (index: number, preferStart: boolean): InternalLocation => {
      if (index < lastIndex) {
        node = this.#textarea.firstChild as Text;
        offset = 0;
        lastIndex = 0;
      }

      let delta = index - lastIndex;
      let remaining: number;
      while (
        remaining = node.textContent!.length - offset,
          preferStart && node.nextSibling
            ? remaining <= delta
            : remaining < delta
      ) {
        delta -= remaining;
        node = node.nextSibling as Text;
        offset = 0;
      }
      offset += delta;
      lastIndex = index;

      return { node, offset };
    };

    for (const token of tokens) {
      const { label, start, end, priority, hoverable = false } = token;

      if (start === end) {
        this.#dispatchError(new Error("Zero-length token", { cause: token }));
        continue;
      }

      yield {
        start: advance(start, true),
        end: advance(end, false),
        label,
        priority,
        hoverable,
        inputToken: hoverable ? token : null,
      };
    }
  }

  #prevHoveredRanges: Set<Range> = new Set();

  #handleMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;

    const hoveredRanges: Set<Range> = new Set();

    for (const range of this.#hoverableRanges.keys()) {
      for (const { left, top, width, height } of range.getClientRects()) {
        if (
          left <= clientX && clientX <= left + width && top <= clientY &&
          clientY <= top + height
        ) {
          hoveredRanges.add(range);
          break;
        }
      }
    }

    const removed = this.#prevHoveredRanges.difference(hoveredRanges);
    const added = hoveredRanges.difference(this.#prevHoveredRanges);

    if (removed.size > 0 || added.size > 0) {
      const preserved = this.#prevHoveredRanges.intersection(hoveredRanges);
      this.#prevHoveredRanges = hoveredRanges;
      this.#dispatchHoverChange(added, removed, preserved);
    }
  }

  #hoverSetToMap(set: Set<Range>): Map<HighlightToken, Range> {
    const map = new Map();
    for (const range of set) {
      map.set(this.#hoverableRanges.get(range), range);
    }
    return map;
  }

  #handleMouseOut() {
    if (this.#prevHoveredRanges.size > 0) {
      const removed = this.#prevHoveredRanges;
      this.#prevHoveredRanges = new Set();
      this.#dispatchHoverChange(new Set(), removed, new Set());
    }
  }

  #dispatchHoverChange(
    added: Set<Range>,
    removed: Set<Range>,
    preserved: Set<Range>,
  ) {
    const event = new CustomEvent("hoverchange", {
      detail: {
        added: this.#hoverSetToMap(added),
        removed: this.#hoverSetToMap(removed),
        preserved: this.#hoverSetToMap(preserved),
      },
    });
    this.dispatchEvent(event);
  }

  #dispatchError(error: unknown) {
    const event = new ErrorEvent("error", { error });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) reportError(error);
  }
}

if (supportsPlaintextEditables() && CSS.highlights) {
  customElements.define("highlighted-textarea", HighlightedTextarea);
} else {
  customElements.define(
    "highlighted-textarea",
    class extends HTMLElement {
      #textarea: HTMLTextAreaElement;

      constructor() {
        super();
        this.#textarea = document.createElement("textarea");
      }

      get value(): string {
        return this.#textarea.value;
      }

      set value(value: string) {
        this.#textarea.value = value;
      }

      async connectedCallback() {
        await domReady;

        const textarea = this.querySelector("textarea");
        if (textarea) {
          this.#textarea = textarea;
        } else {
          this.appendChild(this.#textarea);
          // fix for firefox
          this.#textarea.rows = this.#textarea.value.split("\n").length;
        }
      }
    },
  );
}

function supportsPlaintextEditables() {
  const div = document.createElement("div");
  div.setAttribute("contenteditable", "PLAINTEXT-ONLY");
  return div.contentEditable === "plaintext-only";
}
