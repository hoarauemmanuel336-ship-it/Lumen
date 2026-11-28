"""Relevé ponctuel : les psaumes de chaque office, tirés de l'AELF, pour
dresser le psautier de quatre semaines de la page d'accueil."""
import json, os, time, urllib.request
dates = json.load(open('demande/dates.json'))['dates']
os.makedirs('recu', exist_ok=True)
out, err = {}, {}
for d in dates:
    for o in ('lectures', 'laudes', 'tierce', 'vepres', 'complies'):
        u = f'https://api.aelf.org/v1/{o}/{d}/france'
        for essai in range(3):
            try:
                r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Lumen (lumenveritatis.net)'}), timeout=30)
                j = json.load(r)
                off = j.get(o) or {}
                garde = {}
                for k, v in off.items():
                    if k.startswith(('psaume', 'cantique', 'antienne')):
                        if isinstance(v, dict):
                            garde[k] = {kk: (vv[:240] if kk == 'texte' and isinstance(vv, str) else vv) for kk, vv in v.items()}
                        else:
                            garde[k] = v[:240] if isinstance(v, str) else v
                out[f'{d}/{o}'] = {'info': j.get('informations'), 'cles': list(off.keys()), 'psaumes': garde}
                break
            except Exception as e:
                err[f'{d}/{o}'] = str(e)
                time.sleep(2)
        time.sleep(0.3)
json.dump({'offices': out, 'erreurs': err}, open('recu/aelf.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
