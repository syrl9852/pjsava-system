#!/bin/bash
cd `dirname $0`
pid=$(cat node.pid)
if [[ $pid != '' && `ps ax | grep "^.* $pid .*$"|grep -v "grep"|wc -l` != 0 ]];then
	kill -15 $pid
	exit 0
else
	exit 1
fi

