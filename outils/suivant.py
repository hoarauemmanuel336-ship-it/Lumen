#!/usr/bin/env python3
"""État du bloc et prochains cours à lancer.
lances.txt : codes dont l'écriture a été lancée ; relances.txt : codes dont la relecture a été lancée."""
import os, glob
L = '/home/claude/philo'
codes = sorted(f[:-4] for f in os.listdir(f'{L}/commandes'))
lu = lambda p: set(open(p).read().split()) if os.path.exists(p) else set()
lances, relances, relus = lu(f'{L}/lances.txt'), lu(f'{L}/relances.txt'), lu(f'{L}/relus.txt')
ecrits = {c for c in codes if os.path.exists(f'{L}/redaction/{c}.html')}
a_ecrire = [c for c in codes if c not in lances]
a_relire = [c for c in codes if c in ecrits and c not in relances]
print(f'écrits {len(ecrits)}/{len(codes)} · relus {len(relus)}/{len(codes)} · écriture à lancer {len(a_ecrire)} · relecture à lancer (écrit) {len(a_relire)}')
print('à écrire :', ' '.join(a_ecrire[:20]))
print('à relire :', ' '.join(a_relire[:20]))
