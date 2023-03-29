const {
	Client, 
	GatewayIntentBits,
	REST,
	Routes,
	AttachmentBuilder
} = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions
	]
});

const moment = require('moment-timezone');
const cron = require('node-cron');
const fs = require("fs");
const { ReactionRole } = require("discordjs-reaction-role");

//設定ファイルの読み込み
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
require('dotenv').config();

const mysql = require('mysql')
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'pjsava',
	password: process.env.mysql_pw,
	database: 'pjsava_db'
});

// MySQLデータベースに接続
connection.connect((err) => {
	if (err) {
		console.log('error connecting: ' + err.stack);
		return;
	}
	console.log('Successfully connected to SQL database.');
});

//トークンの指定
const token = process.env.token

const rest = new REST({ version: '10' }).setToken(token);

//サーバーID
const serverID = config.id.server

/* チャンネル指定 */
//全メンバー人数記録ch
const memberCountChannel = config.id.channels.count.member
//ユーザー数記録ch　
const userCountChannel = config.id.channels.count.user
//鯖民数記録ch
const touhuCountChannel = config.id.channels.count.touhu
//Bot数記録ch
const botCountChannel = config.id.channels.count.bot

/* ロール指定 */
const roleID = config.id.roles

// Owner
const ownerId = roleID.status.owner
// Bot
const botID = roleID.status.bot
// Admin
const adminId = roleID.status.admin
// Moderator
const supporter = roleID.status.supporter
// Manager
const managerId = roleID.status.manager

// Developer
const developerID = roleID.status.developer
// Staff
const staffId = roleID.status.staff
// サーバー支援者
const boostID = roleID.status.boost

// ミュート
const mutedID = roleID.status.muted
// セカイに住む一般豆腐
const toufuID = roleID.status.touhu

/* 定期的にメンバーカウントを再確認する */
cron.schedule('0 0,30 * * * *', () => {
	memberCount()
	console.log(formatTime(new Date()).date + " 定期処理 実行しました。")
});

//スラッシュコマンド
const commands = [
	{
		"name": 'ping',
		"description": 'Replies with Pong!'
	},
	{
		"name": "check-in",
		"description": "運営ファンランクの更新ができます！(1ヶ月に1回)"
	},
	{
		"name": "reset",
		"description": "自身の運営ファンのランクをリセットします。"
	},
	{
		"name": "register",
		"description": "運営ファンの設定ができます。",
		"options": [{
			"type": 3,
			"name": "target",
			"description": "誰のファンになりますか？",
			"required": true,
			"choices": [
				{ "name": "暁月蒼空", "value": "sora" },
				{ "name": "春宮咲耶", "value": "saya" },
				{ "name": "one tskk", "value": "one" },
				{ "name": "大鳳零月", "value": "zero" },
				{ "name": "みなづき", "value": "mina" },
				{ "name": "るしふぁー", "value": "rusi"}
			]
		}]
	}
];

/* Bot起動時に実行 */
client.on("ready", message => {
	//スラッシュコマンドの更新
	(async () => {
		try {
			console.log('Started refreshing application (/) commands.');

			await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
			
			console.log('Successfully reloaded application (/) commands.');
		} catch (error) {
			console.error(error);
		}
	})()
	//開始時間，Bot名をConsoleに表示
	console.log(`${nt()}に${client.user.tag}でログインしました!`);
	//ステータスメッセージを設定
	client.user.setActivity('システム稼働中！');
	//メンバーカウントの更新
	memberCount();
});

/* スラッシュコマンドが来た時に実行 */
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}

	// 運営ファン
	// 登録
	if (interaction.commandName === 'register') return sqlconnect(interaction, connection, 1);
	// 削除
	if (interaction.commandName === 'reset') return sqlconnect(interaction, connection, 2)
	// 更新
	if (interaction.commandName === 'check-in') return sqlconnect(interaction, connection, 3);
});

// 運営ファン関連
function sqlconnect (interaction, connection, mode) {
	const userId = interaction.user.id
	const miDate = new Date().getTime();
	connection.query(`select * from oshirole where user = ${userId}`, function (error, results, fields) {
		if (error) throw error;
		const result = results[0];
		switch (mode) {
			// 登録
			case 1: 
				const target = interaction.options.getString('target');

				if (result) {
					const restar = eval(`result.${target}`)
					if (!restar) {
						// 初期設定済み
						connection.query(`update oshirole set ${target}=1, lastdate=${miDate} where user = ${userId}`)
						interaction.reply({ content: '登録が完了しました！\n更新は/check-inから出来ます。', ephemeral: true });
					} else {
						// 既に登録済み
						interaction.reply({ content: '既に登録されています。\n更新は/check-inから出来ます。', ephemeral: true });
					}
				} else {
					// 未登録
					connection.query(`insert into oshirole (user, lastdate, ${target}) values (${userId}, ${miDate}, 1)`)
					interaction.reply({ content: '登録が完了しました！\n更新は/check-inから出来ます。', ephemeral: true });
				}
				break;

			// 削除
			case 2:
				if (result) {
					connection.query(`delete from oshirole where user = ${userId}`)
					interaction.reply({ content: 'リセットしました。', ephemeral: true})
				} else {
					interaction.reply({ content: '未登録です。\n登録は、/registerからできます。', ephemeral: true})
				}
				break;

			// 更新
			case 3:
				if (result) {
					console.log()
					if (miDate > result.lastdate + 2592000000) {
						// 登録済み
						connection.query(
							`update oshirole set
								lastdate = ${new Date().getTime()},
								sora = sora + 1,
								saya = saya + 1,
								one = one + 1,
								zero = zero + 1,
								mina = mina + 1,
								rusi = rusi + 1
							where user = ${userId}`
						)
						interaction.reply({ content: '更新に成功しました！', ephemeral: true});
					} else {
						const nextCan = moment(new Date(result.lastdate + 2592000000)).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
						interaction.reply({ content: `更新に失敗しました。\n更新は1ヶ月に1回行えます。\n次回更新日は${nextCan}`, ephemeral: true})
					}
				} else {
					interaction.reply({ content:'未登録です。\n登録は、/registerからできます。', ephemeral: true})
				}
				break;
		}
	});
};

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
	const member_count = memberCount()
	//キャンバスづくり
	const { createCanvas, loadImage } = require('canvas');
	const canvas = createCanvas(700, 250);
	const context = canvas.getContext('2d');
	//背景画像の読み込み
	const file_url = "./join.png"
	const background = await loadImage(file_url);
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
	const avatar = await loadImage(`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`);
	//アイコンの描画
	context.drawImage(avatar, 25, 25, 200, 200);
	//Attachmentクラスに画像を保存
	const attachment = new AttachmentBuilder(canvas.toBuffer(), 'welcome-image.png');
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
});

/* メンバー退出時に実行 */
client.on('guildMemberRemove', member => {
	//メンバーカウントの更新
	memberCount()
});

/* リアクション追加時に実行 */
client.on('messageReactionAdd', async (reaction, user) => {
	const message = reaction.message
	const member = message.guild.members.resolve(user)
	if (message.id == "909396609392074792") {
		if (reaction.emoji.name == "📜") {
			const keyname = "ad!" + member.user.id
			db.get(keyname).then(value => {
				//データベースの修正めんどかったからコメントアウトして条件なしに設定
				if (true/*value === null*/)	{
					db.set(keyname, new Date).then(() => {
						client.users.cache.get(member.user.id).send(
							`～ 宣伝チャンネルのルール ～\n` +
							`・宣伝は2時間に1回です。\n` +
							`・同じ内容の宣伝はしないでください。\n` +
			 				`・宣伝時にメンションをしないでください。\n` +
							`・以下の内容が含まれる、もしくはこれらに近しいことを目的としているサーバー、ウェブサイト等は宣伝しないでください。\n` +
							`　・荒らしを目的としているもの\n` +
							`　・年齢制限がかかったコンテンツがメインコンテンツのもの\n` +
							`　・各種法令やDiscordの利用規約、コミュニティガイドライン等に違反すると考えられるもの\n` +
							`・その他Managerが不適切であると判断した内容の宣伝はしないでください。\n` +
							`\n` +
							`～ ロールの取得方法 ～\n` +
							`本DMの一番下にあるURLをクリックすると認証画面が出てきます。認証画面にて「認証」を押すことでロールが取得できます。\n` +
							`認証完了画面が出てきたら宣伝チャンネルを利用できます。\n` +
							`エラー画面が出てきた場合やわからないことがあった場合はプロセカ民営公園 お問い合わせ窓口( https://discord.com/channels/849602478475706378/849636324104339516/865902657494319134 )よりお問い合わせください。\n` +
							`\n` +
							`認証用URL: https://discord.com/api/oauth2/authorize?client_id=865150642816155688&redirect_uri=https%3A%2F%2FpjsAuth.kinakomochi.repl.co%3Ftype%3Dadvertisement&response_type=code&scope=identify%20guilds`
						)
					});
				}
			});
		}
	}
	//メンバーカウントの更新
	memberCount()
});


/* リアクション削除時に実行 */
client.on('messageReactionRemove', async (reaction, user) => {
	//メンバーカウントの更新
	memberCount()
});

/* VCメンバー入退出時に実行 */
client.on("voiceStateUpdate",  (oldState, newState) => {
	// VoiceChannel関連の設定を読み込み
	const conid = config.id.channels.voice
	// メンバー参加時
	if(newState.channelId != null) {
		// ハブチャンネルに参加したか
		if (conid.hub == newState.channelId) {
			// 参加したメンバーを取得
			const member = client.users.cache.get(newState.id)
			// サーバーを取得
			const guild = newState.guild
			// 参加したサーバーのチャンネルを取得
			const channel = guild.channels.cache.get(newState.channelId)
			// ボイスチャンネルの作成
			guild.channels.create({
				name: `${member.username}の部屋`,
				type: 2,
				parent: channel.parentId
			})
		}
	}
	
	// メンバー退出時
	if(oldState.channelId != null) {
		// 退出したメンバーを取得
		const member = client.users.cache.get(oldState.id)
		// サーバーを取得
		const guild = oldState.guild
		// 参加したサーバーのチャンネルを取得
		const channel = guild.channels.cache.get(oldState.channelId)
		// フィルター
		if (
			 // ハブカテゴリか
			conid.parent == channel.parentId &&
			 // 誰も居ないか
			channel.members.size == "0" &&
			 // ハブチャンネルではないか
			conid.hub != channel.id &&
			 // AFKチャンネルではないか
			channel.id != channel.guild.afkChannelId &&
			 // 例外チャンネルに含まれていないか
			!conid.ignore.includes(channel.id)
		) {
			// チャンネルの削除
			channel.delete()
		}
	}
});

//現在時刻取得
function nt() {
	const time = moment(new Date).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
	return time;
};

/* メンバーカウント更新関数 */
function memberCount() {
	const guild = client.guilds.cache.get(serverID);
	guild.members.fetch().then(() => {
		const all = guild.memberCount;
		const user = all - guild.members.cache.filter(member => member.user.bot).size;
		const bot = guild.members.cache.filter(member => member.user.bot).size;
		let touhu = guild.roles.cache.get('849605656691474472')
		touhu = touhu.members.size
		guild.channels.cache.get(memberCountChannel).setName('ユーザー数: ' + all);
		guild.channels.cache.get(userCountChannel).setName('メンバー数: ' + user);
		guild.channels.cache.get(touhuCountChannel).setName('豆腐の人数: ' + touhu);
		guild.channels.cache.get(botCountChannel).setName('Bot数: ' + bot);
		return user;
	});
}

/* 固定メッセージRR設定用 */
const oshiMessage = config.id.messages.oshi
const oshiEmoji = config.id.emojis
const oshiRole = config.id.roles.fan.character
const rr = new ReactionRole( client, [
	/* Virtual Singer */
	// Virtual Singer
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.vs,
		roleId: oshiRole.vs
	},
	// 初音ミク
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.miku,
		roleId: oshiRole.miku
	},
	// 鏡音リン
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.rin,
		roleId: oshiRole.rin
	},
	// 鏡音レン
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.ren,
		roleId: oshiRole.ren
	},
	// 巡音ルカ
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.ruka,
		roleId: oshiRole.ruka
	},
	// MEIKO
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.meiko,
		roleId: oshiRole.meiko
	},
	// KAITO
	{
		messageId: oshiMessage.vs,
		reaction: oshiEmoji.kaito,
		roleId: oshiRole.kaito
	},

	/* Leo/need */
	// Leo/need
	{
		messageId: oshiMessage.ln,
		reaction: oshiEmoji.ln,
		roleId: oshiRole.ln
	},
	// レオニミク
	{
		messageId: oshiMessage.ln,
		reaction: oshiEmoji.lnmiku,
		roleId: oshiRole.lnmiku
	},
	// 星乃一歌
	{
		messageId: oshiMessage.ln,
		reaction: oshiEmoji.ichika,
		roleId: oshiRole.ichika
	},
	// 天馬咲希
	{
		messageId: oshiMessage.ln,
		reaction: oshiEmoji.saki,
		roleId: oshiRole.saki
	},
	// 望月穂波
	{
		messageId: oshiMessage.ln,
		reaction: oshiEmoji.honami,
		roleId: oshiRole.honami
	},
	// 日野森志歩
	{
		messageId: oshiMessage.ln,
		reaction: oshiEmoji.shiho,
		roleId: oshiRole.shiho
	},

	/* More More Jump! */
	// More More Jump!
	{
		messageId: oshiMessage.mj,
		reaction: oshiEmoji.mmj,
		roleId: oshiRole.mmj
	},
	// モモジャンミク
	{
		messageId: oshiMessage.mj,
		reaction: oshiEmoji.mmjmiku,
		roleId: oshiRole.mmjmiku
	},
	// 花里みのり
	{
		messageId: oshiMessage.mj,
		reaction: oshiEmoji.minori,
		roleId: oshiRole.minori
	},
	// 桐谷遥
	{
		messageId: oshiMessage.mj,
		reaction: oshiEmoji.haruka,
		roleId: oshiRole.haruka
	},
	// 桃井愛莉
	{
		messageId: oshiMessage.mj,
		reaction: oshiEmoji.airi,
		roleId: oshiRole.airi
	},
	// 日野森雫
	{
		messageId: oshiMessage.mj,
		reaction: oshiEmoji.sizuku,
		roleId: oshiRole.sizuku
	},
	
	/* Vivid Bad SQUAD */
	// Vivid Bad SQUAD
	{
		messageId: oshiMessage.vb,
		reaction: oshiEmoji.vbs,
		roleId: oshiRole.vbs
	},
	// ビビバスミク
	{
		messageId: oshiMessage.vb,
		reaction: oshiEmoji.vbsmiku,
		roleId: oshiRole.vbsmiku
	},
	// 小豆沢こはね
	{
		messageId: oshiMessage.vb,
		reaction: oshiEmoji.kohane,
		roleId: oshiRole.kohane
	},
	// 白石杏
	{
		messageId: oshiMessage.vb,
		reaction: oshiEmoji.an,
		roleId: oshiRole.an
	},
	// 東雲彰人
	{
		messageId: oshiMessage.vb,
		reaction: oshiEmoji.akito,
		roleId: oshiRole.akito
	},
	//青柳冬弥
	{
		messageId: oshiMessage.vb,
		reaction: oshiEmoji.touya,
		roleId: oshiRole.touya
	},
	
	/* ワンダーランズ×ショウタイム */
	// ワンダーランズ×ショウタイム
	{
		messageId: oshiMessage.ws,
		reaction: oshiEmoji.ws,
		roleId: oshiRole.ws
	},
	// ダショミク
	{
		messageId: oshiMessage.ws,
		reaction: oshiEmoji.wsmiku,
		roleId: oshiRole.wsmiku
	},
	// 天馬司
	{
		messageId: oshiMessage.ws,
		reaction: oshiEmoji.tsukasa,
		roleId: oshiRole.tsukasa
	},
	// 鳳えむ
	{
		messageId: oshiMessage.ws,
		reaction: oshiEmoji.emu,
		roleId: oshiRole.emu
	},
	// 草薙寧々
	{
		messageId: oshiMessage.ws,
		reaction: oshiEmoji.nene,
		roleId: oshiRole.nene
	},
	// 神代類
	{
		messageId: oshiMessage.ws,
		reaction: oshiEmoji.rui,
		roleId: oshiRole.rui
	},
	
	/* 25時、ナイトコードで。 */
	// 25時、ナイトコードで。
	{
		messageId: oshiMessage.nc,
		reaction: oshiEmoji.nightcode,
		roleId: oshiRole.nightcode
	},
	// ニゴミク
	{
		messageId: oshiMessage.nc,
		reaction: oshiEmoji.ncmiku,
		roleId: oshiRole.ncmiku
	},
	// 宵崎奏
	{
		messageId: oshiMessage.nc,
		reaction: oshiEmoji.kanade,
		roleId: oshiRole.kanade
	},
	// 朝比奈まふゆ
	{
		messageId: oshiMessage.nc,
		reaction: oshiEmoji.mahuyu,
		roleId: oshiRole.mahuyu
	},
	// 東雲絵名
	{
		messageId: oshiMessage.nc,
		reaction: oshiEmoji.ena,
		roleId: oshiRole.ena
	},
	// 暁山瑞希
	{
		messageId: oshiMessage.nc,
		reaction: oshiEmoji.mizuki,
		roleId: oshiRole.mizuki
	}
]);

//ログイン処理
client.login(token);
