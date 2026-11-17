import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        c=await b.new_context(viewport={"width":390,"height":844},is_mobile=True)
        pg=await c.new_page()
        for name,url,wait in [("home","/","main section"),("busca","/busca","a[href*='/imovel/']"),("bosque","/em-foco/open-bosque","main h1")]:
            await pg.goto("http://localhost:8080"+url,wait_until="networkidle")
            await pg.wait_for_selector(wait,timeout=20000)
            await pg.wait_for_timeout(2500)
            html=await pg.evaluate("()=>document.querySelector('#root').innerHTML")
            open(f"/tmp/browser/pre/{name}.html","w").write(html)
            lcp=await pg.evaluate("""()=>new Promise(r=>{new PerformanceObserver(l=>{const e=l.getEntries().pop();r(e.element?e.element.outerHTML.slice(0,300):'')}).observe({type:'largest-contentful-paint',buffered:true})})""")
            print(name,len(html),lcp)
        await b.close()
asyncio.run(main())
