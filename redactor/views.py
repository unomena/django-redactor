'''
Created on 18 May 2015

@author: michaelwhelehan
'''
import os

from django.views import generic as generic_views
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

import humanize

from redactor import http


class RedactorImageUpload(generic_views.View):
    if settings.REDACTOR_IMAGE_UPLOAD_DIR:
        upload_dir = settings.REDACTOR_IMAGE_UPLOAD_DIR
    else:
        upload_dir = 'redactor_images'

    def post(self, request, *args, **kwargs):
        the_file = http.upload_receive(request)
        filepath = os.path.join(settings.MEDIA_ROOT, self.upload_dir)
        default_storage.save(
            os.path.join(filepath, the_file.name),
            ContentFile(the_file.read())
        )
        data = {
            'filelink': '%s%s/%s' % (
                settings.MEDIA_URL, self.upload_dir, the_file.name
            ),
            'filename': the_file.name
        }
        return http.JFUResponse(request, data)


class RedactorImages(generic_views.View):
    if settings.REDACTOR_IMAGE_UPLOAD_DIR:
        upload_dir = settings.REDACTOR_IMAGE_UPLOAD_DIR
    else:
        upload_dir = 'redactor_images'

    def get(self, request, *args, **kwargs):
        filepath = os.path.join(settings.MEDIA_ROOT, self.upload_dir)
        files = []
        for o in os.listdir(filepath):
            dir_path = os.path.join(filepath, o)
            if not os.path.isdir(dir_path):
                extension = o.split('.')[-1].lower()
                if extension in ['jpg', 'jpeg', 'png']:
                    the_path = '%s%s/%s' % (
                        settings.MEDIA_URL, self.upload_dir, o
                    )
                    files.append({
                        'thumb': the_path,
                        'image': the_path,
                        'title': o
                    })
        return http.JFUResponse(request, files)


class RedactorFileUpload(RedactorImageUpload):
    if settings.REDACTOR_FILE_UPLOAD_DIR:
        upload_dir = settings.REDACTOR_FILE_UPLOAD_DIR
    else:
        upload_dir = 'redactor_files'


class RedactorFiles(generic_views.View):
    if settings.REDACTOR_FILE_UPLOAD_DIR:
        upload_dir = settings.REDACTOR_FILE_UPLOAD_DIR
    else:
        upload_dir = 'redactor_files'

    def get(self, request, *args, **kwargs):
        filepath = os.path.join(settings.MEDIA_ROOT, self.upload_dir)
        files = []
        for o in os.listdir(filepath):
            dir_path = os.path.join(filepath, o)
            if not os.path.isdir(dir_path):
                the_path = '%s%s/%s' % (
                    settings.MEDIA_URL, self.upload_dir, o
                )
                size = humanize.naturalsize(os.path.getsize(dir_path))
                files.append({
                    'link': the_path,
                    'size': size,
                    'title': o,
                    'name': o
                })
        return http.JFUResponse(request, files)