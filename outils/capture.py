import sys, asyncio
from playwright.async_api import async_playwright
async def main(fichier, cibles, sortie):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for largeur, nom in [(1280, 'ordi'), (390, 'tel')]:
            pg = await b.new_page(viewport={'width': largeur, 'height': 900})
            erreurs = []
            pg.on('pageerror', lambda e: erreurs.append(str(e)))
            for c in cibles:
                await pg.goto('file://' + fichier + '#' + c)
                await pg.wait_for_timeout(1200)
                await pg.screenshot(path=f'{sortie}-{c}-{nom}.png')
            print(nom, 'erreurs JS :', erreurs or 'aucune')
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[3].split(','), sys.argv[2]))
