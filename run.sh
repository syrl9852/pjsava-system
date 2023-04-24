#!/bin/bash

if [[ $1 = '0001' ]]; then
	echo "merging logs"
	cat current.log | tee ./latest.log >> ./logs/history.log
	:>./current.log
	{
	echo "===============`date "+%Y/%m/%d %H:%M:%S"`開始==============="
	git pull
	if [[ $? = 0 ]]; then
		echo '"git pull" is successful'
	else
		echo '"git pull is abort"'
	fi
	npm install
	if [[ $? = 0 ]];then
		echo '"npm install" is successful'
	else
		echo '"npm install" is abort'
	fi

	npm start  2>&1 | while read -r line; do echo "$line" | xargs -d "\n" printf "`date "+%Y/%m/%d %H:%M:%S"` : %s\n" 2>&1; done
	echo "===============`date "+%Y/%m/%d %H:%M:%S"`終了exitコード`echo ${PIPESTATUS[0]}`==============="
} >> current.log
else
	cd $(dirname ${0})
	flock --timeout=0 ./current.log ${0} 0001
fi
