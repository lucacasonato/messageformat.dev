import type { Config } from "npm:tailwindcss@3.4.4";

export default {
  content: ["**/*.html", "**/*.md", "**/*.vto"],

  theme: {
    extend: {
      fontFamily: {
        handwritten: ["'Kalam'", "cursive"],
      },
    },
  },
} satisfies Config;
