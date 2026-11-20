import type { Plugin } from 'vite';
import { gzipSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Measures emitted production code, never dev sources or duplicated dependencies. */
export function bundleAnalysis(): Plugin {
  return {
    name: 'uh-bundle-analysis', apply: 'build', enforce: 'post',
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter(item => item.type === 'chunk');
      const entry = chunks.find(c => c.isEntry && c.facadeModuleId?.includes('/src/main.'));
      if (!entry) return;
      const html = bundle['index.html'];
      const htmlText = html?.type === 'asset' ? (typeof html.source === 'string' ? html.source : Buffer.from(html.source).toString('utf8')) : '';
      const preloads = [...htmlText.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/?([^"]+)"/g)].map(m => m[1]);
      function closure(names: string[]) {
        const found = new Set<string>();
        function visit(name: string) {
          if (found.has(name)) return;
          const chunk = chunks.find(c => c.fileName === name);
          if (!chunk) return;
          found.add(name); chunk.imports.forEach(visit);
        }
        names.forEach(visit); return [...found];
      }
      const gzip = (file: string) => { const c = chunks.find(c => c.fileName === file); return c ? gzipSync(c.code).length : 0; };
      const routes = Object.fromEntries([
        ['/', 'Index.tsx'], ['/busca', 'SearchExperience.tsx'],
        ['/imovel/:slug', 'PropertyDetail.tsx'], ['/em-foco/:slug', 'ProdutoFocoPage.tsx'],
      ].map(([route, page]) => {
        const chunk = chunks.find(c => Object.keys(c.modules).some(id => id.endsWith(`/src/pages/${page}`)));
        const files = closure([entry.fileName, ...preloads, ...(chunk ? [chunk.fileName] : [])]);
        return [route, { gzipBytes: files.reduce((n, f) => n + gzip(f), 0), chunks: files.map(file => ({ file, gzipBytes: gzip(file) })) }];
      }));
      const entryModules = Object.entries(entry.modules).map(([id, module]) => ({
        module: id.replace(/^.*\/node_modules\//, 'node_modules/').replace(/^.*\/src\//, 'src/'),
        renderedBytes: module.renderedLength,
        gzipBytes: module.code ? gzipSync(module.code).length : null,
      })).sort((a, b) => (b.gzipBytes ?? 0) - (a.gzipBytes ?? 0) || b.renderedBytes - a.renderedBytes).slice(0, 15);
      const report = JSON.stringify({ definition: 'entry + HTML modulepreload + static route imports, deduplicated', entry: entry.fileName, preloads, routes, entryModules }, null, 2);
      this.emitFile({ type: 'asset', fileName: 'bundle-analysis.json', source: report });
      writeFileSync(join(tmpdir(), 'uhome-bundle-analysis.json'), report);
    },
  };
}