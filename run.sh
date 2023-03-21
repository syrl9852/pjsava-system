#!/bin/bash
echo "===============`date "+%Y/%m/%d %H:%M:%S"`開始===============" >> run.log
node ./index.js 2>&1 | xargs -d "\n" printf "`date "+%Y/%m/%d %H:%M:%S"` : %s\n" &>> run.log
echo "===============`date "+%Y/%m/%d %H:%M:%S"`終了exitコード`echo ${PIPESTATUS[0]}`===============" >> run.log
