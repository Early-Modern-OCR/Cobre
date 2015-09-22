import sys, os, os.path
import ldap
from django_auth_ldap.config import LDAPSearch, NestedActiveDirectoryGroupType

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
     ('Alexey Maslov', 'alexey@library.tamu.edu'),
     ('James Creel', 'jcreel@library.tamu.edu'),
     ('Micah Cooper', 'jmicah@library.tamu.edu')
)

EMAIL_HOST = 'smtp-replay.tamu.edu'

MANAGERS = ADMINS

TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = False
USE_L10N = True
EMAIL_HOST = 'smtp-relay.tamu.edu'

THEME_ROOT = os.path.join(os.path.dirname(__file__),'theme')
THEME_URL = '/theme/'

ADMIN_MEDIA_PREFIX = '/admin_media/'
STATIC_URL = '/admin_media/'

SECRET_KEY = ''

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.media",
    "django.core.context_processors.request",
    "libros.bookreader.context_processors.comparison_books",
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
)

ROOT_URLCONF = 'libros.urls'

TEMPLATE_DIRS = (
     os.path.join(os.path.dirname(__file__),'templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.admin',
    'django.contrib.flatpages',
    'django.contrib.humanize',
    'south',
    'haystack',
    'libros.bookreader'
)

AUTHENTICATION_BACKENDS = (
    'django_auth_ldap.backend.LDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
)

AUTH_LDAP_SERVER_URI = "ldaps://adsdc1.library.tamu.edu/"

AUTH_LDAP_BIND_DN = "CN=libraryweb,OU=ServiceAccounts,DC=library,DC=tamu,DC=edu"
AUTH_LDAP_BIND_PASSWORD = ""
AUTH_LDAP_USER_SEARCH = LDAPSearch("OU=UserAccounts,DC=library,DC=tamu,DC=edu",
    ldap.SCOPE_SUBTREE, "(sAMAccountName=%(user)s)")

AUTH_LDAP_GROUP_SEARCH = LDAPSearch("OU=UserAccounts,DC=library,DC=tamu,DC=edu",
    ldap.SCOPE_SUBTREE, "(objectClass=group)"
)
AUTH_LDAP_GROUP_TYPE = NestedActiveDirectoryGroupType()
#AUTH_LDAP_REQUIRE_GROUP = "CN=Web Systems - Staff,OU=Web Systems,OU=Digital Initiatives,OU=UserAccounts,DC=library,DC=tamu,DC=edu"
#AUTH_LDAP_MIRROR_GROUPS = True
AUTH_LDAP_USER_FLAGS_BY_GROUP = {
    'is_staff': 'CN=Digital Initiatives,OU=Digital Initiatives,OU=User Services,OU=UserAccounts,DC=library,DC=tamu,DC=edu',
    'is_superuser': 'CN=Applications - Staff,OU=Applications,OU=Digital Initiatives,OU=User Services,OU=UserAccounts,DC=library,DC=tamu,DC=edu',
}

AUTH_LDAP_FIND_GROUP_PERMS = True
AUTH_LDAP_CACHE_GROUPS = True
AUTH_LDAP_GROUP_CACHE_TIMEOUT = 3600

AUTH_LDAP_USER_ATTR_MAP = {
    "first_name": "givenName",
    "last_name": "sn",
    "email": "mail"
}

HAYSTACK_SITECONF = 'libros.search_sites'
HAYSTACK_SEARCH_ENGINE = 'simple'
HAYSTACK_CONNECTIONS = {
	'default': {
		'ENGINE': 'haystack.backends.simple_backend.SimpleEngine',
	},
}

DJATOKA_BASE_URL = 'http://djatoka.library.tamu.edu/resolver'


LOGIN_REDIRECT_URL ='/'
LOGIN_URL = '/login/'
LOGOUT_URL = '/logout/'



# Bookreader configuration

BOOKREADER_SIGNALS_ENABLED = True
BOOKREADER_COMPARISON_SESSION_KEY = 'bookreader.compare'
BOOKREADER_COMPARISON_GET_ARGUMENT = 'compare'
BOOKREADER_COMPARISON_TEMPLATE_VARIABLE = 'compare'

DJATOKA_ARGUMENTS = {
	'url_ver':'Z39.88-2004',
	'svc_id':'info:lanl-repo/svc/getRegion',
	'svc_val_fmt':'info:ofi/fmt:kev:mtx:jpeg2000',
	'svc.format':'image/jpeg',
	'svc.scale':'150'}

assert isinstance(DJATOKA_ARGUMENTS, dict), u'DJATOKA_ARGUMENTS must be a dictionary'





