import {defineConfig,globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
 ...nextVitals,
 ...nextTypeScript,
 // Generated framework integrations and copied static assets are not sources.
 globalIgnores(['dist/**','.preview/**','.next/**','.wrangler/**','public/**','artifacts/**','build/**','next-env.d.ts']),
]);
