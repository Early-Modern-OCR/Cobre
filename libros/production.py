import logging, sys
from os.path import join, dirname

from libros.settings import *


logging.basicConfig(stream=sys.stderr, level=logging.ERROR)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'cobre',
        'HOST': 'localhost:5432',
        'USER': 'cobre',
        'PASSWORD': 'cobre'
    }
}

FCGI_OPTIONS = {
    'method': 'threaded',
    'daemonize': 'false',
    'outlog': join(dirname(dirname(__file__)),'var','log','out.log'),
    'errlog': join(dirname(dirname(__file__)),'var','log','error.log'),
    'debug': 'false',
}

FORCE_SCRIPT_NAME = ''

MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)),'var','media')
MEDIA_URL = '/media/'

HAYSTACK_SOLR_URL = 'http://librosindex.l/libros-solr'
