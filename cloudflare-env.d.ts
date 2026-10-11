declare namespace Cloudflare {
  interface Env {
  ADAPTION_API_KEY?: string;
  PUBLIC_DEMO?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
