import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('supabase/functions/site-dobra/index.ts', 'utf8');
const start = source.indexOf('  // O Worker não transmite');
const end = source.indexOf('\n}', start);
const responder = new Function('corpo', 'v3', source.slice(start, end));

describe('resposta direta site-v3', () => {
  it.each(['', 'compacta-1'])('molde compacto só é usado pelo app compatível: %s', layout => {
    document.head.innerHTML = layout ? `<meta name="uh-busca-layout" content="${layout}">` : '';
    document.body.innerHTML = '<div id="uh-pre">foto</div>';
    const guard = source.match(/const gate=`<script>(.*?)<\/script>`;/)?.[1];
    if (!guard) throw new Error('Proteção do molde compacto ausente');
    new Function(guard)();
    expect(document.getElementById('uh-pre') !== null).toBe(layout === 'compacta-1');
  });
  it('envia só head/pre/script e remove o seed legado de busca', () => {
    const result = responder({ preV3: '<div>v3</div>', script: 'window.__UH_BUSCA__={"rows":[]};window.__UH_DOBRA__={};window.__UH_BUSCA_V3__={};', head: '<link rel="preload" as="image" href="antiga.jpg">' }, '<div id="uh-pre">v3</div>');
    expect(Object.keys(result)).toEqual(['head', 'pre', 'script']);
    expect(result.script).toBe('window.__UH_DOBRA__={};window.__UH_BUSCA_V3__={};');
    expect(result.head).toBe('');
    expect(result.pre.startsWith('<div id="uh-pre">')).toBe(true);
    expect(result.pre.includes('document.write')).toBe(false);
  });
  it.each(['site-v1', 'site-v2', '', 'site-v3'])('descarta a dobra fora de v3: %s', version => {
    document.head.innerHTML = version ? `<meta name="uh-dobra-versao" content="${version}">` : '';
    document.body.innerHTML = '<div id="uh-pre">foto</div><div id="root"></div>';
    const result = responder({ script: '', head: '' }, '<div id="uh-pre">foto</div>');
    const guard = result.pre.match(/<script>(.*?)<\/script>/)?.[1];
    if (!guard) throw new Error('Proteção ausente');
    new Function(guard)();
    expect(document.getElementById('uh-pre') !== null).toBe(version === 'site-v3');
    expect(document.getElementById('root') !== null).toBe(true);
  });
});