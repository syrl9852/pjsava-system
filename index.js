/* モジュール系の読み込み */
const http = require("http");
const querystring = require("querystring");
const discord = require("discord.js");
const client = new discord.Client();

/* なんか...なんだろ 
これは確かPOSTでのウェイクアップ用*/
/*
http
  .createServer(function(req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function(chunk) {
        data += chunk;
      });
      req.on("end", function() {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is active now\n");
    }
  })
  .listen(3000);
*/

/* Bot起動時に実行 */
client.on("ready", message => {
	console.log("Bot準備完了～");
	client.user.setPresence({ activity: { name: "system動作中" } });
});

/* メッセージ受信時に実行 */
client.on("message", message => {
	/* なんじゃこりゃ */
		if (message.author.id == client.user.id) {
    	return;
	}
	/* メンション時に実行 */
	if (message == null) {
		if (message.isMemberMentioned(client.user)) {
    		sendReply(message, "呼びましたか？");
			return;
    	}
  	}
  	/* にゃーんに反応してくれる(？) */
  	//console.log(message)
  	//なんでプリントしないんだ
  	if (message.content.match(/OK|OK/)) {
    	var text = "OK";
    	sendMsg(message.channel.id, text);
    	return;
  	}
});

/* Botのトークン未設定だった場合に表示 */
if (process.env.DISCORD_BOT_TOKEN == undefined) {
	console.log("DISCORD_BOT_TOKENが設定されていません。");
	process.exit(0);
}

/* ループ再び */
client.login(process.env.DISCORD_BOT_TOKEN);

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