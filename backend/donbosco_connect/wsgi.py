"""Don Bosco Connect WSGI config"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'donbosco_connect.settings')
application = get_wsgi_application()