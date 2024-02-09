"use strict"

///////////////////////////////////////////////////
// Copyright 2023 satoshiinu. All rights reserved. //
///////////////////////////////////////////////////

/*
	コメントの書き方

	無:何をしているか(大まか)
	#:何をしているか(細かく) (省略可)
	$:何の数字か
	<>:分ける
	v:下のことついて (省略可)

	例:
	v#ｙ#
	ｘ

	意味:ｘがｙしている

*/

/*
	アイデア

	敵のlv=推奨lv
	岩を壊したらコインが出る
*/

//エラーメッセージ処理
let gamestarted = false;
let DoSayErrorMassege = true;
window.onerror = (message, file, lineNo, colNo, error) => {
	if (DoSayErrorMassege) alert(`エラーが発生しました\n再読み込みしてください\nerror: ${message}}\nat ${file},${lineNo}:${colNo}`);
	//if (gamestarted)requestAnimationFrame(main);
}

//画面に表示される時は4倍になるので注意
//let zoom = 1;
let zoomX = 4;
let zoomY = 4;
let ScreenWidth = 320;
let ScreenHeight = 180;

let LEGACY_MODE = false;

let DEFAULT_FONT = "Proj23Fon";

//その他の変数の作成
let timer = 0;
let loopID = 0;
let loopIDloading = 0;
let OneFrameOnly = false;
/**
 * @param {number } playTime プレイ時間 
 * @param {number } SavedPlayTime 最後にセーブロードしたプレイ時間 
 * @param {number } SaveDataPlayTime セーブデータのプレイ時間 
 */
let playTime = 0;
let SavedPlayTime = 0;
let SaveDataPlayTime = 0;
let GameStartedTime = new Date();
let beforeUnloadEnventID = 0;
const siteName = ["http://127.0.0.1:8000", "https://satoshiinu.github.io/games"]

//読み込むもの
let willLoadImg = [
	["img/tiles.png", "tiles", true],
	["img/tiles/water.png", "water"],
	["img/items.png", "items", true],
	["img/players/players.png", "players", true],
	["img/enemy.png", "enemy", true],
	["img/misc/particle.png", "particle", false],
	["img/misc/sweep.png", "sweep", false],
	["img/players/item_models.png", "item_model", false],
	["img/gui/gui.png", "gui", true],
	["img/gui/message.png", "gui_message", true],
	["img/gui/prompt.png", "gui_prompt", true],
	["img/gui/prompt2.png", "gui_prompt_more", true],
	["img/gui/scroll_bar.png", "gui_scroll_bar", true],
	["img/gui/touch.png", "touch_button", false]
]
//Object.freeze(willLoadImg);

let willLoadJson = [
	["param/atlas.json", "atlas", true],
	["param/enemy.json", "enemy", true],
	["param/particle.json", "particle", true],
	["param/item.json", "item", true],
	["param/dialogue.json", "dialogue", true],

	["param/lang/en_us.json", "en_us", true],
	["param/lang/ja_jp.json", "ja_jp", true],
	["param/config.json", "configs", true],
	["param/ui.json", "jsonui", true, "jsonui"]
]
//Object.freeze(willLoadJson);

let willLoadSounds = [
	["audio/select.ogg", "select", false],
	["audio/break.ogg", "break", false, 0.5],
	["audio/breakbit.ogg", "breakbit", false, 0.5],
	["audio/attack.ogg", "attack", false],
	["audio/attack2.ogg", "damage", false],
	["audio/attack2.ogg", "death", false],
	["audio/cancel.ogg", "cancel", false]
]
//Object.freeze(willLoadSounds);

//クラス
class willLoadContent {
	constructor(src, name, nessesary, meta) {
		this.src = src;
		this.name = name;
		this.nessesary = nessesary;
		this.meta = meta;
	}
}
willLoadImg = willLoadImg.map(x => new willLoadContent(...x));
willLoadJson = willLoadJson.map(x => new willLoadContent(...x));
willLoadSounds = willLoadSounds.map(x => new willLoadContent(...x));

let JsonUIContent = new Array();

class Item {
	constructor(ID, count = 99) {
		this.id = ID;
		this.count = count;
	}
}

class Players {
	constructor(ID = 0) {

		this.weapon = {
			"startx": 0,
			"starty": 0,
			"drawx": 0,
			"drawy": 0,
			"timer": 0,
			"rotatex": 0,
			"rotatey": 0,
			"autoAimx": 0,
			"autoAimy": 0,
			"speed": 0,
			"lock": 0,
			"breakingTile": false,
			"attack": 5
		}
		this.hp = 500
		this.hp_max = 500
		this.damage_cooldown = 0,
			this.id = ID
		this.exp = {
			exp: 0,
			lv: 0
		}
		this.alive = true;

	}
}

class Player {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.xknb = 0;
		this.yknb = 0;
		this.mapID = "";
		this.effect = new Array();
		this.boat = false;
		this.items = [
			{
				"id": 0,
				"count": 10
			},
			{
				"id": 0,
				"count": 99
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 2,
				"count": 2
			},
			{
				"id": 3,
				"count": 2
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 1,
				"count": 2
			},
			{
				"id": 2,
				"count": 2
			}
		]

		this.xspd = 0, this.yspd = 0;
		this.scrollx = this.x + 160, this.scrolly = this.y + 24;
		this.scroll_offsetx = 0, this.scroll_offsety = 0;

		this.drawx = 0, this.drawy = 0;
		this.anim = 0;
		this.rotate = 0, this.facing = 0;
		this.canRotate = true;
		this.up = false, this.down = false, this.right, this.left = false;
		this.moved = false, this.moving = false;
		this.moveTimer = 0;
		this.movelog = new Array();

		this.alive = true;
	}
}

class Effect {
	constructor(time, power) {
		this.time = time;
		this.power = power;
	}
}

class Enemy {
	constructor(spx, spy, id) {
		this.x = spx * 16;
		this.y = spy * 16;
		this.sp = [spx, spy];
		this.id = id;
		this.xspd = 0;
		this.yspd = 0;
		this.xknb = 0;
		this.yknb = 0;
		this.move = [false, false, false, false, 0];
		this.attack = {
			"hostility": false,
			"timer": 0,
			"cool_down": 0
		}
		this.hp = loadedjson.enemy[id].hp;
		this.damage_cooldown = 0;
		this.damage_effect = {
			"damage": 0,
			"view_time": 0,
			"Last_damage_timer": 0
		}
		this.attack_anim = {
			"tick": 0,
			"animing": false
		}
		this.anim = {
			"tick": 0,
			"animing": false
		}
		this.moving = false;
	}
}

class NPC {
	constructor(x, y, id, dialogueID) {
		this.x = x * 16;
		this.y = y * 16;
		this.sp = [x, y];
		this.id = id;
		this.xspd = 0;
		this.yspd = 0;
		this.dialogueID = dialogueID;
		this.moving = false;
		this.move = [false, false, false, false, 0];
		this.moved = false;
		this.moveTimer = 0;
		this.facing = 0;
		this.rotate = 0;
		this.up = false;
		this.down = false;
		this.left = false;
		this.right = false;
	}

}

class Keys {
	constructor() {
		this.press = false;
		this.pressLag = false;
		this.down = false;
		this.hold = false;
		this.timer = -1;
		this.time = -1;
		this.timen = -1;
		this.presstime = -1;
	}
}

class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
}


class Game {
	constructor() {
		this.ver = "23m11w3";

		this.saveloadingnow = false;
		this.saveloadfaliedtime = -1;
		this.saveloadfaliedtype = -1;
		this.saveloadsuccesstime = -111;
		this.saveloadsuccesstype = -111;
		this.PopUpDelay = 100;

		this.PlayingScreen = false;

		this.move_limit = 32767;
		this.weapon_canlock = false;
		this.PI = Math.floor(Math.PI * Math.pow(10, 5)) / Math.pow(10, 5);

		this.colorPallet = {
			"magenta": "magenta",//accsent
			"green": "lime",
			"blue": "blue",
			"black": "black",// common
			"gray": "gray",
			"white": "white"
		}

		this.map = new Object;

		this.map_path = {
			"VillageAround": "param/maps/VillageAroundMap.map",
			"LvSpot": "param/maps/LvSpotMap.map",
			"Default": "param/maps/Map.map"
		}

		this.rotate_pos = [
			[0, 1],//　 ↓
			[-1, 1],//  ↙
			[-1, 0],//  ←
			[-1, -1],// ↖
			[0, -1],//  ↑
			[1, -1],//  ↗　
			[1, 0],//　 →
			[1, 1],//　 ↘
		]

		this.facing_pos = [
			[0, 1],//　 ↓
			[-1, 0],//  ←
			[0, -1],//  ↑
			[1, 0],//　 →
		]

		this.tab_offset = [
			64, 128, 128, 128
		]

		this.gui_item_count = [
			15, 7, 15, 7
		]

		this.breakableTile = [
			9, 10, 11
		]

		this.breakableTileAbout = {
			9: {
				"breakProbability": 0.1,
				"becomeTile": 12
			},
			10: {
				"breakProbability": 0.05,
				"becomeTile": 12
			},
			11: {
				"breakProbability": 0.05,
				"becomeTile": 13
			}
		}

		this.animationTile = {
			7: {

			}
		}

		this.DontDrawTIle = [
			0
		]

		this.enemy_type = [
			"slime",
			"gorilla",
			"fish",
			"desert",
			"snow",
			"poison",
			"fire",
			"dark",
			"other"
		]

		this.gui_system_items = [
			"menu.system.config",
			"menu.system.data",
			"menu.system.about"
		]
		this.gui_system_data_items = [
			"menu.system.data.select",
			"menu.system.data.save",
			"menu.system.data.load"
		]

		this.config_name = [
			"player",
			"weapon",
			"data",
			"control",
			"sounds",
			"other",
			"debug"
		]

		this.config_icons = [
			"player",
			"weapon",
			"colorFloppy",
			"gamepad",
			"sound",
			"other",
			"debug"
		]

		this.soundGroupsConfig = {
			"player": "sound_player",
			"tile": "sound_tile",
			"enemy": "sound_enemy",
			"gui": "sound_gui",
			"bgm": "bgm",
			"other": "other"
		}

		this.select_y_size = [
			16, 16, 16, 16
		]

		this.savemetadata = {
			"codename": "project2023",
			"ver": this.ver
		}

		this.title_items = [
			"newgame",
			"loadgame"
		]

		this.UICustomScrollable = [
			"items",
			"roles",
			"hud_hp",
			"UIOpen",
			"config"
		]

		this.configList = new Object();

		this.config = new Object();

	}
	getTileID(maplayer = "map1", x, y) {
		if (typeof game.map[maplayer] !== "undefined")
			if (y >= 0 && y < game.map[maplayer].length)
				if (x >= 0 && x < game.map[maplayer][y].length)
					return game.map[maplayer][y][x];
	}
	async NewGame() {

		//コンフィグリセット
		configReset();

		//マップDefault(placeholder)
		await mapchange("Default");

		game.PlayingScreen = true;
		gamestarted = true;
	}
	async LoadGame() {

		await savedataload();

		game.PlayingScreen = true;
		gamestarted = true;
	}
}
let game = new Game();

class Message {
	constructor() {
		this.visible = false;
		this.text = "";
		this.index = 0;
		this.cool_down = 0;
	}
	view(text) {
		this.visible = true;
		this.text = text;
		this.index = 0;
		this.cool_down = 5;
	}
	next() {
		if (typeof this.text == "object") {
			this.index++;
			this.cool_down = 5;
			if (this.index < this.text.length) return;
		}
		gui_close("message");
	}
}

class GuiConfirm {
	constructor() {
		this.visible = false;
		this.selected = false;
		this.func_ok = () => { };
		this.func_cancel = () => { };
		this.text = "";
		this.title = "";
		this.pos = { "x": 0, "y": 0 };
	}

	view(text = "text", title = "title", x = 0, y = 0, func_ok = () => { }, func_cancel = () => { }) {
		//console.log(text);
		this.visible = true;
		this.text = text;
		this.title = title;
		this.pos.x = x;
		this.pos.y = y;
		this.func_ok = func_ok;
		this.func_cancel = func_cancel;

	}
}

class Gui {
	constructor() {
		this.confirm = new GuiConfirm();
		this.message = new Message();
	}
}
let gui = new Gui();

class Cursor {
	constructor() {
		this.CursorOldPos = new Object();
		this.CursorNeedUpdate = false;
		this.CursorOldPos.x = 0;
		this.CursorOldPos.y = 0;
		this.cursors = new Array();
	}
	draw() {

		let cursorOfseX = 0;
		cursorOfseX += easeOutExpo(timer % 100 / 100) * 5;
		cursorOfseX += easeOutExpo(1 - timer % 100 / 100) * 5;
		cursorOfseX -= 8;

		if (IsBusy()) cursorOfseX = 0;

		let busyCorsor = `cursor_busy_${timer / 8 % 8 >= 6 ? 0 : 1}`;

		if (this.CursorNeedUpdate) {
			let cursor = this.cursors[this.cursors.length - 1];
			this.CursorNeedUpdate = false;
			this.CursorOldPos.x = cursor.x;
			this.CursorOldPos.y = cursor.y;
		}

		if (this.cursors.length !== 0) {
			let cursor = this.cursors[this.cursors.length - 1];
			this.CursorOldPos.x += (cursor.x - this.CursorOldPos.x) / 2;
			this.CursorOldPos.y += (cursor.y - this.CursorOldPos.y) / 2;
		}

		for (let i in this.cursors) {
			let cursor = this.cursors[i];
			if (i != this.cursors.length - 1) draw("cursor_uns", cursor.x, cursor.y);

			if (i == this.cursors.length - 1) draw(IsBusy() ? busyCorsor : "cursor", Math.round(this.CursorOldPos.x + cursorOfseX), this.CursorOldPos.y);
		}

		this.cursors = new Array();//初期化
	}
	push(pos) {//use Vec2
		this.cursors.push(pos);
	}
}

//あざす https://blog.myntinc.com/2019/05/javascriptaudioplay.html
//あざす https://www.w3schools.com/graphics/game_sound.asp
/*
class Sound {
	constructor(src, volume = 1) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		this.sound.volume = volume;
		document.body.appendChild(this.sound);
		this.play = function (DoNotStop = false) {
			if (!DoNotStop)
				this.sound.currentTime = 0;
			this.sound.play();
		}
		this.stop = function () {
			this.sound.currentTime = 0;
			this.sound.pause();
		}
	}
}
*/

//audioの仕様をカスタム
class Sound {
	constructor(audioElem) {
		this.sound = audioElem;
		this.play = function (DoNotStop = false) {
			if (!DoNotStop)
				this.sound.currentTime = 0;
			this.sound.play();
		}
		this.stop = function () {
			this.sound.currentTime = 0;
			this.sound.pause();
		}
	}
}

/**
 * audio要素を作成します 使用例: new Sound(await loadAudio(url, volume));
 * @param {*} url ファイルのURL
 * @param {*} volume 音量
 * @returns audio要素
 */
async function loadAudio(url, volume = 1) {
	return new Promise((resolve, reject) => {
		const audio = new Audio();
		audio.preload = 'auto';
		audio.volume = volume;
		audio.src = url;

		// エラー処理を追加
		audio.onerror = () => reject(audio.error);

		// 'canplaythrough'イベントが発火したら、Promiseを解決する
		audio.addEventListener('canplaythrough', () => {
			resolve(audio);
		}, { once: true });

		// 読み込みを開始
		audio.load();
	});
}

let IsLoading = true;

//キャンバスのやつ
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = ScreenWidth * zoomX;
canvas.height = ScreenHeight * zoomY;
ctx.scale(zoomX, zoomY);

//アンチエイリアスを無効にする
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

//コンテキストメニュー禁止
document.oncontextmenu = () => {
	return false;
};

//フォント
ctx.font = '20px sans-serif';


//config変数の作成
let config = {
	"canrotateonattacking": false,
	"weapon_auto_aiming": true
}
let configs = new Object();


//デバッグ用の変数の作成
let debug = new Object();
debug.hitboxes = new Array();
debug.hitbox_visible = true;
debug.visible = false;
debug.about_visible = false;

debug.info = new Array();

debug.camx = 0;
debug.camy = 0;

debug.pause_frame = new Array();

debug.jsonLoadTime = new Object();

//json読み込み
let loadedjson = new Object();
let img = new Object();
let sounds = new Object();


let load = {
	"jsoncount": 0,
	"imgcount": 0,
	"soundcount": 0,
	"type": "",
	"ejectLog": false,
	"fastLoad": false//its test module
}

//セーブデータ読み込み用の変数の作成
let dirHandle;
let fileHandle;
let LastSavedFileData;
let SaveDataFileName = "save.json"
let LastSavedTime;

let saveFileOptions = {
	suggestedName: 'save.json',
	types: [
		{
			description: "savedata",
			accept: {
				"application/json": [".json"],
			},
		},
	],
};

//FPS計測の変数を作成
let fps = 0;
let frameCount = 0;
let startTime;
let endTime;

startTime = new Date().getTime();

let MainProcStartTime = 0;
let MainProcEndTime = 0;
let MainProcTime = 0;



//プレイヤーの変数の作成
let player = new Player();
let players = new Array();

players[0] = new Players(0);

//事前に埋めとく
player_movelog_reset();


//敵の変数の作成
let enemy_speed = 0.25

let enemy = new Array();

//NPCの変数の作成
let npc = new Array();

//パーティクルの変数の作成
let particle = new Array();

//キーの変数の作成
let key = new Object();

let keys = new Array();

for (let i = 0; i < 255; i++) {
	keys.push(new Keys())
}
let key_groups = new Object();
let key_groups_down = new Object();
let key_groups_hold = new Object();

let key_groups_list = {
	"up": [38, 87],
	"down": [40, 83],
	"left": [37, 65],
	"right": [39, 68],
	"attack": [32],
	"confirm": [90],
	"cancel": [88],
	"menu": [67]
}

let key_arrow = [
	37,
	38,
	39,
	40,
	32
]

//コントローラー
let gamepads = new Object();

//キー判定
addEventListener("keyup", keyupfunc);
addEventListener("keydown", keydownfunc);


// ------------------------------------------------------------
// ゲームパッドを接続すると実行されるイベント
// ------------------------------------------------------------
window.addEventListener("gamepadconnected", function (e) {
	var gamepad = e.gamepad;
});

// ------------------------------------------------------------
// ゲームパッドの接続を解除すると実行されるイベント
// ------------------------------------------------------------
window.addEventListener("gamepaddisconnected", function (e) {
	var gamepad = e.gamepad;
});

//タッチ操作
//あざす https://web-breeze.net/js-touch-event/
// 各タッチイベントのイベントリスナー登録
canvas.addEventListener("touchstart", function (event) { updateTouch(event) })
canvas.addEventListener("touchend", function (event) { updateTouch(event) })
canvas.addEventListener("touchmove", function (event) {
	event.preventDefault()  // 画面スクロールを防止
	updateTouch(event)
})
canvas.addEventListener("touchcancel", function (event) { updateTouch(event) })

const touchpos = new Array();
const touchButton = new Array();
const touchButtonDown = new Array();
const touchButtonHold = new Array();
const touchtime = new Array();

let touchButtons = [
	{ "x": 64, "y": 7 * 16, "type": "up", "width": 16, "height": 16 },
	{ "x": 64, "y": 9 * 16, "type": "down", "width": 16, "height": 16 },
	{ "x": 80, "y": 8 * 16, "type": "right", "width": 16, "height": 16 },
	{ "x": 48, "y": 8 * 16, "type": "left", "width": 16, "height": 16 },
	{ "x": 9 * 16, "y": 8 * 16, "type": "confirm", "width": 16, "height": 16 },
	{ "x": 10 * 16, "y": 8 * 16, "type": "cancel", "width": 16, "height": 16 },
	{ "x": 11 * 16, "y": 8 * 16, "type": "menu", "width": 16, "height": 16 },
	{ "x": 15 * 16, "y": 8 * 16, "type": "attack", "width": 32, "height": 16 }
]

let touchmode = false;


//フォント
img.font = new Object();

//読み込みやつ
let uni = {
	"00": true,
	"20": true,
	"30": true
}

//フォント読み込み 没になった感じ？
/*
for (let i in uni) {
	if (uni[('00' + i.toString(16)).slice(-2)]) {
		img.font["uni_" + ('00' + i.toString(16)).slice(-2)] = new Image();
		img.font["uni_" + ('00' + i.toString(16)).slice(-2)].src = "img/font/uni_" + ('00' + i.toString(16)).slice(-2) + ".png";
	}
}

img.font.uni_00_purple = new Image();
img.font.uni_00_purple.src = "img/font/uni_00_purple.png";
*/

//タイルの設定
let tile_image_list = [img.empty, img.tile, img.tile2];

let tile_collision = [false, true, false, true];


//テクスチャーアトラスの設定
let atlas = new Object();


//剣の設定
let weapon = new Object();

weapon.atlas = [
	[0, 0, 32, 32],
	[32, 0, 32, 32],
	[64, 0, 32, 32],
	[96, 0, 32, 32],
	[128, 0, 32, 32],
	[160, 0, 32, 32],
	[192, 0, 32, 32],
	[224, 0, 32, 32],
]

weapon.offset = [
	[0, 0, true],
	[-8, 0, true],
	[-16, 0, true],
	[-8, -8, true],
	[0, -16, true],
	[0, -8, true],
	[0, 0, true],
	[0, 0, true]
]

//メニューの変数の作成
let menu = {
	"tab": 0,
	"tab_select": true,
	"item_select": [0],
	"select_length": 1,
	"role_select": false,
	"who_use": 0,
	"scroll": [0],
	"system_select": 0,
	"CursorOldPos": { "x": 0, "y": 0 },
	"CursorNeedUpdate": false,
	"visible": false,
	"cursor_time": 0,
	"mode": "Default",
	"config_num": {
		"timer": -1,
		"mode": -1
	}
}
//承認ウィンドウの変数の作成
let window_comfirm = {
	"visible": false,
	"selected": false,
	"func_ok": () => { },
	"func_cancel": () => { },
	"text": "",
	"title": "",
	"pos": { "x": 0, "y": 0 }
}

//承認ウィンドウの変数の作成
let MapNameText = {
	"active": false,
	"time": 0,
	"text": "",
	"title": ""
}

let title_gui = {
	"item_select": 0
}

let MenuTabSelect = 0;

class JsonUI {
	constructor(type, x = 0, y = 0, select = undefined, param) {
		if (!type in loadedjson.jsonui) throw (type + " is not defined");

		let UIGroup = loadedjson.jsonui[type];
		this.type = type;
		this.state = 1;//open:1 close:-1 
		this.openTime = 0;
		this.closeTime = 0;
		this.activeTime = 0;
		this.inactiveTime = 0;
		this.openDelay = UIGroup[0].openDelay ?? 0;
		this.closeDelay = UIGroup[0].closeDelay ?? 0;
		this.opened = false;
		this.closed = false;
		this.select = /*select ??*/ UIGroup[0].default_select ?? 0;
		this.pos = new Vec2(x, y);
		this.data = new Object();
		this.dataGroval = new Object();
		this.CanMovePlayer = UIGroup[0].CanMovePlayer ?? false;


		for (const UIContentKey of Object.keys(UIGroup)) {
			let UIContent = UIGroup[UIContentKey]
			switch (UIContent.type) {
				case "custom":
					if (game.UICustomScrollable.includes(UIContent.renderer))
						this.data[UIContent.id] = { "scroll": 0, "select": 0 };

					if (UIContent.renderer === "roles")
						this.data[UIContent.id].itemIndex = param;
					break;
			}
		}
	}
	open() {
		this.state = 1;
		this.openTime = 0;
		this.activeTime = 0;
	}
	close() {
		this.state = -1;
		this.closeTime = 0;
		this.inactiveTime = 0;
	}
	GetSelectID() {
		let UIGroup = loadedjson.jsonui[this.type];
		return UIGroup[this.select].id;
	}
	ShouldOpenAnim(UIIndex) {
		return this.state == 1 && jsonui_active(UIIndex);
	}
	ShouldCloseAnim(UIIndex) {
		return this.state == -1 || !jsonui_active(UIIndex);
	}
	ActiveChangeDetect(UIIndex) {
		this.#ActiveChange.active = !this.#ActiveChange.TickAgo && jsonui_active(UIIndex) && this.#ActiveChange.TickAgo !== undefined;
		this.#ActiveChange.inactive = this.#ActiveChange.TickAgo && !jsonui_active(UIIndex) && this.#ActiveChange.TickAgo !== undefined;

		this.#ActiveChange.TickAgo = jsonui_active(UIIndex);


		if (this.#ActiveChange.active) this.activeTime = 0;
		if (this.#ActiveChange.inactive) this.inactiveTime = 0;
	}
	#ActiveChange = {
		active: false,
		inactive: false,
		TickAgo: undefined
	}
}

let JsonUIOpen = new Array();

let JsonUICursor = new Cursor();

//言語設定
game.lang = loadedjson.en_us;
let lang = "en_us"

//json読み込み
document.addEventListener("readystatechange", loadingassets)
loadingScreenMain();

function main() {

	//FPS計測
	fpsCount();
	main_proc_time(true);

	game.lang = Object.assign(loadedjson.en_us, loadedjson[lang]);

	//キャンバスの初期化
	ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);

	keycheck();
	GamepadUpdate();
	touch_button_proc();

	if (game.PlayingScreen) GAMEMAIN();

	if (!game.PlayingScreen) TITLEMAIN();


	//タイマー
	timer++;

	main_proc_time(false);
	//ループ
	if (!OneFrameOnly) loopID = requestAnimationFrame(main);
}

function loadingScreenMain() {
	draw_loading_screen()


	if (!gamestarted) loopIDloading = requestAnimationFrame(loadingScreenMain);
};

async function game_start_proc() {


	//クエリパラメータ 取得
	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get("debug") != null) debug.visible = searchParams.has("debug");

	//タイトル変更
	document.title = "project 2023 " + game.ver

	//コンフィグリセット
	configReset();

	jsonui_open("hud")

	//アンロード時に確認メッセージを表示する
	if (game.config.beforeunload) beforeUnloadEnventID = setTimeout(beforeUnloadOn, 1000 * 10);


	gamestarted = true;
}

function GAMEMAIN() {


	if (!IsLoading) game.map = Object.assign(loadedjson.Map, loadedjson.MapMeta);
	playTime = SavedPlayTime + (new Date() - GameStartedTime);

	//プレイヤーの動作
	player_proc();

	//敵の動作
	enemy_proc();

	//NPCの動作
	npc_proc();

	//パーティクルの動作
	particle_proc();

	//敵スポーン
	enemy_spawn_event();


	//スクロール座標を取得
	player.scrollx = player.x - 160 + player.scroll_offsetx + debug.camx;
	player.scrolly = player.y - 80 + player.scroll_offsety + debug.camy;
	if (player.scrollx < 0) player.scrollx = 0;
	if (player.scrolly < 0) player.scrolly = 0;
	if (player.scrollx > 1280) player.scrollx = 1280;
	if (player.scrolly > 1420) player.scrolly = 1420;


	//GUIの処理
	//gui_proc()


	//描画メイン
	game_draw();

	//GUI描画
	//gui_draw();


	jsonui_main();


	//デバッグ
	if (debug.visible) debug_proc();
}

function TITLEMAIN() {
	title_gui_proc();
	title_gui_draw();
}

function keydownfunc(parameter) {
	touchmode = false;

	let key_code = parameter.keyCode;
	if (keys[key_code].press) keys[key_code].pressLag = true;
	keys[key_code].press = true;
	keys[key_code].timer++;
	keys[key_code].timen = timer;
	if (keys[key_code].press && !keys[key_code].pressLag) keys[key_code].time = timer;
	if (keys[key_code].press && !keys[key_code].pressLag) keys[key_code].timer = timer;

	if (key_arrow.includes(key_code)) parameter.preventDefault();

	if (debug.visible && key_code == 80) cancelAnimationFrame(loopID);
	if (debug.visible && key_code == 79) { OneFrameOnly = true; requestAnimationFrame(main); };
}

function keyupfunc(parameter) {
	let key_code = parameter.keyCode
	keys[key_code].press = false;
	keys[key_code].pressLag = false;
	keys[key_code].timer = 0;


	if (debug.visible && key_code == 80) { OneFrameOnly = false; requestAnimationFrame(main); };
}

function updateTouch(event) {
	// 要素の位置座標を取得
	let clientRect = canvas.getBoundingClientRect();
	// 距離取得
	let x = clientRect.left;
	let y = clientRect.top;

	let i = 0;
	touchpos.splice(0, Infinity)
	for (const touch of event.touches) {
		let obj = {
			"x": touch.clientX - clientRect.left,
			"y": touch.clientY - clientRect.top,
			"timer": timer
		}
		touchpos[i] = obj;
		i++;
	}

	touchmode = true;
	//console.log(touchpos[0])

}

function draw_touch_button() {
	if (!touchmode) return;
	for (const i in touchButtons) {
		draw("touch_button_" + touchButtons[i].type, touchButtons[i].x, touchButtons[i].y)
	}
}



// ログを再構築
function GamepadUpdate() {
	// 最新の Gamepad のリストを取得する
	gamepads = navigator.getGamepads();

};

for (let i = 0; i < gamepads.length; i++) {
	var a = new Array();

	// Gamepad オブジェクトを取得
	var gamepad = gamepads[i];

	// Gamepad オブジェクトが存在する
	if (gamepad) {
		console.log(gamepad)

		// Gamepad オブジェクトが存在しない
	} else {
	}

	// テキストを更新
}

function touch_button_proc() {
	if (!touchmode) return;
	//for(const i in touchpos)if(touchpos[i].timer!=timer)touchpos.splice(i,1)

	for (const i in touchButtons) {
		touchButton[touchButtons[i].type] = false;
		for (const j in touchpos) {
			// 点の情報
			let point_pos_x = touchpos[j].x;
			let point_pos_y = touchpos[j].y;

			// 矩形の情報
			let rect_pos_x = touchButtons[i].x;
			let rect_pos_y = touchButtons[i].y;
			let rect_width = touchButtons[i].width;
			let rect_height = touchButtons[i].height;

			if (point_pos_x >= rect_pos_x && point_pos_x <= (rect_pos_x + rect_width)) {
				if (point_pos_y >= rect_pos_y && point_pos_y <= (rect_pos_y + rect_height)) {
					touchButton[touchButtons[i].type] = true;
					touchButtonDown[touchButtons[i].type] = touchtime[j] == 1;
					touchButtonHold[touchButtons[i].type] = touchpos[j].timer == timer - 1;
					//console.log(touchButtons[i].type)
				}
			}
		}
	}
}

function keycheck() {


	for (const i in keys) {
		keys[i].timer == timer ? keys[i].down = true : keys[i].down = false;
		keys[i].presstime == 0 || keys[i].presstime > 10 && keys[i].presstime % 2 == 0 ? keys[i].hold = true : keys[i].hold = false;
		keys[i].press ? keys[i].presstime++ : keys[i].presstime = -1;
	}

	for (const i in touchpos) {
		if (typeof touchtime[i] === "undefined") touchtime[i] = 0;
		touchtime[i]++;
	}
	for (const i in touchtime) {
		if (typeof touchpos[i] === "undefined") touchtime[i] = 0;
	}



	for (const i in key_groups_list) {
		/*
		if (typeof key_groups[i] == "undefined") key_groups[i] = {
			"press": false,
			"down": false
		}
		let press_triggered = false;
		let down_triggered = false;
		let hold_triggered = false;
			    
		for (const j in key_groups_list[i]) {
			if (keys[key_groups_list[i][j]].press) key_groups[i] = true;
			if (keys[key_groups_list[i][j]].press) press_triggered = true;
			if (!press_triggered) key_groups[i] = false;
			    
			if (keys[key_groups_list[i][j]].down) key_groups_down[i] = true;
			if (keys[key_groups_list[i][j]].down) down_triggered = true;
			if (!down_triggered) key_groups_down[i] = false;
			    
			if (keys[key_groups_list[i][j]].hold) key_groups_hold[i] = true;
			if (keys[key_groups_list[i][j]].hold) hold_triggered = true;
			if (!hold_triggered) key_groups_hold[i] = false;
		}
				*/
		key_groups[i] = false;
		key_groups_down[i] = false;
		key_groups_hold[i] = false;
		for (const j in key_groups_list[i]) {
			if (keys[key_groups_list[i][j]].press) key_groups[i] = true;

			if (keys[key_groups_list[i][j]].down) key_groups_down[i] = true;

			if (keys[key_groups_list[i][j]].hold) key_groups_hold[i] = true;
		}

		for (const j in touchButton) {

			if (touchButton[i]) key_groups[i] = true;
			if (touchButton[i] && touchButtonDown[i]) key_groups_down[i] = true;
			if (touchButton[i] && touchButtonHold[i]) key_groups_hold[i] = true;
		}
	}
}

function fpsCount() {
	//FPS計測　あざす 
	frameCount++;
	endTime = new Date().getTime();
	if (endTime - startTime >= 1000) {
		fps = frameCount;
		frameCount = 0;
		startTime = new Date().getTime();

	}
}

function main_proc_time(start) {//処理の時間を計測
	if (start) MainProcStartTime = performance.now();
	if (!start) MainProcEndTime = performance.now();
	if (!start) MainProcTime = Math.floor(MainProcEndTime - MainProcStartTime);
}
/**
 * IDを渡すとテクスチャーアトラスのXかYを返します
 * @param {*} id TileID
 * @param {*} xy 0:X 1:Y
 * @returns テクスチャーアトラスのXかY
 */
function getTileAtlasXY(id, xy) {
	if (xy == 0) return id % 16 * 16
	if (xy == 1) return Math.floor(id / 16) * 16
}

function getPlayerAtlasXY(id, xy) {
	return playerAtlas[id] * 16
}

function ElemId(id) {
	return document.getElementById(id);
}
function ElemIdRepText(id, text) {
	return document.getElementById(id).innerText = String(text);
}
/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @param {bool} floor 切り捨てるか
 * @returns 2つの間の乱数を返します
 */
function Random(min, max = min, floor = false) {
	//あざす https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	if (floor) return Math.floor(Math.random() * (max - min) + min);

	return Math.random() * (max - min) + min;
}

/**
 * @deprecated
 * @function 2つの配列を渡すとその間の乱数を返します 配列以外を渡すとそのまま返します
 */
function RandomArray(input) {
	if (Array.isArray(input)) return Random(...input);
	return input;
}

function ConvertArray(input) {
	if (!Array.isArray(input)) return [input];
	return input;
}

/**
 * 文字を範囲内におさめます
 * @param {string} str 文字列
 * @param {number} len 文字の桁数
 * @param {string} dot 最後に付ける文字
 * @returns str
 */
function slice(str = "", len = 5, dot = undefined) {
	str = String(str);//string変換
	if (dot != undefined) {
		len--;
		dot = dot[0];
	}

	if (str.length > len)
		return str.slice(0, len) + String(dot ?? "");
	//return str.slice(0, len) + (dot == undefined ? "" : String(dot));

	return str;
}

//あざす　https://www.webdesignleaves.com/pr/jquery/js-sec-to-time.html
function milsecToTime(milsec) {
	const seconds = Math.floor(milsec / 1000);

	const hour = Math.floor(seconds / 3600);
	const min = Math.floor(seconds % 3600 / 60);
	const sec = seconds % 60;

	const data = {
		"hour": hour,
		"min": min,
		"sec": sec
	}
	return data;
}

//あざす　https://rfs.jp/sb/javascript/js-lab/zeropadding.html
function zeroPadding(NUM, LEN) {
	return (Array(LEN).join('0') + NUM).slice(-LEN);
}

/**
 * @function 切り捨てます
 * @param {*} num 切り捨てる数値
 * @param {*} k 切り捨てる桁 e.g. 8.161, -2= 8.16
 * @returns 切り捨てた数値
 */
function floor(num, k = 0) {
	if (Math.sign(k) === 1) return Math.floor(num / 10 ** k) * 10 ** k;

	if (Math.sign(k) == -1) return Math.floor(num * 10 ** -k) / 10 ** -k;

	if (k == 0) return Math.floor(num);
}

/**
 * 範囲制限します
 * @param {number} input
 * @param {number} min 
 * @param {number} max 
 * @returns 範囲制限した数値
 */
function limit(input, min, max) {
	return Math.min(Math.max(min, input), max);
}

function hsv2rgb(hsv) {// あざす https://lab.syncer.jp/Web/JavaScript/Snippet/67/
	let h = hsv[0] / 60;
	let s = hsv[1];
	let v = hsv[2];
	if (s == 0) return [v * 255, v * 255, v * 255];

	let rgb;
	let i = parseInt(h);
	let f = h - i;
	let v1 = v * (1 - s);
	let v2 = v * (1 - s * f);
	let v3 = v * (1 - s * (1 - f));

	switch (i) {
		case 0:
		case 6:
			rgb = [v, v3, v1];
			break;

		case 1:
			rgb = [v2, v, v1];
			break;

		case 2:
			rgb = [v1, v, v3];
			break;

		case 3:
			rgb = [v1, v2, v];
			break;

		case 4:
			rgb = [v3, v1, v];
			break;

		case 5:
			rgb = [v, v1, v2];
			break;
	}

	return rgb.map(function (value) {
		return value * 255;
	});
}
/*
//json読み込み
async function loadingassets() {
	load.type = "image";
	if(load.ejectLog)console.log("images are loading");
	{
		let gets = new Array();
		for (const i in willLoadImg) {
			gets.push(loadImage(willLoadImg[i].src, willLoadImg[i].name));
		}

		await Promise.all(gets);
	}

	if(load.ejectLog)console.log("images are loaded");
	load.type = "json";
	if(load.ejectLog)console.log("jsons are loading");
	{
		let gets = new Array();
		for (const i in willLoadJson) {
			gets.push(getJson(willLoadJson[i].src, willLoadJson[i].name, willLoadJson[i].meta === "jsonui"));
		}

		await Promise.all(gets);
	}

	if(load.ejectLog)console.log("jsons are loaded");
	load.type = "sound";
	if(load.ejectLog)console.log("sounds are loading");

	{
		let gets = new Array();
		for (const i in willLoadSounds) {
			gets.push(loadSound(willLoadSounds[i].src, willLoadSounds[i].name, willLoadSounds[i].meta));
		}

		await Promise.all(gets);
	}

	if(load.ejectLog)console.log("sounds are loaded");

	if (gamestarted) return;

	if(load.ejectLog)console.log("game is starting");
	game_start_proc();
	loopID = requestAnimationFrame(main);

	return;
	//よしゃあああaaikrretataaaaaaaaa　2023/08/07 20:38

}*/

//json読み込み
async function loadingassets() {
	{
		let gets = new Array();
		for (const i in willLoadImg) {
			gets.push(dynamicAwait(loadImage, !load.fastLoad || willLoadImg[i].nessesary, willLoadImg[i].src, willLoadImg[i].name));
		}
		for (const i in willLoadJson) {
			gets.push(dynamicAwait(getJson, !load.fastLoad || willLoadJson[i].nessesary, willLoadJson[i].src, willLoadJson[i].name));
		}
		for (const i in willLoadSounds) {
			gets.push(dynamicAwait(loadSound, !load.fastLoad || willLoadSounds[i].nessesary, willLoadSounds[i].src, willLoadSounds[i].name, willLoadSounds[i].meta));
		}

		await Promise.all(gets);
	}

	if (gamestarted) return;

	if (load.ejectLog) console.log("game is starting");
	game_start_proc();
	loopID = requestAnimationFrame(main);

	return;
	//よしゃあああaaikrretataaaaaaaaa　2023/08/07 20:38

}
/*
function load_json_proc() {
	loadingassets().then(result => {
		console.log(result);
		console.log(loadedjson);
		game_start_proc();
		requestAnimationFrame(main);
	});
}*/

/*
async function loadJson(filename, name) {

	//あざす https://kasumiblog.org/javascript-json-loading
	let requestURL = filename;//jsonへのパス
	let loadname = name;//jsonへのパス/
	// XMLHttpRequestを使ってjsonデータを読み込む
	let request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	// JSONデータをJavaScriptオブジェクトに変換
	request.onload = function () {
		let data = request.response;
		data = JSON.parse(JSON.stringify(data));
		loadedjson[loadname] = data;
	}
}*/

class JsonUIChild {
	constructor(obj) {
		JsonUIContent.push(obj);
	}
}

function JsonUIObjToClass(innerObj, keyToFind) {
	// キーがオブジェクトに存在するかチェックして、存在すれば結果に追加します
	if (innerObj.hasOwnProperty(keyToFind)) {
		innerObj[keyToFind].map(obj => JsonUIContent.push(new JsonUIChild(obj)));
		console.log(innerObj)
	}
	// キーが見つからない場合、オブジェクトの各プロパティを再帰的に検索します
	for (let key in innerObj) {
		if (typeof innerObj[key] === 'object' && innerObj[key] !== null) {
			JsonUIObjToClass(innerObj[key], keyToFind);
		}
	}
}


function JsonUIParseReviver(key, value) {
	if (key == "child") value.map(test => new JsonUIChild().createChild(test.test))
	return value
}

async function dynamicAwait(func, doAwait, ...param) {
	if (doAwait) {
		await func(...param);
	} else {
		func(...param);
	}
}

async function getJson(filename, name, useReviver) {
	//あざす　https://gxy-life.com/2PC/javascript/json_table20220514/
	let startTime = new Date().getTime();

	//取得ここから
	const response = await fetch(
		filename  // jsonファイルの場所
	);
	const text = await response.text();
	const jsonObject = JSON.parse(text);
	//取得ここまで

	let endTime = new Date().getTime();
	//jsonObject.loadTime = endTime - startTime; //ばぐるからやめよーー！！ほんまに
	//　↑公開処刑　
	debug.jsonLoadTime[name] = endTime - startTime;

	document.getElementById("jsonLoadCount").innerText = String(++load.jsoncount);
	if (load.ejectLog) console.log('loaded: ' + filename);

	if (!gamestarted) {
		ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);
		ctx.fillText(`loading parameter: ${load.jsoncount}/${willLoadJson.length}`, ScreenWidth / 2, ScreenHeight / 2);
	}

	loadedjson[name] = jsonObject;
	return jsonObject;
}

//あざす https://pisuke-code.com/js-load-image-synchronously/
/// 1.Promiseを使った同期読み込み
async function loadImage(imgUrl, name) {
	img[name] = null;
	let promise = new Promise(function (resolve) {
		img[name] = new Image();
		img[name].onload = function () {
			/// 読み込み完了後...
			document.getElementById("imgLoadCount").innerText = String(++load.imgcount);
			if (!gamestarted) {
				ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);
				ctx.fillText(`loading images: ${load.imgcount}/${willLoadImg.length}`, ScreenWidth / 2, ScreenHeight / 2);
			}

			if (load.ejectLog) console.log('loaded: ' + imgUrl);
			resolve();
		}
		/// 読み込み開始...
		img[name].src = imgUrl;
	});
	/// 読込完了まで待つ
	await promise;
	return img[name];
}

async function loadSound(url, name, volume) {
	sounds[name] = new Sound(await loadAudio(url, volume));
	document.getElementById("soundLoadCount").innerText = String(++load.soundcount);
	if (!gamestarted) {
		ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);
		ctx.fillText(`loading sounds: ${load.soundcount}/${willLoadSounds.length}`, ScreenWidth / 2, ScreenHeight / 2);
		if (load.ejectLog) console.log('loaded: ' + url);
	}
	return sounds[name];
}

//あざす　https://feeld-uni.com/?p=2162
async function loadconfig() {
	//let dirHandle;
	let fileData;

	try {
		if (typeof dirHandle == "undefined") dirHandle = await window.showDirectoryPicker();
	} catch {
		return undefined;
	}

	const file = await dirHandle.getFileHandle(SaveDataFileName, {
		create: true
	});
	fileData = await file.getFile();
	LastSavedFileData = fileData;
	let text = await fileData.text();
	let json = JSON.parse(text);
	return json;
}

async function saveconfig(obj) {
	let fileData;

	try {
		if (typeof dirHandle == "undefined") dirHandle = await window.showDirectoryPicker();
	} catch {
		return undefined;
	}

	const file = await dirHandle.getFileHandle(SaveDataFileName, {
		create: true
	});

	const sampleConfig = JSON.stringify(obj);

	const blob = new Blob([sampleConfig], {
		type: "application/json"
	});

	// Create a file writer and write the blob to the file.
	const writableStream = await file.createWritable();
	await writableStream.write(blob);
	await writableStream.close();

	// Read the file text.
	fileData = await file.getFile();
	LastSavedFileData = fileData;
	let text = await fileData.text();

	return fileData;
}

async function uploadsavedata() {

	try {
		fileHandle = await window.showOpenFilePicker(saveFileOptions);
	} catch {
		return;
	}

	if (Array.isArray(fileHandle)) fileHandle = fileHandle[0];
	let fileData = await fileHandle.getFile();
	let text = await fileData.text();
	let json = JSON.parse(text);
	return json;
}

async function downloadsavedata(obj) {
	let fileData;

	const textContent = JSON.stringify(obj);
	fileHandle = await saveFile(textContent, fileHandle)
	if (fileHandle === undefined) return;

	// Read the file text.
	fileData = await fileHandle.getFile();
	LastSavedFileData = fileData;
	let text = await fileData.text();

	return fileData;
}


//あざす https://qiita.com/pentamania/items/ada07c45d4e5cc139c03
async function writeFile(Handle, content) {
	// writable作成
	const writable = await Handle.createWritable();

	// コンテンツを書き込む
	await writable.write(content);

	// ファイル閉じる
	await writable.close();
}

async function saveFile(content, handle) {
	if (!handle) {
		try {
			handle = await window.showSaveFilePicker(saveFileOptions);
		} catch {
			return;
		}
	}
	await writeFile(handle, content);
	return handle;
}

async function savepathselect() {
	let fileData;

	try {
		if (typeof dirHandle == "undefined") dirHandle = await window.showDirectoryPicker();
	} catch {
		return undefined;
	}

	const file = await dirHandle.getFileHandle(SaveDataFileName, {
		create: true
	});

	// Read the file text.
	fileData = await file.getFile();
	LastSavedFileData = fileData;
	let text = await fileData.text();


	let obj;
	obj = await loadconfig();

	if (obj == undefined) return;

	SaveDataPlayTime = obj.playTime;

	return fileData;
}

function savepathreset() {
	[fileHandle, dirHandle] = [undefined, undefined];
}

async function savedataload(dir = true) {
	let obj;
	if (dir) obj = await loadconfig();
	else obj = await uploadsavedata();

	if (obj == undefined) return;

	SavedPlayTime = obj.playTime;
	SaveDataPlayTime = obj.playTime;
	player = obj.player;
	players = obj.players;
	enemy = obj.enemy;
	config = obj.config;
	LastSavedTime = new Date(obj.LastSavedTime);
	GameStartedTime = new Date();
	player_movelog_reset()
	mapchange(player.mapID, player.x, player.y, false)

	return LastSavedFileData;
}

async function savedatawrite(dir = true) {
	let obj = new Object();

	obj.metadata = game.savemetadata;
	obj.playTime = playTime;
	obj.LastSavedTime = new Date();
	obj.player = JSON.parse(JSON.stringify(player));
	obj.player.movelog = new Array(1);
	obj.players = players;
	obj.enemy = saveDataEnemyCompress();
	obj.config = config;

	if (dir) await saveconfig(obj);
	else await downloadsavedata(obj);

	if (obj == undefined) return;

	LastSavedTime = new Date(obj.LastSavedTime);
	SavedPlayTime = playTime;
	SaveDataPlayTime = playTime;
	GameStartedTime = new Date();

	//アンロード時に確認メッセージを表示する
	beforeUnloadOff();
	if (game.config.beforeunload) beforeUnloadEnventID = setTimeout(beforeUnloadOn, 1000 * 60);
	return LastSavedFileData;
}

function saveDataEnemyCompress() {
	let obj_enemy = JSON.parse(JSON.stringify(enemy));
	for (let enem of obj_enemy) {
		enem.xspd = floor(enem.xspd, 0);
		enem.yspd = floor(enem.yspd, 0);
	}
	return obj_enemy;
}

//あざす https://www.javadrive.jp/javascript/event/index16.html
function beforeUnloadOn() {

	let beforeUnload = event => {
		event.preventDefault();
		event.returnValue = 'Check';
	}

	window.onbeforeunload = beforeUnload;
}

function beforeUnloadOff() {
	window.onbeforeunload = null;
}

function beforeUnloadConfigON() {
	beforeUnloadEnventID = setTimeout(beforeUnloadOn, 1000 * 60);
}
function beforeUnloadConfigOFF() {
	clearTimeout(beforeUnloadEnventID);
	beforeUnloadOff();
}

//あざす https://zenn.dev/batton/articles/c84a99913b5430
async function getHash(message) {
	// const encoder = new TextEncoder();
	// const data = encoder.encode(message);
	// const hash = await crypto.subtle.digest('SHA-256', data);
	// return hash;

	const msgUInt8 = new TextEncoder().encode(message);                           // encode as (utf-8) UInt8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUInt8);           // hash the message
	const hashArray = Array.from(new UInt8Array(hashBuffer));                     // convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}

//あざす https://onl.sc/bWZEx2w
async function getIP() {
	const response = await fetch('https://api.ipify.org?format=json');
	const data = response.json;
	return data.ip
}

function IsBusy() {
	return game.saveloadingnow || IsLoading;
}

function getAllWillLoadLength() {
	return willLoadImg.length + willLoadJson.length + willLoadSounds.length;
}

function getAllLoadedCount() {
	return load.imgcount + load.jsoncount + load.soundcount;
}

function calcAngleDegrees(x, y) {
	//あざす https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
	return Math.atan2(y, x) * 180 / Math.PI;
}


function getNearestEnemy(x, y, d = false) {
	//if (typeof d == "undefined") d = false;
	let distance = new Array();
	for (const i in enemy) {
		distance.push(getDistance(x, y, enemy[i].x, enemy[i].y));
	}
	if (d) return [distance.indexOf(Math.min.apply(null, distance)), Math.min.apply(null, distance)];
	if (d == "distanceOnly") return Math.min.apply(null, distance);
	return distance.indexOf(Math.min.apply(null, distance));

}

function getNearestEnemyDistance(x, y) {
	let distance = new Array();
	for (const i in enemy) {
		distance.push(getDistance(x, y, enemy[i].x, enemy[i].y));
	}
	return Math.min.apply(null, distance);

}
function getDistance(ax, ay, bx, by) {
	return Math.abs(Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)));
}

function getEnemyCenterx(i) {
	return enemy[i].x + loadedjson.enemy[enemy[i].id].width / 2;
}

function getEnemyCentery(i) {
	return enemy[i].y + loadedjson.enemy[enemy[i].id].height / 2;
}

function getEnemyCenter(i) {
	return {
		"x": getEnemyCenterx(i),
		"y": getEnemyCentery(i)
	}
}

//数字のindex番目取得
function NumberofIndex(num, index, shinsu = 10) {
	//if (typeof shinsu == "undefined") shinsu = 10;
	return (String(num.toString(shinsu))[index]);
}

//アニメーションいろいろ(0.0～1.0)
function make_jump_animation(x) {
	if (x < 1) return Math.sin(x * 6.28 - 2);
	if (x >= 1) return Math.sin(4.28);
}

function make_slip_animation(x) {
	return Math.log10(8 * x * 4);
}

function make_scatter_animation(x) {
	if (x < 0.5) return make_slip_animation(x);
	if (x >= 0.5) return 1;
}
//あざす https://easings.net/ja
function easeOutElastic(x) {
	const c4 = (2 * Math.PI) / 3;

	return x === 0
		? 0
		: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
function easeOutExpo(x) {
	return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function easeInExpo(x) {
	return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
function replaceTile(id, maplayer, x, y) {
	game.map[maplayer][y][x] = id;
	return id;
}

function changeHitbox(bool, x, y) {
	game.map["hitbox"][y][x] = bool;
	return bool;
}

function allElemDefined(...elem) {
	if (elem == undefined) return false;

	return elem.every(element => element !== undefined);
}

//当たり判定
function hitbox(x, y) {

	let gethitBox = (x, y) => game.getTileID("hitbox", x, y) || (game.getTileID("map1", x, y) == 7 && !player.boat)

	if (gethitBox(Math.floor(x / 16 + 0), Math.floor(y / 16 + 0))) return true;
	if (gethitBox(Math.floor(x / 16 + 0.95), Math.floor(y / 16 + 0))) return true;
	if (gethitBox(Math.floor(x / 16 + 0), Math.floor(y / 16 + 0.95))) return true;
	if (gethitBox(Math.floor(x / 16 + 0.95), Math.floor(y / 16 + 0.95))) return true;

	return false;
}

function hitbox_rect(ax, ay, aw, ah, bx, by, bw, bh, color = "black") {
	//あざす https://yttm-work.jp/collision/collision_0002.html

	debug_hitbox_push(ax, ay, aw, ah, color);
	debug_hitbox_push(bx, by, bw, bh, color);

	let acx = ax + aw / 2;
	let acy = ay + ah / 2;
	let bcx = bx + bw / 2;
	let bcy = by + bh / 2;

	let dx = Math.abs(acx - bcx);
	let dy = Math.abs(acy - bcy);

	let sx = (aw + bw) / 2;
	let sy = (ah + bh) / 2;

	if (dx < sx && dy < sy) {
		return true;
	} else {
		return false;
	}
}

function hitbox_repo(ax, ay, aw, ah, px, py, color = "black") {
	//あざす https://yttm-work.jp/collision/collision_0004.html

	debug_hitbox_push(ax, ay, aw, ah, color);
	debug_hitbox_push(px, py, 1, 1, color);

	if (px >= ax && px <= (ax + aw) &&
		py >= ay && py <= (ay + ay)) {
		return true;
	} else {
		return false;
	}
}

function hitbox_reci(ax, ay, aw, ah, bx, by, bw, bh, color = "black") {

	debug_hitbox_push(ax, ay, aw, ah, color);
	debug_hitbox_push(bx, by, bw, bh, color);

	let da = ax - bx;
	let db = ay - by;
	let dc = Math.sqrt(da ** 2 + db ** 2);

	let ar = 2 / Math.sqrt(2 * Math.max(aw, ah));
	let br = 2 / Math.sqrt(2 * Math.max(bw, bh));

	if (dc <= ar + br) {
		return true;
	}
	else {
		return false;
	}
}

function hitbox_enemy_rect(ax, ay, aw, ah, color = "black") {

	let hit = new Array();

	for (const i in enemy) {
		let enemy_hitbox_x = get_enemy_data(i, "width");
		let enemy_hitbox_y = get_enemy_data(i, "height");
		if (hitbox_rect(enemy[i].x, enemy[i].y, enemy_hitbox_x, enemy_hitbox_y, ax, ay, aw, ah, color)) hit.push(i * 1);
	}

	return hit;
}

function hitbox_rema(ax, ay, aw, ah, color = "black", checktile, maplayer) {

	let x = Math.round(ax / 16);
	let y = Math.round(ay / 16);

	let hit = new Array();

	for (let ix = 0; ix < Math.ceil(aw / 16); ix++) {
		for (let iy = 0; iy < Math.ceil(ah / 16); iy++) {

			debug_hitbox_push((x + ix) * 16, (y + iy) * 16, 16, 16, color);

			let TileID = game.getTileID(maplayer, x + ix, y + iy)

			if (typeof checktile == "undefined") hit.push([(x + ix), (y + iy), TileID]);
			if (typeof checktile != "undefined" && !Array.isArray(checktile)) if (checktile == TileID) hit.push([(x + ix), (y + iy), TileID]);
			if (typeof checktile != "undefined" && Array.isArray(checktile)) if (checktile.includes(TileID)) hit.push([(x + ix), (y + iy), TileID]);
		}
	}
	return hit;
}

function player_proc() {

	if (IsLoading) return;
	if (canPlayerMoveForOpenGui()) {
		player_move_proc();
		player_npc_talk();
	}
	player_attack();
	player_effect_proc();
	player_death_check()

	mapchange_proc();

	for (const i in players) {

		//ダメージクールダウンの処理
		players[i].damage_cooldown--;

		player_knockback_move(i);

	}

	if (player.x != player.movelog[0][0] || player.y != player.movelog[0][1]) player.movelog.unshift([player.x, player.y]);
}

function player_move_proc() {

	if (player.canRotate && (!key_groups.attack || !game.config.rotatelockonattacking)) player_rotate();

	//移動キー判定
	player.up = key_groups.up;
	player.down = key_groups.down;
	player.right = key_groups.right;
	player.left = key_groups.left;

	//移動判定
	if (key_groups.up || key_groups.down || key_groups.right || key_groups.left) {
		player.moving = true;
	} else {
		player.moving = false;
	}
	if (Math.abs(player.xspd) != 0 || Math.abs(player.yspd) != 0) {
		player.moved = true;
	} else {
		player.moved = false;
	}

	//アニメーションに使用(値を変更すると速度が変わる)
	if (player.moved) player.moveTimer += 0.12;


	//上限(64)を超えたら削除
	player.movelog.splice(64, Infinity);


	//速度調整
	if (player.xspd > 0) {
		player.xspd = Math.floor(player.xspd * 0.85 * 1000) / 1000;
	} else {
		player.xspd = Math.ceil(player.xspd * 0.85 * 1000) / 1000;
	}
	if (player.yspd > 0) {
		player.yspd = Math.floor(player.yspd * 0.85 * 1000) / 1000;
	} else {
		player.yspd = Math.ceil(player.yspd * 0.85 * 1000) / 1000;
	}

	//速度移動
	if (key_groups.up) player.yspd -= 0.5;
	if (key_groups.down) player.yspd += 0.5;
	if (key_groups.right) player.xspd += 0.5;
	if (key_groups.left) player.xspd -= 0.5;

	//プレイヤー移動
	player_move(player.xspd, player.yspd, true);

}

function player_movelog_reset() {
	player.movelog.splice(0, Infinity);
	for (let i = 0; i < 64; i++) player.movelog.push([player.x, player.y]);
}

//プレイヤーの動き
function player_move(mvx, mvy, checkhitbox) {
	for (let i = 0; i < Math.round(Math.abs(mvx)); i++) {
		player.x += Math.sign(mvx);

		if (hitbox(player.x, player.y) && checkhitbox) player.x -= Math.sign(mvx);


		if (i > game.move_limit) break;
	}
	for (let i = 0; i < Math.round(Math.abs(mvy)); i++) {
		player.y += Math.sign(mvy);

		if (hitbox(player.x, player.y) && checkhitbox) player.y -= Math.sign(mvy);

		if (i > game.move_limit) break;
	}

}

//回復処理
function player_heal(i, x) {
	players[i].hp += x;
	if (players[i].hp_max <= players[i].hp) players[i].hp = players[i].hp_max;
}

//ダメージ処理
function player_damage(damage, rx, ry) {
	//クールダウン判定
	if (players[0].damage_cooldown > 0) return false;

	//ノックバック処理
	if (typeof rx != "undefined" && typeof ry != "undefined") {
		player_knockback(rx, ry);
	}

	//ダメージ処理
	players[0].hp -= damage;
	//クールダウン処理
	players[0].damage_cooldown += 5;


	return true;
}

function player_death_check() {
	let alive = false;
	for (let player of players) {
		player.alive = player.hp > 0;
		if (player.hp > 0) {
			alive = true
		}
	}
	player.alive = alive;
}

function player_knockback(x, y) {
	//if (x == Infinity || y == Infinity) alert("infinity")
	player.xknb += x;
	player.yknb += y;
}

function player_knockback_move(i) {
	//移動
	player_move(player.xknb, player.yknb, true);

	player.xknb -= player.xknb * 0.2;
	player.yknb -= player.yknb * 0.2;
}

function player_attack() {

	if (canPlayerMoveForOpenGui()) {
		if (key_groups_down.attack && players[0].weapon.timer > 0) players[0].weapon.speed++;
		if (key_groups.attack && (players[0].weapon.timer <= 0 || players[0].weapon.timer >= 20)) weapon_attack(0);
	}

	//剣の動作
	weapon_proc();
}

/**
 * 
 * @param {number} id 効果のID
 * @param {number} time 効果の秒数
 * @param {number} power 効果の強さ
 * @returns 
 */
function player_effect_add(id, time = 30, power = 0) {
	time *= 60;

	//if (player.effect[id] != undefined)
	//    if (player.effect[id].timetime) return;

	if (player.effect[id]?.timetime) return;

	player.effect[id] = new Effect(time, power)
}

function player_effect_proc() {
	for (const effect of player.effect) {
		if (effect == undefined) continue;
		effect.time--;
	}
}

function weapon_attack(i) {

	players[i].weapon.timer = 1;
	players[i].weapon.rotatex = game.rotate_pos[player.rotate][0];
	players[i].weapon.rotatey = game.rotate_pos[player.rotate][1];
	players[i].weapon.x = 0;
	players[i].weapon.y = 0;
	players[i].weapon.startx = subplayerx(i);
	players[i].weapon.starty = subplayery(i);
	players[i].weapon.autoAimx = 0;
	players[i].weapon.autoAimy = 0;
	players[i].weapon.speed = 1;
	players[i].weapon.lock = -1;
}

function weapon_proc() {
	for (const i in players) {
		if (players[i].weapon.timer > 0) {

			//攻撃
			let hit_enemy = new Array();
			hit_enemy = hitbox_enemy_rect(players[i].weapon.x - 8, players[i].weapon.y - 8, 32, 32);
			for (const j in hit_enemy) {
				enemy_damage(hit_enemy[j], players[i].weapon.attack, players[i].rotatex, players[i].rotatey, true);
			}

			//岩壊す
			let breaks = hitbox_rema(players[i].weapon.x - 8, players[i].weapon.y - 8, 32, 32, "red", game.breakableTile, "map1");
			for (const b in breaks) {
				//console.log(breaks[0])
				if (game.breakableTileAbout[breaks[i][2]].breakProbability > Math.random()) {
					replaceTile(game.breakableTileAbout[breaks[i][2]].becomeTile, "map1", breaks[i][0], breaks[i][1]);
					changeHitbox(false, breaks[i][0], breaks[i][1]);
					createParticle(breaks[i][0] * 16 + 8, breaks[i][1] * 16 + 8, 2, 8);
					PlaySound("break", "tile")
				}

				createParticle(breaks[i][0] * 16 + 8, breaks[i][1] * 16 + 8, 2, 0.2);
				PlaySound("breakbit", "tile", true);
			}

			//オートエイム
			if (players[i].weapon.timer <= 12 && (hit_enemy.length == 0 || !game.weapon_canlock) && game.config.weapon_auto_aiming) {
				let x = players[i].weapon.startx;
				let y = players[i].weapon.starty;
				if (getNearestEnemyDistance(x, y) < 100 && typeof getNearestEnemyDistance(x, y) == "number") {
					let enemyid = getNearestEnemy(x, y);
					let width = loadedjson.enemy[enemy[enemyid].id].width;
					let height = loadedjson.enemy[enemy[enemyid].id].height;
					players[i].weapon.autoAimx += Math.sign((enemy[enemyid].x + width / 2 - players[i].weapon.x + 16) / 32) * 2;
					players[i].weapon.autoAimy += Math.sign((enemy[enemyid].y + height / 2 - players[i].weapon.y + 16) / 32) * 2;
				}
			}
			if (players[i].weapon.timer > 12) {
				players[i].weapon.autoAimx = players[i].weapon.autoAimx * 0.25;
				players[i].weapon.autoAimy = players[i].weapon.autoAimy * 0.25;
			}

			//剣の座標の計算
			players[i].weapon.x = Math.floor(players[i].weapon.rotatex * (Math.sin(Math.PI / 2 * players[i].weapon.timer / 12) * 64) + players[i].weapon.autoAimx + subplayerx(i));
			players[i].weapon.y = Math.floor(players[i].weapon.rotatey * (Math.sin(Math.PI / 2 * players[i].weapon.timer / 12) * 64) + players[i].weapon.autoAimy + subplayery(i));

			//カウントアップ
			if (hit_enemy.length == 0 || !game.weapon_canlock) players[i].weapon.timer += players[i].weapon.speed;

			//リセット
			if (players[i].weapon.timer >= 24) {
				players[i].weapon.timer = 0;
				players[i].weapon.x = 0;
				players[i].weapon.y = 0;
				players[i].weapon.startx = 0;
				players[i].weapon.starty = 0;
				players[i].weapon.autoAimx = 0;
				players[i].weapon.autoAimy = 0;
				players[i].weapon.rotatex = 0;
				players[i].weapon.rotatey = 0;
				players[i].weapon.lock = -1;
			}

		} else {
			players[i].weapon.timer--;
		}
	}
}

//向きを取得
function player_rotate() {
	if (player.up && !player.down && !player.right && !player.left) player.facing = 2;
	if (!player.up && player.down && !player.right && !player.left) player.facing = 0;
	if (!player.up && !player.down && player.right && !player.left) player.facing = 3;
	if (!player.up && !player.down && !player.right && player.left) player.facing = 1;
	if (player.up && !player.down && player.right && !player.left) player.facing = 3;
	if (player.up && !player.down && !player.right && player.left) player.facing = 1;
	if (!player.up && player.down && player.right && !player.left) player.facing = 3;
	if (!player.up && player.down && !player.right && player.left) player.facing = 1;
	//if (!player.up && !player.down && player.right && player.left) player.facing = 0;
	//if (player.up && player.down && !player.right && !player.left) player.facing = 0;
	if (player.up && !player.down && player.right && player.left) player.facing = 2;
	if (!player.up && player.down && player.right && player.left) player.facing = 0;
	if (player.up && player.down && player.right && !player.left) player.facing = 3;
	if (player.up && player.down && !player.right && player.left) player.facing = 1;
	//if (player.up && player.down && player.right && player.left) player.facing = 0;


	if (player.up && !player.down && !player.right && !player.left) player.rotate = 4;
	if (!player.up && player.down && !player.right && !player.left) player.rotate = 0;
	if (!player.up && !player.down && player.right && !player.left) player.rotate = 6;
	if (!player.up && !player.down && !player.right && player.left) player.rotate = 2;
	if (player.up && !player.down && player.right && !player.left) player.rotate = 5;
	if (player.up && !player.down && !player.right && player.left) player.rotate = 3;
	if (!player.up && player.down && player.right && !player.left) player.rotate = 7;
	if (!player.up && player.down && !player.right && player.left) player.rotate = 1;
	//if (!player.up && !player.down && player.right && player.left) player.rotate = 0;
	//if (player.up && player.down && !player.right && !player.left) player.rotate = 0;
	if (player.up && !player.down && player.right && player.left) player.rotate = 4;
	if (!player.up && player.down && player.right && player.left) player.rotate = 0;
	if (player.up && player.down && player.right && !player.left) player.rotate = 6;
	if (player.up && player.down && !player.right && player.left) player.rotate = 2;
	//if (player.up && player.down && player.right && player.left) player.rotate = 0;
}

function player_npc_talk() {
	for (let i in npc) {
		let it = npc[i];
		let facing = new Vec2(game.facing_pos[player.facing][0], game.facing_pos[player.facing][1]);

		if (key_groups_down.confirm) {
			if (hitbox_rect(it.x, it.y, 16, 16, player.x + 4 + facing.x * 16, player.y + 4 + facing.y * 16, 8, 8)) {
				talk_npc(i); return;
			}
		}
	}
}

function talk_npc(i) {
	let dialogueID = npc[i].dialogueID;
	let dialogue = loadedjson.dialogue[dialogueID];
	gui.message.view(dialogue);
}

function mapchange_proc() {
	for (const i in game.map.warp) {
		let [x, y, w, h] = [game.map.warp[i].x * 16, game.map.warp[i].y * 16, game.map.warp[i].w * 16, game.map.warp[i].h * 16];
		if (isNaN(w)) w = 16; if (isNaN(h)) h = 16;

		if (hitbox_rect(x, y, w, h, player.x, player.y, 16, 16)) {
			let [x, y] = [player.x, player.y];
			if (game.map.warp[i].relpos != undefined) {
				[x, y] = [game.map.warp[i].relpos?.x * 16 + x, game.map.warp[i].relpos.y * 16 + y];
				mapchange(game.map.warp[i].to, x, y);
				return;
			}
			if (game.map.warp[i].abspos != undefined) {
				[x, y] = [game.map.warp[i].abspos?.x * 16, game.map.warp[i].abspos.y * 16];
				mapchange(game.map.warp[i].to, x, y);
				return;
			}
			{
				mapchange(game.map.warp[i].to);
				return;
			}
		}

	}
}

function map_change_proc_check(i, x, y, w = 16, h = 16) {
	if (hitbox_rect(x, y, w, h, player.x, player.y, 16, 16)) {
		mapchange(game.map.warp[i].to.mapID, game.map.warp[i].to.x * 16, game.map.warp[i].to.y * 16)
	}
}

async function mapchange(ID, x, y, loadonly = false) {

	IsLoading = true; {
		let gets = new Array();
		gets.push(getJson(game.map_path[ID], "Map"));
		gets.push(getJson(game.map_path[ID] + "meta", "MapMeta"));

		await Promise.all(gets);
	}
	player.mapID = ID;

	if (!loadonly) {
		enemy.splice(0, Infinity);
		npc.splice(0, Infinity);
		for (let i in loadedjson.MapMeta.npc) {
			let it = loadedjson.MapMeta.npc[i]
			npc.push(new NPC(it.x, it.y, it.id, it.dialogueID))
		}

		//プレイヤーの場所を移動
		if (typeof x != "undefined" && typeof y != "undefined" && !isNaN(x) && !isNaN(y)) [player.x, player.y] = [x, y];
		if (typeof x == "undefined" || typeof y == "undefined" || isNaN(x) || isNaN(y)) [player.x, player.y] = [loadedjson.Map.player[0], loadedjson.Map.player[1]];
	}
	IsLoading = false;
}

function subplayerx(i) {
	return player.movelog[i * 16][0];
}

function subplayery(i) {
	return player.movelog[i * 16][1];
}

function subplayerdrawx(i) {
	return subplayerx(i) - player.scrollx;
}

function subplayerdrawy(i) {
	return subplayery(i) - player.scrolly;
}

function enemyx(i) {
	return enemy[i * 16].x;
}

function enemyy(i) {
	return enemy[i * 16].y;
}

function enemydrawx(i) {
	return enemyx(i) - player.scrollx;
}

function enemydrawy(i) {
	return enemyy(i) - player.scrolly;
}

function get_enemy_data(i, data) {
	return loadedjson.enemy[enemy[i].id][data];
}

function get_item_data_index(i, data) {
	return loadedjson.item[i][data];

}

function get_item_data(i, data) {
	return loadedjson.item[player.items[i].id][data];
}
/**
 * 翻訳後の文字列を返します
 * @param {string} key 翻訳キー
 * @param  {...string} param パラメーター
 * @returns 
 */
function get_text(key, ...param) {
	if (typeof game.lang[key] != "string") return key;

	let text = game.lang[key];
	for (let i in param) {
		text = text.replace("%" + i, param[i]);
	}
	return text;
}

function enemy_proc() {

	if (IsLoading) return;

	for (const i in enemy) {
		enemy_move_proc(i);
		enemy_knockback_move(i);
		enemy_damage_proc(i);
		enemy_overlap(i);
		slime_animation_proc(i);
		enemy_become_proc(i);
		enemy_slime_attack_proc(i)
	}
	enemy_death_proc();
}

function enemy_move_proc(i) {

	//スピード調整
	if (enemy[i].xspd > 0) {
		enemy[i].xspd = Math.floor(enemy[i].xspd * 0.85 * 1000) / 1000;
	} else {
		enemy[i].xspd = Math.ceil(enemy[i].xspd * 0.85 * 1000) / 1000;
	}
	if (enemy[i].yspd > 0) {
		enemy[i].yspd = Math.floor(enemy[i].yspd * 0.85 * 1000) / 1000;
	} else {
		enemy[i].yspd = Math.ceil(enemy[i].yspd * 0.85 * 1000) / 1000;
	}

	//動き替える
	if (enemy[i].id == 1) enemy_slime_move_proc(i);
	if (enemy[i].id == 3) enemy_gorilla_move_proc(i);

	//移動
	enemy_move(i, enemy[i].xspd, enemy[i].yspd);
}

function enemy_move(i, x, y) {

	//移動
	for (let j = 0; j < Math.round(Math.abs(x)); j++) {
		enemy[i].x += Math.sign(x);
		if (hitbox(enemy[i].x, enemy[i].y)) enemy[i].x -= Math.sign(x);
		if (j > game.move_limit) break;
	}
	for (let j = 0; j < Math.round(Math.abs(y)); j++) {
		enemy[i].y += Math.sign(y);
		if (hitbox(enemy[i].x, enemy[i].y)) enemy[i].y -= Math.sign(y);
		if (j > game.move_limit) break;
	}
}

function enemy_slime_move_proc(i) {

	if (enemy[i].attack.hostility) {
		enemy_move_hostility(i)
	} else {
		enemy_move_normal(i)
	}
}

function enemy_gorilla_move_proc(i) {

	if (enemy[i].attack.hostility) {
		enemy_move_hostility(i)
	} else {
		enemy_move_normal(i)
	}
}

function enemy_move_normal(i) {

	if (enemy[i].move[0]) enemy[i].yspd -= enemy_speed;
	if (enemy[i].move[1]) enemy[i].yspd += enemy_speed;
	if (enemy[i].move[2]) enemy[i].xspd += enemy_speed;
	if (enemy[i].move[3]) enemy[i].xspd -= enemy_speed;
	if (enemy[i].move[4] > 0) enemy[i].move[4] -= 1;

	if (!enemy[i].move[4] > 0) {
		enemy[i].move[0] = false;
		enemy[i].move[1] = false;
		enemy[i].move[2] = false;
		enemy[i].move[3] = false;

		if (Math.random() > 0.95) {
			if (Math.random() > 0.9) enemy[i].move[0] = true;
			if (Math.random() > 0.9) enemy[i].move[1] = true;
			if (Math.random() > 0.9) enemy[i].move[2] = true;
			if (Math.random() > 0.9) enemy[i].move[3] = true;
			if (enemy[i].move[0] || enemy[i].move[1] || enemy[i].move[2] || enemy[i].move[3]) enemy[i].move[4] = Math.floor(Math.random() * 5 + 5);
		}
	}

	if (enemy[i].move[4] > 0) {
		enemy[i].moving = true;
	} else {
		enemy[i].moving = false;
	}
}

function enemy_move_hostility(i) {
	let dis = getDistance(enemy[i].x, enemy[i].y, subplayerx(0), subplayery(0));
	if (dis < 16) {
		enemy[i].moving = false;
		return
	}

	let r = calcAngleDegrees(player.x + game.facing_pos[player.facing][0] - enemy[i].x, player.y + game.facing_pos[player.facing][1] - enemy[i].y);
	enemy[i].xspd += enemy_speed * (Math.cos(r) + "").slice(0);
	enemy[i].yspd += enemy_speed * (Math.sin(r) + "").slice(0);

	enemy[i].moving = true;
	return
}

function slime_animation_proc(i) {
	if (enemy[i].moving) enemy[i].anim.animing = true;
	if (enemy[i].anim.animing) enemy[i].anim.tick++;
	if (enemy[i].anim.tick >= 20) {
		enemy[i].anim.tick = 0;
		enemy[i].anim.animing = false;
	}

	if (enemy[i].id == 1 && enemy[i].anim.tick == 8) createParticle(getEnemyCenter(i).x, getEnemyCenter(i).y, 1, 2);


	if (enemy[i].attack_anim.animing) enemy[i].attack_anim.tick++;
	if (enemy[i].attack_anim.tick >= 20) {
		enemy[i].attack_anim.tick = 0;
		enemy[i].attack_anim.animing = false;
	}
}

function enemy_overlap(i) {
	for (const j in enemy) {
		if (i != j) {
			if (hitbox_rect(enemy[i].x, enemy[i].y, loadedjson.enemy[enemy[i].id].width, loadedjson.enemy[enemy[i].id].height, enemy[j].x, enemy[j].y, loadedjson.enemy[enemy[j].id].width, loadedjson.enemy[enemy[j].id].height)) {

				let r = calcAngleDegrees(player.x + game.facing_pos[player.facing][0] - enemy[i].x, player.y + game.facing_pos[player.facing][1] - enemy[i].y);
				let d = getDistance(enemy[i].x, enemy[i].y, enemy[j].x, enemy[j].y);
				//enemy_knockback(i, (Math.cos(r - 180) + "").slice(0) * Random(0, 1), (Math.sin(r - 180) + "").slice(0) * Random(0, 1));
				if (r != 1) enemy_move(i, (Math.cos(r - 180) + "").slice(0) * Random(0, 1), (Math.sin(r - 180) + "").slice(0) * Random(0, 1))
				//console.log([enemy[i].xknb, enemy[i].yknb])
			}
		}
	}
}

function enemy_knockback(i, x, y) {
	if (x == Infinity || y == Infinity) alert("infinity")
	enemy[i].xknb += x;
	enemy[i].yknb += y;
}

function enemy_knockback_move(i) {
	//移動
	enemy_move(i, enemy[i].xknb, enemy[i].yknb);

	enemy[i].xknb -= enemy[i].xknb * 0.2;
	enemy[i].yknb -= enemy[i].yknb * 0.2;
}

function enemy_become_proc(i) {
	enemy[i].attack.timer--;
	if (enemy[i].attack.hostility && enemy[i].attack.timer <= 0 && getDistance(player.x, player.y, enemy[i].x, enemy[i].y) > 64) enemy[i].attack.hostility = false;
}

function enemy_slime_attack_proc(i) {
	enemy[i].attack.cool_down--;
	if (!enemy[i].attack.hostility) return;

	if (hitbox_rect(enemy[i].x, enemy[i].y, get_enemy_data(i, "width"), get_enemy_data(i, "height"), player.x, player.y, 16, 16)) {
		if (enemy[i].attack.cool_down <= 0) {
			enemy[i].attack.cool_down = 50
			enemy[i].attack_anim.animing = true;
			enemy[i].attack_anim.tick = 0;
		}

		if (enemy[i].attack_anim.tick == 10) player_damage(10, -Math.sign(getEnemyCenter(i).x - (player.x + 8)), -Math.sign(getEnemyCenter(i).y - (player.y + 8)));
		//console.log("attacked"); 
	}
}

/**
 * 
 * @param {*} i enemyID
 * @param {*} damage 与えるダメージの量
 * @param {*} rx ノックバックの方向
 * @param {*} ry ノックバックの方向
 * @param {*} byPlayer 敵対するかどうか
 * @returns true:ダメージを与えた　false:ダメージを与えられなかった
 */
function enemy_damage(i, damage, rx = 0, ry = 0, byPlayer = false) {
	//クールダウン判定
	if (enemy[i].damage_cooldown > 0) return false;

	//敵対処理
	if (byPlayer) enemy_become_hostility(i);

	//効果音
	PlaySound("damage", "enemy", true);

	//ノックバック処理
	if (typeof rx != "undefined" && typeof ry != "undefined") {
		enemy_knockback(i, rx, ry);
	}

	//ダメージ処理
	enemy[i].hp -= damage;
	//クールダウン処理
	enemy[i].damage_cooldown += 5;

	//エフェクト処理
	enemy[i].damage_effect.damage += damage;
	enemy[i].damage_effect.view_time = 100;
	enemy[i].damage_effect.Last_damage_timer = 250;
	createParticle(getEnemyCenter(i).x, getEnemyCenter(i).y, 1, 1);

	return true;
}

function enemy_become_hostility(i, timer = 1000) {
	enemy[i].attack.hostility = true
	enemy[i].attack.timer = timer;
}

function enemy_damage_proc(i) {
	//エフェクトの処理
	if (enemy[i].damage_effect.view_time > 0) enemy[i].damage_effect.view_time--;
	if (enemy[i].damage_effect.view_time <= 0) enemy[i].damage_effect.damage = 0;

	//ダメージクールダウンの処理
	enemy[i].damage_cooldown--;

	//ダメージタイマーの処理
	enemy[i].damage_effect.Last_damage_timer--;
}

function enemy_death_proc() {
	for (const i in enemy) {
		if (enemy[i].hp <= 0) {
			//倒したときのパーティクル
			createParticle(enemy[i].x, enemy[i].y, 0, 5); enemy_delete(i);

			//効果音
			PlaySound("death", "enemy");
			return;
		}

		//despawn
		if (getDistance(player.x + 8, player.y + 8, enemy[i].x, enemy[i].y) > 256 + 16 && !enemy[i].attack.hostility) {
			enemy_delete(i);
			return;
		}
	}
}

function enemy_delete(i) {
	enemy.splice(i, 1);
}

function enemy_spawn_event() {
	//沸き上限
	if (enemy.length >= 50) return;

	for (let i = 0; i < 360; i += 3) {
		let r = 16;
		let x = Math.floor(player.x / 16 + Math.cos(i) * r);
		let y = Math.floor(player.y / 16 + Math.sin(i) * r);
		enemy_spawn_check(x, y);
	}
}

function enemy_spawn_check(x, y) {
	//debug_hitbox_push(x * 16, y * 16, 16, 16);

	if (Random(0, 10) < 9) return;

	//敵をスポーンする場所かを調べる
	let ID = game.getTileID("enemy", x, y);
	if (ID == null || typeof ID != "number") return;

	//敵が既にスポーンされてないか調べる
	for (const i in enemy) {
		if (enemy[i].sp[0] == x && enemy[i].sp[1] == y) return;
	}
	enemy.push(new Enemy(x, y, ID));

}

function npc_proc() {
	for (let i in npc) {
		npc_move_proc(i)

	}
}

function npc_move_proc(i) {

	npc_rotate(i);


	if (Math.abs(npc[i].xspd) != 0 || Math.abs(npc[i].yspd) != 0) {
		npc[i].moved = true;
	} else {
		npc[i].moved = false;
	}

	//アニメーションに使用(値を変更すると速度が変わる)
	if (npc[i].moved) npc[i].moveTimer += 0.12;


	//スピード調整
	if (npc[i].xspd > 0) {
		npc[i].xspd = Math.floor(npc[i].xspd * 0.85 * 1000) / 1000;
	} else {
		npc[i].xspd = Math.ceil(npc[i].xspd * 0.85 * 1000) / 1000;
	}
	if (npc[i].yspd > 0) {
		npc[i].yspd = Math.floor(npc[i].yspd * 0.85 * 1000) / 1000;
	} else {
		npc[i].yspd = Math.ceil(npc[i].yspd * 0.85 * 1000) / 1000;
	}

	//動き替える


	//速度移動
	if (npc[i].up) npc[i].yspd -= 0.5;
	if (npc[i].down) npc[i].yspd += 0.5;
	if (npc[i].right) npc[i].xspd += 0.5;
	if (npc[i].left) npc[i].xspd -= 0.5;

	//移動
	npc_move(i, npc[i].xspd, npc[i].yspd);


}

function npc_move(i, x, y) {

	//移動
	for (let j = 0; j < Math.round(Math.abs(x)); j++) {
		npc[i].x += Math.sign(x);
		if (hitbox(npc[i].x, npc[i].y)) npc[i].x -= Math.sign(x);
		if (j > game.move_limit) break;
	}
	for (let j = 0; j < Math.round(Math.abs(y)); j++) {
		npc[i].y += Math.sign(y);
		if (hitbox(npc[i].x, npc[i].y)) npc[i].y -= Math.sign(y);
		if (j > game.move_limit) break;
	}
}

function npc_move_spd_add(i, x, y) {
	x = Math.sign(x);
	y = Math.sign(y);

	npc[i].xspd += enemy_speed * x;
	npc[i].yspd += enemy_speed * y;
}

function npc_move_random(i) {

	npc[i].move[0] ? npc[i].down = true : npc[i].down = false;
	npc[i].move[1] ? npc[i].up = true : npc[i].up = false;
	npc[i].move[2] ? npc[i].right = true : npc[i].right = false;
	npc[i].move[3] ? npc[i].left = true : npc[i].left = false;
	if (npc[i].move[4] > 0) npc[i].move[4] -= 1;

	if (!npc[i].move[4] > 0) {
		npc[i].move[0] = false;
		npc[i].move[1] = false;
		npc[i].move[2] = false;
		npc[i].move[3] = false;

		if (Math.random() > 0.95) {
			if (Math.random() > 0.9) npc[i].move[0] = true;
			if (Math.random() > 0.9) npc[i].move[1] = true;
			if (Math.random() > 0.9) npc[i].move[2] = true;
			if (Math.random() > 0.9) npc[i].move[3] = true;
			if (npc[i].move[0] || npc[i].move[1] || npc[i].move[2] || npc[i].move[3]) npc[i].move[4] = Math.floor(Math.random() * 5 + 5);
		}
	}

	if (npc[i].move[4] > 0) {
		npc[i].moving = true;
	} else {
		npc[i].moving = false;
	}
}

//向きを取得
function npc_rotate(i) {
	if (npc[i].up && !npc[i].down && !npc[i].right && !npc[i].left) npc[i].facing = 2;
	if (!npc[i].up && npc[i].down && !npc[i].right && !npc[i].left) npc[i].facing = 0;
	if (!npc[i].up && !npc[i].down && npc[i].right && !npc[i].left) npc[i].facing = 3;
	if (!npc[i].up && !npc[i].down && !npc[i].right && npc[i].left) npc[i].facing = 1;
	if (npc[i].up && !npc[i].down && npc[i].right && !npc[i].left) npc[i].facing = 3;
	if (npc[i].up && !npc[i].down && !npc[i].right && npc[i].left) npc[i].facing = 1;
	if (!npc[i].up && npc[i].down && npc[i].right && !npc[i].left) npc[i].facing = 3;
	if (!npc[i].up && npc[i].down && !npc[i].right && npc[i].left) npc[i].facing = 1;
	//if (!npc[i].up && !npc[i].down && npc[i].right && npc[i].left) npc[i].facing = 0;
	//if (npc[i].up && npc[i].down && !npc[i].right && !npc[i].left) npc[i].facing = 0;
	if (npc[i].up && !npc[i].down && npc[i].right && npc[i].left) npc[i].facing = 2;
	if (!npc[i].up && npc[i].down && npc[i].right && npc[i].left) npc[i].facing = 0;
	if (npc[i].up && npc[i].down && npc[i].right && !npc[i].left) npc[i].facing = 3;
	if (npc[i].up && npc[i].down && !npc[i].right && npc[i].left) npc[i].facing = 1;
	//if (npc[i].up && npc[i].down && npc[i].right && npc[i].left) npc[i].facing = 0;


	if (npc[i].up && !npc[i].down && !npc[i].right && !npc[i].left) npc[i].rotate = 4;
	if (!npc[i].up && npc[i].down && !npc[i].right && !npc[i].left) npc[i].rotate = 0;
	if (!npc[i].up && !npc[i].down && npc[i].right && !npc[i].left) npc[i].rotate = 6;
	if (!npc[i].up && !npc[i].down && !npc[i].right && npc[i].left) npc[i].rotate = 2;
	if (npc[i].up && !npc[i].down && npc[i].right && !npc[i].left) npc[i].rotate = 5;
	if (npc[i].up && !npc[i].down && !npc[i].right && npc[i].left) npc[i].rotate = 3;
	if (!npc[i].up && npc[i].down && npc[i].right && !npc[i].left) npc[i].rotate = 7;
	if (!npc[i].up && npc[i].down && !npc[i].right && npc[i].left) npc[i].rotate = 1;
	//if (!npc[i].up && !npc[i].down && npc[i].right && npc[i].left) npc[i].rotate = 0;
	//if (npc[i].up && npc[i].down && !npc[i].right && !npc[i].left) npc[i].rotate = 0;
	if (npc[i].up && !npc[i].down && npc[i].right && npc[i].left) npc[i].rotate = 4;
	if (!npc[i].up && npc[i].down && npc[i].right && npc[i].left) npc[i].rotate = 0;
	if (npc[i].up && npc[i].down && npc[i].right && !npc[i].left) npc[i].rotate = 6;
	if (npc[i].up && npc[i].down && !npc[i].right && npc[i].left) npc[i].rotate = 2;
	//if (npc[i].up && npc[i].down && npc[i].right && npc[i].left) npc[i].rotate = 0;
}

function particle_proc() {

	if (IsLoading) return;
	for (const i in particle) {
		particle[i].tick++;
	}
	paricle_death_check()
}

function createParticle(spx, spy, id, count) {
	if (count < 1.0) if (Math.random() > count) return;

	for (let j = 0; j < count; j++) {
		//データの作成
		let def = {
			"x": spx,
			"y": spy,
			"id": id,
			"tick": 0,
			"lifetime": Math.floor(Random(loadedjson.particle[id].lifetime[0], loadedjson.particle[id].lifetime[1])),
			"varix": Random(-1, 1),
			"variy": Random(-1, 1)
		}
		//データの追加
		particle.push(def);
	}
}

function paricle_death_check() {
	for (const i in particle) {
		if (particle[i].lifetime <= particle[i].tick) particle.splice(i, 1);
	}
}

function debug_proc() {
	if (keys[75].press) debug.camy++;
	if (keys[73].press) debug.camy--;
	if (keys[76].press) debug.camx++;
	if (keys[74].press) debug.camx--;


	//当たり判定描画の色設定
	ctx.strokeStyle = `rgb(
        ${hsv2rgb([timer * 2 % 360, 1, 1])[0]},
        ${hsv2rgb([timer * 2 % 360, 1, 1])[1]},
        ${hsv2rgb([timer * 2 % 360, 1, 1])[2]}`

	ctx.strokeStyle = "black"

	if (debug.hitbox_visible) for (const i in debug.hitboxes) {
		ctx.strokeStyle = debug.hitboxes[i].color;
		ctx.strokeRect((debug.hitboxes[i].a - player.scrollx), (debug.hitboxes[i].b - player.scrolly), debug.hitboxes[i].c, debug.hitboxes[i].d);
	}
	debug.hitboxes.splice(0);


	//文字描画
	draw_texts(debug.info, 64, 64)
	{
		let draw_text_debug = [
			`FPS:${fps}`,
			`m:${MainProcTime}ms`,
			`t:${timer}`,
			`e:${enemy.length}`,
			`p:${particle.length}`

		]

		draw_texts(draw_text_debug, 0, 136)
	}

	{
		let draw_text_debug = [
			`x:${player.x}(${Math.floor(player.x / 16)})`,
			`y:${player.y}(${Math.floor(player.y / 16)})`,

		]

		draw_texts(draw_text_debug, 64, 0)
	}
	draw_text("dc:" + debug.camx + "," + debug.camy, 0, 24);

	if (menu.visible) {
		{
			let draw_text_debug = [
				"itmsel:" + menu.item_select,
				"scroll:" + menu.scroll
			]
			draw_texts(draw_text_debug, 64 + 64, 0);
		}
		if (menu.tab === 3 && menu.item_select[0] == 0) {
			draw_text("timer:" + menu.config_num.timer, 128, 64 + 64);
			draw_text("mode:" + menu.config_num.mode, 128, 64 + 64 + 8);
		}
	}


	{//jsonUIselect
		let draw_text_debug = ["jsonuisel"]

		for (let i in JsonUIOpen)
			draw_text_debug.push(`${JsonUIOpen[i].select},${JsonUIOpen[i].GetSelectID()}`);

		draw_texts(draw_text_debug, 128 + 32, 0)
	}

	if (false) {
		let draw_text_debug = ["jsonuiabout"]

		for (let key of Object.keys(JsonUIOpen[1] ?? new Object()))
			draw_text_debug.push(`${key}:${JsonUIOpen[1][key]}`);

		draw_texts(draw_text_debug, 128 + 32, 32)
	}


	//キー表示
	for (let i = 0, j = 0; i < keys.length; i++) {
		if (keys[i].press) {
			drawTextFont(String.fromCharCode(i), 78 * 4, j * 8);
			drawTextFont(`${i}`, 74 * 4, j * 8);
			j++;
		}
	}
	{
		let px = 0, dx = 0;
		for (const key in key_groups) {
			if (key_groups[key]) {
				drawTextFont(key.slice(0, 2), 68 * 4, px * 8);
				px++;
			}
			if (key_groups_down[key]) {
				drawTextFont(key.slice(0, 2), 64 * 4, dx * 8);
				dx++;
			}
		}
	}

	//コントローラー表示
	if (gamepads.filter(e => e === null).length !== gamepads.length) for (let x in gamepads) {
		let gp = gamepads[x];
		draw_text(`${x}`, 72 * 4 + x * -40, 32);
		if (gp === null) continue;
		for (let i = 0, j = 0; i < gp.buttons.length; i++) {
			if (gp.buttons[i].pressed) {
				draw_text(`${i}`, 78 * 4 + x * -40, j * 8);
				j++;
			}
		}
		for (let i = 0, j = 0; i < gp.axes.length; i++) {
			let ax = gp.axes[i];
			draw_text(`${slice(ax, 4, "")}`, 72 * 4 + x * -40, j * 8);
			j++;
		}
	}

	//タッチデバック
	debug_draw_touch();



	//敵描画
	for (const i in enemy) {
		draw_text(enemy[i].hp.toString(), enemy[i].x - player.scrollx, enemy[i].y - player.scrolly - 16);
		draw_text(i.toString(), enemy[i].x - player.scrollx, enemy[i].y - player.scrolly - 8);
	}

	for (const pause of debug.pause_frame) {
		if (timer == pause) cancelAnimationFrame(loopID);
	}


	draw_text("project2023\nbeta build\n" + game.ver, 15 * 16 - 8, 10 * 16 - 8)

}

function debug_hitbox_push(a, b, c, d, color = "black") {

	if (!debug.hitbox_visible) return
	if (!debug.visible) return

	//データの作成
	let def = {
		"a": a,
		"b": b,
		"c": c,
		"d": d,
		"color": color
	}

	//データの追加
	debug.hitboxes.push(def);
}

function debug_draw_touch() {
	for (let i in touchpos) {
		draw_text("" + i + touchtime[i], touchpos[i].x / zoomX, touchpos[i].y / zoomY)
	}
}

function editer_main() {
	drawImg(img.players, 0, 0, 16, 16, (0 - player.scrollx), (0 - player.scrolly - 8), 16, 24);
}

function get_select_tile_pos(mousex, mousey) {
	return {
		x: Math.floor(mousex / 16 / zoomX + player.scrollx / 16),
		y: Math.floor(mousey / 16 / zoomY + player.scrolly / 16)
	}
}
//canvas.addEventListener("click", e => console.log(get_select_tile_pos(e.offsetX, e.offsetY)))
/**
 * @function テキストを描画します
 * @param {string} text 描画するテキスト
 * @param {number} textx X(ドット数)
 * @param {number} texty Y(ドット数)
 * @param {number} textwidth 幅(文字数)
 * @param {number} textheight 高さ(文字数)
 * @param {string} font uni_00(font)
 * @param {sign} offset -1:左寄せ 0:中央寄せ 1:右寄せ
 * @param {number} drawOffsetX 描画する範囲をずらします
 * @param {number} drawOffsetY 描画する範囲をずらします
 * @param {number} drawWidth 描画する範囲をずらします
 * @param {number} drawHeight 描画する範囲をずらします
 */
function draw_text(text, textx, texty, textwidth = Infinity, textheight = Infinity, font = "", offset = -1, drawOffsetX = 0, drawOffsetY = 0, drawWidth = 8, drawHeight = 8) {
	text = String(text);//型変換

	if (offset == -1) textx -= text.length * 0;//左寄せ　調整
	if (offset == 0) textx -= text.length * 4;//中央寄せ　調整
	if (offset == 1) textx -= text.length * 8;//右寄せ　調整

	for (let i = 0, at = 0, offsetx = 0, offsety = 0; at < text.length; i++) {

		//改行
		if (text.charAt(at) == "\n") {
			offsety++;
			offsetx = 0;
		}

		if (text.charAt(at).match(/^(\n|\r|\t|\b|\f|\v|\0)$/) != null) at++;

		//描画
		if (at <= text.length) draw_font(text.charAt(at), (textx + offsetx * 8), (texty + offsety * 8), font, drawOffsetX, drawOffsetY, drawWidth, drawHeight);

		//桁
		at++;

		//X上げる
		offsetx++;


		//自動改行
		if (textwidth < offsetx) {
			offsety++;
			offsetx = 0;
		}
		//はみ出し判定
		if (textheight < offsety) {
			return "over height";
		}
	}
	return undefined;
}

/**
 * @function フォント(１文字)描画します
 * @param {string} text 文字
 * @param {number} textx X(ドット数)
 * @param {number} texty Y(ドット数)
 * @param {string} font uni_00(font)
 * @param {number} drawOffsetX 描画する範囲をずらします
 * @param {number} drawOffsetY 描画する範囲をずらします
 * @param {number} drawWidth 描画する範囲をずらします
 * @param {number} drawHeight 描画する範囲をずらします
 */
function draw_font(text, textx, texty, font = "", drawOffsetX = 0, drawOffsetY = 0, drawWidth = 8, drawHeight = 8) {
	if (!LEGACY_MODE) return;

	text = String(text);//型変換

	let codeP = zeroPadding(text.charCodeAt(0).toString(16), 4)
	let fontimg = img.font["uni_" + NumberofIndex(codeP, 0, 16) + NumberofIndex(codeP, 1, 16) + font]

	if (fontimg == undefined) return;

	drawImg(fontimg, parseInt(NumberofIndex(codeP, 3, 16), 16) * 8 + drawOffsetX, parseInt(NumberofIndex(codeP, 2, 16), 16) * 8 + drawOffsetY, drawWidth, drawHeight, textx, texty);

}

function draw_texts(text, x, y) {

	for (const i in text) {
		drawTextFont(text[i], x, i * 8 + y)
	}
}

/**
 * 
 * @param {string} text 
 * @param {number} textX 
 * @param {number} textY 
 * @param {number} startX 
 * @param {number} startY 
 * @param {number} endX 
 * @param {number} endY 
 * @param {"start"|"end"|"left"|"right"|"center"} align 
 */
function drawTextFont(text, textX, textY, { color = game.colorPallet.black, align = "start", startX, startY, endX, endY }) {
	ctx.save();

	const Font = DEFAULT_FONT;

	const fontSize = 8;
	// フォントは大きさ半分で書いてるので２倍にします
	const fontSIzeExpand = fontIsloaded(Font) ? 2 : 1;
	const fontOffsetFix = fontIsloaded(Font) ? 8 : 8;
	//										dotFont:defaultFont

	text = replaceUnsupportedCharacters(String(text), Font);

	ctx.font = `${fontSize * fontSIzeExpand}px ${Font}`; // sans-serif
	ctx.fillStyle = color;
	ctx.textAlign = align;

	//text = replaceVoicedSound(String(text));

	//const textMetrics = ctx.measureText(text);
	//const textWidth = textMetrics.width;
	//const textHeight = textMetrics.fontBoundingBoxAscent;

	const drawX = textX + startX;
	const drawY = textY + startY;
	const width = endX - startX;
	const height = endY - startY;


	if (allElemDefined(startX, startY, endX, endY)) {
		ctx.beginPath();
		ctx.rect(drawX, drawY, width, height);
		ctx.clip();
	}


	// 行ごとにループ処理
	text.split('\n').forEach((line, index) => {
		// Y座標の位置を行のインデックスと行間で調整
		ctx.fillText(line, textX, textY + index * fontOffsetFix + fontSize);//ここも調整
	});
	// thanks gpt4

	//ctx.fillRect(0,0,canvas.width,canvas.height)

	ctx.restore();
}

/*
function draw_icon(i, x, y) {
	let [id = 1023] = [loadedjson.icons[i]];
	ctx.drawImage(img.gui_icons, (id % 32) * 8, Math.floor(id / 32) * 8, 8, 8, x, y, 8, 8);
}
*/

function draw_prompt(dx, dy, dw, dh, img) {
	//numlockごみ
	ctx.drawImage(img, 0, 0, 8, 8, (dx - 8), (dy - 8), 8, 8);
	ctx.drawImage(img, 8, 0, 8, 8, dx, (dy - 8), dw, 8);
	ctx.drawImage(img, 16, 0, 8, 8, (dx + dw), (dy - 8), 8, 8);


	ctx.drawImage(img, 0, 8, 8, 8, (dx - 8), dy, 8, dh);
	ctx.drawImage(img, 16, 8, 8, 8, (dx + dw), dy, 8, dh);


	ctx.drawImage(img, 0, 16, 8, 8, (dx - 8), (dy + dh), 8, 8);
	ctx.drawImage(img, 8, 16, 8, 8, dx, (dy + dh), dw, 8);
	ctx.drawImage(img, 16, 16, 8, 8, (dx + dw), (dy + dh), 8, 8);

	ctx.drawImage(img, 8, 8, 8, 8, dx, dy, dw, dh);
}

function draw_under_page_scroll(x, y) {

	draw("gui_under_page_scroll", x, y);
	draw("gui_under_page_left", x + 2 * 8, y + 8);
	draw("gui_under_page_right", x + 13 * 8, y + 8);
}

function draw_hp(p, x, y) {
	ctx.drawImage(img.gui, 0, 0, 11, 3, (x - 1), (y - 1), 11, 3);
	ctx.drawImage(img.gui, 0, Math.floor(p * 9 + 3), 9, 1, x, y, 9, 1);
}


function game_draw() {
	let DrawObject = new Array();

	//タイル描画
	draw_tiles("map1");

	//アニメーション
	player_animation();
	for (let i in npc) npc_animation(i);

	//プレイヤー描画
	draw_player()

	//NPC描画
	draw_npc()

	//剣描画
	draw_weapons();

	//敵描画
	draw_enemy();

	//パーティクル描画
	draw_particle()

	//タイル描画2
	draw_tiles("map2");

}
//描画
function draw(i, x, y) {
	let t = loadedjson.atlas[i];
	ctx.drawImage(img[t.img], t.atlas[0], t.atlas[1], t.atlas[2], t.atlas[3], Math.round(x), Math.round(y), t.atlas[2], t.atlas[3]);
}
function AtlasDrawImage(i, x, y, ox = 0, oy = 0, ow = 0, oh = 0) {
	let Get = e => loadedjson.atlas[i].atlas[e];
	drawImg(img[loadedjson.atlas[i].img], Get(0) + ox, Get(1) + oy, Get(2) + ow, Get(3) + oh, Math.round(x), Math.round(y));
}
/**
 * 描画します　ctx.drawImageに似ていますかzoomはいりません　sWidth,sHeightとdWidth,dHeightは同じになります
 * @param  {number} image
 * @param  {number} sx
 * @param  {number} sy
 * @param  {number} sWidth
 * @param  {number} sHeight
 * @param  {number} dx
 * @param  {number} dy
 * 
 */
function drawImg(...img) {
	let get = i => Math.floor(img[i])
	ctx.drawImage(img[0], get(1), get(2), get(3), get(4), get(5), get(6), get(3), get(4))
}

function draw_player() {

	//プレイヤー描画
	for (const i in players) {
		ctx.drawImage(img.players, player.anim * 16, player.facing * 32, 16, 24, subplayerdrawx(i), (subplayerdrawy(i) - 8), 16, 24);
	}
}


function draw_weapons() {

	//剣描画
	for (const i in players) {
		if (players[i].weapon.timer <= 0) {
			let wtimer = players[i].weapon.timer;
			if (players[i].weapon.timer <= -20) wtimer = -20;

			draw_weapon(0, subplayerdrawx(i) + Math.floor(make_slip_animation(Math.asin(-wtimer / 10 / Math.PI)) * 16), subplayerdrawy(i) + make_slip_animation(Math.asin(-wtimer / 10 / Math.PI)) * Math.floor(Math.sin(-players[i].weapon.timer / 50) * 8 - 32));
		} else {

			//                                                          v#アニメーション速度# 
			//                                                               v#フレーム数#
			let weapon_rotation = Math.floor((players[i].weapon.timer / 1) % 8)

			draw_weapon(weapon_rotation, players[i].weapon.x - player.scrollx, players[i].weapon.y - player.scrolly);
			draw_sweep(weapon_rotation, players[i].weapon.x - player.scrollx, players[i].weapon.y - player.scrolly);

			//draw_weapon(weapon_rotation, 180 - player.scrollx, 180 - player.scrolly);
			//draw_sweep(weapon_rotation, 180 - player.scrollx, 180 - player.scrolly);
		}
	}
}

function draw_weapon(rotate, x, y) {

	ctx.drawImage(img.item_model, weapon.atlas[rotate][0], weapon.atlas[rotate][1], weapon.atlas[rotate][2], weapon.atlas[rotate][3], (x + weapon.offset[rotate][0]), (y + weapon.offset[rotate][1]), weapon.atlas[rotate][2], weapon.atlas[rotate][3]);

}

function draw_sweep(rotate, x, y) {

	let weapon_offset = {
		//<$調整$    斜めの時の位置調整                    #斜め検知# ><$調整$>< エフェクトの円周の大きさ調整          $大きさ$>
		"x": (4 * Math.sign(game.rotate_pos[rotate][0]) * (rotate % 2)) - 8 + (Math.sign(game.rotate_pos[rotate][0]) * 1),
		"y": (4 * Math.sign(game.rotate_pos[rotate][1]) * (rotate % 2)) - 8 + (Math.sign(game.rotate_pos[rotate][1]) * 1)
	};

	ctx.drawImage(img.sweep, rotate * 32, 0, 32, 32, (x + weapon_offset.x), (y + weapon_offset.y), 32, 32);

	//draw_text(`${weapon_offset.x}\n${weapon_offset.y}`,x,y+16)
}

function player_animation() {

	//プレイヤー画像指定
	if (!player.moving) {
		player.anim = 2;
	}
	else {
		switch (Math.floor(player.moveTimer % 4)) {
			case 0:
				player.anim = 0;
				break;
			case 1:
				player.anim = 2;
				break;
			case 2:
				player.anim = 1;
				break;
			case 3:
				player.anim = 2;
				break;
		}
	}

}

function draw_npc() {

	//プレイヤー描画
	for (const i in npc) {
		ctx.drawImage(img.players, npc[i].anim * 16, npc[i].facing * 32, 16, 24, (npc[i].x - player.scrollx), (npc[i].y - player.scrolly - 8), 16, 24);
	}
}

function npc_animation(i) {

	//プレイヤー画像指定
	if (!npc[i].moving) {
		npc[i].anim = 2;
	}
	else {
		switch (Math.floor(npc[i].moveTimer % 4)) {
			case 0:
				npc[i].anim = 0;
				break;
			case 1:
				npc[i].anim = 2;
				break;
			case 2:
				npc[i].anim = 1;
				break;
			case 3:
				npc[i].anim = 2;
				break;
		}
	}

}


function draw_tiles(maplayer) {

	let plx = Math.floor(player.scrollx / 16);
	let ply = Math.floor(player.scrolly / 16);

	for (let y = 0; y < 13; y++) {
		for (let x = 0; x < 21; x++) {
			let tileID = game.getTileID(maplayer, x + plx, y + ply);

			//軽量化
			if (!game.DontDrawTIle.includes(tileID)) ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, (x * 16 + (16 - player.scrollx % 16) - 16), (y * 16 + (16 - player.scrolly % 16) - 16), 16, 16);

		}
	}
}

function draw_enemy() {

	for (const i in enemy) {
		let t = enemy[i];

		let anim = Math.sin(enemy[i].attack_anim.tick / 20 * game.PI);

		if (t.id == 1) drawImg(img.enemy, slime_animation(i).x, slime_animation(i).y, 16, 16, t.x - player.scrollx, t.y - player.scrolly - anim * 16);
		if (t.id == 2) drawImg(img.enemy, 0, 16, 16, 32, t.x - player.scrollx, t.y - player.scrolly);
		if (t.id == 3) drawImg(img.enemy, gorilla_animation(i).x, gorilla_animation(i).y, 32, 32, t.x - player.scrollx, t.y - player.scrolly);

		if (enemy[i].damage_effect.Last_damage_timer > 0) draw_hp(t.hp / loadedjson.enemy[t.id].hp, getEnemyCenter(i).x - player.scrollx - 5, t.y - player.scrolly);
		if (enemy[i].damage_effect.view_time != 0) draw_text(enemy[i].damage_effect.damage + "", enemy[i].x - player.scrollx, enemy[i].y - 16 - Math.log10(-8 * (enemy[i].damage_effect.view_time / 100 - 1)) * 8 - player.scrolly);
		//if (enemy[i].damage_effect.view_time != 0) draw_text(-8 *( enemy[i].damage_effect.view_time / 100 - 1)  + "", enemy[i].x - player.scrollx, enemy[i].y + 16 - Math.log10((enemy[i].damage_effect.view_time / 100 * 8) * 2) - player.scrolly);
	}
}

function slime_animation(i) {

	let x = 0;
	let y = 0;

	if (enemy[i].anim.animing) x = Math.floor(enemy[i].anim.tick / 20 * 3);
	if (enemy[i].attack_anim.animing) x = Math.floor(enemy[i].attack_anim.tick / 20 * 3);

	return new Vec2(x * 16, y * 16);
}

function gorilla_animation(i) {

	let x = 0;
	let y = 0;

	if (enemy[i].anim.animing) x = Math.floor(enemy[i].anim.tick / 20 * 3);
	//if (enemy[i].attack_anim.animing) x = Math.floor(enemy[i].attack_anim.tick / 20 * 3);

	return new Vec2(x * 32 + 32, y * 32 + 16);
}
function draw_particle() {

	for (const i in particle) {
		let t = particle[i];
		if (t.id == 0) drawImg(img.particle, Math.floor(t.tick / t.lifetime * 8) * 16, 0, 16, 16, t.x - player.scrollx + particle_death_offset(i)[0], t.y - player.scrolly + particle_death_offset(i)[1]);
		if (t.id == 1) drawImg(img.particle, 0, 16, 16, 16, t.x - player.scrollx + t.varix * 16 * make_scatter_animation(t.tick / t.lifetime), t.y - player.scrolly - make_jump_animation(t.tick / t.lifetime * 2) * 4);
		if (t.id == 2) drawImg(img.particle, 16, 16, 16, 16, t.x - player.scrollx + t.varix * 16 * make_scatter_animation(t.tick / t.lifetime), t.y - player.scrolly - make_jump_animation(t.tick / t.lifetime * 2) * 4);
	}
}

function particle_death_offset(i) {
	let t = particle[i];

	return [t.tick * t.varix / 10, -t.tick / 5 - t.variy * 4];
}


function gui_draw() {
	//カーソルの変数の作成
	let cursor = new Array();

	//体力描画
	draw_prompt(8, 8, 7 * 8, players.length * 8, img.gui_prompt);

	for (const i in players) {
		ctx.drawImage(img.gui_menu, players[i].id * 8, 48, 8, 8, 8, (i * 8 + 1 * 8), 8, 8);
		ctx.drawImage(img.gui_menu, 0, 32, 16, 8, 16, (i * 8 + 1 * 8), 16, 8);
		draw_text(players[i].hp + "", 32, (i * 8 + 1 * 8));
	}

	//マップ名描画
	if (MapNameText.active) {
		let x = 0;
		if (0 <= MapNameText.time < 60) x += easeOutExpo((MapNameText.time - 0) / 60);
		if (180 <= MapNameText.time < 240) x += easeInExpo((MapNameText.time - 180) / 60);
		x *= ScreenWidth / 2;
		draw_text(MapNameText.text, x, 64, Infinity, Infinity, "", 0);
	}

	//メッセージ描画
	if (gui.message.visible) {
		draw_prompt(5 * 8, 13 * 8, 32 * 8, 8 * 8, img.gui_message);
		draw_text(typeof gui.message.text === "string" ? gui.message.text : gui.message.text[gui.message.index].text, 40, 104, 31);

		if (debug.visible) draw_text(gui.message.index, 40, 104 - 16);
	}

	//メニュー描画
	if (menu.visible) {
		ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (5 * 8 - 4), (3 * 8 - 4), 64, 32);
		ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (13 * 8 - 4), (3 * 8 - 4), 64, 32);
		ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (21 * 8 - 4), (3 * 8 - 4), 64, 32);
		ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (29 * 8 - 4), (3 * 8 - 4), 64, 32);

		draw_prompt(5 * 8, 5 * 8, 32 * 8, 16 * 8, img.gui_prompt);

		ctx.drawImage(img.gui_tab, game.tab_offset[menu.tab], menu.tab_select * 32 + 32, 64, 32, ((5 + 8 * menu.tab) * 8 - 4), (3 * 8 - 4), 64, 32);

		//タブテキスト描画
		draw_icon("party", 5 * 8, 3 * 8);
		draw_text(get_text("menu.tab.party"), 6 * 8, 3 * 8);
		draw_icon("items", 13 * 8, 3 * 8);
		draw_text(get_text("menu.tab.items"), 14 * 8, 3 * 8);
		draw_icon("equip", 21 * 8, 3 * 8);
		draw_text(get_text("menu.tab.equip"), 22 * 8, 3 * 8);
		draw_icon("system", 29 * 8, 3 * 8);
		draw_text(get_text("menu.tab.system"), 30 * 8, 3 * 8);

		let cursorX = [40];

		//party
		if (menu.tab === 0) {
			ctx.drawImage(img.players, 0, 0, 16, 16, 5 * 8, 5 * 8, 16, 16);
			draw("hp", 5 * 8, 8 * 8);
			draw_text(players[0].hp + "", 7 * 8, 8 * 8);

		}

		//items
		if (menu.tab === 1) {
			cursorX = [40 - 8];
			for (let i in player.items.slice(menu.scroll[0], menu.scroll[0] + 8)) {
				draw_gui_item(40, 5 * 8 + i * 16, Number(i) + menu.scroll[0]);
			}
			draw_scroll_bar(18 * 16, 6 * 8, menu.scroll[0] / Math.max(menu.scroll[0], player.items.length - 8), 128 - 16);
		}

		//equip
		if (menu.tab === 2) {

		}

		//system
		if (menu.tab === 3) {
			cursorX = [4 * 8, 12 * 8, 14 * 8, 33 * 8];
			//右のリスト
			//config
			if (menu.item_select[0] === 0) {
				let itemselect = 0;
				if (menu.item_select[1] != undefined) itemselect = menu.item_select[1];
				let configs = loadedjson.configs[game.config_name[itemselect]];

				//縦線
				draw_gui_vertical_line(14, 5, true);
				drawImg(img.gui_prompt, 8, 8, 8, 8, 14 * 8, itemselect * 16 + 5 * 8)


				let func = (i, dx) => {
					if (configs[i].default == config[configs[i].variable]) draw_font("D", 36 * 8, dx * 16 + 5 * 8);

					if (configs[i].type === "bool") draw(config[configs[i].variable] ? "switch_on" : "switch_off", 34 * 8, dx * 16 + 5 * 8);

					if (configs[i].type === "number") draw_text(config[configs[i].variable], 36 * 8, dx * 16 + 5 * 8, Infinity, Infinity, "", 1);
				}
				draw_gui_items(configs, "name", 15 * 8, 5 * 8, 25, 8, 16, 8, menu.scroll[2], func);

				//数値編集の矢印
				if (menu.config_num.mode != -1 || menu.config_num.timer >= 50) {
					let ofsY = 0;
					if (menu.config_num.mode == 1) ofsY = easeOutExpo(limit(menu.config_num.timer / 100, 0, 1)) * 4;
					if (menu.config_num.mode == -1) ofsY = easeInExpo(limit(menu.config_num.timer / 100, 0, 1)) * 4;
					draw("config_num_up", 34 * 8 + 4, (menu.item_select[2] - menu.scroll[menu.select_length - 1]) * 16 + 5 * 8 - ofsY);
					draw("config_num_down", 34 * 8 + 4, (menu.item_select[2] - menu.scroll[menu.select_length - 1]) * 16 + 5 * 8 + ofsY);
				}

				//中央のリスト
				for (let x in game.config_icons) {
					draw_icon(game.config_icons[x], 13 * 8, (2.5 + Number(x)) * 16)
				}

				draw_text("test", 14 * 8, 20 * 8)

			}

			//data
			if (menu.item_select[0] === 1) {
				draw_gui_items(game.gui_system_data_items, false, 14 * 8, 5 * 8, 25, 2, 16);

				let [savepath, savename, SavedTime, FileSize] = ["???", "???", "???", "???"];
				if (typeof LastSavedFileData !== "undefined") savename = LastSavedFileData.name;

				if (typeof LastSavedFileData !== "undefined") FileSize = floor(LastSavedFileData.size / 1000, -1) + "KB";

				if (typeof dirHandle !== "undefined" && typeof LastSavedFileData !== "undefined")
					savepath = slice(dirHandle.name, 5, "…") + "/" + LastSavedFileData.name;

				if (typeof fileHandle !== "undefined")
					savepath = fileHandle.name;

				if (typeof LastSavedTime !== "undefined") SavedTime = LastSavedTime.toLocaleString();


				if (game.saveloadfaliedtime + game.PopUpDelay > timer)
					draw_text(get_text("menu.loadfailed.type" + game.saveloadfaliedtype), 14 * 8, 16 * 8);
				if (game.saveloadsuccesstime + game.PopUpDelay > timer)
					draw_text(get_text("menu.loadsuccess.type" + game.saveloadsuccesstype), 14 * 8, 16 * 8);

				draw_text(get_text("menu.FileSize") + FileSize, 14 * 8, 18 * 8);

				draw_text(get_text("menu.LastSavedTime") + SavedTime, 14 * 8, 19 * 8);

				draw_text(get_text("menu.saved") + savepath, 14 * 8, 20 * 8, 22);

				//playtime
				{//playtime
					draw_icon("clock", 31 * 8, 6 * 8)
					draw_text(get_text("menu.playtimeS"), 31 * 8, 5 * 8)
					draw_text(`${zeroPadding(milsecToTime(playTime).hour, 2)}:${zeroPadding(milsecToTime(playTime).min, 2)}`, 32 * 8, 6 * 8);
				}
				{//savedataplaytime
					draw_icon("save", 31 * 8, 8 * 8)
					draw_text(get_text("menu.savedataplaytimeS"), 31 * 8, 7 * 8)
					draw_text(typeof LastSavedFileData !== "undefined" ? `${zeroPadding(milsecToTime(SaveDataPlayTime).hour, 2)}:${zeroPadding(milsecToTime(SaveDataPlayTime).min, 2)}` : "??:??", 32 * 8, 8 * 8);
				}
				if (debug.visible) {
					draw_text("PlayTime", 23 * 8, 10 * 8);
					draw_text(playTime, 23 * 8, 11 * 8);
					draw_text("SavedPlayTime", 23 * 8, 12 * 8);
					draw_text(SavedPlayTime, 23 * 8, 13 * 8);
					draw_text("SaveDataPlayTime", 23 * 8, 14 * 8);
					draw_text(SaveDataPlayTime, 23 * 8, 15 * 8);
				}
			}


			//about
			if (menu.item_select[0] === 2) {
				draw_text(get_text("menu.playtime"), 13 * 8, 5 * 8)
				draw_text(`${zeroPadding(milsecToTime(playTime).hour, 2)}:${zeroPadding(milsecToTime(playTime).min, 2)}`, 13 * 8, 6 * 8);
			}

			//左のリスト
			draw_gui_items(game.gui_system_items, false, 6 * 8, 5 * 8, 25, 2, 16);


			//縦線
			draw_gui_vertical_line(12, 5);

		}




		//カーソル//
		let select_y_size = game.select_y_size[menu.tab];
		//タブ
		cursor.push(new Vec2(menu.tab * 64 + 4 * 8, 3 * 8));

		if (!menu.tab_select)
			for (let l in menu.item_select)
				cursor.push(new Vec2(cursorX[l], (menu.item_select[l] - menu.scroll[l]) * select_y_size + 5 * 8));

		if (menu.mode === "ConfigNumEdit") cursor.push(new Vec2(32 * 8, (menu.item_select[2] - menu.scroll[2]) * select_y_size + 5 * 8));


	}

	//誰が使いますか
	if (menu.role_select) {

		draw_prompt(10 * 8, 10 * 8, 7 * 8, 7 * 8, img.gui_prompt);
		draw_text(get_text("menu.item_use.who_use"), 10 * 8, 10 * 8);

		for (const i in players) {
			drawImg(img.gui_menu, players[i].id * 8, 48, 8, 8, 10 * 8, (11 * 8 + i * 8));
			drawImg(img.gui_menu, 0, 32, 16, 8, 11 * 8, (11 * 8 + i * 8));
			draw_text(String(players[i].hp), 13 * 8, (11 * 8 + i * 8));
		}
		cursor.push(new Vec2(9 * 8, 11 * 8));
	}

	//メッセージ描画
	if (gui.confirm.visible) {
		let it = gui.confirm;
		draw_prompt(it.pos.x, it.pos.y, 8 * 8, 8 * 8, img.gui_prompt);
		draw_text(it.text, it.pos.x, it.pos.y, 7);
		cursor.push(new Vec2(it.pos.x + 32 - it.selected * 32, it.pos.y + 64 - 16));
	}

	//カーソル描画//
	cursor_draw(cursor);

	//ロード画面
	if (IsLoading) draw_loading();

	//タッチボタン描画
	draw_touch_button();

}

function cursor_draw(cursor) {

	//カーソル描画//

	let cursorOfseX = 0;
	cursorOfseX += easeOutExpo(timer % 100 / 100) * 5;
	cursorOfseX += easeOutExpo(1 - timer % 100 / 100) * 5;
	cursorOfseX -= 8;

	if (IsBusy()) cursorOfseX = 0;

	let busyCorsor = `cursor_busy_${timer / 8 % 8 >= 6 ? 0 : 1}`;

	if (menu.CursorNeedUpdate) {
		menu.CursorNeedUpdate = false;
		menu.CursorOldPos.x = cursor[cursor.length - 1].x;
		menu.CursorOldPos.y = cursor[cursor.length - 1].y;
	}

	if (cursor.length !== 0) {
		menu.CursorOldPos.x += (cursor[cursor.length - 1].x - menu.CursorOldPos.x) / 2;
		menu.CursorOldPos.y += (cursor[cursor.length - 1].y - menu.CursorOldPos.y) / 2;
	}

	for (let i in cursor) {
		if (i != cursor.length - 1) draw("cursor_uns", cursor[i].x, cursor[i].y);

		if (i == cursor.length - 1) draw(IsBusy() ? busyCorsor : "cursor", menu.CursorOldPos.x + cursorOfseX, menu.CursorOldPos.y);
	}

}
function title_gui_draw(dx = 64, dy = 64) {
	let cursor = new Array();

	draw_gui_items(game.title_items, undefined, dx, dy, 100, 0, 16, 100);
	cursor.push(new Vec2(dx - 16, title_gui.item_select * 16 + dy));

	cursor_draw(cursor);

	draw_text("title", 0, 0)
}

/**
 * 縦線を描画します　てきとうです
 * @param {number} x 
 * @param {number} y 
 * @param {boolean} right 
 */
function draw_gui_vertical_line(x, y, right = false) {
	//縦線
	switch (right) {
		case false:
			ctx.drawImage(img.gui_prompt_more, 0, 0, 8, 8, x * 8, (y - 1) * 8, 8, 8);
			ctx.drawImage(img.gui_prompt, 0, 8, 8, 8, x * 8, y * 8, 8, 16 * 8);
			ctx.drawImage(img.gui_prompt_more, 0, 8, 8, 8, x * 8, (y + 21 - 5) * 8, 8, 8);
			break;
		case true:
			ctx.drawImage(img.gui_prompt_more, 8, 0, 8, 8, x * 8, (y - 1) * 8, 8, 8);
			ctx.drawImage(img.gui_prompt, 16, 8, 8, 8, x * 8, y * 8, 8, 16 * 8);
			ctx.drawImage(img.gui_prompt_more, 8, 8, 8, 8, x * 8, (y + 21 - 5) * 8, 8, 8);
			break;
	}
}

function draw_gui_item(x, y, i) {
	//console.log(i)
	//アイテムの名前描画
	draw_text(get_text("item." + get_item_data(i, "name") + ".name"), 8 * 3 + x, y);

	let count_offset = 13 * 8;
	draw_text(" x", x + count_offset, y);
	draw_text(player.items[i].count + "", x + count_offset + 2 * 8, y, undefined, undefined, "_purple");

	ctx.drawImage(img.items, getTileAtlasXY(player.items[i].id, 0), getTileAtlasXY(player.items[i].id, 1), 16, 16, 24 + x, y, 16, 16);

	if (get_item_data(i, "efficacy") == "health") {
		draw("gui_item_text_health", 3 * 8 + x, y + 8);
		draw_text(get_item_data(i, "heal_power") + "", 7 * 8 + x, y + 8, undefined, undefined, "_purple");
	}
}

function draw_scroll_bar(x, y, p = 0, height = 64, id = null) {
	if (isNaN(p)) p = 0;

	ctx.drawImage(img.gui_scroll_bar, 0, 0, 8, 1, x, y, 8, 1);
	ctx.drawImage(img.gui_scroll_bar, 0, 1, 8, 1, x, 2 + y, 8, -2 + height);
	ctx.drawImage(img.gui_scroll_bar, 0, 7, 8, 1, x, (y + height - 1), 8, 1);

	draw("scroll_bar", x, y + (height - 8) * p)

	//デバッグ
	if (debug.visible) draw_text("p:" + p, 128, 32);
}
/**
 * 
 * @param {string[]} array テキストの配列
 * @param {string|undefined} objname さらに参照するオブジェクト
 * @param {number} x 描画するx
 * @param {number} y 描画するy
 * @param {number} w テキストの幅
 * @param {number} h テキストの縦幅
 * @param {number} s 行間
 * @param {number} lines 描画するの行数 
 * @param {number} scroll スクロールのY
 * @param {object} func 実行する関数(引数に行の数が入る)
 */
function draw_gui_items(array, objname = false, x, y, w = Infinity, h = Infinity, s = 8, lines = Infinity, scroll = 0, func = () => { }) {
	/**
	 * @param {number} i 参照する配列のindex
	 * @param {number} dx 描画する行
	 */
	for (let i = scroll, dx = 0; dx < lines; i++, dx++) {
		//console.log(array.length,i,array[i])
		if (array.length <= i) return;//範囲ごえ検知

		if (!objname) draw_text(get_text(array[i]), x, dx * s + y, w, h);
		if (objname) draw_text(get_text(array[i][objname]), x, dx * s + y, w, h);
		func(i, dx);
	}
}

function draw_loading() {
	draw_prompt(15 * 16, 160, 8 * 8, 8, img.gui_prompt)
	draw_text("loading…", 15 * 16, 160, 32, 8)
}

function gui_proc() {

	if (game.saveloadingnow) return;

	if (IsLoading) {
		gui_close();
		return;
	}

	if (MapNameText.active) {
		MapNameText.time++;
		if (240 <= MapNameText.time) MapNameText.active = false;
	}

	//メッセージ消す
	if (key_groups_down.confirm && gui.message.cool_down < 0) gui.message.next();
	gui.message.cool_down--;

	//メニュー表示 非表示
	if (key_groups_down.menu) {
		if (menu.visible) {
			gui_close("menu");
		} else {
			gui_open("menu");
		}
	}

	//承認ウィンドウ
	if (gui.confirm.visible) {
		if (key_groups_down.right) gui.confirm.selected = false;
		if (key_groups_down.left) gui.confirm.selected = true;

		if (key_groups_down.down || key_groups_down.confirm) {
			if (gui.confirm.selected) gui.confirm.func_ok();
			if (!gui.confirm.selected) gui.confirm.func_cancel();
			gui_close("confirm");
			return;
		}
		if (key_groups_down.cancel || key_groups_down.menu) {
			gui.confirm.func_cancel();
			gui_close("confirm");
			return;
		}
		return;
	}

	let scroll_limit = Infinity;
	let select_limit = Infinity;

	//party
	if (menu.tab === 0) {
		scroll_limit = Infinity;

	}
	//items
	if (menu.tab === 1) {
		scroll_limit = player.items.length - 8;
		//アイテム使用判定
		item_use_proc();
	}
	//equip
	if (menu.tab === 2) {
		scroll_limit = Infinity;

	}
	//config
	if (menu.tab === 3) {
		scroll_limit = Infinity;

		let itemselect = 0;
		if (menu.item_select[1] != undefined) itemselect = menu.item_select[1];
		let configs = loadedjson.configs[game.config_name[itemselect]];

		if (menu.select_length == 1) select_limit = 7;
		if (menu.select_length == 2) select_limit = game.config_icons.length - 1;

		if (menu.select_length == 3 && menu.item_select[0] == 0) select_limit = configs.length - 1;
		if (menu.select_length == 3 && menu.item_select[0] == 1) select_limit = game.gui_system_data_items.length - 1;

		//数値編集の矢印
		menu.config_num.timer += menu.config_num.mode;
		//↓閉じるときは速さが２倍
		if (menu.config_num.mode == -1) menu.config_num.timer += menu.config_num.mode;

		//コンフィグ変更
		//　メニュー表示     カーソル下選択        systemタブ選択　　　　タブ右選択　　　　　　　　　　　　　configタブ選択
		if (menu.visible && !menu.tab_select && menu.tab == 3 && menu.select_length == 3 && menu.item_select[0] == 0) {//configタブ
			if (menu.item_select[2] <= configs.length - 1) {//範囲内選択

				let conf = configs[menu.item_select[2]];

				if (key_groups_down.confirm || key_groups_down.right) {//選択キー処理
					if (conf.type === "bool") {
						config[conf.variable] = !config[conf.variable];//切り替え
						if (config[conf.variable]) Function(conf.ONfunc)();//関数実行
						if (!config[conf.variable]) Function(conf.OFFfunc)();//関数実行
					}

					if (conf.type === "number") {
						menu.mode = "ConfigNumEdit"
						{
							menu.config_num.mode = 1;
							menu.config_num.timer = 0;
						}
						return;
					}
				}
				if (key_groups_down.cancel || key_groups_down.left) {//キャンセルキー処理
					if (menu.mode === "ConfigNumEdit") {
						menu.mode = "Default"
						{
							menu.config_num.mode = -1;
							menu.config_num.timer = 100;
						}
						return;
					}
				}
				if (menu.mode === "ConfigNumEdit") {//数値編集
					let range = { "min": -Infinity, "max": Infinity };
					if (conf.range != undefined) range = { "min": conf.range[0], "max": conf.range[1] };

					if (key_groups_hold.up && config[conf.variable] < range.max) config[conf.variable]++;
					if (key_groups_hold.down && config[conf.variable] > range.min) config[conf.variable]--;
				}
				//console.log(conf)
			}
		}
		//データ
		if (menu.select_length == 2 && menu.item_select[0] == 1) save_load_proc();

		//system左右カーソル移動
		if ((key_groups_down.left || key_groups_down.cancel /*|| (key_groups_down.up && menu.item_select[menu.select_length - 1] == 0)*/) && !menu.tab_select) {
			if (menu.select_length === 3 && menu.item_select[0] == 0) {//config限定

				menu.select_length = 2;

				PlaySound("select", "gui");
				return;
			}
			if (menu.select_length === 2) {

				menu.select_length = 1;

				PlaySound("select", "gui");
				return;
			}
		}
		if ((key_groups_down.right || key_groups_down.confirm) && !menu.tab_select) {
			if (menu.select_length === 1) {
				menu.select_length = 2;

				PlaySound("select", "gui");
				return;
			}
			if (menu.select_length === 2 && menu.item_select[0] == 0) {//config限定
				menu.select_length = 3;

				PlaySound("select", "gui");
				return;
			}
		}

	}

	//メニュー動作
	if (menu.visible && !menu.role_select && menu.mode === "Default") {
		let count = game.gui_item_count[menu.tab];

		//アイテムセレクト
		let l = menu.select_length - 1;
		while (menu.select_length > menu.item_select.length) menu.item_select.push(0);
		menu.item_select.splice(menu.select_length, Infinity);
		while (menu.select_length > menu.scroll.length) menu.scroll.push(0);
		menu.scroll.splice(menu.select_length, Infinity);

		if (menu.tab_select) {//カーソル上
			//タブの動き
			if (key_groups_down.right && menu.tab < 3) {//タブ右に動かす
				menu.tab++;
				PlaySound("select", "gui");
			}
			if (key_groups_down.left && menu.tab > 0) {//タブ左に動かす
				menu.tab--;
				PlaySound("select", "gui");
			}

			//　　　　　　　　　　　　　　　　　　　　　　　　　      　　　アイテムタブ　　設定タブ　　　　
			if ((key_groups_down.confirm || key_groups_down.down) && (menu.tab == 1 || menu.tab == 3)) {
				menu.tab_select = false;//カーソルを下(タブじゃない)にずらす
				PlaySound("select", "gui");
			}

			//メニュー閉じる
			if (key_groups_down.cancel) {
				menu.visible = false;//Xキーで閉じる
				PlaySound("select", "gui");
			}
			return;

		} else {//カーソル下
			//カーソルを上にずらす
			if (key_groups_down.up && menu.item_select[l] == 0 && menu.select_length == 1) {
				menu.tab_select = true;//カーソルを上(タブ)にずらす
				PlaySound("select", "gui");
			}
			//if (key_groups_down.up && menu.item_select[l] == 0 && menu.select_length==2) menu.select_length==2=false;

			//アイテムセレクト上下
			if (key_groups_hold.down/* && menu.scroll[l] <= count*/ && menu.item_select[l] < select_limit) menu.item_select[l]++;
			if (key_groups_hold.up && menu.scroll[l] >= 0) menu.item_select[l]--;

			//サウンド
			if (key_groups_hold.down /*&& menu.scroll[l] <= count*/) PlaySound("select", "gui");
			if (key_groups_hold.up && menu.scroll[l] >= 0) PlaySound("select", "gui");

			//スクロール
			if (menu.item_select[l] - menu.scroll[l] > count && menu.scroll[l] < scroll_limit) menu.scroll[l]++;

			if (menu.item_select[l] - menu.scroll[l] < 0 && menu.scroll[l] > 0) menu.scroll[l]--;

			//範囲ごえ検知&修正
			if (menu.item_select[l] - menu.scroll[l] > count) menu.item_select[l]--;

			if (menu.item_select[l] - menu.scroll[l] < 0) menu.item_select[l]++;


			//カーソルを上にずらす(閉じる)
			if (key_groups_down.cancel) {
				menu.item_select[l] = 0;
				menu.tab_select = true;

				PlaySound("select", "gui");
			}
			return;
		}
	}

	if (menu.role_select) {
		//誰が使うか閉じる
		if (key_groups_down.cancel || key_groups_down.left) {
			menu.role_select = false;

			return;
		}
	}

}

function title_gui_proc() {
	if (key_groups_down.up && title_gui.item_select > 0) title_gui.item_select--;
	if (key_groups_down.down && title_gui.item_select < game.title_items.length - 1) title_gui.item_select++;

	if (key_groups_down.confirm || key_groups_down.right) {
		if (title_gui.item_select == 0) game.NewGame();

		if (title_gui.item_select == 1) game.LoadGame();
	}
}

function draw_loading_screen() {

	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, ScreenWidth, ScreenHeight);
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";
	drawTextFont(`loading:${Math.floor(getAllLoadedCount() / getAllWillLoadLength() * 100)}%\nImage: ${load.jsoncount}/${willLoadJson.length}\nJson: ${load.imgcount}/${willLoadImg.length}\nSound: ${load.soundcount}/${willLoadSounds.length}`, ScreenWidth / 2, ScreenHeight / 2, { color: game.colorPallet.white, align: "center" });

	let progressBar = new Rect((ScreenWidth - 128) / 2, ScreenHeight - 16, 128, 8);

	ctx.strokeRect(progressBar.x, progressBar.y, progressBar.w, progressBar.h);
	ctx.fillRect(progressBar.x + 2, progressBar.y + 2, getAllLoadedCount() / getAllWillLoadLength() * (progressBar.w - 4), progressBar.h - 4);
}

class JsonUIDraw {
	constructor(UIContent, UIIndex) {
		/*for (const key of Object.keys(UIContent)) {
			this[key] = UIContent[key];
		}*/


		let UIData = JsonUIOpen[UIIndex].data[UIContent.id];

		const offset = new Vec2(...UIContent.offset);
		const offset_type = new Vec2(...UIContent.offset_type ?? []);
		let dx = offset.x + GetOffsetScreen(offset_type.x, offset_type.y).x + JsonUIOpen[UIIndex].pos.x
		let dy = offset.y + GetOffsetScreen(offset_type.x, offset_type.y).y + JsonUIOpen[UIIndex].pos.y
		this.Offset = new Vec2(dx, dy);
		this.CursorOffset = new Vec2(...UIContent.CursorOffset ?? [-8, 0]);
		this.size = new Vec2(...UIContent.size);



		if (UIContent.animIn !== undefined && (JsonUIOpen[UIIndex].ShouldOpenAnim(UIIndex) || JsonUIOpen[UIIndex].opened)) {
			let anim = -UIContent.animIn.size;
			if (UIContent.animIn.ease === "easeOutExpo") anim += easeOutExpo((JsonUIOpen[UIIndex].activeTime - UIContent.animIn.offset) / UIContent.animIn.length) * UIContent.animIn.size;
			if (UIContent.animIn.ease === "easeInExpo") anim += easeInExpo((JsonUIOpen[UIIndex].activeTime - UIContent.animIn.offset) / UIContent.animIn.length) * UIContent.animIn.size;

			if (UIContent.animOut.type === "offsetx") this.Offset.x += Math.round(anim);
			if (UIContent.animOut.type === "offsety") this.Offset.y += Math.round(anim);
		}
		if (UIContent.animOut !== undefined && (JsonUIOpen[UIIndex].ShouldCloseAnim(UIIndex) || JsonUIOpen[UIIndex].closed)) {
			let anim = 0;
			if (UIContent.animOut.ease === "easeOutExpo") anim += easeOutExpo((JsonUIOpen[UIIndex].inactiveTime - UIContent.animOut.offset) / UIContent.animOut.length) * UIContent.animOut.size;
			if (UIContent.animOut.ease === "easeInExpo") anim += easeInExpo((JsonUIOpen[UIIndex].inactiveTime - UIContent.animOut.offset) / UIContent.animOut.length) * UIContent.animOut.size;

			if (UIContent.animOut.type === "offsetx") this.Offset.x += Math.round(anim);
			if (UIContent.animOut.type === "offsety") this.Offset.y += Math.round(anim);
		}
	}
}

function GetOffsetScreen(textx, texty) {
	let x, y;
	switch (textx) {
		case "left":
			x = 0;
			break;
		case "right":
			x = ScreenWidth;
			break;
		default:
			x = 0;
			break;
	}
	switch (texty) {
		case "top":
			y = 0;
			break;
		case "bottom":
			y = ScreenHeight;
			break;
		default:
			y = 0;
			break;
	}
	return new Vec2(x, y);
}

function jsonui_default_proc(...objs) {

	for (let obj of objs) {
		if (obj?.default !== undefined) {
			obj = Object.assign(obj, loadedjson.jsonui._default[obj.default]);
			delete obj.default;
		}

	}
}

function jsonui_cursor(UIID, UIIndex) {

	let UIGroup = loadedjson.jsonui[UIID];
	let UIContent = UIGroup[JsonUIOpen[UIIndex].select];
	let Draw = new JsonUIDraw(UIContent, UIIndex);
	let data = JsonUIOpen[UIIndex].data[UIContent.id];
	//console.log(Draw.Offset);
	if (!UIContent.ShowCursor) return;

	switch (UIContent.type) {
		case "custom":
			switch (UIContent.renderer) {
				case "items":
				case "roles":
				case "UIOpen":
				case "config":
					JsonUICursor.push(new Vec2(Draw.Offset.x + Draw.CursorOffset.x, Draw.Offset.y + Draw.CursorOffset.y + data.select * 16 - data.scroll));
					break;
				default:
					JsonUICursor.push(new Vec2(Draw.Offset.x + Draw.CursorOffset.x, Draw.Offset.y + Draw.CursorOffset.y));
					break;
			}
			break;
		default:
			JsonUICursor.push(new Vec2(Draw.Offset.x + Draw.CursorOffset.x, Draw.Offset.y + Draw.CursorOffset.y));
			break;
	}
}

function jsonui_draw(UIID, UIIndex) {
	for (const UIContent of loadedjson.jsonui[UIID]) {
		jsonui_default_proc(UIContent, UIContent.animIn, UIContent.animOut, UIContent.trans);

		let Draw = new JsonUIDraw(UIContent, UIIndex);
		let UIData = JsonUIOpen[UIIndex];

		switch (UIContent.type) {
			case "text":
				drawTextFont(jsonui_variable(get_text(UIContent.text), undefined, UIContent, undefined, UIIndex), Draw.Offset.x, Draw.Offset.y, { color: game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
				break;
			case "button":
				draw_prompt(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
				drawTextFont(get_text(UIContent.text), Draw.Offset.x, Draw.Offset.y, { color: game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
				break;
			case "tab":
				draw_prompt(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
				drawTextFont(get_text(UIContent.text), Draw.Offset.x, Draw.Offset.y, { color: game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
				break;
			case "rectangle":
				if (UIContent.type === "rectangle") draw_prompt(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
				break;
			case "custom":
				if (UIContent.type === "custom") jsonui_custom_renderer(UIID, UIIndex, Draw, UIContent, UIData);
				break;
		}
	}
}

function jsonui_main() {
	for (let UIIndex in JsonUIOpen) {
		let UIData = JsonUIOpen[UIIndex];
		if (UIData.closed) JsonUIOpen.splice(UIIndex, 1)
	}
	if (JsonUIOpen.length !== 0) jsonui_select(JsonUIOpen[JsonUIOpen.length - 1].type, JsonUIOpen.length - 1);


	let cursor = new Array();
	for (let UIIndex in JsonUIOpen) {
		let UIData = JsonUIOpen[UIIndex];

		UIData.ActiveChangeDetect(UIIndex);
		if (UIData.state == 1) UIData.openTime++;
		if (UIData.state == -1) UIData.closeTime++;
		if (UIData.ShouldOpenAnim(UIIndex)) UIData.activeTime++;
		if (UIData.ShouldCloseAnim(UIIndex)) UIData.inactiveTime++;

		jsonui_draw(UIData.type, UIIndex);
		jsonui_cursor(UIData.type, UIIndex, cursor);

		//if(UIIndex == 1 )console.table([UIData.state == 1 && jsonui_active(UIIndex),UIData.state == -1 || !jsonui_active(UIIndex)])

		if (UIData.openTime >= UIData.openDelay) UIData.opened = true;
		if (UIData.closeTime >= UIData.closeDelay) UIData.closed = true;
	}
	JsonUICursor.draw();

}

function jsonui_active(UIIndex) {
	//必要かわからん
	//let UIGroup = loadedjson.jsonui[UIID];
	//let UIContent = UIGroup[JsonUIOpen[UIIndex].select];
	//let UIData = JsonUIOpen[UIIndex].data[UIContent.id];

	return JsonUIOpen.length - 1 == UIIndex;
}

function jsonui_variable(rawvalue, UIGroup, UIContent, UIData, UIIndex) {
	if (typeof rawvalue !== "string") return rawvalue;
	let values = rawvalue.split(",");
	let value = values[0];

	//console.log(values)

	for (let key of Object.keys(loadedjson.jsonui?.variable ?? {})) {
		let variable = loadedjson.jsonui.variable[key];
		if (value === key) return variable;
	}

	switch (value) {
		case "$TabSelectID":
			return MenuTabSelect;
			break;
		case "$SelectID":
			return JsonUIOpen[UIIndex].select;
			break;
		case "$SelectScrollID":
			return UIData.select;
			break;
		case "$selectUI":
			return Object.keys(loadedjson.jsonui)[UIData.select];
			break;
		case "$itemIndex":
			return UIData.data[UIContent.id].select;
			break;
		case "$fps":
			return fps;
			break;
		case "$getData":
			return UIData.data[values[1]];
			break;
		default:
			return value;
			break;
	}
}


function getJsonuiSelect(UIIndex = JsonUIOpen.length - 1) {
	return JsonUIOpen[UIIndex].select;
}

function jsonui_select(UIID, UIIndex) {
	let UIGroup = loadedjson.jsonui[UIID];
	let UIContent = UIGroup[JsonUIOpen[UIIndex].select];
	let UIData = JsonUIOpen[UIIndex];

	let trigger = (array) => {
		for (const trans of array) {
			transition(...trans);
		}
	}

	let transition = (mode, ...param) => {
		for (let i in param) {
			param[i] = jsonui_variable(param[i], UIGroup, UIContent, UIData, UIIndex);
		}

		switch (mode) {
			case "select_abs":
				JsonUIOpen[UIIndex].select = param[0];
				break;
			case "select_rel":
				JsonUIOpen[UIIndex].select += param[0];
				break;
			case "open":
				jsonui_open(...param);
				break;
			case "close":
				JsonUIOpen[UIIndex].close();
				break;
			case "closeAll":
				JsonUIOpen.forEach((element, index) => {
					if (index >= param[0]) element.close();
				});
				break;
			case "UseItem":
				item_use_proc(...param);
				break;
			case "writeGrovalData":
				JsonUIOpen[UIIndex].dataGroval[param[0]] = param[1];
				break;
			case "data":
				JsonUIOpen[UIIndex].data[param[0]] = param[1];
				break;
		}
	}

	if (UIContent.trans !== undefined) {
		if (UIContent.trans.tickBefore !== undefined) trigger(UIContent.trans.tickBefore);
		for (let transkey of Object.keys(key_groups).filter((key) => key in UIContent.trans)) {
			if (key_groups_hold[transkey]) trigger(UIContent.trans[transkey]);
		}
		if (UIContent.trans.tickAfter !== undefined) trigger(UIContent.trans.tickAfter);

	}
	if (UIContent.type === "custom" ? game.UICustomScrollable.includes(UIContent?.renderer) : false) {
		let data = JsonUIOpen[UIIndex].data[UIContent.id];
		if (true) {
			if (key_groups_hold.down && data.select < player.items.length - 1) data.select++
			if (key_groups_hold.up && data.select > 0) data.select--
			if (key_groups_hold.down || key_groups_hold.up) PlaySound("select", "gui");

			if (data.select * 16 - data.scroll <= 0)
				data.scroll += Math.floor((data.select * 16 - data.scroll) / 2);
			if (data.select * 16 - data.scroll + 16 > new Vec2(...UIContent.size).y)
				data.scroll += Math.ceil((data.select * 16 - data.scroll + 16 - new Vec2(...UIContent.size).y) / 2);
		} else {
			if (key_groups_hold.down) data.scroll++;
			if (key_groups_hold.up) data.scroll--;
		}
	}

	if (UIID === "menu") MenuTabSelect = JsonUIOpen[UIIndex].select;
}

function jsonui_open(type, DefaultX, DefaultY, DefaultSelectID, param) {
	JsonUIOpen.push(new JsonUI(type, DefaultX, DefaultY, DefaultSelectID, param));
}

function jsonui_custom_renderer(UIID, UIIndex, Draw, UIContent, UIData) {
	let items;
	// items代入
	switch (UIContent.renderer) {
		case "items":
			items = player.items;
			break;
		case "roles":
		case "hud_hp":
			items = players;
			break;
		case "UIOpen":
			items = Object.keys(loadedjson.jsonui);
			break;
		case "config":
			items = loadedjson.configs[UIData.data.tab] ?? [];
			break;
	}
	// 描画いろいろ
	switch (UIContent.renderer) {
		case "items":
		case "roles":
		case "hud_hp":
		case "UIOpen":
		case "config":
			let scroll = JsonUIOpen[UIIndex].data[UIContent.id].scroll
			for (let i in items.slice(Math.floor(scroll / 16), Math.floor(scroll / 16) + Math.ceil(Draw.size.y / 16 + 1))) {
				let DrawOffset = i * 16 - scroll % 16;
				let itemIndex = Number(i) + Math.floor(scroll / 16);
				let item = items[itemIndex];

				for (const key of Object.keys(UIContent.items)) {
					let itemOffset = new Vec2(...UIContent.items[key].offset);
					let itemSize = new Vec2(...UIContent.items[key].size);

					let ObjOut = new Object();
					ObjOut.top = Math.min(DrawOffset + itemOffset.y, 0);
					ObjOut.bottom = Math.min(DrawOffset + itemOffset.y + itemSize.y, Draw.size.y) - DrawOffset - itemOffset.y;

					if (-ObjOut.top >= itemSize.y) continue;
					if (-ObjOut.bottom > 0) continue;

					//let draw_text_templ = (text, font = "", AddX = 0, AddY = 0) => draw_text(text, Math.min(itemOffset.x + AddX, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset + AddY, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top, undefined, undefined, font, -1, 0, -ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top);
					let draw_text_templ = (text, color = game.colorPallet.black, align = "start", AddX = 0, AddY = 0) => {
						const TextX = itemOffset.x + Draw.Offset.x + AddX;
						const TextY = itemOffset.y + Draw.Offset.y + AddY + DrawOffset;
						const StartX = 0
						const StartY = -DrawOffset - itemOffset.y
						const EndX = Draw.size.x - itemOffset.x - AddX;
						const EndY = Draw.size.y - itemOffset.y - AddY - DrawOffset;

						drawTextFont(text, TextX, TextY, { color: color, align: align, startX: StartX, startY: StartY, endX: EndX, endY: EndY });
						//if (key_groups_down.attack && text == "egg") console.table([text, TextX, TextY, StartX, StartY, EndX, EndY])
					}

					switch (UIContent.items[key].tag) {
						case "atlas_img":
							drawImg(img.items, getTileAtlasXY(item.id, 0), getTileAtlasXY(item.id, 1) - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
							break;
						case "text":
							draw_text_templ(get_text(UIContent.items[key].text));
							break;
						case "ttftext":
							draw_text_ttf(get_text(UIContent.items[key].text));
							break;
						case "ItemRender":
							drawImg(img.items, getTileAtlasXY(get_item_data(itemIndex, "icon"), 0), getTileAtlasXY(get_item_data(itemIndex, "icon"), 1) - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
							break;
						case "ItemName":
							draw_text_templ(get_text("item." + get_item_data(itemIndex, "name") + ".name"));
							break;
						case "ConfigName":
							//console.log(UIData.data.tab)
							draw_text_templ(item.name ?? "");
							break;
						case "ItemCount":
							draw_text_templ(item.count, game.colorPallet.magenta, "start");
							break;
						case "ItemEfficacy":
							if (get_item_data(itemIndex, "efficacy") == "health") {
								AtlasDrawImage("gui_item_text_health", Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top, 0, -ObjOut.top, 0, ObjOut.bottom + ObjOut.top - itemSize.y);
								draw_text_templ(String(get_item_data(itemIndex, "heal_power")), "start", "black", 32, 0);
							}
							break;
						case "debugtest":
							draw_text_templ(`${ObjOut.top},${ObjOut.bottom}`, "_purple");
							break;
						case "role_icon":
							drawImg(img.gui, players[itemIndex].id * 8, 48 - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
							break;
						case "role_hp":
							draw_text_templ(players[itemIndex].hp);
							break;
						case "img":
						case "image":
							AtlasDrawImage(UIContent.items[key].img, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top, 0, -ObjOut.top, 0, ObjOut.bottom + ObjOut.top - itemSize.y);
							break;
						case "uilist":
							draw_text_templ(item, "_purple");
							break;
					}
				}
			}
			break;
	}
}

function gui_close(...input) {
	for (let name of input) {
		switch (name) {
			case "menu":
				menu.visible = false;
				//誰が使いますか画面も閉じる
				menu.role_select = false;

				menu.item_select.fill(0);
				menu.select_length = 1;
				menu.role_select = 0;
				menu.mode = "Default";
				menu.tab_select = true;
				break;
			case "message":
				gui.message.visible = false;
				break;
			case "confirm":
				gui.confirm.visible = false;
				break;
			case "whouse":
				menu.role_select = false;
				break;

		}
	}
}

function gui_open(...input) {
	for (let name of input) {
		switch (name) {
			case "menu":
				menu.visible = true;
				menu.CursorOldPos.x = 0;
				menu.CursorOldPos.y = 24;
				break;
			case "message":
				gui.message.visible = true;
				gui.message.text = "text";
				break;
			case "confirm":
				gui.confirm.visible = true;
				break;
			case "whouse":
				menu.role_select = true;
				break;

		}
	}
}


function MapNameTextActive(text = "DefaultText") {
	MapNameText.text = text;
	MapNameText.active = true;
	MapNameText.time = 0;
}

function canPlayerMoveForOpenGui() {
	/*
	if (gui.message.visible) return false;
	if (menu.visible) return false;
	if (gui.confirm.visible) return false;

	return true;
	*/

	return JsonUIOpen.length === 0 ? true : JsonUIOpen[JsonUIOpen.length - 1].CanMovePlayer;
}

function item_use_proc() {
	if (menu.visible && !menu.tab_select && (key_groups_down.confirm || key_groups_down.right) && menu.item_select[0] <= player.items.length - 1 && menu.tab == 1) {

		//誰が使いますか画面を出す
		if (get_item_data(menu.item_select[0], "role_select") && !menu.role_select) {
			menu.role_select = true;
			return;
		}

		//アイテム使用
		if (!get_item_data(menu.item_select[0], "role_select") || menu.role_select) {
			if (!get_item_data(menu.item_select[0], "role_select")) menu.who_use = 0;

			item_use(menu.item_select[0]);
		}
		menu.role_select = false;

		//アイテムの数を減らす
		player.items[menu.item_select[0]].count--;
		//アイテムの数が0だったら消す
		if (player.items[menu.item_select[0]].count == 0) player.items.splice(menu.item_select[0], 1);
	}
}

function item_use_proc(i, isRoleSelect, windowPos) {
	if (i > player.items.length - 1) return false;

	//誰が使いますか画面を出す
	if (get_item_data(i, "role_select") && !isRoleSelect) {
		jsonui_open("item_role_select", 128, 64, undefined, i)
		return;
	}

	//アイテム使用
	if (!get_item_data(i, "role_select") || isRoleSelect) {
		if (!get_item_data(i, "role_select")) menu.who_use = 0;

		item_use(i);
	}
	//menu.role_select = false;

	//アイテムの数を減らす
	player.items[i].count--;
	//アイテムの数が0だったら消す
	if (player.items[i].count == 0) player.items.splice(i, 1);

	return true;

}

async function save_load_proc() {
	if (menu.visible && !menu.tab_select && (key_groups_down.confirm || key_groups_down.right) && menu.tab == 3 && menu.select_length == 2) {
		game.saveloadingnow = true;
		let result;
		/*
		if (menu.item_select[1] === 0) result = await savedatawrite(true);
		if (menu.item_select[1] === 1) result = await savedataload(true)
		if (menu.item_select[1] === 2) result = await savepathreset(true);
		if (menu.item_select[1] === 3) result = await savedatawrite(false)
		if (menu.item_select[1] === 4) result = await savedataload(false);*/

		switch (menu.item_select[1]) {
			case 0:
				await savepathreset();
				result = await savepathselect();
				break;
			case 1:
				result = await savedatawrite();
				break;
			case 2:
				result = await savedataload();
				break;

		}

		//failed
		if (result == undefined && menu.item_select[1] !== 2) {
			game.saveloadfaliedtime = timer;
			game.saveloadfaliedtype = menu.item_select[1];
		}
		if (result != undefined) {
			game.saveloadsuccesstime = timer;
			game.saveloadsuccesstype = menu.item_select[1];
		}

		game.saveloadingnow = false;
	}
}

function item_use(i) {//i = itemselectINDEX

	if (get_item_data(i, "efficacy") == "health") player_heal(menu.who_use, get_item_data(i, "heal_power"));
}

function configReset() {

	//コンフィグ初期化
	for (const configKey of Object.keys(loadedjson.configs)) {
		const configs = loadedjson.configs[configKey];
		//console.table(configs)
		for (const config of configs) {
			game.config[config.variable] = config.default;
		}
	}
}


//あざす https://www.w3schools.com/graphics/game_sound.asp
function PlaySound(src = "select", group = "other", DoNotStop = false) {
	if (config[game.soundGroupsConfig[group]]) sounds[src].play(DoNotStop)
}

function font2x(Glyph) {
	let fontDataArray = new Array(16);
	for (let line = 0; line < 8; line++) {
		let fontDataLine = new Array(16);

		Glyph[line].toString(2).split("").forEach((element, index) => {
			fontDataLine[index * 2] = element;
			fontDataLine[index * 2 + 1] = element;
		});

		let lineResult = parseInt(fontDataLine.join(''), 2);
		fontDataArray[line * 2] = lineResult;
		fontDataArray[line * 2 + 1] = lineResult;
	}
	console.log(fontDataArray)
	return fontDataArray;
}

function font2xmain() {
	let fontData = JSON.parse(JSON.stringify(loadedjson.rawfont))

	for (const key of Object.keys(fontData).filter((word) => word == String(Number(word)))) {
		let Obj = fontData[key];

		fontData[key] = font2x(Obj)
	}
	return JSON.stringify(fontData);

}

//AIマジ感謝
function isCharacterSupportedByFont(character, fontFamily) {
	// canvas要素を動的に作成
	//var canvas = document.createElement('canvas');
	//var context = canvas.getContext('2d');

	// 比較用のデフォルトフォントを指定
	var defaultFont = '10px sans-serif';

	// カスタムフォントを指定
	var customFont = '10px ' + fontFamily;

	// デフォルトフォントでの描画と測定
	ctx.font = defaultFont;
	var defaultWidth = ctx.measureText(character).width;

	// カスタムフォントでの描画と測定
	ctx.font = customFont;
	var customWidth = ctx.measureText(character).width;

	// 幅が異なるかどうかを比較
	return customWidth !== defaultWidth;
}

function replaceUnsupportedCharacters(text, fontFamily) {
	if (!fontIsloaded(fontFamily)) return text;
	// 各文字をチェックして、対応していないものを空白に置き換える
	var result = '';
	for (var i = 0; i < text.length; i++) {
		if (isCharacterSupportedByFont(text[i], fontFamily)) {
			result += text[i];
		} else {
			result += '?'; // 対応していない文字を空白に置き換える
		}
	}
	return result;
}

function fontIsloaded(fontFamily) {
	// これでフォントが読み込みされているかを判定しています //
	// 読み込みされていない場合はfalseを返します           //
	// なんか動くのでヨシ!                               //ずれんな
	return isCharacterSupportedByFont("a", fontFamily);
}

function item_use_proc(i, isRoleSelect, windowPos) {
	if (i > player.items.length - 1) return false;

	//誰が使いますか画面を出す
	if (get_item_data(i, "role_select") && !isRoleSelect) {
		jsonui_open("item_role_select", 128, 64, undefined, i)
		return;
	}

	//アイテム使用
	if (!get_item_data(i, "role_select") || isRoleSelect) {
		if (!get_item_data(i, "role_select")) menu.who_use = 0;

		item_use(i);
	}
	//menu.role_select = false;

	//アイテムの数を減らす
	player.items[i].count--;
	//アイテムの数が0だったら消す
	if (player.items[i].count == 0) player.items.splice(i, 1);

	return true;

}

async function save_load_proc() {
	if (menu.visible && !menu.tab_select && (key_groups_down.confirm || key_groups_down.right) && menu.tab == 3 && menu.select_length == 2) {
		game.saveloadingnow = true;
		let result;
		/*
		if (menu.item_select[1] === 0) result = await savedatawrite(true);
		if (menu.item_select[1] === 1) result = await savedataload(true)
		if (menu.item_select[1] === 2) result = await savepathreset(true);
		if (menu.item_select[1] === 3) result = await savedatawrite(false)
		if (menu.item_select[1] === 4) result = await savedataload(false);*/

		switch (menu.item_select[1]) {
			case 0:
				await savepathreset();
				result = await savepathselect();
				break;
			case 1:
				result = await savedatawrite();
				break;
			case 2:
				result = await savedataload();
				break;

		}

		//failed
		if (result == undefined && menu.item_select[1] !== 2) {
			game.saveloadfaliedtime = timer;
			game.saveloadfaliedtype = menu.item_select[1];
		}
		if (result != undefined) {
			game.saveloadsuccesstime = timer;
			game.saveloadsuccesstype = menu.item_select[1];
		}

		game.saveloadingnow = false;
	}
}

function item_use(i) {//i = itemselectINDEX

	if (get_item_data(i, "efficacy") == "health") player_heal(menu.who_use, get_item_data(i, "heal_power"));
}



//あざす https://www.w3schools.com/graphics/game_sound.asp
function PlaySound(src = "select", group = "other", DoNotStop = false) {
	if (config[game.soundGroupsConfig[group]]) sounds[src].play(DoNotStop)
}

function font2x(Glyph) {
	let fontDataArray = new Array(16);
	for (let line = 0; line < 8; line++) {
		let fontDataLine = new Array(16);

		Glyph[line].toString(2).split("").forEach((element, index) => {
			fontDataLine[index * 2] = element;
			fontDataLine[index * 2 + 1] = element;
		});

		let lineResult = parseInt(fontDataLine.join(''), 2);
		fontDataArray[line * 2] = lineResult;
		fontDataArray[line * 2 + 1] = lineResult;
	}
	console.log(fontDataArray)
	return fontDataArray;
}

function font2xmain() {
	let fontData = JSON.parse(JSON.stringify(loadedjson.rawfont))

	for (const key of Object.keys(fontData).filter((word) => word == String(Number(word)))) {
		let Obj = fontData[key];

		fontData[key] = font2x(Obj)
	}
	return JSON.stringify(fontData);

}

//AIマジ感謝
function isCharacterSupportedByFont(character, fontFamily) {
	// canvas要素を動的に作成
	//var canvas = document.createElement('canvas');
	//var context = canvas.getContext('2d');

	// 比較用のデフォルトフォントを指定
	var defaultFont = '10px sans-serif';

	// カスタムフォントを指定
	var customFont = '10px ' + fontFamily;

	// デフォルトフォントでの描画と測定
	ctx.font = defaultFont;
	var defaultWidth = ctx.measureText(character).width;

	// カスタムフォントでの描画と測定
	ctx.font = customFont;
	var customWidth = ctx.measureText(character).width;

	// 幅が異なるかどうかを比較
	return customWidth !== defaultWidth;
}

function replaceUnsupportedCharacters(text, fontFamily) {
	if (!fontIsloaded(fontFamily)) return text;
	// 各文字をチェックして、対応していないものを空白に置き換える
	var result = '';
	for (var i = 0; i < text.length; i++) {
		if (isCharacterSupportedByFont(text[i], fontFamily)) {
			result += text[i];
		} else {
			result += '?'; // 対応していない文字を空白に置き換える
		}
	}
	return result;
}

function fontIsloaded(fontFamily) {
	// これでフォントが読み込みされているかを判定しています //
	// 読み込みされていない場合はfalseを返します           //
	// なんか動くのでヨシ!                               //ずれんな
	return isCharacterSupportedByFont("a", fontFamily);
}