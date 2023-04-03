#!/bin/bash

if [[ $1 = '0001' ]]; then
	echo "===============`date "+%Y/%m/%d %H:%M:%S"`開始===============" >> run.log
	npx node ./index.js  2>&1 | while read -r line; do echo "$line" | xargs -d "\n" printf "`date "+%Y/%m/%d %H:%M:%S"` : %s\n" &>> run.log; done
	echo "===============`date "+%Y/%m/%d %H:%M:%S"`終了exitコード`echo ${PIPESTATUS[0]}`===============" >> run.log
else
	cd $(dirname ${0})
	flock --timeout=0 ./run.log ${0} 0001
fi
