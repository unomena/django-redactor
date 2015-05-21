'''
Created on 18 May 2015

@author: michaelwhelehan
'''
from django.conf.urls import patterns, url
from django.views.decorators.csrf import csrf_exempt

from redactor import views

urlpatterns = patterns('',
    url(r'^images/upload/$',
        csrf_exempt(views.RedactorImageUpload.as_view()),
        name='redactor_images_upload'
    ),

    url(r'^images/$',
        views.RedactorImages.as_view(),
        name='redactor_images'
    ),

    url(r'^files/upload/$',
        csrf_exempt(views.RedactorFileUpload.as_view()),
        name='redactor_files_upload'
    ),

    url(r'^files/$',
        views.RedactorFiles.as_view(),
        name='redactor_files'
    ),
)
