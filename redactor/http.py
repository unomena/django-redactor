'''
Created on 01 Oct 2014

@author: michael
'''
import json
from django.http import HttpResponse


def upload_receive(request):
    """
    Returns the file(s) uploaded by the user.
    """
    return request.FILES['file'] if request.FILES else None


class JFUResponse(HttpResponse):
    """
    Returns an HTTP response with its data encoded in JSON format.

    Content-Type negotation is handled transparently by inspecting the
    request object. If the client accepts JSON, the MIME-type of the response
    is set to JSON. Otherwise, the MIME-type defaults to 'text/plain'.

    This approach suports jQuery File Upload's use of an Iframe Transport
    module for the browsers (IE & Opera) incapable of handling XmlHttpRequest
    file uploads and who present download dialogs for iFrame responses that
    declare a JSON MIME-type.
    """

    def __init__(self, request, data=True, *args, **kwargs):
        data = json.dumps(data)
        j = "application/json"
        accept = request.META.get('HTTP_ACCEPT')

        mime = j if accept and j in accept else 'text/plain'

        super(JFUResponse, self).__init__(data, mime, *args, **kwargs)
