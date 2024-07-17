import MarkdownIt from "npm:markdown-it";

interface AutolinkOptions {
  references: { [key: string]: string };
}

function autolink(md: MarkdownIt, options: AutolinkOptions) {
  const references = options.references;

  function getReference(linkText: string): string | null {
    const lowerText = linkText.toLowerCase();
    if (references[lowerText]) return references[lowerText];
    // Handle plural forms (simple 's' plural)
    if (linkText.endsWith("s")) {
      const singular = lowerText.slice(0, -1);
      if (references[singular]) return references[singular];
    }
    return null;
  }

  // deno-lint-ignore no-explicit-any
  function autolinkToken(state: any, silent: boolean): boolean {
    const max = state.posMax;
    const start = state.pos;

    if (state.src.charCodeAt(start) !== 0x7B /* { */) {
      return false;
    }

    let pos = start + 1;

    while (pos < max) {
      if (state.src.charCodeAt(pos) === 0x7D /* } */) {
        const content = state.src.slice(start + 1, pos);
        const parts = content.split("|");
        const text = parts[0];
        const linkText = parts.length > 1 ? parts[1] : text;
        const link = getReference(linkText);

        if (link) {
          if (!silent) {
            const token = state.push("link_open", "a", 1);
            token.attrs = [["href", link]];
            token.markup = "autolink";
            token.info = "auto";
            token.map = [start, pos + 1];

            const tokenText = state.push("text", "", 0);
            tokenText.content = text;

            state.push("link_close", "a", -1);
          }

          state.pos = pos + 1;
          return true;
        }
      }
      pos++;
    }
    return false;
  }

  md.inline.ruler.before("emphasis", "autolink", autolinkToken);
}

export default autolink;
