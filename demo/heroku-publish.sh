#!/usr/bin/env bash
CURRENT_BRANCH_NAME=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
heroku create --remote ccd-case-ui-toolkit-demo --stack heroku-16 ccd-case-ui-toolkit-demo
heroku config:set USERNAME=pirate --app ccd-case-ui-toolkit-demo
heroku config:set PASSWORD=bunting --app ccd-case-ui-toolkit-demo
heroku config:set YARN_PRODUCTION=false --app ccd-case-ui-toolkit-demo
git push heroku $CURRENT_BRANCH_NAME:master
