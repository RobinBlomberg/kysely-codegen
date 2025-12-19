import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ["./src/index.ts", "./src/cli/bin.ts"],
    platform: 'node',
    clean: true,
    exports: true, // auto-generate exports field in package.json
    // unbundle: true,
    dts: true,
    cjsDefault: true,
    format: ['cjs', 'esm'],
    external: [/^bun(:.*)?$/], // bun:* e.g., bun:sqlite
});
