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
			rm -r temp
		else
			rm -r temp
		fi
	# else
	#	echo "Failed"
	#	yeoman clean
	# fi
else
	echo "Failed"
	yeoman clean
fi

