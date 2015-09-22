import re

from haystack import site, indexes, fields

from libros.bookreader.models import Book



class BookIndex(indexes.RealTimeSearchIndex):
    text = fields.CharField(document=True, use_template=True,
                            template_name='bookreader/book_index.txt')
    
    title = fields.CharField(model_attr='title')
    creator = fields.MultiValueField(model_attr='creator', null=True)
    created = fields.CharField(model_attr='created', null=True)
    issued = fields.DateTimeField(model_attr='issued', null=True)
    collection = fields.CharField(model_attr='collection__name', null=True)
    repository = fields.CharField(model_attr='collection__repository__name', null=True)
    
    description = fields.MultiValueField(null=True)
    contributor = fields.MultiValueField(null=True)
    subject = fields.MultiValueField(null=True)
    publisher = fields.MultiValueField(null=True)
    
    def prepare_creator(self, obj):
        if obj.creator:
            return obj.creator.split(', ')
        return []
    
    def prepare_created(self, obj):
        if obj.created:
            m = re.match('\d{4}', obj.created)
            if m:
                return m.group(0)
        return ''
    
    def prepare_description(self, obj):
        try:
            return obj.additional_metadata.getlist('description')
        except:
            return []
    
    def prepare_contributor(self, obj):
        try:
            return obj.additional_metadata.getlist('contributor')
        except:
            return []
    
    def prepare_subject(self, obj):
        try:
            return obj.additional_metadata.getlist('subject')
        except:
            return []
    
    def prepare_publisher(self, obj):
        try:
            return obj.additional_metadata.getlist('publisher')
        except:
            return []

site.register(Book, BookIndex)    
