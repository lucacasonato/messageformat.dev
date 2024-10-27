import { highlight, instantiate } from "./mf2/lib/mf2_website.generated.js";
import type { HighlightToken } from "../textarea.ts";

instantiate();

export function* mf2Highlight(text: string): Generator<HighlightToken> {
  for (const token of highlight(text)) {
    if (token.start === token.end) continue;
    token.priority = token.label === "error" ? 1 : 2;
    token.hoverable = token.label === "error" || token.label === "variable";
    yield token;
  }
}
