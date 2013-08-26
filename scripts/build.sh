#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Build Process"
echo "-------------------------------------------------------------------"


grunt build
if [ $? == 0 ] #if unit tests pass
then
   #build passed
	
	cp -r $BASE_DIR/../dist/common/adeImg $BASE_DIR/../dist/build

	grunt test-dist
	if [ $? == 0 ]
	then
		echo "Success"

		echo "Making zip file"

		mkdir $BASE_DIR/../dist/ade-1.2
		cp $BASE_DIR/../INSTALL $BASE_DIR/../dist/ade-1.2
		cp $BASE_DIR/../README.md $BASE_DIR/../dist/ade-1.2
		cp $BASE_DIR/../LICENSE $BASE_DIR/../dist/ade-1.2
		cp -r $BASE_DIR/../dist/build/* $BASE_DIR/../dist/ade-1.2
		zip -j $BASE_DIR/../dist/build/ade.zip $BASE_DIR/../dist/ade-1.2/*
		rm -rf $BASE_DIR/../dist/ade-1.2

	else 
		echo "Tests Failed"
		#grunt clean
	fi
else
	echo "Build Failed"
	grunt clean
fi
