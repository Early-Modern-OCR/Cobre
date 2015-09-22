import os.path

from django.conf.urls.defaults import *
from django.conf import settings
from django.contrib import admin

from haystack import forms, views, query

from libros.bookreader.models import Book



book_id_re = '[\S^:]+:[\S^:]+:[\d\./]+'

admin.autodiscover()

handler500 # Pyflakes

sqs = query.SearchQuerySet()
sqs.models(Book)

class SearchForm(forms.SearchForm):
    def search(self):
        sqs = super(SearchForm, self).search()
        if hasattr(self, 'cleaned_data'):
            self.clean()
	if self.is_valid() and hasattr(self, 'cleaned_data'):
	    sqs = self.searchqueryset.raw_search(self.cleaned_data['q'])
        
        if self.load_all:
            sqs = sqs.load_all()
        
        return sqs

search_view = views.SearchView(template='search.html',
                               form_class=SearchForm)

urlpatterns = patterns('',
    #(r'^openid/', include('django_openid_auth.urls')),
    url(r'^search/$', search_view, name='haystack-search'),
    (r'^admin/', include(admin.site.urls)),
    (r'^login/$', 'django.contrib.auth.views.login'),
    (r'^logout/$', 'django.contrib.auth.views.logout'),
    (r'^%s/(?P<path>.*)$' % (settings.MEDIA_URL.strip('/'),),
     'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
    (r'^%s/(?P<path>.*)$' % (settings.THEME_URL.strip('/'),),
     'django.views.static.serve', {'document_root': settings.THEME_ROOT}),
    (r'^%s/(?P<path>.*)$' % (settings.ADMIN_MEDIA_PREFIX.strip('/'),),
     'django.views.static.serve',
     {'document_root': os.path.join(os.path.dirname(admin.__file__),'media')}),
    (r'', include('libros.bookreader.urls')),
    url(r'^page/(?P<object_id>\d+)/facebox/$', 'libros.bookreader.views.page.view',
        kwargs={'template_name':'bookreader/page/facebox.html'},
        name='bookreader-page-facebox'),
)
