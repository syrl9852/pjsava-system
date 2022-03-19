/* モジュール系の読み込み */
//DiscordのBotだからやっぱこれだよねぇ～
const {
	Discord,
	Client,
	Intents,
	MessageAttachment,
	WebhookClient,
	Webhook
} = require('discord.js');

//常時稼働用のhttpモジュール読み込み
const http = require('http');

//リクエストモジュール
const request = require('request');

//時差修正用モジュール
const momentTimezone = require('moment-timezone');

//データ保存用
const Database = require("@replit/database")

//画像メーカー(適当)
const Canvas = require('canvas');

//ファイル操作
const fs = require('fs');

//path
const path = require('path');

//リアクションロール用
const ReactionRole = require("discordjs-reaction-role").default;

//フォント問題解決用
const {	registerFont } = require('canvas');

//時間比較モジュール
const moment = require('moment')

//タイマーパッケージ
const Timer = require('tiny-timer')

//定期実行用パッケージ(cron)
const cron = require('node-cron');

/* 各種設定 */
//Discordクライアントの指定
const client = new Client({
	intents: [
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES
	],
	partials: [
		'USER',
		'CHANNEL',
		'GUILD_MEMBER',
		'MESSAGE',
		'REACTION'
	]
});

//設定ファイルの読み込み
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

//banユーザーリスト設定
const blacklist = config.blacklist

//プロ鯖SYSTEMデータベース
const db = new Database()

//トークンの指定
const token = process.env['token']

//プレフィックス
const prefix = config.prefix

//サーバーID
const serverID = config.id.server

/* チャンネル指定 */
//全メンバー人数記録ch
const memberCountChannel = config.id.channel.count.member
//ユーザー数記録ch　
const userCountChannel = config.id.channel.count.user
//鯖民数記録ch
const touhuCountChannel = config.id.channel.count.touhu
//Bot数記録ch
const botCountChannel = config.id.channel.count.bot

/* ロール指定 */
// Owner
const ownerId = config.id.role.status.owner
// Bot
const botID = config.id.role.status.bot
// Admin
const adminId = config.id.role.status.admin
// Moderator
const moderatorId = config.id.role.status.moderator
// Manager
const managerId = config.id.role.status.manager
// Developer
const developerID = config.id.role.status.developer
// Staff
const staffId = config.id.role.status.staff
// サーバー支援者
const boostID = config.id.role.status.boost
// ミュート
const mutedID = config.id.role.status.muted
// セカイに住む一般豆腐
const toufuID = config.id.role.status.touhu

//ファンロール
//そらファン
const soraFan1 = config.id.role.fan.manager.sora[0]
const soraFan2 = config.id.role.fan.manager.sora[1]
const soraFan3 = config.id.role.fan.manager.sora[2]
const soraFan4 = config.id.role.fan.manager.sora[3]
const soraFan5 = config.id.role.fan.manager.sora[4]

//咲耶ファン
const sayaFan1 = config.id.role.fan.manager.saya[0]
const sayaFan2 = config.id.role.fan.manager.saya[1]
const sayaFan3 = config.id.role.fan.manager.saya[2]
const sayaFan4 = config.id.role.fan.manager.saya[3]
const sayaFan5 = config.id.role.fan.manager.saya[4]

//犬氏ファン
const oneFan1 = config.id.role.fan.manager.one[0]
const oneFan2 = config.id.role.fan.manager.one[1]
const oneFan3 = config.id.role.fan.manager.one[2]
const oneFan4 = config.id.role.fan.manager.one[3]
const oneFan5 = config.id.role.fan.manager.one[4]

//零ファン
const zeroFan1 = config.id.role.fan.manager.zero[0]
const zeroFan2 = config.id.role.fan.manager.zero[1]
const zeroFan3 = config.id.role.fan.manager.zero[2]
const zeroFan4 = config.id.role.fan.manager.zero[3]
const zeroFan5 = config.id.role.fan.manager.zero[4]

//みなづきファン
const minaFan1 = config.id.role.fan.manager.mina[0]
const minaFan2 = config.id.role.fan.manager.mina[1]
const minaFan3 = config.id.role.fan.manager.mina[2]
const minaFan4 = config.id.role.fan.manager.mina[3]
const minaFan5 = config.id.role.fan.manager.mina[4]

//るしふぁーファン
const rusiFan1 = config.id.role.fan.manager.rusi[0]
const rusiFan2 = config.id.role.fan.manager.rusi[1]
const rusiFan3 = config.id.role.fan.manager.rusi[2]
const rusiFan4 = config.id.role.fan.manager.rusi[3]
const rusiFan5 = config.id.role.fan.manager.rusi[4]
//ファンロール終わり

//フォント指定
registerFont('./Fonts/NotoSerifJP-Black.otf', {
	family: 'Noto_Serif'
});
registerFont('./Fonts/Roboto-Black.ttf', {
	family: 'Roboto'
});
registerFont('./Fonts/-pr6n-r.otf', {
	family: 'Gothic'
});

/* 汎用開始時間取得モジュール */
require('date-utils');
const startedtime = momentTimezone(new Date()).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');

/* 常時稼働用モジュール&認証モジュール */
http.createServer(function(req, res) {
	//表示する情報の種類を指定
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	//メッセージを表示
	res.end(`
		Bot operating status: starting\n
		Start time: ${startedtime}
	`);
}).listen(3000);

/* Bot起動時に実行 */
client.on("ready", message => {
	//開始時間，Bot名をConsoleに表示
	console.log(startedtime + 'に' + client.user.tag + 'が起動しました')
	//ステータスメッセージを設定
	client.user.setActivity('システム稼働中！')
	//メンバーカウントの更新
	memberCount()
});

//ファンロール用モジュール
/*client.on('guildMemberUpdate', (oldMember, newMember) => {
	console.log(oldMember)
})*/

/*定期実行モジュール(毎日0時に実行)*/
cron.schedule('0 0 0 * * *', () => {
  //アクティブ日数定期実行部分
	db.get("activeuser").then(value => {
		if (!(value === null)) {
			value.forEach(userid => {
				const keyname = "active" + userid
				db.get(keyname).then(msgcount => {
					if (msgcount >= 20) {
						const activecount = "activecount" + userid
						db.get(activecount).then(daycount => {
							if (daycount === null) {
								db.set(activecount, 1).then(() => {});
							} else {
								db.set(activecount, daycount + 1).then(() => {});
							}
						});
					}
				});
				db.delete(keyname).then(() => {});
			});
		}
	});
});

/* メッセージ受信時に実行 */
client.on('message', async message => {
	//botのアイコンを取得
	const botAvatar = avatarGet(client)

	/* 例外系 */
	// 自分(bot)のメッセージ無視なんてあるんだね yes
	if (message.author.id == client.user.id) return;

	//自動公開 botのメッセージも公開したいから移動-ｻｲｷｮｳ
	if (message.channel.type === 'news') {
		message.crosspost()
	}
	
	if (message.content.match(/goggle/)) {
		if (message.channel.id == "911615993514692668") return;
		message.delete({
			reason: "goggle"
		})
	}

	//雑談リアルタイム
	if (message.channel.id == "853973462620176404") {
		message.guild.channels.cache.get('914467827229032469').send({
			embed: {
				author: {
					name: message.member.displayName,
					icon_url: avatarGet(message.member)
				},
				description: message.content,
				footer: {
					text: "ID: " + message.author.id  + "\n" + new Date()
				}
			}
		});
		message.delete({ timeout: 300000 })
	}

	// Botからの発言は全て見なかったことに...
	if (message.author.bot) return;

	// DMからの問い合わせを受け付ける
	if (message.channel.type == "dm") {
		client.users.cache.get(message.author.id).send(
			'現在botからの問い合わせの受付が停止されています。\n' + 
			'お問い合わせは <#849636324104339516> こちらからチケットを発行して作成されたチャンネルへ転記をお願いします。'
		)
	}

	//メッセージ数の測定のやつ
	/*const keyname = "active" + message.author.id
	db.get(keyname).then(value => {
		if (value === null) {
			//初期値1を設定
			db.set(keyname, 1).then(() => {});
		} else {
			//現在の値に1を足す
			db.set(keyname, value + 1).then(() => {});
		}
		db.get("activeuser").then(value => {
			if (!(value.includes(message.author.id))) {
				db.set("activeuser", message.author.id).then(() => {})
			}
		})
	})*/
	
	//DMカテゴリからの送信
	if (message.channel.parentID == "921763594276851722") {
		//DMへそのまま送信
		client.users.cache.get(message.channel.name).send(message.content)
	}

	//メンション飛んできた時に実行
	if (message.content.match(/<@!865150642816155688>/)) {
		//プレフィクスがない場合のみ作動
		if (message.content.toLowerCase().indexOf(prefix) !== 0) {
			message.reply("お呼びですか？")
		}
	}
	
	/*
		～ スタンプURL用配列 ～
		0. ネネダヨー
		1. 瑞希：よろしく～
		2. えむ：わんだほーい！
		3. ワンダショミク：セカイへようこそ～
	*/
	const stumpURL = config.stump

	/* スタンプ作成系 */
	const stPre = message.content.slice(0, 1)
	if (stPre == "、" || stPre == "。") {
		const stamp = message.content.slice(1);
		let url = false
		switch (stamp) {
			case '！':
				url = stumpURL[0]
				message.delete()
				break;
			case 'よろしく':
				url = stumpURL[1]
				message.delete()
				break;
			case 'わんだほーい！':
				url = stumpURL[2]
				message.delete()
				break;
			case 'わんだほーい':
				url = stumpURL[2]
				message.delete()
				break;
			case 'ようこそ':
				url = stumpURL[3]
				message.delete()
				break;
			//スタンプに該当しない場合
			default:
				break;
		}
		//URLなかったら終了
		if (!url) return;
		switch (stPre) {
			case '。':
				message.channel.send(url)
				break;
			case '、':
				//ニックネームを取得
				const username = message.member.displayName
				//アイコンを取得
				const avatar = avatarGet(message.member)
				//メッセージの送信
				message.channel.send({
					embed: {
						author: {
							name: message.member.user.username,
							icon_url: avatar
						},
						image: {
							url: url
						},
						color: 10551294
					}
				})
				break;
		}
	}

	//この下はコマンド専用
	//bot使用禁止ユーザーの指定
	const banuser = config.blackList.cmdBanUser
	const cmdbanned = banuser.includes(message.author.id)
	if (cmdbanned) return;
	//プレフィクス無しの場合は無視
	if (message.content.toLowerCase().indexOf(prefix) !== 0) return;
	//引数の指定？
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	//コマンドの確認
	const command = args.shift().toLowerCase();

	if (command === "stamp") {
		message.channel.send({
			embed: {
				title: "使用できるスタンプ一覧",
				description: "現在このBotを使って送信できるスタンプの一覧です。",
				fields: [
					{
						name: "ネネダヨー",
						value: "。！",
						inline: true
					},
					{
						name: "瑞希「よろしく～」",
						value: "。よろしく",
						inline: true
					},
					{
						name: "えむ「わんだほーい！」",
						value: "。わんだほーい！\n(！は無くても可)",
						inline: true
					},
					{
						name: "ワンダショミク「セカイへようこそ～」",
						value: "。ようこそ",
						inline: true
					}
				]
			}
		});
	}

	//Ping値の測定
	if (command === "ping") {
		message.channel.send(` Ping を確認しています...`)
			.then((pingcheck) => pingcheck.edit(`botの速度|${pingcheck.createdTimestamp - message.createdTimestamp} ms`))
	}

	//タイマー
	if (command.startsWith("timer")) {
		const mode = args.join(" ");
		const timer = new Timer()
		//整数か確認
		if (Number.isInteger(Number(mode))) {
			//ミリ秒計算
			let rimit = Number(mode) * 60 * 1000;
			timer.start(rimit)
			message.channel.send(`${mode}分のタイマーを設定しました。`)
			timer.on('done', () => {
				message.reply("タイマーが終了しました。")
			})
		} else {
			message.channel.send("引数が正しくありません。")
		}
	}

	//サーバーへの招待メッセージをコピペ
	if (command === "invite") {
		message.channel.send({
			embed: {
				title: "宣伝文",
				description: "招待リンク：\n" +
					"https://discord.gg/cjdunYHhyx\n\n" +
					"宣伝文は下記ページを参照してください：\n" +
					"https://discord.com/channels/849602478475706378/864422033043750922/864423925852143627\n" + "制作中の公式webサイトです\n" + "https://pssabaweb.saikyounosennsi.repl.co/",
				color: 10551294
			}
		})
	}

	//サーバー情報
	if (command === "info") {
		//サーバー情報の取得
		const guild = message.guild
		//サーバー人数を取得
		const all = guild.memberCount;
		//guild.member.cache省略できへんかな
		const gmc = guild.members.cache
		//ユーザー人数を取得
		const user = all - gmc.filter(member => member.user.bot).size;
		//Bot人数を取得
		const bot = gmc.filter(member => member.user.bot).size;
		//オンラインユーザーを取得
		const online = gmc.filter(member => member.presence.status == "online" && !member.user.bot).size
		//所有者の取得
		const owner = guild.members.resolve(guild.ownerID).user.tag
		//アイコンを取得
		const avatar = guild.iconURL({
			format: "png",
			dynamic: true,
			size: 1024
		})
		//作成日の取得
		const createdAt = momentTimezone(guild.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
		//ブースト数，ブーストレベルの取得
		const boostLevel = guild.premiumTier
		const boostCount = guild.premiumSubscriptionCount
		//チャンネル数
		const channelCount = guild.channels.cache.size;

		//メッセージの送信
		message.channel.send({
			embed: {
				author: {
					name: guild.name,
					icon_url: avatar
				},
				thumbnail: {
					url: avatar
				},
				footer: {
					icon_url: avatarGet(message.member),
					text: `${message.author.username}がリクエストしました。`
				},
				fields: [{
					name: "サーバー名",
					value: guild.name
				},
				{
					name: "サーバーID",
					value: guild.id
				},
				{
					name: "サーバー作成日",
					value: createdAt
				},
				{
					name: "サーバー所有者",
					value: owner
				},
				{
					name: "メンバー数",
					value: all,
					inline: true
				},
				{
					name: "ユーザー数",
					value: user,
					inline: true
				},
				{
					name: "Bot数",
					value: bot,
					inline: true
				},
				{
					name: "オンラインユーザー数",
					value: online,
					inline: true
				},
				{
					name: "ブースト数",
					value: boostCount,
					inline: true
				},
				{
					name: "ブーストレベル",
					value: boostLevel,
					inline: true
				}
				],
				color: 10551294
			}
		})
	}

	//コイントス
	if (command === "cointos") {
		const coin = Math.floor( Math.random() * 2 );		
		message.channel.send(coin)
	}

	//ヘルプコマンドの送信
	if (command.startsWith('help') && message.guild) {
		//メッセージの送信
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: botAvatar
				},
				footer: {
					icon_url: avatarGet(message.member),
					text: `${message.author.username}がリクエストしました。`
				},
				title: "プロセカbotコマンド一覧",
				description: "【】→必ず入れる引数，()→任意で入れられる引数",
				fields: [
					{
						name: "ps!help",
						value: "このメッセージを送信します。"
					},
					{
						name: "ps!stamp",
						value: "送信できるスタンプの一覧を表示します。"
					},
					{
						name: "ps!ping",
						value: "Ping値の測定します。"
					},
					{
						name: "ps!timer 【分】",
						value: "分単位でタイマーを動かせます。"
					},
					{
						name: "ps!invite",
						value: "サーバーへの招待リンクを表示します。"
					},
					{
						name: "ps!info",
						value: "サーバーに関する情報を表示します。"
					},
					{
						name: "ps!user (userID or メンション)",
						value: "サーバー内に居る人の情報を表示します。"
					},
					{
						name: "ps!s-user (userID or メンション)",
						value: "ps!userの簡略版を表示します。\nタグ、ニックネーム、ステータスのみになります。"
					},
					{
						name: "ps!avatar (userID or メンション)",
						value: "指定したユーザーもしくは自分のアバターを取得します。"
					},
					{
						name: "ps!result (コメント)",
						value: "<#867024511589023744>へリザルト画面を送信します\n" + "コメントを追加した場合、一緒に表示されます。"
					},
					{
						name: "ps!anre",
						value: "基本機能は**ps!result**と同じですが、送信先が<#874399161821323275>になります。"
					}
				],
				color: 10551294
			}
		})
	}

	//リザルトの送信
	if (command.startsWith('result') || command.startsWith('anre') && message.guild) {
		//ファイルの取得
		let file = message.attachments.first()
		//ファイルなしの場合エラーを出す
		if (!file) {
			message.channel.send({
				embed: {
					author: {
						name: client.user.username,
						icon_url: botAvatar
					},
					title: "画像が添付されていません",
					description: "30秒以内に画像を送信してください。\n送信されない場合は本処理は終了されます。\nキャンセルする場合はCancelと入力してください。\nなお、コメントを追加したい場合は、先程のものは消えてしまったので、もう一度入力してください。",
					color: 10551294,
					footer: {
						text: "412 Precondition Failed"
					}
				}
			})
			const filter = msg => msg.author.id === message.author.id
			const collected = await message.channel.awaitMessages(filter, {
				max: 1,
				time: 30000
			})
			const response = collected.first()
			if (!response) {
				return message.channel.send({
					embed: {
						author: {
							name: client.user.username,
							icon_url: botAvatar
						},
						description: "画像未送信状態が30秒経過したため、本処理を終了します。",
						color: 10551294,
						footer: {
							text: "408 Request Timeout"
						}
					}
				});
			}
			var cancel_check = response.content.toLowerCase()
			if (cancel_check == "cancel") {
				return message.channel.send({
					embed: {
						author: {
							name: client.user.username,
							icon_url: botAvatar
						},
						description: "Cancelコマンドが実行されたため、処理を終了します。",
						color: 10551294,
						footer: {
							text: "408 Request Timeout"
						}
					}
				});
			}
			//ファイルの取得
			file = response.attachments.first()
			//ファイルなしの場合エラーを出す
			if (!file) return message.channel.send("キャンセルコマンドが送信されず、画像が添付されていなかったため、処理を終了します。")
			//縦横のパラメーターがないファイルは無視
			if (!file.height && !file.width) return message.channel.send("画像を添付してください");
			//再度メッセージを取得
			const message = response
			//ファイルを再取得
			file = message.attachments.first()
		}
		//ファイルに縦横比があるか確認する
		if (!file.height && !file.width) return message.channel.send("画像を添付してください");
		//メッセージの取得
		const content = message.content.slice(10);
		//写真元のメッセージURL
		const message_url = "https://discord.com/channels/849602478475706378/" + message.channel.id + "/" + message.id;
		//アイコンの取得
		const avatar = avatarGet(message.member)
		//リザルトch指定用変数の指定
		let resultSendCh = "";
		//result(プロセカリザルト)の場合
		if (command.startsWith('result')) {
			//#リザルト
			resultSendCh = "932300201476128768";
			//別ゲー用リザルトの場合
		} else if (command.startsWith('anre')) {
			//#リザルト-別ゲー
			resultSendCh = "932300201476128768";
			//エラー時の分岐
		} else {
			return message.channel.send(
				"<@866968483316629574>/n",
				{
					embed: {
						author: {
							name: client.user.username,
							icon_url: botAvatar
						},
						title: "予期せぬエラーが発生しました。",
						description: "エラー内容：リザルトチャンネル指定にて正常に動作していません。",
						color: 16757683
					}
				}
			);
		}
		const mention = "<@" + message.author.id + ">"
		client.channels.cache.get(resultSendCh).send(mention + "\n" + message_url, {
			embed: {
				author: {
					name: message.author.username,
					icon_url: avatar
				},
				description: content,
				color: 10551294,
				image: {
					url: file.url
				}
			}
		})
	}

	//VC
	if (command.startsWith('ovc') && message.guild) {
		const name = args.join(" ");
		message.channel.send("チャンネルを作成します。30秒以内にハブチャンネルに参加してください。")
		const filter = msg => msg.author.id === message.author.id
		const collected = await message.channel.awaitMessages(filter, {
			max: 1,
			time: 30000
		})
			const response = collected.first()
			if (!response) {
				return message.channel.send({
					embed: {
						author: {
							name: client.user.username,
							icon_url: botAvatar
						},
						description: "画像未送信状態が30秒経過したため、本処理を終了します。",
						color: 10551294,
						footer: {
							text: "408 Request Timeout"
						}
					}
				});
			}
			var cancel_check = response.content.toLowerCase()
			if (cancel_check == "cancel") {
				return message.channel.send({
					embed: {
						author: {
							name: client.user.username,
							icon_url: botAvatar
						},
						description: "Cancelコマンドが実行されたため、処理を終了します。",
						color: 10551294,
						footer: {
							text: "408 Request Timeout"
						}
					}
				});
			}
			//ファイルの取得
			file = response.attachments.first()
			//ファイルなしの場合エラーを出す
			if (!file) return message.channel.send("キャンセルコマンドが送信されず、画像が添付されていなかったため、処理を終了します。")
			//縦横のパラメーターがないファイルは無視
			if (!file.height && !file.width) return message.channel.send("画像を添付してください");
			//再度メッセージを取得
			const message = response
			//ファイルを再取得
			file = message.attachments.first()
		guild.channels.create('new-voice', {
			type: 'voice',
			permissionOverwrites: [
				{
					id: message.author.id,
					deny: ['VIEW_CHANNEL'],
				},
			],
		})
	}

	//ユーザー情報の取得
	if (command.startsWith('user') && message.guild) {
		//送信者の情報を取得
		const member = memberGet(message, args)[0]
		//送信者のアバターを取得
		const author_avatar = avatarGet(message.member)
		//ステータスを取得
		const status = statusGet(member.presence.status)
		//ユーザータグを取得
		const tag = member.user.tag
		//ニックネームを取得
		const username = member.displayName
		//アイコンを取得
		const avatar = avatarGet(member)

		//作成日の取得
		const createdAt = formatTime(member.user.createdAt).date
		const createdCo = formatTime(member.user.createdAt).comparison
		//参加日の取得
		const joinedAt = formatTime(member.joinedAt).date
		const joinedCo = formatTime(member.joinedAt).comparison

		//プロ鯖スタッフ参加状況の取得
		let staff
		//最高管理者
		const owner = member.roles.cache.has(ownerId)
		//管理者
		const admin = member.roles.cache.has(adminId)
		//モデレーター
		const mod = member.roles.cache.has(moderatorId)
		//開発担当者
		const dev = member.roles.cache.has(developerID)
		//サーバー支援者
		const boost = member.roles.cache.has(boostID)
		//bot
		let bot = member.user.bot
		//豆腐
		const toufu = member.roles.cache.has(toufuID)
		//スタッフ参加状況の日本語化
		if (owner || admin || mod || dev || boost || bot) {
			if (boost) {
				staff = "サーバー支援者"
			}
			if (dev) {
				staff = "Developer"
			}
			if (mod) {
				staff = "Moderator"
			}
			if (admin) {
				staff = "Admin"
			}
			if (bot) {
				staff = "Bot"
			}
			if (owner) {
				staff = "Owner"
			}
		} else {
			if (toufu) {
				staff = "メンバー";
			} else {
				staff = "未認証";
			}
		}

		//ミュート状況の取得
		let muted = member.roles.cache.has(mutedID)
		//ミュート状況の日本語化
		if (muted) {
			muted = "ミュート中"
		} else {
			muted = "ミュートなし"
		}

		//Botかどうかの日本語化
		if (bot) {
			bot = "はい"
		} else {
			bot = "いいえ"
		}

		//メッセージの送信
		message.channel.send({
			embed: {
				author: {
					name: member.user.username,
					icon_url: avatar
				},
				thumbnail: {
					url: avatar
				},
				footer: {
					icon_url: message.member.user.displayAvatarURL({
						format: "png",
						dynamic: true,
						size: 1024
					}),
					text: `${message.author.username}がリクエストしました。`
				},
				fields: [{
					name: "ユーザータグ",
					value: tag,
					inline: true
				},
				{
					name: "ニックネーム",
					value: username,
					inline: true
				},
				{
					name: "ユーザーID",
					value: member.id,
					inline: true
				},
				{
					name: "botであるか",
					value: bot,
					inline: true
				},
				{
					name: "アカウント作成日",
					value: createdAt + "\n" + createdCo,
					inline: true
				},
				{
					name: "サーバー参加日",
					value: joinedAt + "\n" + joinedCo,
					inline: true
				},
				{
					name: "プロ鯖での役職",
					value: staff,
					inline: true
				},
				{
					name: "ミュート状態",
					value: muted,
					inline: true
				},
				{
					name: "現在のステータス",
					value: status,
					inline: true
				}
				],
				color: 10551294
			}
		})
	}

	//ユーザー情報の取得 ～簡易版～
	if (command.startsWith('s-user') && message.guild) {
		//送信者の情報を取得
		const member = memberGet(message, args)[0]
		//送信者のアバターを取得
		const author_avatar = avatarGet(message.member)
		//ステータスを取得
		const status = statusGet(member.presence.status)
		//ユーザータグを取得
		const tag = member.user.tag
		//ニックネームを取得
		const username = member.displayName
		//アイコンを取得
		const avatar = avatarGet(member)

		//メッセージの送信
		message.channel.send({
			embed: {
				author: {
					name: member.user.username,
					icon_url: avatar
				},
				footer: {
					icon_url: message.member.user.displayAvatarURL({
						format: "png",
						dynamic: true,
						size: 1024
					}),
					text: `${message.author.username}がリクエストしました。`
				},
				fields: [{
					name: "ユーザータグ",
					value: tag
				},
				{
					name: "ニックネーム",
					value: username
				},
				{
					name: "現在のステータス",
					value: status
				}
				],
				color: 10551294
			}
		})
	}

	//ユーザーアイコンの取得
	if (command.startsWith('avatar') && message.guild) {
		//送信者の情報を取得
		var member = memberGet(message, args)[0]
		//送信者のアバターを取得
		var author_avatar = avatarGet(message.member)
		//ユーザータグを取得
		const tag = member.user.tag
		//アイコンを取得
		const avatar = avatarGet(member)

		//メッセージの送信
		message.channel.send({
			embed: {
				author: {
					name: member.user.username,
					icon_url: avatar
				},
				footer: {
					icon_url: message.member.user.displayAvatarURL({
						format: "png",
						dynamic: true,
						size: 1024
					}),
					text: `${message.author.username}がリクエストしました。`
				},
				description: `${tag}のアイコン`,
				image: {
					url: avatar
				},
				color: 10551294
			}
		})
	}

	//ユーザーのステータスの取得
	if (command.startsWith('status') && message.guild) {
		//送信者の情報を取得
		var member = memberGet(message, args)[0]
		//ユーザーのタグを取得
		const tag = member.user.tag
		//ユーザーのステータスを表示
		const userStatus = member.presence.clientStatus
		if (!userStatus) return message.channel.send('offline')
		//PCからのアクセスを確認
		const statusDesktop = statusGet(userStatus.desktop)
		const statusMobile = statusGet(userStatus.mobile)
		const statusWeb = statusGet(userStatus.web)
		
		//メッセージの送信
		message.channel.send(
			`${tag}のステータス\n` +
			"\`\`\`" +
			`パソコン：${statusDesktop}\n` +
			`スマホ：${statusMobile}\n` +
			`Web上：${statusDesktop}` +
			"\`\`\`",
		)
	}

	//ユーザーへの警告
	if (command.startsWith('warn')) {
		//権限を持っているか確認
		if (!message.member.roles.cache.has(managerId)) return message.channel.send('権限が不足しています。\n権限を確認してください。');
		//メンバー、文字数の取得
		const pair = memberGet(message, args)
		if (!pair) return;
		//メンバーの取得
		const member = pair[0]
		//自分ではないかの確認
		if (!pair[1]) {
			message.channel.send(
				"ユーザーを1人指定してください。\n" +
				"自分を取得する場合はメンションをせずに実行してください。\n" +
				"ただし、警告・キック・BAN等では自身を指定できません。"
			);
			return;
		}
		//理由の取得
		let reason = args.slice(pair[1])
		if (!reason || reason == "") {
			reason = reasonGet(message)
			if (!reason) return;
		}
		client.users.cache.get(member.id).send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: botAvatar
				},
				description: "サーバー運営メンバーより警告されています。",
				color: 16757683,
				fields: [{
					name: "警告内容",
					value: reason
				}],
			}
		})
	}

	//ミュート	
	if (command.startsWith('mute') && message.guild) {
		if (!message.member.roles.cache.has(managerId)) return message.channel.send('権限が不足しています。\n権限を確認してください。');
		//メンバーの取得
		const member = memberGet(message, args)[0]
		//既にミュートされていないかの確認
		if (member.roles.cache.has(mutedID)) return message.channel.send('既にミュートされています。\nミュートの解除はUnmuteを実行してください。')
		//ミュートの実行
		member.roles.add(mutedID)
		//通知
		message.channel.send("ミュートしました。\n解除する場合はUnmuteコマンドを実行してください。")
	}

	//ミュート解除
	if (command.startsWith('unmute') && message.guild) {
		if (!message.member.roles.cache.has(managerId)) return message.channel.send('権限が不足しています。\n権限を確認してください。');
		//メンバーの取得
		const member = memberGet(message, args)[0]
		//自分ではないか確認
		if (member.id == message.member.id) return message.channel.send('自分のミュートを解除することはできません。');
		//ミュートされているか確認
		if (!member.roles.cache.has(mutedID)) return message.channel.send('ミュートされていません。\nミュートをする場合はMuteを実行してください。')
		member.roles.remove(mutedID)
		message.channel.send("ミュートを解除しました。")
	}

	//メンバーのキック
	if (command.startsWith('kick') && message.guild) {
		//権限を持っているか確認
		if (!message.member.roles.cache.has(ownerId)) {
			if (!message.member.roles.cache.has(adminId)) {
				if (!message.member.roles.cache.has(moderatorId) && !emergency) {
					return message.channel.send('権限が不足しています。\n権限を確認してください。')
				}
			}
		};
		//メンバー、文字数の取得
		const pair = memberGet(message, args)
		if (!pair) return;
		//メンバーの取得
		const member = pair[0]
		//自分ではないかの確認
		if (!pair[1]) {
			message.channel.send(
				"ユーザーを1人指定してください。\n" +
				"自分を取得する場合はメンションをせずに実行してください。\n" +
				"ただし、警告・キック・BAN等では自身を指定できません。"
			);
			return;
		}
		//メンバーのキックが可能か確認
		if (!member.kickable) return message.channel.send('このユーザーをキックすることができません');
		//理由の取得
		let reason = args.slice(pair[1])
		if (!reason || reason == "") {
			reason = reasonGet(message)
			if (!reason) return;
		}
		//キック処理
		member.kick(reason)
		//キック成功報告
		message.channel.send(`${member.user.tag}をキックしました\n理由：` + reason)
	}

	//メンバーのBAN
	if (command.startsWith('ban') && message.guild) {
		//権限を持っているか確認
		if (!message.member.roles.cache.has(ownerId)) {
			if (!message.member.roles.cache.has(adminId)) {
				if (!message.member.roles.cache.has(moderatorId) && !emergency) {
					return message.channel.send('権限が不足しています。\n権限を確認してください。')
				}
			}
		};
		//メンバー、文字数の取得
		const pair = memberGet(message, args)
		if (!pair) return;
		//メンバーの取得
		const member = pair[0]
		//自分ではないかの確認
		if (!pair[1]) {
			message.channel.send(
				"ユーザーを1人指定してください。\n" +
				"自分を取得する場合はメンションをせずに実行してください。\n" +
				"ただし、警告・キック・BAN等では自身を指定できません。"
			);
			return;
		}
		//メンバーのキックが可能か確認
		if (!member.bannable) return message.channel.send('このユーザーをBANすることができません');
		//理由の取得
		let reason = args.slice(pair[1])
		if (!reason || reason == "") {
			reason = reasonGet(message)
			if (!reason) return;
		}
		//BAN処理
		member.ban({
			reason: reason
		})
		//BAN成功報告
		message.channel.send(`${member.user.tag}をBANしました\n理由：` + reason)
	}

	if (command == "dblist") {
		db.list().then(keys => {
			console.log(keys)
			//message.channel.send(`\`\`\`\n${keys}\n\`\`\``)
		});
	}

	//各種テストコマンド類
	if (command.startsWith('test') && message.guild) {
		if (!message.member.roles.cache.has(staffId)) return message.channel.send("testコマンドはStaffロールを持っている人のみ使用できます。")

		/* 引数の指定？ */
		//const argument = args.slice("test ".length).trim().split(/ +/g);

		/* コマンドの確認 */
		const testcmd = args.shift().toLowerCase();

		/* コマンド処理 */
		switch (testcmd) {
			/* 参加テスト */
			case 'join':
				const member = message.member
				client.emit('guildMemberAdd', member);
				break;

			/* メンバーカウントの手動更新 */
			case 'recount':
				memberCount()
				message.reply("実行しました。")
				break;

			/* DBテスト 
			case 'dbtest':
				const keyName = "active" + message.author.id
				db.get(keyName).then(value => {
					if (value === null) {
						db.set(keyName, 1).then(() => {
							db.get(keyName).then(value => {
								console.log(value)
							});
						});
					} else {
						db.set(keyName, value + 1).then(() => {
							db.get(keyName).then(value => {
								console.log(value)
							});
						});
					}
				});
				break;

		    case 'dbtestd':
			    const keyNameA = "active" + message.author.id
				db.delete(keyNameA).then(() => {
					message.channel.send("削除しました。")
				});
			    break;*/

		    case 'fortest':
		        const testn = ['test1',"test2","test3"]
		    	for (const i of testn){
		          message.channel.send(i)
		        }
				/*for (var i = 0; i < testn.length; i++) {
					message.channel.send(i)			
				}*/
		        break;

			case 'idt':
				const msg = client.channels.cache.get('896737070637273098').messages.fetch(config.id.message.oshi.vs)
				console.log(msg)
				break;
        
      /*case 't'
        db.get("testt").then(value => {
          if (value == null) {
            db.set("testt", message.author.id).then(() => {});
          } else {
            if (!(value.includes(message.author.id))) {
              db.set("testt", message.author.id).then(() => {});
            }
          }
        });
        db.get("testt").then(value => {
          message.cannel.send(value)
        });
        break;*/
          case 'dblist':
        db.list().then(keys => {
          message.reply(keys);
        });
        break;
        /* 当てはまらない時 */
			default:
				message.channel.send("引数を指定してください。")
		}
	}

	//再起動
	if (command === "reboot") {
		//権限を持っているか確認
		if (!message.member.roles.cache.has(staffId)) return message.channel.send('権限が不足しています。\n権限を確認してください。')
		message.reply("Botを再起動します。")
		const date = momentTimezone(new Date).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
		client.channels.cache.get('922057019454808124').send(`再起動が実行されました。\n時刻：${date}\nユーザー：${message.author.tag}`)
		fs.appendFileSync('./ps.reboot', date + '\n');
	}

	//強制シャットダウン
	if (command === "shutdown") {
		//権限を持っているか確認
		if (!message.member.roles.cache.has(ownerId)) {
			message.channel.send('権限が不足しています。\n権限を確認してください。')
		} else {
			const date = momentTimezone(new Date).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
			const send = client.channels.cache.get('922057019454808124').send(`シャットダウンが実行されました。\n時刻：${date}\nユーザー：${message.author.tag}`)
			if (send) {
				process.exit()
			}
		}
	}
});

/* メンバー参加時に実行 */
client.on('guildMemberAdd', async member => {
	//Botの場合は無視
	if (member.user.bot) return;
	/* ようこそ画像用 */
	const applyText = (canvas, text) => {
		const context = canvas.getContext('2d');
		let fontSize = 70;
		do {
			context.font = `${fontSize -= 5}px Gothic`;
		} while (context.measureText(text).width > canvas.width - 300);
		return context.font;
	};
	//メンバー数の取得
	var member_count = member.guild.memberCount - member.guild.members.cache.filter(member => member.user.bot).size
	//キャンバスづくり
	const canvas = Canvas.createCanvas(700, 250);
	const context = canvas.getContext('2d');
	//背景画像の読み込み
	const file_url = "./join.png"
	const background = await Canvas.loadImage(file_url);
	//画像をキャンバスの大きさに引き伸ばし
	context.drawImage(background, 0, 0, canvas.width, canvas.height);
	//境界線の色を指定
	context.strokeStyle = '#0099ff';
	//周りに境界線を引く
	context.strokeRect(0, 0, canvas.width, canvas.height);
	context.borderRadius
	// Slightly smaller text placed above the member's display name
	context.font = '28px Roboto';
	context.fillStyle = '#ffffff';
	context.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

	// Add an exclamation point here and below
	context.font = applyText(canvas, `${member.displayName}!`);
	context.fillStyle = '#ffffff';
	context.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

	//描画の開始
	context.beginPath();
	//円を作成
	context.arc(125, 125, 100, 0, Math.PI * 2, true);
	//描画の停止
	context.closePath();
	//切り取り
	context.clip();
	//アイコンを読み込み
	const avatar = await Canvas.loadImage(member.user.displayAvatarURL({
		format: "png"
	}));
	//アイコンの描画
	context.drawImage(avatar, 25, 25, 200, 200);
	//Attachmentクラスに画像を保存
	const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
	var member_count = member.guild.memberCount - member.guild.members.cache.filter(member => member.user.bot).size
	member.guild.channels.cache.get('853904783000469535').send({
		content: `ようこそ！<@${member.user.id}>さん！\n` +
			"このサーバーはプロセカが大好きな人達が集まるDiscordコミュニティです！\n" +
			"ぜひ楽しんでってね！\n" +
			`現在のメンバー数：${member_count}\n\n` +
			"------------------------------\n\n" +
			"まずは<#932874132587180092>で参加認証を済ませましょう。\n" +
			"そうしたら<#849977288828387378>で自己紹介をしてサーバーのみんなに自分を紹介しよう！\n" +
			"テンプレートはチャンネル内のピン留めを使ってください。\n" +
			"<#855999316706721792>から各種ロールの取得、<#896737070637273098>で推しロールも取得できます。\n"+ 
			"なにかありましたら<#849636324104339516>からご連絡ください。\n" +
			"長くなったけどこれからよろしくね！",
		files: [attachment]
	})
	//DMにメッセージ送信
	client.users.cache.get(member.user.id).send({
		content: `ようこそ！<@${member.user.id}>さん！\n` +
		"このサーバーはプロセカが大好きな人達が集まるDiscordコミュニティです！\n" +
		"ぜひ楽しんでってね！",
		files: [attachment]
	})
	//メンバーカウントの更新
	if (member.guild.id === serverID) {
		memberCount()
	}
});

/* メンバー退出時に実行 */
client.on('guildMemberRemove', member => {
	//メンバーカウントの更新
	if (member.guild.id === serverID) {
		memberCount()
	}
});

client.on('messageReactionAdd', async (reaction, user) => {
	const message = reaction.message
	const member = message.guild.members.resolve(user)
	if (message.id== "912304959066894336") {
		client.users.cache.get(member.user.id).send("https://discord.com/oauth2/authorize?client_id=865150642816155688&redirect_uri=https%3A%2F%2FpjsAuth.kinakomochi.repl.co&response_type=code&scope=identify%20guilds")
	}
	//メンバーカウントの更新
	if (reaction.message.id === "935098342894100490") {
		memberCount()
	}
});

client.on('messageReactionRemove', async (reaction, user) => {
	const message = reaction.message
	const member = message.guild.members.resolve(user)
	if (message.id== "912304959066894336") {
		client.users.cache.get(member.user.id).send("https://discord.com/oauth2/authorize?client_id=865150642816155688&redirect_uri=https%3A%2F%2FpjsAuth.kinakomochi.repl.co&response_type=code&scope=identify%20guilds")
	}
	//メンバーカウントの更新
	if (reaction.message.id === "935098342894100490") {
		memberCount()
	}
});

/* VCメンバー入退出時に実行 */
client.on("voiceStateUpdate",  (oldState, newState) => {
	// VoiceChannel関連の設定を読み込み
	const conid = config.id.channel.voice
	
	// メンバー参加時
	if(newState.channelID != null) {
		// ハブチャンネルに参加したか
		if (newState.channelID == conid.hub) {
			// 参加したメンバーを取得
			const member = newState.guild.members.cache.get(newState.id)
			// ボイスチャンネルの作成
			newState.guild.channels.create(`${member.user.username}の部屋` , {
				type: "voice",
				parent: conid.parent
			}).then(channel => {
				// メンバーをVCに移動
				member.voice.setChannel(channel)
				// 聞き専チャンネルを作成
				newState.guild.channels.create(chnge(member, channel), {
					"type": 'text',
					"parent": conid.parent,
					"topic": `${member.user.username}の部屋用の聞き専です。`
				})
			})
		}
	}
	
	// メンバー退出時
	if(oldState.channelID != null) {
		// 退出したメンバーを取得
		const member = oldState.guild.members.cache.get(oldState.id)
		// 退出したサーバーのチャンネルを取得
		const che = oldState.guild.channels.cache
		// 退出したチャンネルを取得
		const channel = che.get(oldState.channelID)
		// フィルター
		if (
			 // ハブカテゴリか
			channel.parentID == conid.parent &&
			 // 誰も居ないか
			channel.members.size == "0" &&
			 // ハブチャンネルではないか
			channel.id != conid.hub &&
			 // AFKチャンネルではないか
			channel.id != channel.guild.afkChannelID
		) {
			// チャンネルの削除
			channel.delete()
			// 付随するテキストチャンネルを検索
			const textCh = che.find( (textch)=> 
				textch.name === chnge(member, channel)
			)
			// テキストチャンネルがあった場合
			if (textCh) {
				// アーカイブカテゴリに移動 							
				textCh.setParent(conid.archive, { lockPermissions: true })
			}
		}
	}
});

// チャンネル名生成
function chnge (member, channel) {
	const rawData = channel.createdAt
	const data = String(rawData.getFullYear() * (rawData.getMonth() + 1) * rawData.getDate() * rawData.getHours() * rawData.getMinutes() * rawData.getSeconds());
	return `🗣｜${member.user.username.replace(' ', '-')}の部屋-${data}`
}

//待機関数
function sleep(waitMsec) {
	var startMsec = new Date();
	while (new Date() - startMsec < waitMsec);
}

/* メンバーカウント更新関数 */
function memberCount() {
	var guild = client.guilds.cache.get(serverID);
	var all = guild.memberCount;
	var user = all - guild.members.cache.filter(member => member.user.bot).size;
	var bot = guild.members.cache.filter(member => member.user.bot).size;
	var touhu = guild.members.cache.filter(member => member.roles.cache.has('849605656691474472')).size;
	guild.channels.cache.get(memberCountChannel).setName('ユーザー数: ' + all);
	guild.channels.cache.get(userCountChannel).setName('メンバー数: ' + user);
	guild.channels.cache.get(touhuCountChannel).setName('豆腐の人数: ' + touhu);
	guild.channels.cache.get(botCountChannel).setName('Bot数: ' + bot);
}

/* アイコン取得関数 */
function avatarGet(member) {
	//アイコンを取得
	var avatar = member.user.displayAvatarURL({
		format: "png",
		dynamic: true,
		size: 1024
	})
	return avatar;
}

/* メンバー取得関数 */
function memberGet(message, args) {
	//メンションが2以上もしくは0ではないかの確認
	if (message.mentions.members.size !== 1) {
		//メンションが0なのかの確認
		if (message.mentions.members.size == 0) {
			//ユーザーIDが指定されているか確認
			const userID = args.join(" ");
			const member = message.guild.members.resolve(userID)
			if (member) {
				return [member, 19];
			} else {
				//メッセージ送信者を指定
				const member = message.member
				return [member, false];
			}
		} else {
			//メンションが2以上の場合
			return false;
		}
	} else {
		//メンションされた人を指定
		const member = message.mentions.members.first();
		return [member, 22];
	}
}

/* ステータス取得 */
function statusGet(status) {
	//ステータス日本語化		
	switch (status) {
		case 'online':
			status = "🟢 オンライン";
			break;
		case 'idle':
			status = "🟠 退席中";
			break;
		case 'dnd':
			status = "🔴 取り込み中";
			break;
		case 'offline':
			status = "⚫ オフライン";
			break;
		case undefined:
			status = "⚫ オフライン";
			break;
		default:
			break;
	}
	return status;
}

/* 理由確認 */
async function reasonGet(message) {
	//botのアイコンを取得
	const botAvatar = avatarGet(client)
	message.channel.send({
		embed: {
			author: {
				name: client.user.username,
				icon_url: botAvatar
			},
			title: "内容が未指定です。",
			description: "30秒以内に理由/内容を送信してください。\n送信されない場合は本処理は終了されます。\nキャンセルする場合はCancelと入力してください。",
			color: 10551294,
			footer: {
				text: "412 Precondition Failed"
			}
		}
	})
	const filter = msg => msg.author.id === message.author.id
	const collected = await message.channel.awaitMessages(filter, {
		max: 1,
		time: 30000
	})
	const response = collected.first()
	const cancel_check = response.content.toLowerCase()
	if (cancel_check == "cancel") {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: botAvatar
				},
				description: "Cancelコマンドが実行されたため、処理を終了します。",
				color: 10551294,
				footer: {
					text: "Cancel"
				}
			}
		})
		return false;
	}
	if (!response.content) {
		message.channel.send({
			embed: {
				author: {
					name: client.user.username,
					icon_url: botAvatar
				},
				description: "内容未送信状態が30秒経過したため、本処理を終了します。",
				color: 10551294,
				footer: {
					text: "408 Request Timeout"
				}
			}
		})
		return false;
	}
	const reason = response.content
	return reason;
}

//時間取得、整形モジュール
function formatTime (time) {
	const date = momentTimezone(time).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
	let comparison = moment(date, 'YYYY/MM/DD HH:mm:S').fromNow();
	return {
		"date": date,
		"comparison": comparison
	}
}

/* 固定メッセージRR設定用 */
const rr = new ReactionRole( client, [
	/* Virtual Singer */
	// Virtual Singer
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.vs,
		roleId: config.id.role.fan.character.vs
	},
	// 初音ミク
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.miku,
		roleId: config.id.role.fan.character.miku
	},
	// 鏡音リン
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.rin,
		roleId: config.id.role.fan.character.rin
	},
	// 鏡音レン
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.ren,
		roleId: config.id.role.fan.character.ren
	},
	// 巡音ルカ
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.ruka,
		roleId: config.id.role.fan.character.ruka
	},
	// MEIKO
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.meiko,
		roleId: config.id.role.fan.character.meiko
	},
	// KAITO
	{
		messageId: config.id.message.oshi.vs,
		reaction: config.id.emoji.kaito,
		roleId: config.id.role.fan.character.kaito
	},

	/* Leo/need */
	// Leo/need
	{
		messageId: config.id.message.oshi.ln,
		reaction: config.id.emoji.ln,
		roleId: config.id.role.fan.character.ln
	},
	// レオニミク
	{
		messageId: config.id.message.oshi.ln,
		reaction: config.id.emoji.lnmiku,
		roleId: config.id.role.fan.character.lnmiku
	},
	// 星乃一歌
	{
		messageId: config.id.message.oshi.ln,
		reaction: config.id.emoji.ichika,
		roleId: config.id.role.fan.character.ichika
	},
	// 天馬咲希
	{
		messageId: config.id.message.oshi.ln,
		reaction: config.id.emoji.saki,
		roleId: config.id.role.fan.character.saki
	},
	// 望月穂波
	{
		messageId: config.id.message.oshi.ln,
		reaction: config.id.emoji.honami,
		roleId: config.id.role.fan.character.honami
	},
	// 日野森志歩
	{
		messageId: config.id.message.oshi.ln,
		reaction: config.id.emoji.shiho,
		roleId: config.id.role.fan.character.shiho
	},

	/* More More Jump! */
	// More More Jump!
	{
		messageId: config.id.message.oshi.mj,
		reaction: config.id.emoji.mmj,
		roleId: config.id.role.fan.character.mmj
	},
	// モモジャンミク
	{
		messageId: config.id.message.oshi.mj,
		reaction: config.id.emoji.mmjmiku,
		roleId: config.id.role.fan.character.mmjmiku
	},
	// 花里みのり
	{
		messageId: config.id.message.oshi.mj,
		reaction: config.id.emoji.minori,
		roleId: config.id.role.fan.character.minori
	},
	// 桐谷遥
	{
		messageId: config.id.message.oshi.mj,
		reaction: config.id.emoji.haruka,
		roleId: config.id.role.fan.character.haruka
	},
	// 桃井愛莉
	{
		messageId: config.id.message.oshi.mj,
		reaction: config.id.emoji.airi,
		roleId: config.id.role.fan.character.airi
	},
	// 日野森雫
	{
		messageId: config.id.message.oshi.mj,
		reaction: config.id.emoji.sizuku,
		roleId: config.id.role.fan.character.sizuku
	},
	
	/* Vivid Bad SQUAD */
	// Vivid Bad SQUAD
	{
		messageId: config.id.message.oshi.vb,
		reaction: config.id.emoji.vbs,
		roleId: config.id.role.fan.character.vbs
	},
	// ビビバスミク
	{
		messageId: config.id.message.oshi.vb,
		reaction: config.id.emoji.vbsmiku,
		roleId: config.id.role.fan.character.vbsmiku
	},
	// 小豆沢こはね
	{
		messageId: config.id.message.oshi.vb,
		reaction: config.id.emoji.kohane,
		roleId: config.id.role.fan.character.kohane
	},
	// 白石杏
	{
		messageId: config.id.message.oshi.vb,
		reaction: config.id.emoji.an,
		roleId: config.id.role.fan.character.an
	},
	// 東雲彰人
	{
		messageId: config.id.message.oshi.vb,
		reaction: config.id.emoji.akito,
		roleId: config.id.role.fan.character.akito
	},
	//青柳冬弥
	{
		messageId: config.id.message.oshi.vb,
		reaction: config.id.emoji.touya,
		roleId: config.id.role.fan.character.touya
	},
	
	/* ワンダーランズ×ショウタイム */
	// ワンダーランズ×ショウタイム
	{
		messageId: config.id.message.oshi.ws,
		reaction: config.id.emoji.ws,
		roleId: config.id.role.fan.character.ws
	},
	// ダショミク
	{
		messageId: config.id.message.oshi.ws,
		reaction: config.id.emoji.wsmiku,
		roleId: config.id.role.fan.character.wsmiku
	},
	// 天馬司
	{
		messageId: config.id.message.oshi.ws,
		reaction: config.id.emoji.tsukasa,
		roleId: config.id.role.fan.character.tsukasa
	},
	// 鳳えむ
	{
		messageId: config.id.message.oshi.ws,
		reaction: config.id.emoji.emu,
		roleId: config.id.role.fan.character.emu
	},
	// 草薙寧々
	{
		messageId: config.id.message.oshi.ws,
		reaction: config.id.emoji.nene,
		roleId: config.id.role.fan.character.nene
	},
	// 神代類
	{
		messageId: config.id.message.oshi.ws,
		reaction: config.id.emoji.rui,
		roleId: config.id.role.fan.character.rui
	},
	
	/* 25時、ナイトコードで。 */
	// 25時、ナイトコードで。
	{
		messageId: config.id.message.oshi.nc,
		reaction: config.id.emoji.nightcode,
		roleId: config.id.role.fan.character.nightcode
	},
	// ニゴミク
	{
		messageId: config.id.message.oshi.nc,
		reaction: config.id.emoji.ncmiku,
		roleId: config.id.role.fan.character.ncmiku
	},
	// 宵崎奏
	{
		messageId: config.id.message.oshi.nc,
		reaction: config.id.emoji.kanade,
		roleId: config.id.role.fan.character.kanade
	},
	// 朝比奈まふゆ
	{
		messageId: config.id.message.oshi.nc,
		reaction: config.id.emoji.mahuyu,
		roleId: config.id.role.fan.character.mahuyu
	},
	// 東雲絵名
	{
		messageId: config.id.message.oshi.nc,
		reaction: config.id.emoji.ena,
		roleId: config.id.role.fan.character.ena
	},
	// 暁山瑞希
	{
		messageId: config.id.message.oshi.nc,
		reaction: config.id.emoji.mizuki,
		roleId: config.id.role.fan.character.mizuki
	}
]);

//ログイン処理
client.login(token);