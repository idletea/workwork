import typescript from  "@rollup/plugin-typescript";
import { terser } from  "rollup-plugin-terser";

export default {
  input: "src/lib.ts",
  output: {
    file: "dist/workwork.js",
    format: "es",
  },
  plugins: [typescript(), terser()],
}
