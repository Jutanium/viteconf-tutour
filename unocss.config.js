import { transformerVariantGroup } from "unocss";
import { defineConfig, presetTypography, presetUno } from "unocss";

export default defineConfig({
  theme: {
    colors: {
      oneDark: {
        chalky: "#e5c07b",
        coral: "#e06c75",
        cyan: "#56b6c2",
        malibu: "#61afef",
        ivory: "#abb2bf",
        sage: "#98c379",
        stone: "#7d8799",
        whiskey: "#d19a66",
        violet: "#c678dd",
        background: "#282c34",
        darkBackground: "#21252b",
        highlightBackground: "#2c313a",
        tooltipBackground: "#353a42",
        selection: "#3E4451",
        cursor: "#528bff",
      },
    },
  },
  presets: [
    presetUno({}), // required
    presetTypography({
      selectorName: "markdown",
      cssExtend: {
        "h1,h2,h3": {
          margin: 0,
        },
      },
    }),
  ],
  transformers: [transformerVariantGroup()],
});
