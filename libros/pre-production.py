import logging, sys
from os.path import join, dirname

from libros.settings import *


#logging.basicConfig(stream=sys.stderr, level=logging.INFO)
logging.basicConfig(
    level = logging.DEBUG,
    format = '%(asctime)s %(levelname)s %(message)s',
    filename = '/data/logs/bookreader.log',
    filemode = 'w'
)

#for cobredjangodevx:
#'NAME': 'cobredjangodev2',
#'HOST': 'pgdev3.l',
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'libros',
        'HOST': 'pgdev3',
        'USER': 'libros',
    }
}

FCGI_OPTIONS = {
    'method': 'threaded',
    'daemonize': 'false',
    'outlog': join(dirname(dirname(__file__)),'var','log','out.log'),
    'errlog': join(dirname(dirname(__file__)),'var','log','error.log'),
    'debug': 'true',
}

FORCE_SCRIPT_NAME = ''

MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)),'var','media')
MEDIA_URL = '/media/'

HAYSTACK_SOLR_URL = 'http://librosindex.l/libros-solr'
