#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Build Process"
echo "-------------------------------------------------------------------"


grunt build
if [ $? == 0 ] #if unit tests pass
then
	#build
	grunt test-dist
	if [ $? == 0 ]
	then
		echo "Success"

	else 
		echo "Tests Failed"
		#grunt clean
	fi
else
	echo "Build Failed"
	grunt clean
fi
