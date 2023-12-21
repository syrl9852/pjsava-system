#!/bin/bash
cd `dirname $0`
description='使用法: ./setup.sh ["install" or "remove"]\n\npjsava-systemのサービスを管理します。\n実行にはroot権限が必要です\n\ninstall: サービスをローカルシステムにインストールします。\nディレクトリ構成が以下のようになっていることが前提です。\n  pjsava-system/\n    systemd-service/\n      pjsys-server.service\n      setup.sh\n    run.sh\n    stop.sh\n    その他サーバーの実行に必要なファイルとディレクトリ\n\nremove: インストールされているサービスを削除します。\n'
case $1 in
	"install")
		if [[ `id -u` != 0 ]];then
			echo "インストールはrootで実行する必要があります"
			exit 1
		fi
		read -p "サーバーを実行するユーザー:" user
		cat pjsys-server.service |sed -e "s/{user}/${user}/"|sed -e "s/{ProjectRoot}/$(dirname `pwd`|sed -e 's/\//\\\//g')/g" > /etc/systemd/system/pjsys-server.service
		systemctl enable pjsys-server.service
		systemctl start pjsys-server.service
		if [[ $? == 0 ]];then
			echo -e "サービスは正常にインストールされました\n\"systemctl status pjsys-server\"でサービスの状態を確認することができます"
			exit 0
		fi;;
	"remove")
		if [[ `id -u` != 0 ]];then
			echo "削除はrootで実行する必要があります"
			exit 1
		fi
		if [[ `systemctl list-units --type=service|grep pjsys-server.service|wc -l` != 0 ]];then
			systemctl stop pjsys-server.service
			systemctl disable pjsys-server.service
			rm -f /etc/systemd/system/pjsys-server.service
			echo "サービスを削除しました"
			exit 0
		else
			echo "サービスが見つかりませんでした"
		fi;;
	"")
		echo -e "$description";;
	*)
		echo -e "引数が間違っています\n\n$description"
esac

