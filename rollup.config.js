import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";

const target = process.env.TARGET || "chrome";
const uppercaseTarget = target.charAt(0).toUpperCase() + target.slice(1);

export default [
  {
    input: `src/content/content.ts`,
    output: {
      file: `dist/${target}/content.js`,
      format: "iife",
      name: `${uppercaseTarget}Content`,
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: false,
      }),
      copy({
        targets: [
          {
            src: `src/manifest/manifest.${target}.json`,
            dest: `dist/${target}`,
            rename: "manifest.json",
          },
          {
            src: `src/content/content.css`,
            dest: `dist/${target}`,
          },
          { src: "src/assets/*", dest: `dist/${target}` },
        ],
        flatten: true,
        verbose: true,
      }),
    ],
  },
  {
    input: `src/popup/popup.ts`,
    output: {
      file: `dist/${target}/popup.js`,
      format: "iife",
      name: `${uppercaseTarget}Popup`,
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: false,
      }),
      copy({
        targets: [{ src: "src/popup/popup.html", dest: `dist/${target}` }],
        flatten: true,
        verbose: true,
      }),
    ],
  },
];
