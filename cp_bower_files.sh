#!/bin/sh
DEST=../js/lib/
SRC=src/bower/

cd $SRC
cp angular/angular.js $DEST
cp angular-bootstrap/ui-bootstrap.js $DEST
cp angular-cookies/angular-cookies.js $DEST
cp angular-mocks/angular-mocks.js $DEST
cp angular-resource/angular-resource.js $DEST
cp angular-ui-router/release/angular-ui-router.js $DEST
cp angular-ui-utils/ui-utils.js $DEST
cp jquery/dist/jquery.js $DEST