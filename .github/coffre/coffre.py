"""Ce que partagent les deux scripts du robot : parler au coffre R2
avec l'outil S3 d'Amazon, déjà installé sur les machines de GitHub.
Les clés viennent des secrets du dépôt (R2_ACCESS_KEY_ID,
R2_SECRET_ACCESS_KEY, R2_ENDPOINT), posés par le fichier du robot."""
import os, subprocess, sys

COFFRE = 'lumen-ressources'


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


def existe(cle):
    """vrai si le coffre a déjà un fichier à cette clé"""
    point = os.environ.get('R2_ENDPOINT', '')
    r = subprocess.run(['aws', '--endpoint-url', point, 's3api', 'head-object', '--bucket', COFFRE, '--key', cle],
                       capture_output=True, text=True)
    return r.returncode == 0
