#!/usr/bin/env bash

# <description>
#
# Usage:
#  $ ./heroky-publish param1 param2
# * param1: description of the app in heroku
# * param2: name of the tag

programname=$0

if [ ${#@} == 0 ]; then
    echo "usage: $programname param1 param2"
    echo "  param1: description of the app in heroku"
    echo "  param2: name of the tag"
    exit 1
fi

heroku create --remote $1 --stack heroku-16 $1
heroku config:set USERNAME=pirate --app $1
heroku config:set PASSWORD=bunting --app $1
heroku config:set YARN_PRODUCTION=false --app $1
git push heroku $2:master
