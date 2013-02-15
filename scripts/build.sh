#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Build Process"
echo "-------------------------------------------------------------------"

yeoman test
if [ $? == 0 ]
then
	# yeoman test:e2e
	# if [ $? == 0 ]
	# then
		yeoman build
		if [ $? == 0 ]
		then
			cp -r dist/common/adeImg dist/build
			rm -r temp
		else
			yeoman clean
		fi
	# else
	#	echo "Failed"
	#	yeoman clean
	# fi
else
	echo "Failed"
	yeoman clean
fi

