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
	["img/gui/tab_select.png", "gui_tab_select", true],
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
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

class Size {
	constructor(width = 0, height = 0) {
		this.w = width;
		this.h = height;
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

class Range {
	constructor(min = -Infinity, max = Infinity) {
		this.min = min;
		this.max = max;
	}
}

//config変数の作成
let config = new Array();

class Config {
	constructor(name, group, defaultValue = this.getDefaultValue(type)) {
		if (name === undefined) throw new Error("name is undefined");
		//if (type === undefined) throw new Error("type is undefined");
		if (group === undefined) throw new Error("group is undefined");


		this.name = name;
		//this.type = type;
		this.group = group;
		this.value = defaultValue;

		config.push(this);
	}
	change() {
		switch (this.type) {
			case "bool":
				this.value = !this.value;
				break;
		}
	}
	set(value) {
		switch (this.type) {
			case "bool":
				this.value = value;
				break;
		}

	}
	getDefaultValue(type) {
		switch (type) {
			case "bool":
				return false;
			case "number":
				return 0;
		}
	}
}

class ConfigBool extends Config {
	type = "bool";
}
class ConfigNum extends Config {
	type = "number";
}

function getConfigsGroup(group) {
	return config.filter(value => value.group === group);
}
function getConfig(name) {
	return config.filter(value => value.name === name)[0];
}
function hasConfig(name) {
	return !!getConfig(name);
}
function getConfigValue(name) {
	return getConfig(name).value;
}
function isConfigValue(name, value) {
	return getConfigValue(name) === value;
}
new ConfigBool("AttackRotateRock", "player", true);

new ConfigBool("AutoAim", "weapon", true);


class Item {
	constructor(ID, count = 99) {
		this.id = ID;
		this.count = count;
	}
	use(isRoleSelect, playerIndex = 0) {
		const index = PlayerControl.items.indexOf(this);
		if (index > PlayerControl.items.length - 1) return false;

		//誰が使いますか画面を出す
		if (get_item_data(index, "role_select") && !isRoleSelect) {
			jsonui_open("item_role_select", 128, 64, undefined, index)
			return;
		}

		//アイテム使用
		if (!get_item_data(index, "role_select") || isRoleSelect) {

			item_use(index, players[playerIndex]);
		}
		//menu.role_select = false;

		//アイテムの数を減らす
		this.count--;
		//アイテムの数が0だったら消す
		if (this.count == 0) PlayerControl.items.splice(index, 1);

		return true;

	}
}
function item_use(i, player) {//i = itemselectINDEX

	if (get_item_data(i, "efficacy") == "health") player.heal(menu.who_use, get_item_data(i, "heal_power"));
}

class Cam {
	static x = 0;
	static y = 0;
	static offset = {
		x: 0,
		y: 0
	};
	static tick() {

		this.x = PlayerControl.pos.x - 160 + this.offset.x + debug.camx;
		this.y = PlayerControl.pos.y - 80 + this.offset.y + debug.camy;
		if (this.x < 0) this.x = 0;
		if (this.y < 0) this.y = 0;
		if (this.x > 1280) this.x = 1280;
		if (this.y > 1420) this.y = 1420;
	}
}

class Players {
	constructor(ID = 0) {

		this.weapon = new Weapon();
		this.maxHealth = 500;
		this.health = this.maxHealth;
		this.damage_cooldown = 0;
		this.id = ID;
		this.exp = {
			exp: 0,
			lv: 0
		}
		this.alive = true;

	}
	tick() {
		this.weaponTick();
		this.deathCheck();

		this.damage_cooldown--;
	}
	weaponTick() {
		if (canPlayerMoveForOpenGui()) {
			if (key_groups_down.attack && this.weapon.time > 0)
				this.weapon.speed++;

			if (key_groups.attack && (this.weapon.time <= 0 || this.weapon.time >= 20))
				this.weapon.attack();
		}

		//剣の動作
		this.weapon.tick();
	}
	deathCheck() {
		if (this.health <= 0) {
			this.alive = false
		}
	}
	damage(damage, rx = 0, ry = 0) {

		//クールダウン判定
		if (this.damage_cooldown > 0) return false;

		//ノックバック処理
		if (typeof rx != "undefined" && typeof ry != "undefined") {
			this.knockback(rx, ry);
		}

		//ダメージ処理
		this.health -= damage;
		//クールダウン処理
		this.damage_cooldown = 5;

	}
	heal(heal) {
		this.health += heal;
		if (this.maxHealth <= this.health) this.health = this.maxHealth;
	}
	get getIndex() {
		return players.indexOf(this);
	}
	get getPosX() {
		return subplayerx(this.getIndex);
	}
	get getPosY() {
		return subplayery(this.getIndex);
	}
	draw() {
		ctx.drawImage(img.players, PlayerControl.getAnimFlame() * 16, PlayerControl.facing * 32, 16, 24, getDrawPosX(this.getPosX), getDrawPosY(this.getPosY) - 8, 16, 24);
	}
	knockback(x, y) {
		PlayerControl.speed.x += x;
		PlayerControl.speed.y += y;
	}
}

class PlayerControl {
	static pos = new Vec2();
	static speed = new Vec2();
	static mapID = "";
	static effect = new Array();
	static boat = false;
	static items = [
		new Item(0, 10),
		new Item(1, 10),
		new Item(2, 10),
		new Item(3, 10),
		new Item(1, 10)
	]
	static key = {
		up: false,
		down: false,
		right: false,
		left: false
	}

	static drawx = 0
	static drawy = 0;
	static anim = 0;
	static rotate = 0
	static facing = 0;
	static canRotate = true;
	static isMoveing = false
	static wasMoved = false;
	static moveTimer = 0;
	static movelog = new Array();

	static alive = true;
	static tick() {

		if (canPlayerMoveForOpenGui()) {
			this.moveTick();
			this.NpcTalkTick();
		}
		this.getAnimFlame()
		this.mapChangeCheck();
	}
	static moveTick() {

		//移動キー判定
		this.key.up = key_groups.up;
		this.key.down = key_groups.down;
		this.key.right = key_groups.right;
		this.key.left = key_groups.left;


		if (this.canRotate && (!key_groups.attack || !getConfigValue("AttackRotateRock"))) {
			this.facing = getFacing(this.key.up, this.key.down, this.key.right, this.key.left) ?? this.facing;
			this.rotate = getRotate(this.key.up, this.key.down, this.key.right, this.key.left) ?? this.rotate;
		}

		//移動判定
		if (this.key.up || this.key.down || this.key.right || this.key.left) {
			this.isMoveing = true;
		} else {
			this.isMoveing = false;
		}
		if (Math.abs(this.speed.x + this.speed.y) >= 1) {
			this.wasMoved = true;
		} else {
			this.wasMoved = false;
		}

		//アニメーションに使用(値を変更すると速度が変わる)
		if (this.wasMoved) this.moveTimer += 0.12;


		//上限(64)を超えたら削除
		this.movelog.splice(64, Infinity);


		//速度調整
		if (this.speed.x > 0) {
			this.speed.x = Math.floor(this.speed.x * 0.85 * 1000) / 1000;
		} else {
			this.speed.x = Math.ceil(this.speed.x * 0.85 * 1000) / 1000;
		}
		if (this.speed.y > 0) {
			this.speed.y = Math.floor(this.speed.y * 0.85 * 1000) / 1000;
		} else {
			this.speed.y = Math.ceil(this.speed.y * 0.85 * 1000) / 1000;
		}

		//速度移動
		if (this.key.up) this.speed.y -= 0.5;
		if (this.key.down) this.speed.y += 0.5;
		if (this.key.right) this.speed.x += 0.5;
		if (this.key.left) this.speed.x -= 0.5;

		//プレイヤー移動
		this.move(this.speed.x, this.speed.y, true);
	}
	static move(mvx, mvy, checkhitbox) {
		for (let i = 0; i < Math.round(Math.abs(mvx)); i++) {
			this.pos.x += Math.sign(mvx);

			if (hitbox(this.pos.x, this.pos.y) && checkhitbox) this.pos.x -= Math.sign(mvx);


			if (i > game.move_limit) break;
		}
		for (let i = 0; i < Math.round(Math.abs(mvy)); i++) {
			this.pos.y += Math.sign(mvy);

			if (hitbox(this.pos.x, this.pos.y) && checkhitbox) this.pos.y -= Math.sign(mvy);

			if (i > game.move_limit) break;
		}
	}
	static mapChangeCheck() {
		for (const i in game.map.warp) {
			let [x, y, w, h] = [game.map.warp[i].x * 16, game.map.warp[i].y * 16, game.map.warp[i].w * 16, game.map.warp[i].h * 16];
			if (isNaN(w)) w = 16; if (isNaN(h)) h = 16;

			if (hitbox_rect(x, y, w, h, this.pos.x, this.pos.y, 16, 16)) {
				let [x, y] = [this.pos.x, this.pos.y];
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
	static NpcTalkTick() {
		return;//後で直す

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
	static getAnimFlame() {
		if (this.wasMoved) {
			switch (Math.floor(this.moveTimer % 4)) {
				case 0:
					return 0;
				case 1:
					return 2;
				case 2:
					return 1;
				case 3:
					return 2;
			}
		}
		else {
			return 2;
		}
	}
}
class Weapon {
	constructor() {
		this.reset();
	}
	reset() {
		this.time = 0;
		this.pos = new Vec2();
		this.start = new Vec2();
		this.autoAim = new Vec2();
		this.rotate = new Vec2();
		this.speed = 1;
	}
	get getPlayer() {
		for (const player of players) {
			if (player.weapon == this) return player;
		}
	}
	attack() {
		this.time = 1;
		this.pos = new Vec2();
		this.start = new Vec2(this.getPlayer.getPosX, this.getPlayer.getPosY);
		this.autoAim = new Vec2();
		this.rotate = new Vec2(...game.rotate_pos[PlayerControl.rotate]);
		this.speed = 1;
	}
	tick() {
		if (this.time > 0) {

			//攻撃
			let hit_enemy = new Array();
			hit_enemy = hitbox_entity_rect(this.pos.x - 8, this.pos.y - 8, 32, 32, "Enemy");
			for (const entity of hit_enemy) {
				const facing = new Vec2(...game.facing_pos[PlayerControl.facing]);
				const knockbackPower = 2.5;
				const attackPower = 10;
				entity.damage(attackPower, facing.x * knockbackPower, facing.y * knockbackPower, true);
			}

			//岩壊す
			const layer = "map1";
			let breakTiles = hitbox_rema(this.pos.x - 8, this.pos.y - 8, 32, 32, "red", game.breakableTile, layer);
			for (const breakTile of breakTiles) {
				//console.log(breaks[0])
				if (game.breakableTileAbout[breakTile.id].breakProbability > Math.random()) {
					replaceTile(game.breakableTileAbout[breakTile.id].becomeTile, layer, breakTile.x, breakTile.y);
					replaceHitboxTile(false, breakTile.x, breakTile.y);
					splinterParticle.RockBreak.create(breakTile.x * 16 + 8, breakTile.y * 16 + 8, 8);
					PlaySound("break", "tile");
				}

				splinterParticle.RockBreak.create(breakTile.x * 16 + 8, breakTile.y * 16 + 8, 0.2);
				PlaySound("breakbit", "tile", true);
			}

			//オートエイム
			if (this.time <= 12 && (hit_enemy.length == 0 || !game.weapon_canlock) && config.weapon_auto_aiming) {
				let x = this.start.x;
				let y = this.start.y;
				if (getNearestEntityDistance(x, y, "Enemy") < 100) {
					let entity = getNearestEntity(x, y, "Enemy");
					let width = entity.size.w;
					let height = entity.size.h;
					this.autoAim.x += Math.sign((entity.pos.x + width / 2 - this.pos.x + 16) / 32) * 2;
					this.autoAim.y += Math.sign((entity.pos.y + height / 2 - this.pos.y + 16) / 32) * 2;
				}
			}
			if (this.time > 12) {
				this.autoAim.x *= 0.25;
				this.autoAim.y *= 0.25;
			}

			//剣の座標の計算
			this.pos.x = Math.floor(this.rotate.x * (Math.sin(Math.PI / 2 * this.time / 12) * 64) + this.autoAim.x + this.getPlayer.getPosX);
			this.pos.y = Math.floor(this.rotate.y * (Math.sin(Math.PI / 2 * this.time / 12) * 64) + this.autoAim.y + this.getPlayer.getPosY);

			//カウントアップ
			if (hit_enemy.length == 0 || !game.weapon_canlock) this.time += this.speed;

			//リセット
			if (this.time >= 24) this.reset()

		} else {
			this.time--;
		}
	}
	draw() {

		if (this.time <= 0) {
			let temptime = limit(this.time, -20, Infinity);

			draw_weapon(0, this.getPlayer.getPosX + Math.floor(make_slip_animation(Math.asin(-temptime / 10 / Math.PI)) * 16) - Cam.x, this.getPlayer.getPosY + make_slip_animation(Math.asin(-temptime / 10 / Math.PI)) * Math.floor(Math.sin(-this.time / 50) * 8 - 32) - Cam.y);
		} else {
			const animationSpeed = 1;
			const frameCount = 8;
			let weapon_rotation = Math.floor((this.time / animationSpeed) % frameCount);

			draw_weapon(weapon_rotation, this.pos.x - Cam.x, this.pos.y - Cam.y);
			draw_sweep(weapon_rotation, this.pos.x - Cam.x, this.pos.y - Cam.y);

		}
	}
}

class Entity {
	pos = new Vec2();
	speed = new Vec2();
	spawn = new Vec2();
	family = new Array();
	wasMoved = false;

	customType = null;
	moveSpeed = 0.25;
	size = new Size(16, 16);
	maxHealth = 20;
	health = 20;
	constructor(spawnX, spawnY) {
		this.spawn.x = spawnX;
		this.pos.x = spawnX;
		this.spawn.y = spawnY;
		this.pos.y = spawnY;

		this.spawnScript();

		entities.push(this);
	}
	tick() {
		this.move();

	}
	move() {

		//スピード調整
		if (this.speed.x > 0) {
			this.speed.x = Math.floor(this.speed.x * 0.85 * 1000) / 1000;
		} else {
			this.speed.x = Math.ceil(this.speed.x * 0.85 * 1000) / 1000;
		}
		if (this.speed.y > 0) {
			this.speed.y = Math.floor(this.speed.y * 0.85 * 1000) / 1000;
		} else {
			this.speed.y = Math.ceil(this.speed.y * 0.85 * 1000) / 1000;
		}

		//動き替える
		this.moveScript();

		//移動 当たり判定
		for (let i = 0; i < Math.round(Math.abs(this.speed.x)); i++) {
			this.pos.x += Math.sign(this.speed.x);
			if (hitbox(this.pos.x, this.pos.y)) this.pos.x -= Math.sign(this.speed.x);
			if (i > game.move_limit) break;
		}
		for (let i = 0; i < Math.round(Math.abs(this.speed.y)); i++) {
			this.pos.y += Math.sign(this.speed.y);
			if (hitbox(this.pos.x, this.pos.y)) this.pos.y -= Math.sign(this.speed.y);
			if (i > game.move_limit) break;
		}
	}
	moveScript() {

	}
	spawnScript() {
		this.addFamily("Default");
	}
	draw() {
		drawImg(img.enemy, 0, 0, 16, 16, this.pos.x - Cam.x, this.pos.y - Cam.y);
	}
	damage(damage, rx = 0, ry = 0, byPlayer = false) {
		return false;
	}
	despawn() {
		const index = entities.indexOf(this);
		entities.splice(index, 1);
	}
	get getCenterX() {
		return this.pos.x + this.size.w / 2;
	}
	get getCenterY() {
		return this.pos.y + this.size.h / 2;
	}
	hasFamily(value) {
		return this.family.includes(value);
	}
	addFamily(value) {
		this.family.push(value);
	}

}

class EntityEnemy extends Entity {
	damageEffect = {
		Damage: 0,
		ViewTime: 0,
		HealthTime: 0
	}
	#damageCooldown = 0;
	attack = {
		coolDown: 0,
		animTime: 0,
		animFlag: 0
	}
	get attackCondition() { return true };

	attackPower = 10;
	tick() {
		super.tick(...arguments);

		this.attackTick();

		this.#damageCooldown--;
		this.damageEffect.ViewTime--;
		this.damageEffect.HealthTime--;

		if (this.damageEffect.ViewTime <= 0) this.damageEffect.Damage = 0;

		if (this.health <= 0) {
			smokeParticle.create(this.pos.x, this.pos.y, 1);
			this.despawn();
		}

	}
	attackTick() {

		this.attack.coolDown--;
		if (this.attackCondition) return;

		//playerid
		let i = 0;

		if (hitbox_rect(this.pos.x, this.pos.y, this.size.w, this.size.h, subplayerx(i), subplayery(i), 16, 16)) {
			if (this.attack.coolDown <= 0) {
				this.attack.coolDown = 50
				this.attack.animFlag = true;
			}

			if (this.attack.animTime == 10)
				players[i].damage(this.attackPower, -Math.sign(this.getCenterX - (subplayerx(i) + 8)), -Math.sign(this.getCenterY - (subplayery(i) + 8)));
		}
	}
	damage(damage, rx = 0, ry = 0, byPlayer = false) {
		super.damage(...arguments);

		const knockbackResistance = 1.0;
		//クールダウン判定
		if (this.#damageCooldown > 0) return false;

		//効果音
		PlaySound("damage", "enemy", true);

		//ノックバック処理
		this.speed.x += rx / knockbackResistance;
		this.speed.y += ry / knockbackResistance;

		//ダメージ処理
		this.health -= damage;
		//クールダウン処理
		this.#damageCooldown = 5;

		//エフェクト処理
		this.damageEffect.Damage += damage;
		this.damageEffect.ViewTime = 100;
		this.damageEffect.HealthTime = 250;
		splinterParticle.BlueSlime.create(this.pos.x, this.pos.y, 1);

		return true;
	}
	drawDamageEffect() {
		if (this.damageEffect.HealthTime > 0)
			draw_hp(this.health / this.maxHealth, this.getCenterX - Cam.x - 5, this.pos.y - Cam.y);

		if (this.damageEffect.ViewTime > 0)
			drawTextFont(this.damageEffect.Damage.toString(), this.pos.x - Cam.x, this.pos.y - 16 - Math.log10(-8 * (this.damageEffect.ViewTime / 100 - 1)) * 8 - Cam.y, {});

	}
	spawnScript() {
		super.spawnScript(...arguments);
		this.addFamily("Enemy");
	}
}

class EntityEnemyNeutralBasic extends EntityEnemy {
	hostilityDelay = 0;
	get hostility() { return this.hostilityDelay > 0; };
	#movetemp = {
		xp: false,
		xn: false,
		yp: false,
		yn: false,
		movingTime: 0,
		get Moving() {
			return this.movingTime > 0
		}
	}
	get attackCondition() { return !this.hostility };


	tick() {
		super.tick(...arguments);

		const becomeNotHostilityDistance = 256;
		if (this.hostility && getDistance(subplayerx(0), subplayery(0), this.pos.x, this.pos.y) > becomeNotHostilityDistance)
			this.hostilityDelay--;

	}
	moveScript() {
		if (this.hostility) {

			let dis = getDistance(this.pos.x, this.pos.y, subplayerx(0), subplayery(0));
			if (dis < 16) {
				this.wasMoved = false;
				return;
			}

			let r = calcAngleDegrees(subplayerx(0) + game.facing_pos[PlayerControl.facing][0] - this.pos.x, subplayery(0) + game.facing_pos[PlayerControl.facing][1] - this.pos.y);
			this.speed.x += this.moveSpeed * Math.cos(r);
			this.speed.y += this.moveSpeed * Math.sin(r);

			this.wasMoved = true;
			return;

		} else {
			//move random (normal)

			if (this.#movetemp.yn) this.speed.y -= this.moveSpeed;
			if (this.#movetemp.yp) this.speed.y += this.moveSpeed;
			if (this.#movetemp.xp) this.speed.x += this.moveSpeed;
			if (this.#movetemp.xn) this.speed.x -= this.moveSpeed;
			if (this.#movetemp.movingTime > 0) this.#movetemp.movingTime -= 1;

			if (this.#movetemp.movingTime <= 0) {
				this.#movetemp.yn = false;
				this.#movetemp.yp = false;
				this.#movetemp.xp = false;
				this.#movetemp.xn = false;

				if (Math.random() > 0.95) {
					if (Math.random() > 0.9) this.#movetemp.yn = true;
					if (Math.random() > 0.9) this.#movetemp.yp = true;
					if (Math.random() > 0.9) this.#movetemp.xp = true;
					if (Math.random() > 0.9) this.#movetemp.xn = true;
					if (this.#movetemp.yn || this.#movetemp.yp || this.#movetemp.xn || this.#movetemp.yp)
						this.#movetemp.movingTime = Math.floor(Math.random() * 5 + 5);
				}
			}

			if (this.#movetemp.movingTime > 0) {
				this.wasMoved = true;
			} else {
				this.wasMoved = false;
			}
		}
	}
	damage(damage, rx = 0, ry = 0, byPlayer = false) {
		super.damage(...arguments);

		const becomeNotHostilityDelay = 100;
		this.hostilityDelay = becomeNotHostilityDelay;

	}
	spawnScript() {
		super.spawnScript(...arguments);
		this.addFamily("Neutral");
	}
}

class SlimeEntity extends EntityEnemyNeutralBasic {
	anim = {
		time: 0,
		flag: false
	}

	size = new Size(16, 16);
	maxHealth = 200;
	health = 200;
	tick() {
		this.animationTick();

		super.tick();
	}
	draw() {
		let DrawOffset = new Vec2(0, 0);

		const drawPos = this.getAnimationFlame();
		drawImg(img.enemy, DrawOffset.x + drawPos.x, DrawOffset.y + drawPos.y, 16, 16, this.pos.x - Cam.x, this.pos.y - Cam.y - make_jump_animation(this.attack.animTime / 20) * 5);
		this.drawDamageEffect();
	}
	spawnScript() {
		super.spawnScript(...arguments);
		this.addFamily("Slime");
	}
	animationTick() {

		if (this.wasMoved) this.anim.flag = true;
		if (this.anim.flag) this.anim.time++;
		if (this.anim.time >= 20) {
			this.anim.time = 0;
			this.anim.flag = false;
		}

		if (this.anim.time == 8) splinterParticle.BlueSlime.create(this.getCenterX, this.getCenterY, 1, 2);


		if (this.attack.animFlag) this.attack.animTime++;
		if (this.attack.animTime >= 20) {
			this.attack.animTime = 0;
			this.attack.animFlag = false;
		}
	}
	getAnimationFlame() {
		let x = 0;
		let y = 0;

		if (this.anim.time > 0) x = Math.floor(this.anim.time / 20 * 3);
		if (this.attack.animTime > 0) x = Math.floor(this.attack.animTime / 20 * 3);

		return new Vec2(x * 16, y * 16);
	}
	static Blue =
		class extends SlimeEntity {
			customType = "blue"
		}

}

class EntityNpcBasic extends Entity {

	#movetemp = {
		xp: false,
		xn: false,
		yp: false,
		yn: false,
		movingTime: 0,
		get Moving() {
			return this.movingTime > 0
		}
	}
	moveScript() {

		if (this.#movetemp.yn) this.speed.y -= this.moveSpeed
		if (this.#movetemp.yp) this.speed.y += this.moveSpeed
		if (this.#movetemp.xp) this.speed.x += this.moveSpeed
		if (this.#movetemp.xn) this.speed.x -= this.moveSpeed
		if (this.#movetemp.movingTime > 0) enemy[i].move[4] -= 1;

		if (this.#movetemp.movingTime > 0) {
			this.#movetemp.yn = false;
			this.#movetemp.yp = false;
			this.#movetemp.xp = false;
			this.#movetemp.xn = false;

			if (Math.random() > 0.95) {
				if (Math.random() > 0.9) this.#movetemp.yn = true;
				if (Math.random() > 0.9) this.#movetemp.yp = true;
				if (Math.random() > 0.9) this.#movetemp.xp = true;
				if (Math.random() > 0.9) this.#movetemp.xn = true;
				if (this.#movetemp.yn || this.#movetemp.yp || this.#movetemp.xn || this.#movetemp.yp)
					this.#movetemp.movingTime = Math.floor(Math.random() * 5 + 5);
			}
		}

		if (this.#movetemp.movingTime > 0) {
			this.wasMoved = true;
		} else {
			this.wasMoved = false;
		}
	}
}
const entityClasses = {
	1: SlimeEntity.Blue
}

function entityClass(Class, Type) {
	return {
		class: Class,
		type: Type
	}
}

let particles = new Array();

class Particle {
	pos = new Vec2();
	time = 0;
	lifetime = 0;
	random = new Array();

	constructor(spawnX, spawnY, count) {

		this.pos = new Vec2(spawnX, spawnY);
		this.random = [Random(-1, 1), Random(-1, 1)];

	}
	static create(spawnX = 0, spawnY = 0, count = 1) {
		if (count < 1.0) if (Math.random() > count) return;

		for (let i = 0; i < count; i++) {
			particles.push(new this(...arguments));
		}
		return count;
	}
	draw() {

	}
	tick() {
		this.time++;

		if (this.lifetime <= this.time) this.despawn();
	}
	despawn() {
		const index = particles.indexOf(this);
		particles.splice(index, 1);
	}
}

class splinterParticle extends Particle {

	DrawOffset = new Vec2(0, 0);
	lifetime = Random(25, 50, true);

	draw() {
		drawImg(img.particle, this.DrawOffset.x, this.DrawOffset.y, 16, 16, getDrawPosX(this.pos.x + this.random[0] * 16 * make_scatter_animation(this.time / this.lifetime)), getDrawPosY(this.pos.y - make_jump_animation(this.time / this.lifetime * 2) * 4));
	}
	static RockBreak =
		class extends splinterParticle {
			DrawOffset = new Vec2(16, 16);
		}
	static BlueSlime =
		class extends splinterParticle {
			DrawOffset = new Vec2(0, 16);
		}
}

class smokeParticle extends Particle {

	DrawOffset = new Vec2(0, 0);
	lifetime = Random(50, 100, true);

	draw() {
		drawImg(img.particle, this.DrawOffset.x + Math.floor(this.time / this.lifetime * 8) * 16, this.DrawOffset.y, 16, 16, getDrawPosX(this.pos.x), getDrawPosY(this.pos.y + this.time * this.random[0] / 10, -this.time / 5 - this.random[1] * 4));
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
			this.CursorOldPos.x = limit(this.CursorOldPos.x, 0, Infinity);
			this.CursorOldPos.y = limit(this.CursorOldPos.y, 0, Infinity);
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
		audio.onerror = () => {
			reject(audio.error)
		};

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
//let player = new PlayerControl();
let players = new Array();

players[0] = new Players(0);

//事前に埋めとく
player_movelog_reset();


//敵の変数の作成
let enemy_speed = 0.25

let enemy = new Array();
//敵の変数の作成

let entities = new Array();

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

		//uidata = this;
		this.UIGroup = loadedjson.jsonui[this.type];

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
		return true;
	}
	close() {
		if (this.state === -1) return false;

		this.state = -1;
		this.closeTime = 0;
		this.inactiveTime = 0;
		return true;
	}
	GetSelectID() {
		let UIGroup = loadedjson.jsonui[this.type];
		return UIGroup[this.select].id;
	}
	get index() {
		return JsonUIOpen.indexOf(this);
	}
	ShouldOpenAnim(UIIndex, UIContent) {
		return this.state === 1 && jsonui_active(this.index);
	}
	ShouldCloseAnim(UIIndex, UIContent) {
		return this.state === -1 || !jsonui_active(this.index);
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
	getUIContent(index) {
		return this.UIGroup[index];
	}
	defaultProc(...objs) {

		for (let obj of objs) {
			if (obj?.default !== undefined) {
				obj = Object.assign(obj, loadedjson.jsonui._default[obj.default]);
				delete obj.default;
			}

		}
	}
	closeCheck() {
		if (this.closed) JsonUIOpen.splice(this.index, 1);
	}
	tick() {
		this.ActiveChangeDetect(this.index)
		if (this.state === 1) this.openTime++;
		if (this.state === -1) this.closeTime++;
		if (this.ShouldOpenAnim(this.index)) this.activeTime++;
		if (this.ShouldCloseAnim(this.index)) this.inactiveTime++;
		if (this.openTime >= this.openDelay) this.opened = true;
		if (this.closeTime >= this.closeDelay) this.closed = true;

		this.draw();
	}
	draw() {

		for (const UIContent of this.UIGroup) {

			this.defaultProc(UIContent, ...ConvertArray(UIContent.animIn), ...ConvertArray(UIContent.animOut), UIContent.trans);


			let Draw = new JsonUIDraw(UIContent, this, false);
			let UIData = JsonUIOpen[this.index];
			if (UIContent.drawLog === "OffsetX") JsonUIOpen[this.index].data[UIContent.id] = Draw.Offset.x;

			switch (UIContent.type) {
				case "text":
					drawTextFont(translate(jsonui_variable(UIContent.text), undefined, UIContent, undefined, this.index), Draw.Offset.x, Draw.Offset.y, { color: game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
					break;
				case "button":
					draw_rectangle(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
					drawTextFont(translate(UIContent.text), Draw.Offset.x, Draw.Offset.y, { color: game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
					break;
				case "tabConfig":
					let sizeOverride = new JsonUIDraw(loadedjson.jsonui[UIID][0], this.index).Offset.x - Draw.Offset.x;
				//console.log(sizeOverride)
				case "tab":
					draw_tab(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt, img.gui_tab_select, UIContent.tabType, UIData.data.selectid === UIContent.id);
					drawTextFont(translate(UIContent.text), Draw.Offset.x, Draw.Offset.y, { color: game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
					break;
				case "rectangle":
					draw_rectangle(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
					break;
				case "custom":
					this.customRenderer(UIContent, Draw);
					break;
			}
		}
	}
	customRenderer(UIContent, Draw) {
		let drawItems;
		// items代入
		switch (UIContent.renderer) {
			case "items":
				drawItems = PlayerControl.items;
				break;
			case "roles":
			case "hud_hp":
				drawItems = players;
				break;
			case "UIOpen":
				drawItems = Object.keys(loadedjson.jsonui);
				break;
			case "config":
				drawItems = getConfigsGroup(this.data.tab);
				break;
		}
		// 描画いろいろ
		switch (UIContent.renderer) {
			case "items":
			case "roles":
			case "hud_hp":
			case "UIOpen":
			case "config":
				let scroll = JsonUIOpen[this.index].data[UIContent.id].scroll
				for (let i in drawItems.slice(Math.floor(scroll / 16), Math.floor(scroll / 16) + Math.ceil(Draw.size.y / 16 + 1))) {
					let DrawOffset = i * 16 - scroll % 16;
					let itemIndex = Number(i) + Math.floor(scroll / 16);
					let drawItem = drawItems[itemIndex];

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
								drawImg(img.items, getTileAtlasXY(drawItem.id, 0), getTileAtlasXY(drawItem.id, 1) - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
								break;
							case "text":
								draw_text_templ(translate(UIContent.items[key].text));
								break;
							case "ttftext":
								draw_text_ttf(translate(UIContent.items[key].text));
								break;
							case "ItemRender":
								drawImg(img.items, getTileAtlasXY(get_item_data(itemIndex, "icon"), 0), getTileAtlasXY(get_item_data(itemIndex, "icon"), 1) - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
								break;
							case "ItemName":
								draw_text_templ(translate("item." + get_item_data(itemIndex, "name") + ".name"));
								break;
							case "ConfigName":
								draw_text_templ(translate(drawItem.name));
								break;
							case "ConfigValue":
								draw_text_templ(translate(drawItem.value));
								break;
							case "ItemCount":
								draw_text_templ(drawItem.count, game.colorPallet.magenta, "start");
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
								draw_text_templ(players[itemIndex].health);
								break;
							case "img":
							case "image":
								AtlasDrawImage(UIContent.items[key].img, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top, 0, -ObjOut.top, 0, ObjOut.bottom + ObjOut.top - itemSize.y);
								break;
							case "uilist":
								draw_text_templ(drawItem, "_purple");
								break;
						}
					}
				}
				break;
		}
	}
	control() {
		let UIContent = this.getUIContent(this.select);

		let trigger = (array) => {
			for (const trans of array) {
				transition(...trans);
			}
		}

		let transition = (mode, ...param) => {
			for (let i in param) {
				param[i] = jsonui_variable(param[i], this.UIGroup, UIContent, this, this.index);
			}

			switch (mode) {
				case "select_abs":
					JsonUIOpen[this.index].select = param[0];
					break;
				case "select_rel":
					JsonUIOpen[this.index].select += param[0];
					break;
				case "open":
					jsonui_open(...param);
					break;
				case "close":
					JsonUIOpen[this.index].close();
					break;
				case "closeAll":
					JsonUIOpen.forEach((element, index) => {
						if (index >= param[0]) element.close();
					});
					break;
				case "UseItem":
					PlayerControl.items[param[0]].use(param[1]);
					break;
				case "data":
					JsonUIOpen[this.index].data[param[0]] = param[1];
					break;
				case "ChangeConfig":
					let configData = loadedjson.configs[this.data.tab][this.data.configRender.select];
					let configState = config[configData.variable];
					switch (configData.type) {
						case "bool":
							configState = !configState;
							break;
					}
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
			let data = this.data[UIContent.id];
			if (true) {
				if (key_groups_hold.down && data.select < PlayerControl.items.length - 1) data.select++
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

		//if (UIID === "menu") MenuTabSelect = JsonUIOpen[UIIndex].select;
	}
	cursorTick() {

		let UIContent = this.getUIContent(this.select);
		let Draw = new JsonUIDraw(UIContent, this, true);
		let UIData = JsonUIOpen[this.index];
		let data = UIData.data[UIContent.id];

		if (this.index != jsonuiSelectIdNoClosing()) return;
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
}

class JsonUIDraw {
	constructor(UIContent, UIData, NoAnimation = false) {
		/*for (const key of Object.keys(UIContent)) {
			this[key] = UIContent[key];
		}*/
		let variableFunc = value => jsonui_variable(valur, undefined, UIContent, JsonUIOpen[UIIndex], UIIndex);


		const offset = new Vec2(...UIContent.offset);
		const offset_type = new Vec2(...UIContent.offset_type ?? []);
		let dx = offset.x + GetOffsetScreen(offset_type.x, offset_type.y).x + UIData.pos.x
		let dy = offset.y + GetOffsetScreen(offset_type.x, offset_type.y).y + UIData.pos.y
		this.Offset = new Vec2(dx, dy);
		this.CursorOffset = new Vec2(...UIContent.CursorOffset ?? [-8, 0]);
		this.size = new Vec2(...UIContent.size);

		// ここから下にはアニメーション以外のプログラムを書かないで下さい //
		if (NoAnimation) return;

		const easingFunc = (func, value, size) => {
			switch (func) {
				case "easeOutExpo":
					return easeOutExpo(value) * size;
					break;
				case "easeInExpo":
					return easeInExpo(value) * size;
					break;
			}
		}
		const animationTypeFunc = (func, anim) => {
			switch (func) {
				case "offsetx":
					this.Offset.x += Math.round(anim);
					break;
				case "offsety":
					this.Offset.y += Math.round(anim);
					break;
				case "sizex":
					this.size.x += Math.round(anim);
					break;
				case "sizey":
					this.size.y += Math.round(anim);
					break;
			}
		}

		if (UIContent.animIn !== undefined && (UIData.ShouldOpenAnim(this.index, UIContent) || UIData.opened)) {

			new Array().concat(UIContent.animIn).forEach(animData => {
				let defaultValue = -animData.size;
				let anim = defaultValue + easingFunc(animData.ease, (UIData.activeTime - animData.offset) / animData.length, animData.size);
				animationTypeFunc(animData.type, anim);
			})
		}
		if (UIContent.animOut !== undefined && (UIData.ShouldCloseAnim(this.index, UIContent) || UIData.closed)) {

			new Array().concat(UIContent.animOut).forEach(animData => {
				let defaultValue = 0;
				let anim = defaultValue + easingFunc(animData.ease, (UIData.inactiveTime - animData.offset) / animData.length, animData.size);
				animationTypeFunc(animData.type, anim);
			})
		}
	}
	get index() {
		JsonUIOpen.indexOf(this);
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
		if (UIData.ShouldOpenAnim(UIIndex, loadedjson.jsonui[UIData.type][0])) UIData.activeTime++;
		if (UIData.ShouldCloseAnim(UIIndex)) UIData.inactiveTime++;

		jsonui_draw(UIData.type, UIIndex);
		jsonui_cursor(UIData.type, UIIndex, cursor);

		//if(UIIndex == 1 )console.table([UIData.state == 1 && jsonui_active(UIIndex),UIData.state == -1 || !jsonui_active(UIIndex)])

		if (UIData.openTime >= UIData.openDelay) UIData.opened = true;
		if (UIData.closeTime >= UIData.closeDelay) UIData.closed = true;
	}
	JsonUICursor.draw();

}
function jsonui_main() {
	for (let UIData of JsonUIOpen) {
		UIData.tick();
	}
	for (let UIData of JsonUIOpen) {
		UIData.closeCheck();
	}
	JsonUIOpen[JsonUIOpen.length - 1].control();
	JsonUIOpen[JsonUIOpen.length - 1].cursorTick();

	JsonUICursor.draw();

}

function jsonui_active(UIIndex) {
	//必要かわからん
	//let UIGroup = loadedjson.jsonui[UIID];
	//let UIContent = UIGroup[JsonUIOpen[UIIndex].select];
	//let UIData = JsonUIOpen[UIIndex].data[UIContent.id];

	return JsonUIOpen.length - 1 == UIIndex;
}

function jsonuiSelectIdNoClosing() {

	for (let index = JsonUIOpen.length - 1; index >= 0; index--) {
		const element = JsonUIOpen[index];
		if (element.state === 1) return index;
	}
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
		case "$SelectID":
			return JsonUIOpen[UIIndex].select;
		case "$UIContentID":
			return UIContent.id;
		case "$selectUI":
			return Object.keys(loadedjson.jsonui)[UIData.select];
		case "$fps":
			return fps;
		case "$getData":
			return UIData.data[values[1]];
		case "$getDataLocal":
			return UIData.data[UIContent.id][values[1]];
		default:
			return value;

	}
}


function getJsonuiSelect(UIIndex = JsonUIOpen.length - 1) {
	return JsonUIOpen[UIIndex].select;
}


function jsonui_open(type, DefaultX, DefaultY, DefaultSelectID, param) {
	JsonUIOpen.push(new JsonUI(type, DefaultX, DefaultY, DefaultSelectID, param));
}

let JsonUIOpen = new Array();

let JsonUICursor = new Cursor();

//言語設定
game.lang = loadedjson.en_us;
let lang = "en_us";

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
	if (config.beforeunload) beforeUnloadEnventID = setTimeout(beforeUnloadOn, 1000 * 10);


	gamestarted = true;
}

function GAMEMAIN() {


	if (!IsLoading) game.map = Object.assign(loadedjson.Map, loadedjson.MapMeta);
	playTime = SavedPlayTime + (new Date() - GameStartedTime);

	player_tick();

	entity_tick();

	particle_proc();

	enemy_spawn_event();


	Cam.tick();


	game_draw();



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
	return new Array().concat(input);
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
	const response = await fetch(filename);
	const jsonObject = await response.json();
	//取得ここまで

	let endTime = new Date().getTime();
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
	if (config.beforeunload) beforeUnloadEnventID = setTimeout(beforeUnloadOn, 1000 * 60);
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

function getNearestEntityDistance(x, y, family) {
	let distance = new Array();
	for (const entity of entities.filter(value => value.hasFamily(family))) {
		distance.push(getDistance(x, y, entity.pos.x, entity.pos.y));
	}
	return Math.min.apply(null, distance);

}
function getNearestEntity(x, y, family) {
	//if (typeof d == "undefined") d = false;
	let distance = new Array();
	for (const entity of entities.filter(value => value.hasFamily(family))) {
		distance.push(getDistance(x, y, entity.pos.x, entity.pos.y));
	}
	return distance.indexOf(Math.min.apply(null, distance));

}

function getDistance(ax, ay, bx, by) {
	return Math.abs(Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)));
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
function replaceHitboxTile(bool, x, y) {
	game.map["hitbox"][y][x] = bool;
	return bool;
}

function allElemDefined(...elem) {
	if (elem == undefined) return false;

	return elem.every(element => element !== undefined);
}

//当たり判定
function hitbox(x, y) {

	let gethitBox = (x, y) => game.getTileID("hitbox", x, y) || (game.getTileID("map1", x, y) == 7)

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

function hitbox_entity_rect(ax, ay, aw, ah, family, color = "black") {

	let hit = new Array();

	for (const entity of entities.filter(value => value.hasFamily(family))) {
		if (hitbox_rect(entity.pos.x, entity.pos.y, entity.size.w, entity.size.h, ax, ay, aw, ah, color))
			hit.push(entity);
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

			let result = {
				x: x + ix,
				y: y + iy,
				id: TileID
			}

			if (typeof checktile == "undefined") hit.push(result);
			if (typeof checktile != "undefined" && !Array.isArray(checktile)) if (checktile == TileID) hit.push(result);
			if (typeof checktile != "undefined" && Array.isArray(checktile)) if (checktile.includes(TileID)) hit.push(result);
		}
	}
	return hit;
}
function player_tick() {

	if (IsLoading) return;
	PlayerControl.tick();

	for (const player of players) {
		player.tick();
	}

	if (PlayerControl.pos.x != PlayerControl.movelog[0].x || PlayerControl.pos.y != PlayerControl.movelog[0].y)
		PlayerControl.movelog.unshift(new Vec2(PlayerControl.pos.x, PlayerControl.pos.y));
}

function player_movelog_reset() {
	PlayerControl.movelog.splice(0, Infinity);
	for (let i = 0; i < 64; i++) PlayerControl.movelog.push(new Vec2(PlayerControl.pos.x, PlayerControl.pos.y));
}
function getFacing(up, down, right, left) {
	if (up && !down && !right && !left) return 2;
	if (!up && down && !right && !left) return 0;
	if (!up && !down && right && !left) return 3;
	if (!up && !down && !right && left) return 1;
	if (up && !down && right && !left) return 3;
	if (up && !down && !right && left) return 1;
	if (!up && down && right && !left) return 3;
	if (!up && down && !right && left) return 1;
	//if (!up && !down && right && left) return 0;
	//if (up && down && !right && !left) return 0;
	if (up && !down && right && left) return 2;
	if (!up && down && right && left) return 0;
	if (up && down && right && !left) return 3;
	if (up && down && !right && left) return 1;
	//if (up && down && right && left) return 0;

	return null;

}
function getRotate(up, down, right, left) {
	if (up && !down && !right && !left) return 4;
	if (!up && down && !right && !left) return 0;
	if (!up && !down && right && !left) return 6;
	if (!up && !down && !right && left) return 2;
	if (up && !down && right && !left) return 5;
	if (up && !down && !right && left) return 3;
	if (!up && down && right && !left) return 7;
	if (!up && down && !right && left) return 1;
	//if (!up && !down && right && left) return 0;
	//if (up && down && !right && !left) return 0;
	if (up && !down && right && left) return 4;
	if (!up && down && right && left) return 0;
	if (up && down && right && !left) return 6;
	if (up && down && !right && left) return 2;
	//if (up && down && right && left) return 0;

	return null;
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
	PlayerControl.mapID = ID;

	if (!loadonly) {
		entities = new Array();//初期化
		for (let entity of loadedjson.MapMeta.entity ?? []) {
			new entityClasses[entity.id](entity.x, entity.y, entity.dialogueID);
		}

		//プレイヤーの場所を移動
		//引数で指定された座標
		if (typeof x != "undefined" && typeof y != "undefined" && !isNaN(x) && !isNaN(y))
			[PlayerControl.pos.x, PlayerControl.pos.y] = [x, y];

		//デフォルトの座標
		if (typeof x == "undefined" || typeof y == "undefined" || isNaN(x) || isNaN(y))
			[PlayerControl.pos.x, PlayerControl.pos.y] = [loadedjson.Map.player[0], loadedjson.Map.player[1]];
	}
	IsLoading = false;
}

function subplayerx(i) {
	return PlayerControl.movelog[i * 16].x;
}

function subplayery(i) {
	return PlayerControl.movelog[i * 16].y;
}

function subplayerdrawx(i) {
	return subplayerx(i) - Cam.x;
}

function subplayerdrawy(i) {
	return subplayery(i) - Cam.y;
}

function get_item_data_index(i, data) {
	return loadedjson.item[i][data];
}

function get_item_data(i, data) {
	return loadedjson.item[PlayerControl.items[i].id][data];
}
/**
 * 翻訳後の文字列を返します
 * @param {string} key 翻訳キー
 * @param  {...string} param パラメーター
 * @returns 
 */
function translate(key, ...param) {
	if (typeof game.lang[key] != "string") return key;

	let text = game.lang[key];
	for (let i in param) {
		text = text.replace("%" + i, param[i]);
	}
	return text;
}

function entity_tick() {
	for (const element of entities) {
		element.tick();
	}
}

function enemy_spawn_event() {
	//沸き上限
	if (enemy.length >= 50) return;

	for (let i = 0; i < 360; i += 3) {
		let r = 16;
		let x = Math.floor(PlayerControl.pos.x / 16 + Math.cos(i) * r);
		let y = Math.floor(PlayerControl.pos.y / 16 + Math.sin(i) * r);
		enemy_spawn_check(x, y);
	}
}

function enemy_spawn_check(x, y) {
	//debug_hitbox_push(x * 16, y * 16, 16, 16);

	if (Random(0, 10) < 9) return;

	//敵をスポーンする場所かを調べる
	let ID = game.getTileID("enemy", x, y);
	if (ID == null || typeof ID != "number") return false;

	//敵が既にスポーンされてないか調べる
	for (const enemy of entities.filter(value => value.hasFamily("Enemy"))) {
		if (enemy.spawn.x == x * 16 && enemy.spawn.y == y * 16) return false;
	}
	if (!entityClasses.hasOwnProperty(ID)) return false;

	new entityClasses[ID](x * 16, y * 16);
	return true;

}

function particle_proc() {

	if (IsLoading) return;
	for (const particle of particles) {
		particle.tick();
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
		ctx.strokeRect((debug.hitboxes[i].a - Cam.x), (debug.hitboxes[i].b - Cam.y), debug.hitboxes[i].c, debug.hitboxes[i].d);
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

	{
		let draw_text_debug = ["cursor", JsonUICursor.CursorOldPos.x, JsonUICursor.CursorOldPos.y]

		draw_texts(draw_text_debug, 128 + 64, 64)
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
			drawTextFont(String.fromCharCode(i), 78 * 4, j * 8, {});
			drawTextFont(`${i}`, 74 * 4, j * 8, {});
			j++;
		}
	}
	{
		let px = 0, dx = 0;
		for (const key in key_groups) {
			if (key_groups[key]) {
				drawTextFont(key.slice(0, 2), 68 * 4, px * 8, {});
				px++;
			}
			if (key_groups_down[key]) {
				drawTextFont(key.slice(0, 2), 64 * 4, dx * 8, {});
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
		draw_text(enemy[i].hp.toString(), enemy[i].x - Cam.x, enemy[i].y - Cam.y - 16);
		draw_text(i.toString(), enemy[i].x - Cam.x, enemy[i].y - Cam.y - 8);
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
	drawImg(img.players, 0, 0, 16, 16, (0 - Cam.x), (0 - Cam.y - 8), 16, 24);
}

function get_select_tile_pos(mousex, mousey) {
	return {
		x: Math.floor(mousex / 16 / zoomX + Cam.x / 16),
		y: Math.floor(mousey / 16 / zoomY + Cam.y / 16)
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

//overdide
function draw_text(text, textx, texty) {
	drawTextFont(text, textx, texty, {});
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
		drawTextFont(text[i], x, i * 8 + y, {});
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

/**
 * 
 * @param {Number} dx 
 * @param {Number} dy 
 * @param {Number} dw 
 * @param {Number} dh 
 * @param {Image} img *RECOMMEND: img.gui_prompt
 */
function draw_rectangle(dx, dy, dw, dh, img) {
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

/**
 * 
 * @param {Number} dx 
 * @param {Number} dy 
 * @param {Number} dw 
 * @param {Number} dh 
 * @param {Image} img *RECOMMEND: img.gui_prompt
 * @param {Image} imgmore *RECOMMEND: img.gui_tab_select
 * @param {string} type top middle bottom
 */
function draw_tab(dx, dy, dw, dh, img, imgtab, type, select) {
	//numlockない最高
	const offset = -4;
	const selectAtlasList = {
		"top": [[24, 0], [16, 0]],
		"middle": [[16, 8], [NaN, NaN]],
		"bottom": [[24, 16], [16, 16]],

		"topEdge": [[32, 0], [8, 0]],
		"middleEdge": [[NaN, NaN], [NaN, NaN]],
		"bottomEdge": [[32, 16], [8, 16]]
	}
	const atlasGet = (type, edge) => new Vec2(...selectAtlasList[edge ? type + "Edge" : type][select ? 1 : 0]);

	ctx.drawImage(img, 0, 0, 8, 8, (dx - 8), (dy - 8), 8, 8);
	ctx.drawImage(img, 8, 0, 8, 8, dx, (dy - 8), dw + offset, 8);
	ctx.drawImage(imgtab, 0, 0, 8, 8, (dx + dw + offset), (dy - 8), 8, 8);
	ctx.drawImage(imgtab, atlasGet("top", type === "top").x, atlasGet("top", type === "top").y, 8, 8, dx + dw + offset, dy - 8, 8, 8);

	ctx.drawImage(img, 0, 8, 8, 8, (dx - 8), dy, 8, dh);
	ctx.drawImage(imgtab, 0, 8, 8, 8, (dx + dw + offset), dy, 8, dh);
	ctx.drawImage(img, atlasGet("middle", false).x, atlasGet("middle", false).y, 8, 8, dx + dw + offset, dy, 8, dh);


	ctx.drawImage(img, 0, 16, 8, 8, (dx - 8), (dy + dh), 8, 8);
	ctx.drawImage(img, 8, 16, 8, 8, dx, (dy + dh), dw + offset, 8);
	ctx.drawImage(imgtab, 0, 16, 8, 8, (dx + dw + offset), (dy + dh), 8, 8);
	ctx.drawImage(imgtab, atlasGet("bottom", type === "bottom").x, atlasGet("bottom", type === "v").y, 8, 8, dx + dw + offset, dy + dh, 8, 8);

	ctx.drawImage(img, 8, 8, 8, 8, dx, dy, dw + offset, dh);

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

function getDrawPosX(pos) {
	return pos - Cam.x;
}

function getDrawPosY(pos) {
	return pos - Cam.y;
}

function game_draw() {

	draw_tiles("map1");

	draw_player()

	draw_weapons();

	draw_particle();

	draw_entity();

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

function draw_tiles(maplayer) {

	let plx = Math.floor(Cam.x / 16);
	let ply = Math.floor(Cam.y / 16);

	for (let y = 0; y < 13; y++) {
		for (let x = 0; x < 21; x++) {
			let tileID = game.getTileID(maplayer, x + plx, y + ply);

			//軽量化
			if (!game.DontDrawTIle.includes(tileID)) ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, (x * 16 + (16 - Cam.x % 16) - 16), (y * 16 + (16 - Cam.y % 16) - 16), 16, 16);

		}
	}
}

function draw_player() {

	//プレイヤー描画
	for (const player of players) {
		player.draw();
	}
}


function draw_weapons() {
	for (const player of players) {
		player.weapon.draw();
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

function draw_entity() {

	for (const entity of entities) {
		entity.draw();
	}
}
function draw_particle() {

	for (let particle of particles) {
		particle.draw();
	}

	return;

	for (const i in particle) {
		let t = particle[i];
		if (t.id == 0) drawImg(img.particle, Math.floor(t.tick / t.lifetime * 8) * 16, 0, 16, 16, t.x - Cam.x + particle_death_offset(i)[0], t.y - Cam.y + particle_death_offset(i)[1]);
		if (t.id == 1) drawImg(img.particle, 0, 16, 16, 16, t.x - Cam.x + t.varix * 16 * make_scatter_animation(t.tick / t.lifetime), t.y - Cam.y - make_jump_animation(t.tick / t.lifetime * 2) * 4);
		if (t.id == 2) drawImg(img.particle, 16, 16, 16, 16, t.x - Cam.x + t.varix * 16 * make_scatter_animation(t.tick / t.lifetime), t.y - Cam.y - make_jump_animation(t.tick / t.lifetime * 2) * 4);
	}
}

function particle_death_offset(i) {
	let t = particle[i];

	return [t.tick * t.varix / 10, -t.tick / 5 - t.variy * 4];
}


function title_gui_proc() {
	//if (IsLoading) return false;

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

function title_gui_draw(dx = 64, dy = 64) {
	return;

	let cursor = new Array();

	draw_gui_items(game.title_items, undefined, dx, dy, 100, 0, 16, 100);
	cursor.push(new Vec2(dx - 16, title_gui.item_select * 16 + dy));

	cursor_draw(cursor);

	draw_text("title", 0, 0)
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

function configReset() {

	//コンフィグ初期化
	for (const configKey of Object.keys(loadedjson.configs)) {
		const configs = loadedjson.configs[configKey];
		//console.table(configs)
		for (const config of configs) {
			config[config.variable] = config.default;
		}
	}
}

//あざす https://www.w3schools.com/graphics/game_sound.asp
function PlaySound(src = "select", group = "other", DoNotStop = false) {
	if (config[game.soundGroupsConfig[group]]) sounds[src].play(DoNotStop)
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

	// 一部の英語はうまく判定できないので除外 //
	let IsFireFox = window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
	if (character.charCodeAt(0) >= 256 && IsFireFox) return true;

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