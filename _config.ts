import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import jsx from "lume/plugins/jsx_preact.ts";

import tailwindConfig from "./tailwind.config.ts";

const site = lume();

site.copy("static/fonts");
site.copy("static/js");

site.use(tailwindcss({ options: tailwindConfig }));
site.use(postcss());
site.use(jsx({}));

export default site;
