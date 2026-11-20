import { describe, expect, it, vi } from 'vitest';
import type { OutputBundle, OutputChunk, PluginContext, NormalizedOutputOptions } from 'rollup';
import { gzipSync } from 'node:zlib';
import { bundleAnalysis } from '../../scripts/bundleAnalysis';

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>();
  const writeFileSync = vi.fn();
  return { ...actual, writeFileSync, default: { ...actual, writeFileSync } };
});
describe('análise do JS de produção por rota', () => {
  it('deduplica entry, preloads e imports estáticos, sem contar imports dinâmicos', () => {
    function chunk(fileName: string, code: string, page: string, imports: string[]): OutputChunk {
      return { type: 'chunk', fileName, code, isEntry: fileName === 'assets/main.js', facadeModuleId: page, imports, dynamicImports: ['assets/optional.js'], modules: { [page]: { code, renderedLength: code.length } } } as unknown as OutputChunk;
    }
    const bundle: OutputBundle = {
      'assets/main.js': chunk('assets/main.js', 'main code', '/src/main.tsx', ['assets/shared.js']),
      'assets/shared.js': chunk('assets/shared.js', 'shared code', '/src/shared.ts', []),
      'assets/home.js': chunk('assets/home.js', 'home code', '/src/pages/Index.tsx', ['assets/shared.js']),
      'assets/optional.js': chunk('assets/optional.js', 'optional code', '/src/optional.ts', []),
      'index.html': { type: 'asset', fileName: 'index.html', source: '<link rel="modulepreload" crossorigin href="/assets/shared.js">', names: [], originalFileNames: [], name: undefined, originalFileName: null, needsCodeReference: false },
    };
    const emitFile = vi.fn(); const hook = bundleAnalysis().generateBundle;
    if (typeof hook !== 'function') throw new Error('Hook ausente');
    hook.call({ emitFile } as unknown as PluginContext, {} as NormalizedOutputOptions, bundle, false);
    const emitted = emitFile.mock.calls[0]?.[0] as { source: string } | undefined;
    if (!emitted) throw new Error('Relatório ausente');
    const report = JSON.parse(emitted.source);
    expect(report.routes['/'].chunks.map((c: { file: string }) => c.file)).toEqual(['assets/main.js', 'assets/shared.js', 'assets/home.js']);
    expect(report.routes['/'].gzipBytes).toBe(['main code', 'shared code', 'home code'].reduce((total, code) => total + gzipSync(code).length, 0));
    expect(report.entryModules[0].gzipBytes).toBe(gzipSync('main code').length);
  });
});