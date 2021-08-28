#!/bin/bash

dkcmd="set -a;source /all;source /env;node $2"


docker exec -i $1 bash -c "$dkcmd"
