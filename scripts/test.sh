#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Karma Server (http://karma-runner.github.com/)"
echo "-------------------------------------------------------------------"

echo $BASE_DIR/../test/config/karma.conf.js

rm -r $BASE_DIR/../coverage
karma start $BASE_DIR/../test/config/karma.conf.js $*
