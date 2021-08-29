#!/bin/bash

eval `ssh-agent` 
ssh-add ~/.ssh/id_github
ssh -T git@github.com
$@
ssh-agent -k
