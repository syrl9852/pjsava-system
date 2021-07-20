/* モジュール系の読み込み */
const discord = require("discord.js");
const client = new discord.Client();

/* Bot起動時に実行 */
client.on("ready", message => {
	console.log("Bot準備完了～");
	client.user.setPresence({ activity: { name: "system未動作" } });
});

/* メッセージ受信時に実行 */
client.on("message", message => {
	console.log(message)
	console.log(message.attachments.map(attachment => attachment.url))
});

/* ループ再び */
client.login("ODY1MTUwNjQyODE2MTU1Njg4.YO_0Ug.l6L7IB2nHU0wVWsR51xbLLZwPKE");