"""Ce que partagent les deux scripts du robot : parler au coffre R2
avec l'outil S3 d'Amazon, déjà installé sur les machines de GitHub.
Les clés viennent des secrets du dépôt (R2_ACCESS_KEY_ID,
R2_SECRET_ACCESS_KEY, R2_ENDPOINT), posés par le fichier du robot."""
import json, os, subprocess, sys

COFFRE = 'lumen-ressources'
# Les rangements du coffre, par espèce (les mêmes que commun/coffre.js).
ESPECES = {
    'ressources': {'code': 'res_code', 'medias': 'res_medias'},
    'articles': {'code': 'art_code', 'medias': 'art_medias'},
}


def aws(*args, capture=False):
    point = os.environ.get('R2_ENDPOINT', '')
    if not point:
        sys.exit('Le secret R2_ENDPOINT est vide : le robot ne sait pas où est le coffre.')
    cmd = ['aws', '--endpoint-url', point, *args]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('Le coffre a refusé : ' + ' '.join(args[:3]) + '\n' + r.stderr)
    return r.stdout if capture else None


def envoie(chemin, cle, mime):
    aws('s3', 'cp', chemin, f's3://{COFFRE}/{cle}', '--content-type', mime, '--only-show-errors')


def recoit(cle, chemin):
    aws('s3', 'cp', f's3://{COFFRE}/{cle}', chemin, '--only-show-errors')


def liste(prefixe):
    """[{cle, taille, date}] des fichiers sous un rangement"""
    out, suite = [], None
    while True:
        args = ['s3api', 'list-objects-v2', '--bucket', COFFRE, '--prefix', prefixe, '--output', 'json']
        if suite:
            args += ['--continuation-token', suite]
        j = json.loads(aws(*args, capture=True) or '{}')
        for o in j.get('Contents', []):
            out.append({'cle': o['Key'], 'taille': o.get('Size', 0), 'date': o.get('LastModified', '')})
        suite = j.get('NextContinuationToken')
        if not suite:
            return out
