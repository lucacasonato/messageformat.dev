import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import esbuild from "lume/plugins/esbuild.ts";
import inline from "lume/plugins/inline.ts";
import nav from "lume/plugins/nav.ts";
import search from "lume/plugins/search.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.7.0/toc.ts";
import anchor from "npm:markdown-it-anchor@9";

import tailwindConfig from "./tailwind.config.ts";

const site = lume({}, {
  markdown: {
    options: {
      linkify: true,
    },
    plugins: [
      [anchor, {
        permalink: anchor.permalink.linkInsideHeader({
          symbol:
            `<span class="sr-only">Jump to heading</span><span aria-hidden="true" class="anchor">#</span>`,
          placement: "after",
        }),
      }],
    ],
  },
});

site.copy("static/fonts");
site.copy("static/js");

site.use(tailwindcss({ options: tailwindConfig }));
site.use(postcss());
site.use(jsx({}));
site.use(esbuild({ extensions: [".ts"] }));
site.use(inline());
site.use(nav({}));
site.use(toc({ anchor: false }));

export default site;
