#!/bin/bash

dkcmd="set -a;source /all;source /env;node $1"

if [ -f shellScripts/container_names ];then
	rm shellScripts/container_names
fi	

docker-compose ps | grep jd | awk  '{print $1}' >> shellScripts/container_names
cat shellScripts/container_names | xargs -i docker exec -i {} bash -c "$dkcmd"
