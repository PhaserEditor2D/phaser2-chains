#!/usr/bin/python


import os
import json
import os
import os.path as path


content = ''

######################### DOCGEN  #########################

print('''

create js/data.js

''')

DOCGEN_OUTPUT = 'phaser-docgen-output'

types = []

for fname in os.listdir(DOCGEN_OUTPUT):
	print(fname)	
	f = open(path.join(DOCGEN_OUTPUT, fname))
	with f:
		root = json.load(f)	
	types.append(root)


content += '''

var PHASER_UNITS = ''' + json.dumps(types) + ''';

'''



######################### EXAMPLES - DATABASE #########################


print('''

create examples database

	''')


EXAMPLE_DIR = path.join('phaser-examples-master', 'examples')
LABS_DIR = path.join('phaser-examples-master', 'labs')

filelist = []

def walktree(dirname):
	if '_site' in dirname:
		return;
	for name in os.listdir(dirname):
		fullname = path.join(dirname, name)		
		if path.isdir(fullname):
			walktree(fullname)
		else:			
			if name.endswith('.js') and not '.min.' in name and not 'phaser.js' in name:
				filelist.append(fullname)
			else:
				print('ignore ' + fullname)

walktree(EXAMPLE_DIR)
walktree(LABS_DIR)

print('processing ' + str(len(filelist)) + ' files');

lines = []
filename_map = {}
fileindex = 0
for name in filelist:
	print(name)
	f = open(name)
	with f:
		lineindex = 0
		for l in f.readlines():
			l = l.strip()
			if len(l) > 5:
				lines.append((l, lineindex, fileindex))								
			lineindex += 1
	fileindex += 1


print('adding ' + str(len(lines)) + ' lines')

filelist2 = []
for fname in filelist:
	split = fname.split(path.sep)
	if split[1] == 'labs':
		fname = '/'.join(split[1:])
	else:
		fname = '/'.join(split[2:])
	filelist2.append(fname)

examples_data = {'filelist':filelist2, 'lines':lines}


content += '''

var PHASER_EXAMPLES = ''' + json.dumps(examples_data) + ''';

'''

data = {'types': types, 'examples': examples_data}

f = open('www/js/data.js', 'w')
with f:
	f.write(content)

	
	