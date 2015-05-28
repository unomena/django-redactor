'''
Created on 28 May 2015

@author: michaelwhelehan
'''
from django import forms
from django.db import models


class RedactorTextField(models.TextField):
    def __init__(self, *args, **kwargs):
        super(RedactorTextField, self).__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        defaults = {'form_class': RedactorTextFormField}
        defaults.update(kwargs)
        return super(RedactorTextField, self).formfield(**defaults)


class RedactorTextFormField(forms.fields.CharField):
    def __init__(self, *args, **kwargs):
        kwargs.update({'widget': forms.Textarea()})
        kwargs['widget'].attrs.update({'class': 'redactor'})
        super(RedactorTextFormField, self).__init__(*args, **kwargs)

try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ["^redactor\.fields\.RedactorTextField"])
except:
    pass
