#!/bin/bash
DEV_ENV_FILE="dev.env"
EXAMPLE_DEV_ENV_FILE=$DEV_ENV_FILE.example

if [ ! -f $DEV_ENV_FILE ]; then
   cp $EXAMPLE_DEV_ENV_FILE $DEV_ENV_FILE
   echo $DEV_ENV_FILE file created
fi
