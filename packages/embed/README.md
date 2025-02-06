# rollup-plugin-embed

A Rollup/Vite plugin that allows you to embed directories into your bundle as virtual file systems using [memfs](https://github.com/streamich/memfs). This plugin is particularly useful when you need to work with directory structures in your JavaScript/TypeScript code.

## Installation

```bash
# Install the plugin and required dependencies
npm install rollup-plugin-embed memfs --save-dev
# or
yarn add -D rollup-plugin-embed memfs
# or
pnpm add -D rollup-plugin-embed memfs
```

### Browser Polyfills

Since `memfs` uses Node.js built-in modules, you'll need to install polyfills when using this plugin in browser environments:

- rollup: [rollup-plugin-polyfill-node](https://www.npmjs.com/package/rollup-plugin-polyfill-node)
- vite: [vite-plugin-node-polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills)

## TypeScript Configuration

To get proper type hints for the `embed:` imports, you need to configure TypeScript to recognize the plugin's type definitions. You have two options:

1. Add a triple-slash reference in your source files:

```typescript
/// <reference types="rollup-plugin-embed/types" />

import fs from 'embed:./assets';
```

2. Or add the types to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["rollup-plugin-embed/types"]
  }
}
```

## Usage

### Configuration

#### Rollup Configuration

```js
import { embed } from 'rollup-plugin-embed';

export default {
  // ...
  plugins: [embed()],
};
```

#### Vite Configuration

The plugin is compatible with Vite since Vite uses Rollup under the hood:

```js
import { defineConfig } from 'vite';
import { embed } from 'rollup-plugin-embed';

export default defineConfig({
  plugins: [embed()],
});
```

### Basic Usage

Import directories using the `embed:` prefix:

```typescript
// Import a directory
import fs from 'embed:./assets';

// You can also import the volume object for more control
import fs, { vol } from 'embed:./assets';
```

### Working with the Virtual File System

The plugin creates a virtual file system using `memfs`. When you import a directory using the `embed:` prefix, you get a `memfs` file system instance that contains your embedded directory structure.

```typescript
// Import a directory containing files
import fs from 'embed:./assets';

// List all files in the root directory
const files = fs.readdirSync('/');

// Read a file from the virtual file system
const content = fs.readFileSync('/config.json', 'utf8');

// Work with subdirectories
const subDirFiles = fs.readdirSync('/images');

// You can also use the volume object for direct manipulation
import { vol } from 'embed:./assets';
console.log(vol.toJSON()); // Get a JSON representation of the file system
```
