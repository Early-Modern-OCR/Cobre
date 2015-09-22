from urllib import urlopen
from urlparse import urlparse

from django.contrib import messages
from django.conf import settings
from django.http import *
from django.contrib.auth.decorators import permission_required
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404, get_list_or_404, render_to_response, redirect
from django.template import RequestContext
from django.utils.simplejson import dumps
from django.views.generic import list_detail
from django.views.decorators.csrf import csrf_exempt

from libros.bookreader.models import Book, Page, Transcription
from libros.bookreader.forms import TranscriptionForm


def ajax(request, response):
    return HttpResponse(response, mimetype='application/json')
    
def view(request, object_id, **kwargs):
    kwargs.setdefault('template_object_name','page')
    return list_detail.object_detail(request, Page.objects.all(),
                                     object_id=object_id, **kwargs)

def jp2_metadata(request):
    if not 'rft_id' in request.REQUEST:
        return HttpResponseBadRequest('rft_id required')
    
    url = '%s?url_ver=Z39.88-2004&rft_id=%s&svc_id=info:lanl-repo/svc/getMetadata' % (settings.DJATOKA_BASE_URL, request.REQUEST['rft_id'],)
    
    try:
        return HttpResponse(urlopen(url).read(), mimetype="application/javascript")
    except:
        return HttpResponse('{}', mimetype="application/javascript")

def annotations(request, object_id, **kwargs):
    kwargs.setdefault('template_name','bookreader/annotation/page.html')
    return view(request, object_id, **kwargs)
    
def transcriptions(request, object_id, **kwargs):
    kwargs.setdefault('template_name','bookreader/transcription/page.html')
    return view(request, object_id, **kwargs)

def printable(request, object_id):
    from bookreader.templatetags.bookreader_djatoka import DjatokaResolverNode
    
    page = get_object_or_404(Page, pk=object_id)
    
    if not page.jp2:
        return HttpResponseNotFound('Page is missing')
    
    return HttpResponseRedirect(DjatokaResolverNode('"%s"' % (page.jp2,),
                                                    ['svc.scale=1.0']).render({}))






@permission_required('bookreader.add_transcription')
@csrf_exempt
def add_transcription(request, object_id, **kwargs):
    kwargs.setdefault('template_name','bookreader/editor/add_transcription.html')
    kwargs.setdefault('redirect',reverse('bookreader-page', args=[object_id]))
    kwargs.setdefault('form_class', TranscriptionForm)
        
    page = get_object_or_404(Page, pk=object_id)
    userId = request.user.id
    
    if 'redirect' in request.GET:
        kwargs['redirect'] = request.GET['redirect']
    
    if request.method == 'POST':
        form = kwargs['form_class'](page.pk, userId, request.POST)
        
        if form.is_valid():
            transcription = form.save()
            transcription.save()
            
            if request.is_ajax():
                return ajax(request,'{"added": %d}' % (transcription.pk,))
                
            messages.add_message(request, messages.INFO, 'Added a new transcription to %s' % (page.safe_title,))
            
            return HttpResponseRedirect(kwargs['redirect'])
            
        if request.is_ajax():
            return ajax(request, dumps({'errors': unicode(form.errors)}))
    else:
        form = kwargs['form_class'](page.pk, userId)    
    
    if request.is_ajax():
        return HttpResponse(form.as_p())
    
    return render_to_response(kwargs['template_name'], {'form': form},
                              RequestContext(request))

@permission_required('bookreader.change_transcription')
@csrf_exempt
def edit_transcription(request, object_id, **kwargs):
    print "attempting edit of transcription " + object_id
    kwargs.setdefault('template_name','bookreader/editor/edit_transcription.html')
    kwargs.setdefault('form_class', TranscriptionForm)

    transcription = get_object_or_404(Transcription, pk=object_id)
    page = transcription.page
    userId = request.user.id
    
    #print "How about that old transcription " + transcription.text + "; authored by " + transcription.author.username + " on page " + page.safe_title
    
    kwargs.setdefault('redirect',reverse('bookreader-page', args=[page.pk]))
    
    if 'redirect' in request.GET:
        #print "redirect in request.GET"
        kwargs['redirect'] = request.GET['redirect']
    
    if request.method == 'POST':
        #print "request is POST"
        form = kwargs['form_class'](page.pk, userId, request.POST, instance=transcription)
        if form.is_valid():
            #print "form is valid"
            transcription = form.save()
            
            if request.is_ajax():
                #print "request is ajax"
                return ajax(request,'{"updated": %d}' % (transcription.pk,))
            
            messages.add_message(request, messages.INFO, 'Updated the transcription: %s' % (transcription.text,))
            
            return HttpResponseRedirect(kwargs['redirect'])
        if request.is_ajax():
            #print "form is not valid, but request is ajax"
            return ajax(request, dumps({'errors': unicode(form.errors)}))
    else:
        #print "setting form kwargs"
        form = kwargs['form_class'](page.pk, userId, instance=transcription)
    
    if request.is_ajax():
        #print "request is ajax, returning form as p"
        return HttpResponse(form.as_p())
    
    #print "done with transcription " + str(transcription.text)
    
    return render_to_response(kwargs['template_name'], {'form': form,
                                                        'transcription': transcription},
                              RequestContext(request))

@permission_required('bookreader.delete_transcription')
def delete_transcription(request, object_id, **kwargs):
    kwargs.setdefault('template_name','bookreader/editor/delete_transcription.html')
    
    transcription = get_object_or_404(Transcription, pk=object_id)
    page = transcription.page
    userId = request.user.id
    
    
    #print "deleting transcription on page " + page.safe_title
    
    book = page.book
    
    #print "The book is " + book.title + " with pk " + book.pk
    
    kwargs.setdefault('redirect',reverse('bookreader-page', args=[page.pk]))

    id = transcription.pk
    
    transcription.delete()
    
    if request.is_ajax():
        return ajax(request,'{"deleted": %d}' % (id,))
    
    return render_to_response(kwargs['template_name'], {'transcription': transcription},
                              RequestContext(request))
