#!/bin/sh

if [ "$BUILDER" = "travis_ci" ]; then 
    npm run test:low-resource-mode
else
    npm test
fi;
