/*
～ すべてのプロジェクト編集者へ ～
ソースコード上で会話しても問題はないですが、codechat.txtかdiscordでできれば会話してくださいね()
あんまり多いとコードが長くなっちゃうから()
※問題ないかもしれないけどしらね
あと自分の名前をしっかり書きましょう。誰が誰だかわかりません()
- syota_sacv01
*/

/* モジュール系の読み込み */
// なんやこれ
// const querystring = require("querystring");
// DiscordのBotだからやっぱこれだよねぇ～
const discord = require("discord.js");
const client = new discord.Client();
// 設定ファイルの読み込み
// なんか読み込めない()
/*
const config = require('./config.json');
const token = config.token
*/

/* リプライ関数 */
function sendReply(message, text) {
	message
		.reply(text)
		.then(console.log("リプライ送信: " + text))
		.catch(console.error);
}

/* メッセージ送信関数 */
function sendMsg(channelId, text, option = {}) {
	client.channels
		.get(channelId)
		.send(text, option)
		.then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
		.catch(console.error);
}

/* Bot起動時に実行 */
client.on("ready", message => {
	console.log("Bot準備完了～");
	client.user.setPresence({ activity: { name: "system動作中" } });
});

/* メッセージ受信時に実行 */
client.on("message", message => {
	/* 例外系 */
	// 自分(bot)のメッセージ無視なんてあるんだね yes
	if (message.author.id == client.user.id) {
		return;
	}
	// Botからの発言は全て見なかったことに...
	if (message.author.bot) {
		return;
	};
	// なんとなくDMも封鎖wwwwwwwwwwwwwwwwwwww
	// 誰だ草生やしたやつ()
	if (message.channel.type == "dm") {
		return;
	};

	//あれdm( ﾟДﾟ) m
	//？ - syota_sacv01
	// メンション時に実行
	// した2つの好きな方を選んでね☆ - syota_sacv01
	//if (message.content.match(/<@!773486707294076951>/)) {
	if (message.content == "<@!865150642816155688>") {
		message.channel.send("呼びました？")
  	}

	//あれ()
	if (message.content == "p.reza") {
		//ファイル添付チェック
		if (message.attachments.size) {
			// 添付された全ての画像(ファイル)のURLを取得する
			var files = message.attachments.map(attachment => attachment.url)
			//拡張子の確認
			//アップロードを許可する拡張子
			var allow_exts = new Array('jpg', 'jpeg', 'png','tiff');
			checkIfImage();
			function checkIfImage () {
				//指定されたファイルの数だけ拡張子をチェックする
				for (var i = 0; i < files.length; i++) {
					if (!checkExt(files[i].name)) {
						message.reply("画像ファイルを添付してください。")
						return false;
					}
				}
				//チェックを通ったらtrueを返す
				return true;
			}
			//アップロード予定のファイル名の拡張子が許可されているか確認する関数
			function checkExt(filename)
			{
				//比較のため小文字にする
        if (!filename == undefined) {
				var ext = getExt(filename).toLowerCase();
        }
				//許可する拡張子の一覧(allow_exts)から対象の拡張子があるか確認する
				if (allow_exts.indexOf(ext) === -1) return false;
				return true;
			}
      
			//ファイル名から拡張子を取得する関数
			function getExt(filename) {
        if (!filename == undefined) {
          var pos = filename.lastIndexOf('.');
        
				if (pos === -1) return '';
				return filename.slice(pos + 1);
        }
				
			}

			// ファイルを指定してメッセージを送信する
			message.guild.channels.cache.get('867024511589023744').send({ files })
		} else {
			message.reply("Error: ファイルを添付してください。")
		}
	}
});

/* ループ再び */
client.login("ODY1MTUwNjQyODE2MTU1Njg4.YO_0Ug.l6L7IB2nHU0wVWsR51xbLLZwPKE");



/*
にゃーんに反応してくれる(？)
//console.log(message)
//なんでプリントしないんだ
if (message.content.match(/OK|OK/)) {
var text = "OKです！";
sendMsg(message.channel.id, text);
return;
}
if (messsage.content ==='OH')
message.channel.send(
{embed: {
color:7506394
fields: [
{
name: "うわぁぁぁ",
value: "**__OH....__**",
},
]
}}
)});
if (message == null) {
if (message.isMemberMentioned(client.user)) {
sendReply(message, "呼びましたか？");
return;
}
}
Botのトークン未設定だった場合に表示
if (token == undefined) {
console.log("tokenが設定されていません。");
process.exit(0);
}
*/