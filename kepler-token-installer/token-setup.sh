#!/bin/sh

KEPLER_USERNAME=$1
KEPLER_USER_TOKEN=$2
KEPLER_SERVER_NAME=$3
KEPLER_REPO_NAME=$4
KNRC_PATH="$HOME/.knrc"
KNRC_PATH_BAK="$KNRC_PATH.bak"

if [ $# -lt 2 ] ; then
  echo "Get the username (customer ID) and token from here: https://developer.amazon.com/docs/kepler-tv/auth-token.html"
  echo "USAGE: $0 [USERNAME] [TOKEN] [KEPLER_SERVER_NAME optional (must exclude https:// prefix)] [KEPLER_REPO_NAME optional]"
  exit 0
fi

if [ -f "$KNRC_PATH" ] ; then
  sed '/KEPLER_USERNAME/d; /KEPLER_USER_TOKEN/d' "$KNRC_PATH" >> "$KNRC_PATH_BAK"
  mv "$KNRC_PATH_BAK" "$KNRC_PATH"
fi

# Rename server and repo names if empty
if [ -z "$KEPLER_SERVER_NAME" ]; then
  KEPLER_SERVER_NAME="k-artifactory-external.labcollab.net/artifactory/api/conan/kepler-conan-prod-local"
fi

if [ -z "$KEPLER_REPO_NAME" ]; then
  KEPLER_REPO_NAME="external-stable"
fi

cat <<EOT > $KNRC_PATH
[[Repos]]
repo = "$KEPLER_REPO_NAME"
apiUrl = "https://$KEPLER_SERVER_NAME"
username = "$KEPLER_USERNAME"
token = "$KEPLER_USER_TOKEN"
# Additional repos can be added with:
# [[Repos]]
# repo = <repo name>
# apiUrl = <url to repo/server>
# username = <username credentials>
# token = <token credentials>
EOT

sh ./update-npmrc.sh $KEPLER_USER_TOKEN

echo "Successfully added the credentials!"
exit 0
