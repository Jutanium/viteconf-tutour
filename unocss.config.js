import { defineConfig, presetTypography, presetUno } from "unocss";

export default defineConfig({
  theme: {
    colors: {
      editorblack: "#282c34",
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
});
