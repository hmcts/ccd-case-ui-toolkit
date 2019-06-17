#!/usr/bin/env bash

createTag() {
    git ls-remote --tags origin $TAG_NAME 2>/dev/null | grep $TAG_NAME 1>/dev/null
    if [ "$?" == 0 ]; then
       echo Tag $TAG_NAME already exists!;
    else
       git tag $TAG_NAME -a -m "Generated tag from TravisCI build $TRAVIS_BUILD_NUMBER"
       git push https://${GH_TOKEN}@github.com/hmcts/ccd-case-ui-toolkit.git --tags >/dev/null
    fi
}

git config user.name "Travis CI"
git config user.email "travis@travis-ci.org"

export PACKAGE_VERSION=$(jq -r ".version" package.json)
export TAG_NAME="v$PACKAGE_VERSION"

if [[ "$TRAVIS_PULL_REQUEST" != "false" && "$PACKAGE_VERSION" != *RDM*-prerelease ]]; then
      echo "PR branch must have a prerelease version with RDM number to tag (Eg: 1.2.3-RDM-4685-prerelease)"
    else
     createTag
fi
