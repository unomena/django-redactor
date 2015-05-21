from setuptools import setup, find_packages

setup(
    name='redactor',
    version='0.0.1',
    description='Redactor implemented in Django',
    long_description = open('README.rst', 'r').read() + open('AUTHORS.rst', 'r').read(),
    author='Unomena',
    author_email='dev@unomena.com',
    license='BSD',
    url='http://git.unomena.net/unomena/unoconsole',
    packages = find_packages(),
    dependency_links = [],
    install_requires = [
        'humanize==0.5.1'
    ],
    tests_require=[
        'django-setuptest>=0.1.2',
        'pysqlite>=2.5',
	    'pycurl'
    ],
    test_suite="setuptest.setuptest.SetupTestSuite",
    include_package_data=True,
    classifiers = [
        "Programming Language :: Python",
        "License :: OSI Approved :: BSD License",
        "Development Status :: 4 - Beta",
        "Operating System :: OS Independent",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
    ],
    zip_safe=False,
)
