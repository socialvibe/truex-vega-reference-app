#!/bin/sh

NPMRC_PATH="$HOME/.npmrc"
NPMRC_PATH_BAK="$NPMRC_PATH.bak"
KEPLER_USER_TOKEN=$1
KEPLER_SERVER_NAME=$2

if [ $# -lt 1 ] ; then
  echo "Get the token from here: https://developer.amazon.com/docs/kepler-tv/auth-token.html"
  echo "USAGE: $0 [TOKEN] [KEPLER_SERVER_NAME optional (must exclude https:// prefix)]"
  exit 0
fi
if [ -f "$NPMRC_PATH" ] ; then
  sed '/@amzn:registry/d; /k-artifactory/d; /always-auth/d' "$NPMRC_PATH" >> "$NPMRC_PATH_BAK"
  mv "$NPMRC_PATH_BAK" "$NPMRC_PATH"
fi

if [ -z "$KEPLER_SERVER_NAME" ]
  then KEPLER_SERVER_NAME="k-artifactory-external.labcollab.net/artifactory/api/npm/kepler-npm-prod-local/"
fi

echo "@amzn:registry=https://$KEPLER_SERVER_NAME" >> "$NPMRC_PATH"
echo "//$KEPLER_SERVER_NAME:_authToken=$KEPLER_USER_TOKEN" >> "$NPMRC_PATH"
echo "always-auth=true" >> "$NPMRC_PATH"

exit 0
