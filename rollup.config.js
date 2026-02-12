import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";

export default [
  // Chrome Inject
  {
    input: "src/chrome/inject.ts",
    output: {
      file: "dist/chrome/inject.js",
      format: "iife",
      name: "ChromeInject",
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: false,
      }),
      copy({
        targets: [
          { src: "src/base/*", dest: "dist/chrome" },
          { src: "src/chrome/**/!(*.ts)", dest: "dist/chrome" },
        ],
        flatten: true,
        verbose: true,
      }),
    ],
  },
  // Chrome Popup
  {
    input: "src/chrome/popup.ts",
    output: {
      file: "dist/chrome/popup.js",
      format: "iife",
      name: "ChromePopup",
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: false,
      }),
      // Assets only beim ersten Build kopieren, daher hier leer
    ],
  },
  // Firefox Inject
  {
    input: "src/firefox/inject.ts",
    output: {
      file: "dist/firefox/inject.js",
      format: "iife",
      name: "FirefoxInject",
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: false,
      }),
      copy({
        targets: [
          { src: "src/base/*", dest: "dist/firefox" },
          { src: "src/firefox/**/!(*.ts)", dest: "dist/firefox" },
        ],
        flatten: true,
        verbose: true,
      }),
    ],
  },
  // Firefox Popup
  {
    input: "src/firefox/popup.ts",
    output: {
      file: "dist/firefox/popup.js",
      format: "iife",
      name: "FirefoxPopup",
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: false,
      }),
      // Assets only beim ersten Build kopieren, daher hier leer
    ],
  },
];
