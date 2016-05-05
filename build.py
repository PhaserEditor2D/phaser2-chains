#!/usr/bin/python

import shutil
import os
import subprocess
import base64
import datetime
import sys

COPY_FOLDERS = [
	'lib',
	'js', 
	'assets',
	]
	
COPY_FILES = [
	'index.html',
]


distdir = 'build'

shutil.rmtree(distdir, True)

os.chdir('www')

# copy folders

for fname in COPY_FOLDERS:
    shutil.copytree(fname, '../' + distdir + '/' + fname)


# copy HTML files


for fname in COPY_FILES:
    shutil.copyfile(fname, '../' + distdir + '/' + fname)


# cache manifest
curdir = os.path.abspath(os.curdir)
os.chdir('../' + distdir)

text = 'CACHE MANIFEST\n'
text += '# ' + str(datetime.datetime.now()) + '\n'

for dirpath, dirnames, filenames in os.walk('.'):
    for fname in filenames:
        # ignore hidden files, like those from apache server
        if fname.startswith('.'):
            continue
        # the rest of the files, add them to the cache
        text += os.path.join(dirpath[1:], fname) + '\n'            


        
text += '''
NETWORK:
*
'''


f = open('phaserchains.appcache', 'w')
f.write(text)
f.close();

os.chdir(curdir)

print('\n\nWebsite compiled at "' + os.path.abspath(distdir) + '"\n\n')








