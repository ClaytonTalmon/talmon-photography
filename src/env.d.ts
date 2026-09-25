/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CF_BEACON_TOKEN?: string;
  readonly PUBLIC_FORMSPREE_ID?: string;
  readonly PUBLIC_PRIVATE_VIEW_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
