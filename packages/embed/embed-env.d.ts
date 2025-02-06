declare module 'embed:*' {
  import type { memfs } from 'memfs';
  type Ret = ReturnType<typeof memfs>;
  const fs: Ret['fs'];
  const vol: Ret['vol'];
  export default fs;
  export { vol };
}
