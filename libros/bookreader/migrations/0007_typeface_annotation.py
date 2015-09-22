# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

	def forwards(self, orm):
		# Adding field 'Annotation.typeface'
		db.add_column('bookreader_annotation', 'typeface',
						self.gf('django.db.models.fields.BooleanField')(default=False),
						keep_default=False)


	def backwards(self, orm):
		# Deleting field 'Annotation.typeface'
		db.delete_column('bookreader_annotation', 'typeface')


	models = {
		'bookreader.annotation': {
			'typeface': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
		}
	}

	complete_apps = ['bookreader']