#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Build Process"
echo "-------------------------------------------------------------------"

grunt build
if [[ $? == 0 ]] #if unit tests pass
then
   #build passed
	
	cp -r $BASE_DIR/../dist/common/adeImg $BASE_DIR/../dist/build

	grunt karma:dist
	if [[ $? == 0 ]]
	then
		echo "Unit Tests Pass"
	else 
		grunt clean
		echo "Unit Tests Failed"
		echo -en "\007" #beep
	fi
else
	grunt clean
	echo "Build Failed"
	echo -en "\007" #beep
fi
