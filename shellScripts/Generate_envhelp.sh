#!/bin/bash

env_dir=$(pwd)/env
cd $env_dir
if [ -f envhelp ];then
    rm old.envhelp
    mv envhelp old.envhelp
fi

echo 'JD_COOKIE=' > envhelp

function writeSpecEnv(){
    echo write envfile $1
    echo -e "\n\n" >> envhelp
    echo \#$1 >> envhelp
    cat $1 | grep ^pt_pin >> envhelp
    cat $1 | grep ^pt_key >> envhelp
    echo jd_cookie$1=\"pt_key=\$pt_key\;pt_pin=\$pt_pin\;\" >> envhelp
    echo JD_COOKIE=\"\$JD_COOKIE\&\$jd_cookie$1\" >> envhelp
}

export -f writeSpecEnv

ls env* | xargs -t -i bash -c "writeSpecEnv {}"

