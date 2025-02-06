import type { Plugin } from 'rollup';
import { toBinarySnapshot } from 'memfs/lib/snapshot/index.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';

const UTILS_ID = '\0plugin-embed-utils.js';

const UTILS = `
export const toBinary = /* @__PURE__ */ (() => {
  var table = new Uint8Array(128)
  for (var i = 0; i < 64; i++) table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i
  return base64 => {
    var n = base64.length, bytes = new Uint8Array((n - (base64[n - 1] == '=') - (base64[n - 2] == '=')) * 3 / 4 | 0)
    for (var i = 0, j = 0; i < n;) {
      var c0 = table[base64.charCodeAt(i++)], c1 = table[base64.charCodeAt(i++)]
      var c2 = table[base64.charCodeAt(i++)], c3 = table[base64.charCodeAt(i++)]
      bytes[j++] = (c0 << 2) | (c1 >> 4)
      bytes[j++] = (c1 << 4) | (c2 >> 2)
      bytes[j++] = (c2 << 6) | c3
    }
    return bytes
  }
})();
`;

const RESOLVED_PREFIX = '\0embed:';
const PREFIX = RESOLVED_PREFIX.slice(1);

export function embed(): Plugin {
  return {
    name: 'ikkz/embed',
    resolveId(id, importer) {
      if (id === UTILS_ID) {
        return id;
      }
      if (!id.startsWith(PREFIX)) {
        return null;
      }
      if (!importer) {
        return `\0${id}`;
      }
      const resolved = path.resolve(
        path.dirname(importer),
        id.slice(PREFIX.length)
      );
      return `${RESOLVED_PREFIX}${resolved}`;
    },
    async load(id) {
      if (id === UTILS_ID) {
        return UTILS;
      }
      if (!id.startsWith(RESOLVED_PREFIX)) {
        return null;
      }
      const path = id.slice(RESOLVED_PREFIX.length);
      this.addWatchFile(path);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshot = await toBinarySnapshot({ fs: fs as any, path });

      return `import { toBinary } from '${UTILS_ID}';
import { memfs } from 'memfs';
import { fromBinarySnapshotSync } from 'memfs/lib/snapshot';
const bin = toBinary('${Buffer.from(snapshot).toString('base64')}');
const { fs, vol } = memfs();
fromBinarySnapshotSync(bin, {fs, path: '/'});
export default fs;
export {vol};
`;
    },
  };
}
