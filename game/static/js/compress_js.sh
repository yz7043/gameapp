#! /bin/bash
JS_PATH=/home/andyzhuyx57/gitrepo/gameapp/game/static/js/
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/

find ${JS_PATH_SRC} -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}game.js
echo "compress success!"

python3 /home/andyzhuyx57/gitrepo/gameapp/manage.py collectstatic
