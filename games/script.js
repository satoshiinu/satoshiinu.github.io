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
	clearInterval(intervalID);
	if (DoSayErrorMassege) alert(`エラーが発生しました\n再読み込みしてください\nerror: ${message}}\nat ${file},${lineNo}:${colNo}`);
	//if (gamestarted)requestAnimationFrame(main);
}

//画面に表示される時は4倍になるので注意
//let zoom = 1;
let defaultzoomX = 4;
let defaultzoomY = 4;
let zoomX = defaultzoomX;
let zoomY = defaultzoomY;
let ScreenWidth = 320;
let ScreenHeight = 180;

let LEGACY_MODE = false;

let DEFAULT_FONT = "Proj23Fon";

//久しぶりのあざす　https://blog.oimo.io/2021/06/06/adjust-fps/
const UPDATE_LOAD_COEFF = 0.5;

let targetInterval = 1000 / 60;
let prevTime = Date.now() - targetInterval;

//その他の変数の作成
let timer = 0;
let loopID = 0;
let intervalID = 0;
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
	//["img/gui/message.png", "gui_message", true],
	["img/gui/prompt.png", "gui_prompt", true],
	["img/gui/prompt2.png", "gui_prompt_more", true],
	["img/gui/tab_select.png", "gui_tab_select", true],
	["img/gui/scroll_bar.png", "gui_scroll_bar", true],
	["img/gui/touch.png", "touch_button", false]
]
//Object.freeze(willLoadImg);

let willLoadJson = [
	//["param/atlas.json", "atlas", true],
	//["param/enemy.json", "enemy", true],
	//["param/particle.json", "particle", true],
	["param/item.json", "item", true],
	//["param/dialogue.json", "dialogue", true],

	["param/lang/en_us.json", "en_us", true],
	["param/lang/ja_jp.json", "ja_jp", true],
	//["param/config.json", "configs", true],
	["param/ui.json", "jsonui", true, "jsonui"],

	["param/levelTest.json", "level", true]
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


class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	toString() {
		return `x${this.x}_y${this.y}`;
	}
	[Symbol.iterator] = function* () {
		yield this.x;
		yield this.y;
	}
	classType = "vec2";

}

class Size {
	constructor(width, height) {
		this.w = width;
		this.h = height;
	}
	toString() {
		return `w${this.w}_h${this.h}`;
	}
	[Symbol.iterator] = function* () {
		yield this.w;
		yield this.h;
	}
	classType = "size";
}

class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	toString() {
		return `x${this.x}_y${this.y}_w${this.w}_h${this.h}`;
	}
	[Symbol.iterator] = function* () {
		yield this.x;
		yield this.y;
		yield this.w;
		yield this.h;
	}
	classType = "rect";
}

class Range {
	constructor(min = -Infinity, max = Infinity) {
		this.min = min;
		this.max = max;
	}
	toString() {
		return `min${this.min}_max${this.max}`;
	}
	[Symbol.iterator] = function* () {
		yield this.min;
		yield this.max;
	}
	classType = "range";
}

class StartEnd {
	constructor(startX, startY, endX, endY) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
	}
	toString() {
		return `startX${this.startX}_startY${this.startY}_endX${this.endX}_endY${this.endY}`;
	}
	[Symbol.iterator] = function* () {
		yield this.startX;
		yield this.startY;
		yield this.endX;
		yield this.endY;
	}
	classType = "startend";
}
class pos extends Vec2 {
	getTilePos() {
		return new cpos(Math.floor(this.x / 16), Math.floor(this.y / 16));
	}
	getChunkPos() {
		return this.getTilePos().getChunkPos();
	}

}
class tpos extends Vec2 {
	isChunkPos = false;
	getChunkPos() {
		return new cpos(Math.floor(this.x / chunkSize.w), Math.floor(this.y / chunkSize.h));
	}
	getEntityPos() {
		return new pos(Math.floor(this.x * 16 + 8), Math.floor(this.y * 16 + 8));
	}
	getInChunkPos() {
		return new cpos(Math.abs(this.x % chunkSize.w), Math.abs(this.y % chunkSize.h));
	}
	getInChunkIndex() {
		return this.getInChunkPos().x + this.getInChunkPos().y * chunkSize.w;
	}
	classType = "pos";
}
class cpos extends Vec2 {
	isChunkPos = true;
	getChunkPos() {
		return this;
	}
	classType = "cpos";
}

class Hitbox {
}

class Registry extends Map {
	getKey(searchValue) {
		return this.entries().find(([key, value]) => value === searchValue)?.[0] ?? null;
	}
	set(key, value) {
		let a = super.set(...arguments);
		this.createMapGetter(key);
		return a;
	}
	createMapGetter(key) {
		Object.defineProperty(this, key,
			{
				get: function () {
					return this.get(key);
				}
			});
	}
	createReadonly(key, value) {
		Object.defineProperty(this, key,
			{
				get: function () {
					return value;
				}
			});
	}
}

class RegistryItemType extends Registry {
	register(key, baseClass, prop) {
		let obj = {
			create: (...arg) => {
				let createdClass =
					Object.getPrototypeOf(baseClass).hasOwnProperty("setProperties") ?
						new baseClass(...arg) :
						new baseClass(...arg).setProperties(prop);

				if (baseClass.getParentKey)
					this.createReadonly.call(createdClass, "key", key)
				return createdClass
			},
			baseClass: baseClass,
			key: key,
			prop: prop
		}
		return this.set(key, obj);
	}
}
class RegistryEntityType extends Registry {
	register(key, baseClass, prop, numid) {
		let obj = {
			create: (...arg) => {
				let createdClass =
					baseClass.prototype.setProperties === undefined ?
						new baseClass(...arg) :
						new baseClass(...arg).setProperties(prop);
				if (baseClass.prototype.key === null)
					this.createReadonly.call(createdClass, "key", key)
				return createdClass
			},
			baseClass: baseClass,
			key: key,
			numid: numid,
			prop: prop
		}
		this.set(key, obj);
		return this.set(numid, obj);
	}
}
class RegistryParticleType extends Registry {
	register(key, baseClass, prop) {
		let obj = {
			create: (...arg) => {
				let createdClass =
					Object.getPrototypeOf(baseClass).hasOwnProperty("setProperties") ?
						new baseClass(...arg) :
						new baseClass(...arg).setProperties(prop);

				if (baseClass.getParentKey)
					this.createReadonly.call(createdClass, "key", key)
				return createdClass
			},
			multiCreate: (count, ...arg) => {
				let createdClass = new Array;
				for (let index = 0; index < Particle.getCreateCount(count); index++) {
					createdClass.push(obj.create(...arg));
				}
				return createdClass;

			},
			baseClass: baseClass,
			key: key,
			prop: prop
		}
		return this.set(key, obj);
	}
}

class AABB {
	constructor(x0, y0, x1, y1, misc) {
		this.x0 = x0;
		this.y0 = y0;
		this.x1 = x1;
		this.y1 = y1;
		this.misc = misc;
	}
	expand(xa, ya) {
		let _x0 = this.x0;
		let _y0 = this.y0;
		let _x1 = this.x1;
		let _y1 = this.y1;
		if (xa < 0)
			_x0 + xa;
		if (xa > 0)
			_x1 + xa;
		if (ya < 0)
			_y0 + ya;
		if (ya > 0)
			_y1 + ya;
		return new AABB(_x0, _y0, _x1, _y1);
	}
	scale(s = 1) {
		let _x0 = this.x0;
		let _y0 = this.y0;
		let _x1 = this.x1;
		let _y1 = this.y1;
		return new AABB(_x0 * s, _y0 * s, _x1 * s, _y1 * s);
	}
	move(xa, ya) {
		this.x0 += xa;
		this.y0 += ya;
		this.x1 += xa;
		this.y1 += ya;
	}
	clipXCollide(c, xa) {
		if (c.y1 <= this.y0 || c.y0 >= this.y1)
			return xa;

		if (xa > 0.0 && c.x1 <= this.x0) {
			let max = this.x0 - c.x1;
			if (max < xa)
				xa = max;
		}
		if (xa < 0.0 && c.x0 >= this.x1) {
			let max = this.x1 - c.x0;
			if (max > xa)
				xa = max;
		}
		return xa;
	}
	clipYCollide(c, ya) {
		if (c.x1 <= this.x0 || c.x0 >= this.x1)
			return ya;

		if (ya > 0.0 && c.y1 <= this.y0) {
			let max = this.y0 - c.y1;
			if (max < ya)
				ya = max;
		}
		if (ya < 0.0 && c.y0 >= this.y1) {
			let max = this.y1 - c.y0;
			if (max > ya)
				ya = max;
		}
		return ya;
	}
	simpleOverlap(aabb) {
		return (this.x0 < aabb.x1 && this.x1 > aabb.x0 && this.y0 < aabb.y1 && this.y1 > aabb.y0);
	}
	classType = "aabb";
}

class Debug {
	static hitboxView = new Array;
	static hitboxesTile = new Array;
	static draw() {
		this.drawHitboxView();
		this.drawEntityBB(PlayerControl?.level);
	}
	static drawAABB(aabb) {
		let drawX = aabb.x0;
		let drawY = aabb.y0;
		let drawW = aabb.x1 - aabb.x0;
		let drawH = aabb.y1 - aabb.y0;
		ctx.strokeRect(drawX - Cam.x, drawY - Cam.y, drawW, drawH)
	}
	static drawHitboxView() {
		if (!Configs.get("DebugHitboxShow").value) return;
		for (const aabb of this.hitboxView) {
			this.drawAABB(aabb);
		}
		this.hitboxView = new Array;
	}
	static drawEntityBB(level) {
		if (!Configs.get("DebugEntityHitboxShow").value) return;
		if (!level?.entities) return;
		for (const entity of level?.entities) {
			this.drawAABB(entity.bb);
		}
	}
	static tpsChange(tps = 60) {
		targetInterval = 1000 / tps;
		prevTime = Date.now() - targetInterval;
	}
}

//config変数の作成
let Configs = new Map();

class Config {
	constructor(name, group, defaultValue = this.getDefaultValue(type)) {
		if (name === undefined) throw new Error("name is undefined");
		if (group === undefined) throw new Error("group is undefined");


		this.name = name;
		this.group = group;
		this.value = defaultValue;

		Configs.set(name, this);
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
	uiToggle() {
		switch (this.type) {
			case "bool":
				this.value = !this.value;
				break;
		}
	}
	static groupPlayer = Symbol("groupPlayer");
	static groupWeapon = Symbol("groupWeapon");
	static groupData = Symbol("groupData");
	static groupControl = Symbol("groupControl");
	static groupSound = Symbol("groupSound");
	static groupOther = Symbol("groupOther");
	static groupDebug = Symbol("groupDebug");
	static group(group) {
		return Configs.entries().reduce((pre, [key, value]) => {
			if (value.group === group) pre.set(key, value)
			return pre;
		}, new Map());
	};
}

class ConfigBool extends Config {
	type = "bool";
}
class ConfigNum extends Config {
	type = "number";
}

new ConfigBool("AttackRotateRock", Config.groupWeapon, true);
new ConfigBool("AutoAim", Config.groupWeapon, true);

new ConfigBool("FileExtension", Config.groupData, false);

new ConfigBool("DebugHitboxShow", Config.groupDebug, false);
new ConfigBool("DebugEntityHitboxShow", Config.groupDebug, false);


class Direction {
	static rotateKey = new Array;
	static facingKey = new Array;
	static rotate = new Array;
	static facing = new Array;
	static {
		this.register("down", 0, 1, { degrees: 0.0, rotateIndex: 0, facingIndex: 0, weaponOffset: new Vec2(0, 0) });//　          ↓
		this.register("downleft", -1, 1, { degrees: -45.0, rotateIndex: 1, facingIndex: null, weaponOffset: new Vec2(-8, 0) });//    ↙
		this.register("left", -1, 0, { degrees: -90.0, rotateIndex: 2, facingIndex: 1, weaponOffset: new Vec2(-16, 0) });//           ←
		this.register("upleft", -1, -1, { degrees: -135.0, rotateIndex: 3, facingIndex: null, weaponOffset: new Vec2(-8, -8) });//     ↖
		this.register("up", 0, -1, { degrees: 180.0, rotateIndex: 4, facingIndex: 2, weaponOffset: new Vec2(0, -16) });//             ↑
		this.register("upright", 1, -1, { degrees: 45.0, rotateIndex: 5, facingIndex: null, weaponOffset: new Vec2(0, -8) });//     ↗
		this.register("right", 1, 0, { degrees: 90.0, rotateIndex: 6, facingIndex: 3, weaponOffset: new Vec2(0, 0) }); //          →
		this.register("downright", 1, 1, { degrees: 135.0, rotateIndex: 7, facingIndex: null, weaponOffset: new Vec2(0, 0) });//   ↘

		this.registerRotateKey([1, 0, 0, 0], this.up);
		this.registerRotateKey([0, 1, 0, 0], this.down);
		this.registerRotateKey([0, 0, 1, 0], this.left);
		this.registerRotateKey([0, 0, 0, 1], this.right);
		this.registerRotateKey([1, 0, 1, 0], this.upleft);
		this.registerRotateKey([1, 0, 0, 1], this.upright);
		this.registerRotateKey([0, 1, 1, 0], this.downleft);
		this.registerRotateKey([0, 1, 0, 1], this.downright);
		this.registerRotateKey([1, 0, 1, 1], this.up);
		this.registerRotateKey([0, 1, 1, 1], this.down);
		this.registerRotateKey([1, 1, 1, 0], this.left);
		this.registerRotateKey([1, 1, 0, 1], this.right);

		this.registerFacingKey([1, 0, 0, 0], this.up);
		this.registerFacingKey([0, 1, 0, 0], this.down);
		this.registerFacingKey([0, 0, 1, 0], this.left);
		this.registerFacingKey([0, 0, 0, 1], this.right);
		this.registerFacingKey([1, 0, 1, 0], this.left);
		this.registerFacingKey([1, 0, 0, 1], this.right);
		this.registerFacingKey([0, 1, 1, 0], this.left);
		this.registerFacingKey([0, 1, 0, 1], this.right);
		this.registerFacingKey([1, 0, 1, 1], this.up);
		this.registerFacingKey([0, 1, 1, 1], this.down);
		this.registerFacingKey([1, 1, 1, 0], this.left);
		this.registerFacingKey([1, 1, 0, 1], this.right);
	}
	static register(name, dx, dy, { rotateIndex, facingIndex, weaponOffset, degrees } = {}) {
		class DirectionChild {
			classType = "direction";
			name = name;
			type = null;
			dx = dx;
			dy = dy;
			rotateIndex = rotateIndex;
			facingIndex = facingIndex;
			weaponOffset = weaponOffset;
			degrees = degrees;
			toRotate() {
				const valueOf = () => this.rotateIndex;
				return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { valueOf: valueOf, type: "rotate" });
			}
			toFacing() {
				const valueOf = () => this.facingIndex;
				return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { valueOf: valueOf, type: "facing" });
			}
		}
		const directionChild = new DirectionChild();
		this[name] = directionChild;
		this.rotate[rotateIndex] = directionChild.toRotate();
		this.facing[facingIndex] = directionChild.toFacing();
		Object.freeze(directionChild)
	}
	static registerRotateKey([up, down, right, left], direction) {
		class RotateKey {
			up = Boolean(up);
			down = Boolean(down);
			right = Boolean(right);
			left = Boolean(left);
			direction = direction.toRotate();
		}
		this.rotateKey.push(new RotateKey());
	}
	static registerFacingKey([up, down, right, left], direction) {
		class FacingKey {
			up = Boolean(up);
			down = Boolean(down);
			right = Boolean(right);
			left = Boolean(left);
			direction = direction.toFacing();
		}
		this.facingKey.push(new FacingKey());
	}
	static getRotateByKey(up, down, right, left) {
		for (let key of this.rotateKey) {
			if (key.up === up)
				if (key.down === down)
					if (key.right === right)
						if (key.left === left)
							return key.direction;
		}
		return null;
	}
	static getFacingByKey(up, down, right, left) {
		for (let key of this.facingKey) {
			if (key.up === up)
				if (key.down === down)
					if (key.right === right)
						if (key.left === left)
							return key.direction;
		}
		return null;
	}
	static getRotateByIndex(index) {
		return this.rotate[index];
	}
	static getFacingByIndex(index) {
		return this.facing[index];
	}
	static dataRestore({ name, type }) {
		const direction = this[name];
		switch (type) {
			case "rotate":
				return direction.toRotate();
				break;
			case "facing":
				return direction.toFacing();
				break;
			default:
				return direction;

		}
	}

}

class PerformanceTester {
	FpsStartTime = null;
	FpsEndTime = null;
	StartTime = null;
	EndTime = null;
	Time = NaN;
	Fps = NaN;
	FrameCount = 0;
	Start() {
		this.StartTime = performance.now();
	}
	End() {
		this.EndTime = performance.now();
		this.Time = Math.floor(this.EndTime - this.StartTime);

		this.FpsEndTime = performance.now();
		this.FrameCount++;
		if (this.FpsEndTime - this.FpsStartTime >= 1000) {
			this.Fps = this.FrameCount;
			this.FrameCount = 0;
			this.FpsStartTime = performance.now();
		}
	}
	constructor() {
		this.Start();
	}
	valueOf() {
		return this.Fps;
	}
}
const tps = new PerformanceTester;
const fps = new PerformanceTester;

class ItemProperties {
	setProperties(obj) {
		for (let [key, value] of Object.entries(obj)) {
			this.createReadonly(key, value);
		}
		return this;
	}
	static of() {
		return new ItemProperties();
	}
	setType(type) {
		this.type = type;
		return this;
	}
	setIcon(icon) {
		this.icon = icon;
		return this;
	}
	setName(name) {
		this.name = name;
		return this;
	}
	setHealPower(healPower) {
		this.healPower = healPower;
		return this;
	}
	setGroup(group) {
		this.group = group;
		return this;
	}
	createReadonly(key, value) {
		Object.defineProperty(this, key,
			{
				get: function () {
					return value;
				}
			});
	}
}


let ItemType = new RegistryItemType;



class Item extends ItemProperties {
	static getParentKey = true;//necesary

	count = 10;
	roleSelectAble = false;
	constructor(count) {
		super(...arguments);
		this.count = count;

		inventory.push(this);
	}
	static init() {
		ItemType.register("apple", ItemHealable, ItemProperties.of().setGroup(Item.groupHeal).setIcon(1).setHealPower(20));
		ItemType.register("dummy", Item, ItemProperties.of().setGroup(Item.groupHeal).setIcon(0));
		ItemType.register("mineralWater", ItemProjectile, ItemProperties.of().setGroup(Item.groupHeal).setIcon(0));
	}
	mayUse(isRoleSelect, playerIndex = 0) {
		const index = this.getIndex;
		const player = players[playerIndex];


		//アイテム使用
		if (!this.roleSelectAble || isRoleSelect) {
			if (this.use(player)) {
				this.decrementStack(1);
				return true;
			}
			return false;
		}
		//誰が使いますか画面を出す
		jsonui_open("item_role_select", 128, 64, undefined, index);
		return 2;

	}
	use(player) {
		return true;
	}
	decrementStack(value = 1) {
		this.count -= value;
		if (this.count == 0)
			this.remove();
	}
	get getIndex() {
		return inventory.indexOf(this);
	}
	remove() {
		items.splice(this.getIndex, 1);
	}
	static register(id, itemClass) {
		ItemType.set(id, itemClass);
	}
	getRegisterName() {
		return
	}
	getDisplayName() {
		return translate(`item.${this.key}.name`);
	}
	getDisplayEfficacy() {
		return translate("item.efficacy.none");
	}
	getDisplayEfficacyIcon() {
		return null;
	}
	static groupHeal = Symbol("groupHeal");
	static groupMaterial = Symbol("groupMaterial");
	static group(group) {
		return items.entries().reduce((pre, [key, value]) => {
			if (value.group === group) pre.push(value)
			return pre;
		}, new Array());
	};
	dataConvert() {
		let obj = new Object();
		Object.assign(obj, this);
		obj.registerName = this.getRegisterName();

		return obj;
	}
	dataRestore(obj) {
		Object.assign(this, structuredClone(obj));
	}
	static dataRestore(obj) {
		regItems[obj.registerName]().dataRestore();
	}

}


class ItemRoleSelectAble extends Item {
	roleSelectAble = true;
}
class ItemHealable extends ItemRoleSelectAble {
	use(player) {
		return player.heal(this.healPower);
	}
	getDisplayEfficacy() {
		return translate("none");
	}
	getDisplayEfficacyIcon() {
		return Sprite.itemHealIcon;
	}
}
class ItemProjectile extends Item {
	use(player) {
		Entity.addFreshEntity(new EntityMineralWater(...player.pos).setRotateDegrees(player.rotate.degrees));
		return true;
	}
	getDisplayEfficacy() {
		return translate("none");
	}
	getDisplayEfficacyIcon() {
		return Sprite.itemHealIcon;
	}
}

let inventory = new Array();



class Cam {
	static level = null;
	static x = 0;
	static y = 0;
	static offset = new Vec2(0, 0);
	static tick() {
		let player = Player.control;
		let playerEntity = player.entity;
		this.level = playerEntity.level;
		this.x = playerEntity.pos.x - 160 + this.offset.x;
		this.y = playerEntity.pos.y - 80 + this.offset.y;
		return;
		if (this.x < 0) this.x = 0;
		if (this.y < 0) this.y = 0;
		if (this.x > 1280) this.x = 1280;
		if (this.y > 1420) this.y = 1420;
	}
}

class Phys {
	//thanks mc
	static move(xa, ya, level = this.level()) {
		if (Math.abs(xa) < 1)
			xa = 0;
		if (Math.abs(ya) < 1)
			ya = 0;
		this.ogPos = new pos(...this.pos);
		let ogXa = xa;
		let ogYa = ya;
		let aabbs = level.getCubes(this.bb.expand(xa, ya));
		Debug.hitboxesTile.push(...aabbs);
		for (let aabb of aabbs) {
			xa = aabb.clipXCollide(this.bb, xa);
		}
		this.bb.move(xa, 0);
		for (let aabb of aabbs) {
			ya = aabb.clipYCollide(this.bb, ya);
		}
		this.bb.move(0, ya);
		this.wasCollisioned = new Vec2(ogXa !== xa, ogYa !== ya);
		this.pos.x = Math.round((this.bb.x0 + this.bb.x1) / 2);
		this.pos.y = Math.round((this.bb.y0 + this.bb.y1) / 2);
	}
	static setPos(x, y) {
		this.bb = new AABB(x - this.size.w / 2, y - this.size.h / 2, x + this.size.w / 2, y + this.size.h / 2);
	}
}
//プレイヤーの変数の作成
//let player = new PlayerControl();


class Player {
	static control = null;

	classType = "player";
	entity = null;
	weapon = new Weapon;
	constructor() {
		this.entity = new EntityPlayer();
		this.weapon = new Weapon().setPlayer(this);

	}
	static setControlAble(player) {
		this.control = player;
	}
	spawnAt(spawnX = 0, spawnY = 0, spawnLevel = level) {
		this.entity.spawnAt(spawnX, spawnY, spawnLevel);
		return this;
	}
	setControlAble() {
		this.constructor.setControlAble(this);
		return this;
	}
	weaponTick() {
		if (canPlayerMoveForOpenGui()) {
			if (keyGroups.attack.down && this.weapon.time > 0)
				this.weapon.speed++;

			if (keyGroups.attack.press && (this.weapon.time <= 0 || this.weapon.time >= 20))
				this.weapon.attack();
		}

		//剣の動作
		this.weapon.tick();
	}
	updatePlayerLevel() {
		if (this.isControl()) Cam.level = this.entity.level;
	}
	tick() {
		this.weaponTick();
		this.updatePlayerLevel();
	}
	isControl() {
		return this.constructor.control === this;
		return players.indexOf(this) === 0;
	}
	dataConvert() {
		let obj = new Object();
		obj.entity = this.entity.dataConvert();
		obj.weapon

		return obj;
	}
}

class Players {
	classType = "players";
	constructor(ID = 0) {
		this.size = new Size(15, 15);
		this.bb = new AABB();
		this.speed = new Vec2(0, 0);
		this.pos = new pos(0, 0);
		this.moveTimer = 0;
		this.facing = 0;
		this.rotate = 0;
		this.weapon = new Weapon();
		this.maxHealth = 500;
		this.health = this.maxHealth;
		this.damageCooldown = 0;
		this.id = ID;
		this.exp = {
			exp: 0,
			lv: 0
		}
		this.alive = true;
		this.level = level;

	}
	tick() {

		if (canPlayerMoveForOpenGui()) {
			this.moveBase();
		}
		this.weaponTick();
		this.deathCheck();
		if (this.isControl()) PlayerControl = this;

		this.damageCooldown--;
	}
	weaponTick() {
		if (canPlayerMoveForOpenGui()) {
			if (keyGroups.attack.down && this.weapon.time > 0)
				this.weapon.speed++;

			if (keyGroups.attack.press && (this.weapon.time <= 0 || this.weapon.time >= 20))
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
		if (this.damageCooldown > 0) return false;

		//ノックバック処理
		if (typeof rx != "undefined" && typeof ry != "undefined") {
			this.knockback(rx, ry);
		}

		//ダメージ処理
		this.health -= damage;
		//クールダウン処理
		this.damageCooldown = 5;

	}
	heal(heal) {
		if (this.health === this.maxHealth) return false;
		this.health += Math.min(heal, this.maxHealth);
		return true;
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
		let drawOffset = new Vec2(-8, -16);
		drawImg(img.players, this.getAnimFlame() * 16, this.facing * 32, 16, 24, this.getPosX + drawOffset.x - Cam.x, this.getPosY + drawOffset.y - Cam.y);
	}
	getAnimFlame() {
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
	knockback(x, y) {
		this.speed.x += x;
		this.speed.y += y;
	}
	moveBase() {
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

		this.speedCalc();

		if (Math.abs(this.speed.x) + Math.abs(this.speed.y) >= 1) {
			this.wasMoved = true;
		} else {
			this.wasMoved = false;
		}

		//アニメーションに使用(値を変更すると速度が変わる)
		if (this.wasMoved) this.moveTimer += 0.12;

		this.move(this.speed.x, this.speed.y, true);

		//プレイヤー移動
	}
	speedCalc() {
		const preventPlayerMove = RioxUiMain.isPreventPlayerMove();

		//移動キー判定
		let key = new Object;
		if (this.isControl()) {
			if (!preventPlayerMove) {
				key.up = keyGroups.up.press;
				key.down = keyGroups.down.press;
				key.right = keyGroups.right.press;
				key.left = keyGroups.left.press;
			} else {
				key.up = false;
				key.down = false;
				key.right = false;
				key.left = false;
			}
		} else {

		}


		if (!preventPlayerMove && !keyGroups.attack.press || !Configs.get("AttackRotateRock")) {
			this.facing = Direction.getFacingByKey(key.up, key.down, key.left, key.right) ?? this.facing;
			this.rotate = Direction.getRotateByKey(key.up, key.down, key.left, key.right) ?? this.rotate;
		}

		//移動判定
		if (key.up || key.down || key.right || key.left) {
			this.isMoving = true;
		} else {
			this.isMoving = false;
		}



		//速度移動
		if (key.up) this.speed.y -= 0.425;
		if (key.down) this.speed.y += 0.425;
		if (key.right) this.speed.x += 0.425;
		if (key.left) this.speed.x -= 0.425;
	}
	move(xa, ya) {
		Phys.move.call(this, xa, ya, this.level);
	}
	setPos(xa, ya) {
		Phys.setPos.call(this, xa, ya);
	}
	get pos() {
		return new pos(
			Math.round((this.bb.x0 + this.bb.x1) / 2),
			Math.round((this.bb.y0 + this.bb.y1) / 2)
		);
	}
	set pos({ x: xa, y: ya }) {
		Phys.setPos.call(this, xa, ya);
	}
	isControl() {
		return players.indexOf(this) === 0;
	}
	dataConvert() {
		let obj = new Object();
		Object.assign(obj, this);

		return obj;
	}
	dataRestore({ pos, size, bb, speed, moveTimer, facing, rotate, weapon, maxHealth, health, damageCooldown, id, exp, alive }) {
		this.pos = pos;
		this.size = size;
		this.bb = bb;
		this.speed = speed;
		this.moveTimer = moveTimer;
		this.facing = facing;
		this.rotate = rotate;
		this.weapon = weapon;
		this.maxHealth = maxHealth;
		this.health = health;
		this.damageCooldown = damageCooldown;
		this.id = id;
		this.exp = exp;
		this.alive = alive;
		return this;
	}
}
class Weapon {
	classType = "weapon";
	constructor() {
		this.reset();
	}
	reset() {
		this.time = 0;
		this.pos = new Vec2(0, 0);
		this.start = new Vec2(0, 0);
		this.autoAim = new Vec2(0, 0);
		this.rotate = new Vec2(0, 0);
		this.speed = 1;
	}
	player = null;
	setPlayer(player) {
		this.player = player;
		return this;
	}
	attack() {
		this.time = 1;
		this.pos = new Vec2(...this.player.entity.pos);
		this.start = new Vec2(...this.player.entity.pos);
		this.autoAim = new Vec2(0, 0);
		this.rotate = this.player.entity.rotate;
		this.speed = 1;
	}
	tick() {
		const playerEntity = this.player.entity;
		const thisLevel = playerEntity.level;
		const breakLayer = "layer1";
		if (this.time > 0) {

			//攻撃
			let hit_enemy = new Array();
			hit_enemy = Entity.allOverlaps(new AABB(this.pos.x - 8, this.pos.y - 8, this.pos.x + 24, this.pos.y + 24), thisLevel, EntityEnemy);
			for (const entity of hit_enemy) {
				const facing = new Vec2(playerEntity.facing.dx, playerEntity.facing.dy);
				const knockbackPower = 2.5;
				const attackPower = 10;
				entity.damage(attackPower, facing.x * knockbackPower, facing.y * knockbackPower, true);
			}

			//岩壊す
			let breakTiles = thisLevel.overlapTiles(new AABB(this.pos.x - 8, this.pos.y - 8, this.pos.x + 24, this.pos.y + 24));
			for (const breakTile of breakTiles.filter(e => e.tile[breakLayer] in Game.breakableTileAbout)) {
				//console.log(breaks[0])
				const breakTileId = breakTile.tile[breakLayer];
				const breakableThisTileAbout = Game.breakableTileAbout[breakTileId];
				if (breakableThisTileAbout.breakProbability > Math.random()) {
					thisLevel.setTile(new tpos(breakTile.pos.x, breakTile.pos.y), { [breakLayer]: breakableThisTileAbout.becomeTile, hitbox: Game.hitbox.none });
					ParticleType.rockBreak.multiCreate(10).forEach(e => e.spawnAt(...new tpos(breakTile.pos.x, breakTile.pos.y).getEntityPos(), thisLevel))
					PlaySound("break", "tile");
				}

				ParticleType.rockBreak.multiCreate(0.2).forEach(e => e.spawnAt(...new tpos(breakTile.pos.x, breakTile.pos.y).getEntityPos(), thisLevel))
				PlaySound("breakbit", "tile", true);
			}

			//オートエイム
			if (this.time <= 12 && (hit_enemy.length == 0 || !Game.weapon_canlock) && Configs.get("weapon_auto_aiming")) {
				if (getNearestEntityDistance(this.start, EntityEnemy) < 100) {
					let entity = getNearestEntity(this.start, EntityEnemy);
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
			const attackTime = 12;
			const attackSize = 64;
			this.pos.x = Math.floor(this.rotate.dx * (Math.sin(Math.PI / 2 * this.time / attackTime) * attackSize) + this.autoAim.x + playerEntity.pos.x - 8);
			this.pos.y = Math.floor(this.rotate.dy * (Math.sin(Math.PI / 2 * this.time / attackTime) * attackSize) + this.autoAim.y + playerEntity.pos.y - 8);

			//カウントアップ
			if (hit_enemy.length == 0 || !Game.weapon_canlock) this.time += this.speed;

			//リセット
			if (this.time >= 24) this.reset()

		} else {
			this.time--;
		}
	}
	draw() {
		if (this.time <= 0) {
			let temptime = this.time.limit(-20, Infinity);

			this.draw_weapon(Direction.down, this.player.getPosX + Math.floor(make_slip_animation(Math.asin(-temptime / 10 / Math.PI)) * 16) - Cam.x, this.player.getPosY + make_slip_animation(Math.asin(-temptime / 10 / Math.PI)) * Math.floor(Math.sin(-this.time / 50) * 8 - 32) - Cam.y);
		} else {
			const animationSpeed = 1;
			const frameCount = 8;
			let weapon_rotation = Direction.getRotateByIndex(Math.floor((this.time / animationSpeed) % frameCount));

			this.draw_weapon(weapon_rotation, this.pos.x - Cam.x, this.pos.y - Cam.y);
			this.draw_sweep(weapon_rotation, this.pos.x - Cam.x, this.pos.y - Cam.y);

		}
	}
	draw_weapon(rotate, drawX, drawY) {
		drawImg(img.item_model, rotate * 32, 0, 32, 32, drawX + rotate.weaponOffset.x, drawY + rotate.weaponOffset.y);

	}
	draw_sweep(rotate, drawX, drawY) {
		const size = 7;
		let offset = new Vec2(
			4 * Math.sign(rotate.dx) * (rotate % 2) - 8 + Math.sign(rotate.dx) * size,
			4 * Math.sign(rotate.dy) * (rotate % 2) - 8 + Math.sign(rotate.dy) * size
		);

		drawImg(img.sweep, rotate * 32, 0, 32, 32, drawX + offset.x, drawY + offset.y);
	}
	dataRestore({ time, pos, start, autoAim, rotate, speed }) {
		this.time = time;
		this.pos = pos;
		this.start = start;
		this.autoAim = autoAim;
		this.rotate = rotate;
		this.speed = speed;
		return this;
	}

}

//事前に埋めとく
//player_movelog_reset();

let players = new Array();
let PlayerControl = null;
let entities = new Array();

let EntityType = new RegistryEntityType;

class EntityProperties {
	setProperties(obj) {
		for (let [key, value] of Object.entries(obj)) {
			this.createReadonly(key, value);
		}
		return this;
	}
	static of() {
		return new EntityProperties();
	}
	setType(type) {
		this.type = type;
		return this;
	}
	createReadonly(key, value) {
		Object.defineProperty(this, key,
			{
				get: function () {
					return value;
				}
			});
	}
}
//仮
class posGetSet {
	constructor(parent) {
		this.parent = parent;
	}
	get x() {
		return Math.round((this.parent.bb.x0 + this.parent.bb.x1) / 2);
	}
	get y() {
		return Math.round((this.parent.bb.y0 + this.parent.bb.y1) / 2);
	}
	set x(value) {
		return Phys.setPos.call(this.parent, value, this.y);
	}
	set y(value) {
		return Phys.setPos.call(this.parent, this.x, value);
	}
	toString() {
		return `x${this.x}_y${this.y}`;
	}
	[Symbol.iterator] = function* () {
		yield this.x;
		yield this.y;
	}
	classType = "posGetSetPlaceHolder";
}

class Entity extends EntityProperties {
	static getParentKey = true;//necesary

	neverSave = false;
	speed = new Vec2(0, 0);
	bb = new AABB();
	spawn = new Vec2(0, 0);
	pos = new posGetSet(this);
	ogPos = new pos(0, 0);
	wasMoved = false;
	isMoving = false;
	classType = "entity";
	level = null;
	wasCollisioned = new Vec2(false, false);
	alive = true;
	moveingTick = 0;
	movedTick = 0;


	moveSpeed = 0.25;
	size = new Size(16, 16);
	maxHealth = 20;
	health = null;


	static init() {
		EntityType.register("slimeBlue", EntitySlime, EntityProperties.of().setType(EntitySlime.typeBlue), 0x01);
		EntityType.register("mineralWater", EntityMineralWater, EntityProperties.of(), null);
		EntityType.register("crab", EntityCrab, EntityProperties.of(), 0x10);
	}
	constructor() {
		super(...arguments);
		this.health ??= this.maxHealth;

	}
	spawnAt(spawnX = 0, spawnY = 0, level = PlayerControl?.level) {
		this.level = level;
		this.spawn.x = spawnX;
		this.pos.x = spawnX;
		this.spawn.y = spawnY;
		this.pos.y = spawnY;

		this.setPos(spawnX, spawnY);

		level.entities.push(this);
	}
	tick() {
		this.moveBase();
		if (this.isMoving)
			this.moveingTick++;
		else
			this.moveingTick = 0;
		if (this.wasMoved)
			this.movedTick++;
		else
			this.movedTick = 0;
	}
	moveBase() {

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
		this.speedCalc();
		this.move(this.speed.x, this.speed.y);
		this.isMoving = this.speed.x > 0 || this.speed.y > 0;
		this.wasMoved = this.ogPos.x !== this.pos.x || this.ogPos.y !== this.pos.y;

	}
	move(xa, ya) {
		Phys.move.call(this, xa, ya, this.level);
	}
	setPos(xa, ya) {
		Phys.setPos.call(this, xa, ya);
	}
	get pos() {
		return new pos(
			Math.round((this.bb.x0 + this.bb.x1) / 2),
			Math.round((this.bb.y0 + this.bb.y1) / 2)
		);
	}
	set pos({ x: xa, y: ya }) {
		Phys.setPos.call(this, xa, ya);
	}
	speedCalc() {

	}
	draw() {
		let drawOffset = new Vec2(-8, -8);
		drawImg(img.enemy, 0, 0, 16, 16, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
	}
	drawCondition() {
		return Game.onScreenArea(new Rect(this.pos.x, this.pos.y, this.size.w, this.size.h));
	}
	damage(damage, rx = 0, ry = 0, byPlayer = false) {
		return false;
	}
	despawn() {
		const index = this.level.entities.indexOf(this);
		this.level.entities.splice(index, 1);
	}
	static register(name, id, classObj) {
		regEntity.set(name, classObj);
		// regEntityId.set(id, classObj);
	}
	getRegisterName() {
		return regEntity.entries().find(([key, value]) => value === this.constructor)?.[0]
	}
	dataConvert(obj = new Object) {
		obj.pos = this.pos;
		obj.speed = this.speed;
		obj.spawn = this.spawn;
		obj.wasMoved = this.wasMoved;
		obj.bb = this.bb;
		obj.health = this.health;
		obj.registerName = this.getRegisterName();
		obj.classType = "entity";
		return obj;
	}
	dataRestore({ pos, speed, spawn, wasMoved, bb, health }) {
		this.pos = pos;
		this.speed = speed;
		this.spawn = spawn;
		this.wasMoved = wasMoved;
		this.bb = bb;
		this.health = health;
		return this;
	}
	static allOverlaps(aabb, level, instance) {
		let hit = new Array();

		for (const entity of level.entities.filter(value => typeof instance === "object" ? value instanceof instance : true)) {
			if (entity.bb.simpleOverlap(aabb))
				hit.push(entity);
		}

		return hit;
	}
	debugDrawText(text, offset = new Vec2(0, 0)) {
		drawTextFont(text, this.pos.x + offset.x - Cam.x, this.pos.y + offset.y - Cam.y);
	}
}

class EntityPlayer extends Entity {
	neverSave = true;
	damageCooldown = 0;
	facing = 0;
	rotate = 0;
	maxHealth = 500;
	health = this.maxHealth;
	isControl() {
		return Player.control.entity === this;
	}
	speedCalc() {
		const preventPlayerMove = RioxUiMain.isPreventPlayerMove();

		let key = new Object;
		if (this.isControl()) {
			if (!preventPlayerMove) {
				key.up = keyGroups.up.press;
				key.down = keyGroups.down.press;
				key.right = keyGroups.right.press;
				key.left = keyGroups.left.press;
			} else {
				key.up = false;
				key.down = false;
				key.right = false;
				key.left = false;
			}
		} else {

		}


		if (!preventPlayerMove && !keyGroups.attack.press || !Configs.get("AttackRotateRock")) {
			this.facing = Direction.getFacingByKey(key.up, key.down, key.left, key.right) ?? this.facing;
			this.rotate = Direction.getRotateByKey(key.up, key.down, key.left, key.right) ?? this.rotate;
		}

		//移動判定
		if (key.up || key.down || key.right || key.left) {
			this.isMoving = true;
		} else {
			this.isMoving = false;
		}



		//速度移動
		if (key.up) this.speed.y -= 0.425;
		if (key.down) this.speed.y += 0.425;
		if (key.right) this.speed.x += 0.425;
		if (key.left) this.speed.x -= 0.425;
	}
	draw() {
		let drawOffset = new Vec2(-8, -16);
		drawImg(img.players, this.getAnimFlame() * 16, this.facing * 32, 16, 24, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
	}
	getAnimFlame() {
		if (this.wasMoved) {
			switch (Math.floor(this.movedTick / 5 % 4)) {
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

class EntityEnemy extends Entity {
	damageEffect = {
		Damage: 0,
		ViewTime: 0,
		HealthTime: 0
	}
	damageCooldown = 0;
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

		this.damageCooldown--;
		this.damageEffect.ViewTime--;
		this.damageEffect.HealthTime--;

		if (this.damageEffect.ViewTime <= 0) this.damageEffect.Damage = 0;

		if (this.health <= 0) {
			ParticleType.deathSmoke.multiCreate(5).forEach(e => e.spawnAt(this.pos.x, this.pos.y, this.level));
			this.despawn();
		}

	}
	attackTick() {

		this.attack.coolDown--;
		if (this.attackCondition) return;

		//playerid
		let i = 0;

		if (this.bb.simpleOverlap(PlayerControl?.bb)) {
			if (this.attack.coolDown <= 0) {
				this.attack.coolDown = 50
				this.attack.animFlag = true;
			}

			if (this.attack.animTime == 10)
				players[i].damage(this.attackPower, -Math.sign(this.pos.x - (subplayerx(i) + 8)), -Math.sign(this.pos.y - (subplayery(i) + 8)));
		}
	}
	damage(damage, rx = 0, ry = 0, byPlayer = false) {
		super.damage(...arguments);

		const knockbackResistance = 1.0;
		//クールダウン判定
		if (this.damageCooldown > 0) return false;

		//効果音
		PlaySound("damage", "enemy", true);

		//ノックバック処理
		this.speed.x += rx / knockbackResistance;
		this.speed.y += ry / knockbackResistance;

		//ダメージ処理
		this.health -= damage;
		//クールダウン処理
		this.damageCooldown = 5;

		//エフェクト処理
		this.damageEffect.Damage += damage;
		this.damageEffect.ViewTime = 100;
		this.damageEffect.HealthTime = 250;
		ParticleType.blueSlime.multiCreate(1).forEach(e => e.spawnAt(...new pos(this.pos.x, this.pos.y), this.level))


		return true;
	}
	drawDamageEffect() {
		if (this.damageEffect.HealthTime > 0)
			draw_hp(this.health / this.maxHealth, this.pos.x - Cam.x - 5, this.pos.y - Cam.y);

		if (this.damageEffect.ViewTime > 0)
			drawTextFont(this.damageEffect.Damage.toString(), this.pos.x - Cam.x, this.pos.y - 16 - Math.log10(-8 * (this.damageEffect.ViewTime / 100 - 1)) * 8 - Cam.y, {});

	}
	constructor() {
		super(...arguments);
	}
	dataConvert(obj = new Object) {
		obj.damageEffect = this.damageEffect;
		obj.damageCooldown = this.damageCooldown;
		obj.attack = this.attack;
		super.dataConvert(obj);
		return obj;
	}
	dataRestore({ damageEffect, damageCooldown, attack }) {
		this.damageEffect = damageEffect;
		this.damageCooldown = damageCooldown;
		this.attack = attack;
		super.dataRestore(...arguments);
		return this;
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
	speedCalc() {
		if (this.hostility) {

			/*
			let dis = getDistance(this.pos?.x, this.pos?.y, PlayerControl?.pos?.x, PlayerControl?.pos?.y);
			if (dis < 16) {
				this.wasMoved = false;
				return;
			}
			*/

			if (this.bb.scale(0.9).simpleOverlap(PlayerControl?.bb)) {
				this.wasMoved = false;
				return;
			}


			let r = calcAngleDegrees(
				PlayerControl?.pos?.x - this.pos.x,
				PlayerControl?.pos?.y - this.pos.y
			);
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
	dataConvert(obj = new Object) {
		obj.hostilityDelay = this.hostilityDelay;
		super.dataConvert(obj);
		return obj;
	}
	dataRestore({ hostilityDelay }) {
		this.hostilityDelay = hostilityDelay;
		super.dataRestore(...arguments);
		return this;
	}
}

class EntitySlime extends EntityEnemyNeutralBasic {
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
		const srcOffset = new Vec2(0, 0);
		const drawOffset = new Vec2(-8, -8);

		const srcPos = this.getDrawSourcePos();
		drawImg(img.enemy, srcOffset.x + srcPos.x, srcOffset.y + srcPos.y, 16, 16, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y - make_jump_animation(this.attack.animTime / 20) * 5);
		this.drawDamageEffect();
	}
	animationTick() {

		if (this.wasMoved) this.anim.flag = true;
		if (this.anim.flag) this.anim.time++;
		if (this.anim.time >= 20) {
			this.anim.time = 0;
			this.anim.flag = false;
		}

		if (this.anim.time == 8) ParticleType.blueSlime.multiCreate(1).forEach(e => e.spawnAt(...new pos(this.pos.x, this.pos.y), this.level))



		if (this.attack.animFlag) this.attack.animTime++;
		if (this.attack.animTime >= 20) {
			this.attack.animTime = 0;
			this.attack.animFlag = false;
		}
	}
	getDrawSourcePos() {
		let x = 0;
		let y = 0;

		if (this.anim.time > 0) x = Math.floor(this.anim.time / 20 * 3);
		if (this.attack.animTime > 0) x = Math.floor(this.attack.animTime / 20 * 3);

		return new Vec2(x * 16, y * 16);
	}
	static typeBlue = Symbol("Blue");
	dataConvert(obj = new Object) {
		obj.anim = this.anim;
		super.dataConvert(obj);
		return obj;
	}
	dataRestore({ anim }) {
		this.anim = anim;
		super.dataRestore(...arguments);
		return this;
	}
}

class EntityCrab extends EntityEnemy {
	maxHealth = 400;
	health = 400;
	size = new Size(32, 32);
	moveSpeed = 0.25;

	autoTurnWalkTick = 50;
	turnDelay = 10;
	damageMoveDelay = 3;

	targetStartRange = 8 * 16;
	targetEndRange = 16 * 16;

	facingSign = 1;
	walkTickAfterTurn = 0;
	turnTick = 0;
	damageTick = 0;

	target = null;


	tick() {
		super.tick(...arguments);


		if (this.wasCollisioned.x ||
			this.walkTickAfterTurn > this.autoTurnWalkTick)
			this.turn();

		this.walkTickAfterTurn++;
		this.turnTick--;
		this.damageTick--;


	}
	checkTarget() {
		let player = Player.control;
		let playerEntity = player.entity;
		let playerRange = getDistance(...this.pos, ...playerEntity.pos);

		this.debugDrawText(playerRange)
	}
	turn() {
		this.facingSign *= -1;// turn
		this.walkTickAfterTurn = 0;
		this.turnTick = this.turnDelay;
	}
	damage() {
		super.damage(...arguments);

		this.damageTick = this.damageMoveDelay;
	}
	speedCalc() {
		if (this.turnTick <= 0 && this.damageTick <= 0)
			this.speed.x += this.moveSpeed * this.facingSign;
	}
	animationTick() {
	}
	getDrawSourcePos() {
		return new Vec2(0, 0);
	}
	draw() {
		let srcOffset = new Vec2(0, 48);
		let drawOffset = new Vec2(-16, -16);

		const srcPos = this.getDrawSourcePos();
		drawImg(img.enemy, srcOffset.x + srcPos.x, srcOffset.y + srcPos.y, 32, 32, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
		this.drawDamageEffect();

		//drawTextFont(`x:${this.wasCollisioned.x},y:${this.wasCollisioned.y}`, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
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
	dataConvert(obj = new Object) {
		obj.movetemp = this.movetemp;
		super.dataConvert(obj);
		return obj;
	}
	dataRestore({ movetemp }) {
		this.movetemp = movetemp;
		super.dataRestore(...arguments);
		return this;
	}
}
const regEntity = new Map;
const regEntityId = new Map;
function register(obj, name, clas, prop) {
	obj[name] = (...arg) => {
		return new clas(prop, ...arg);
	}
	obj[name].constructor = clas;
}

class EntityProjectile extends Entity {
	power = 10;
	inertia = 0.9;
	homing = false;
	rotateDegrees = 0;
	constructor() {
		super(...arguments);
		this.speed.x = 0;
		this.speed.y = 0;
	}
	setRotateDegrees(d) {
		this.rotateDegrees = d;

		this.speed.x = Math.sin(this.rotateDegrees.degreesToRadians()) * this.power;
		this.speed.y = Math.cos(this.rotateDegrees.degreesToRadians()) * this.power;
		return this;
	}
	speedCalc() {

	}
	moveBase() {

		//スピード調整
		if (this.speed.x > 0) {
			this.speed.x = Math.floor(this.speed.x * this.inertia * 1000) / 1000;
		} else {
			this.speed.x = Math.ceil(this.speed.x * this.inertia * 1000) / 1000;
		}
		if (this.speed.y > 0) {
			this.speed.y = Math.floor(this.speed.y * this.inertia * 1000) / 1000;
		} else {
			this.speed.y = Math.ceil(this.speed.y * this.inertia * 1000) / 1000;
		}

		//動き替える
		this.speedCalc();
		this.move(this.speed.x, this.speed.y);

	}
}
class EntityMineralWater extends EntityProjectile {
	power = 10;
	inertia = 0.9;
	homing = false;
}

let particles = new Array();
let ParticleType = new RegistryParticleType();//ばぐのもと？

class ParticleProperties {
	setProperties(obj) {
		for (let [key, value] of Object.entries(obj)) {
			this.createReadonly(key, value);
		}
		return this;
	}
	static of() {
		return new EntityProperties();
	}
	setType(type) {
		this.type = type;
		return this;
	}
	createReadonly(key, value) {
		Object.defineProperty(this, key,
			{
				get: function () {
					return value;
				}
			});
	}
}

class Particle extends ParticleProperties {
	spawn = new pos(0, 0);
	pos = new pos(0, 0);
	time = 0;
	random = new Array();
	bb = new AABB();
	level = null;

	size = new Size(16, 16);
	lifetime = 0;

	static init() {
		ParticleType.register("rockBreak", ParticleSplinter, ParticleProperties.of().setType(ParticleSplinter.TypeRockBreak));
		ParticleType.register("blueSlime", ParticleSplinter, ParticleProperties.of().setType(ParticleSplinter.TypeBlueSlime));
		ParticleType.register("deathSmoke", ParticleSmoke, ParticleProperties.of().setType(ParticleSplinter.TypeDeath));
	}
	constructor() {
		super(...arguments);
		this.random = [Random(-1, 1), Random(-1, 1)];

	}
	spawnAt(spawnX = 0, spawnY = 0, level = PlayerControl?.level) {
		this.level = level;
		this.spawn.x = spawnX;
		this.pos.x = spawnX;
		this.spawn.y = spawnY;
		this.pos.y = spawnY;

		this.setPos(spawnX, spawnY);

		level.particles.push(this);
	}
	static createMulti(count = 1) {
		let multiparticles = new Array;
		if (count < 1.0) if (Math.random() > count) return multiparticles;

		for (let i = 0; i < count; i++) {
			multiparticles.push(this);
		}
		return multiparticles;
	}
	static getCreateCount(count = 1) {
		if (count < 1.0) if (Math.random() > count) return 0;

		return Math.ceil(count);
	}
	draw() {

	}
	drawCondition() {
		return Game.onScreenArea(new Rect(this.pos.x, this.pos.y, this.size.w, this.size.h))
	}
	tick() {
		this.time++;

		if (this.lifetime <= this.time) this.despawn();
	}
	despawn() {
		const index = this.level.particles.indexOf(this);
		this.level.particles.splice(index, 1);
	}
	move(xa, ya) {
		Phys.move.call(this, xa, ya, this.level);
	}
	setPos(xa, ya) {
		Phys.setPos.call(this, xa, ya);
	}
	get pos() {
		return new pos(
			Math.round((this.bb.x0 + this.bb.x1) / 2),
			Math.round((this.bb.y0 + this.bb.y1) / 2)
		);
	}
	set pos({ x: xa, y: ya }) {
		Phys.setPos.call(this, xa, ya);
	}
}

class ParticleSplinter extends Particle {
	size = new Size(8, 8);
	DrawOffset = new Vec2(0, 0);
	lifetime = Random(25, 50, true);

	draw() {
		const drawOffset = this.getDrawOffset();
		const srcPos = this.getDrawSourcePos();

		drawImg(img.particle, srcPos.x, srcPos.y, 16, 16, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
	}
	getDrawOffset() {
		return new Vec2(
			this.random[0] * 16 * Easings.scatter(this.time / this.lifetime),
			-Easings.jump(this.time / this.lifetime * 2) * 4
		);
	}
	getDrawSourcePos() {
		switch (this.type) {
			default:
			case this.TypeRockBreak:
				return new Vec2(16, 16);
			case this.TypeBlueSlime:
				return new Vec2(0, 16);
		}
	}
	static TypeRockBreak = Symbol("TypeRockBreak");
	static TypeBlueSlime = Symbol("TypeBlueSlime");
}
class ParticleSmoke extends Particle {

	size = new Size(8, 8);
	DrawOffset = new Vec2(0, 0);
	lifetime = Random(25, 50, true);

	draw() {
		const drawOffset = this.getDrawOffset();
		const srcPos = this.getDrawSourcePos();

		drawImg(img.particle, srcPos.x, srcPos.y, 16, 16, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
	}
	getDrawOffset() {
		return new pos(
			this.random[0] * this.time / 10,
			-Math.abs(this.random[1] * this.time / 10)
			- this.time / 5 - this.random[1] * 4
		)
	}
	getDrawSourcePos() {
		switch (this.type) {
			default:
			case this.TypeDeath:
				return new Vec2(Math.floor(this.time / this.lifetime * 8) * 16, 0);
		}
	}
	static TypeDeath = Symbol("TypeDeath");
}
class splinterParticle extends Particle {

	size = new Size(8, 8);
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

	size = new Size(16, 16);
	DrawOffset = new Vec2(0, 0);
	lifetime = Random(50, 100, true);

	draw() {
		drawImg(img.particle, this.DrawOffset.x + Math.floor(this.time / this.lifetime * 8) * 16, this.DrawOffset.y, 16, 16, getDrawPosX(this.pos.x + this.random[0] * this.time / 10), getDrawPosY(this.pos.y + -Math.abs(this.time * this.random[1] / 10), -this.time / 5 - this.random[1] * 4));
	}
}

const chunkSize = new Size(256, 256);


class Level {
	rawData = null;
	chunks = new Object;
	entities = new Array;
	particles = new Array;
	levelName = "test";
	async chunkLoad(cpos) {
		//新しいチャンクで待機
		this.chunks[cpos.getChunkPos().toString()] = ChunkLevel.create(level, cpos, this.levelName);

		return this.chunks[cpos.getChunkPos().toString()] = await ChunkLevel.load(level, cpos, this.levelName);
	}
	async chunkCreate(cpos) {
		return this.chunks[cpos.getChunkPos().toString()] = ChunkLevel.create(level, cpos, this.levelName);
	}
	toString() {

	}
	getTile(pos) {
		if (pos.isChunkPos) throw new Error("is cpos");
		return this.getChunk(pos)?.getTile(pos) ?? new Tile;
	}
	setTile(pos, tile) {
		if (pos.isChunkPos) throw new Error("is cpos");
		return this.getChunk(pos)?.setTile(pos, tile);
	}
	getChunk(pos) {
		return this.chunks[pos.getChunkPos().toString()] ?? null;
	}
	hasChunk(cpos) {
		let cposArr = Array.toArray(cpos);
		cposArr.forEach(value => value.getChunkPos());
		for (const cpos of cposArr) {
			if (Object.keys(this.chunks).includes(cpos.toString())) return true;
		}
		return false;
	}
	autoLoadDispose(plPos) {
		const plCpos = new tpos(plPos.x / 16, plPos.y / 16).getChunkPos()
		const loadcpos = [
			new cpos(plCpos.x + 1, plCpos.y + 1),
			new cpos(plCpos.x + 0, plCpos.y + 1),
			new cpos(plCpos.x - 1, plCpos.y + 1),
			new cpos(plCpos.x + 1, plCpos.y + 0),
			new cpos(plCpos.x + 0, plCpos.y + 0),
			new cpos(plCpos.x - 1, plCpos.y + 0),
			new cpos(plCpos.x + 1, plCpos.y - 1),
			new cpos(plCpos.x + 0, plCpos.y - 1),
			new cpos(plCpos.x - 1, plCpos.y - 1)
		]
		for (const cpos of loadcpos) {
			if (this.hasChunk(cpos)) continue;
			this.chunkLoad(cpos);
		}
		for (const chunk of Object.keys(this.chunks)) {
			if (!loadcpos.map(value => value.toString()).includes(chunk))
				delete this.chunks[chunk];
		}
	}
	getCubes(aabb) {
		let aabbs = new Array;
		let x0 = Math.floor(aabb.x0 / 16 - 1);
		let x1 = Math.ceil(aabb.x1 / 16 + 1);
		let y0 = Math.floor(aabb.y0 / 16 - 1);
		let y1 = Math.ceil(aabb.y1 / 16 + 1);
		for (let x = x0; x < x1; x++) {
			for (let y = y0; y < y1; y++) {
				switch (this.getTile(new tpos(Math.floor(x), Math.floor(y))).hitbox) {
					case 1:
						aabbs.push(new AABB(Math.floor(x) * 16, Math.floor(y) * 16, Math.floor(x) * 16 + 16, Math.floor(y) * 16 + 16, { tileX: x, tileY: y }));
						break;
					default:
						break;
				}

			}
		}
		return aabbs;
	}
	/**
	 * 
	 * @param {AABB} aabb bounding box
	 * @param {Number[]} checkTile check condition
	 * @param {String} checkLayer layer to check
	 * @returns {Tile} tile
	 */
	overlapTiles(aabbSrc, checkTile, checkLayer) {
		let aabb = aabbSrc.scale(1)

		let x = Math.round(aabb.x0 / 16);
		let y = Math.round(aabb.y0 / 16);

		let hit = new Array();

		let debugenabled = Configs.get("DebugHitboxShow").value
		if (debugenabled)
			Debug.hitboxView.push(aabbSrc);
		let debug;

		for (let ix = 0; ix < Math.ceil((aabb.x1 - aabb.x0) / 16); ix++) {
			for (let iy = 0; iy < Math.ceil((aabb.y1 - aabb.y0) / 16); iy++) {

				let Tile_ = level.getTile(new tpos(x + ix, y + iy)) ?? null;

				let result = {
					pos: new Vec2(x + ix, y + iy),
					tile: Tile_
				}
				if (!allElemDefined(checkTile))
					hit.push(result);
				if (allElemDefined(checkTile) && Array.toArray(checkTile).includes(result.tile?.[checkLayer]))
					hit.push(result);

				if (debugenabled)
					Debug.hitboxView.push(new AABB(x + ix, y + iy, x + ix + 1, y + iy + 1).scale(16));
				debug = result.tile;
			}

		}
		return hit;
	}
}

let level = new Level;
// const dim = { main: level };//place holder

class ChunkLevelOld {
	constructor(rawObj, cpos = console.error("no cpos")) {
		if (rawObj === null) rawObj = ChunkLevel.getDefaultValue();
		this.cData = rawObj.cData.map(value => new Tile(...value));
		this.cpos = cpos;
	}
	init(cpos) {
		this.cpos = cpos;
	}
	dispose(level) {

	}
	static create(level, cpos) {
		return new ChunkLevel(this.getDefaultValue(), cpos);
	}
	static async load(level, cpos, levelName) {
		//return new ChunkLevel(level.rawData.chunks[pos.x][pos.y]);
		return new ChunkLevel(await loadJson(`/maps/${levelName}/${cpos.toString()}.json`) ?? null, cpos);
	}
	static getDefaultValue() {
		const chunk = new Object;
		chunk.cData = new Array(chunkSize.w * chunkSize.h).fill(Array.from(new Tile(0, 0, 0, 0)));
		return chunk;
	}
	toString() {
		const thisCopy = Object.assign({}, this);
		thisCopy.cData = thisCopy.cData.map(value => Array.from(value))
		return JSON.stringify(thisCopy);
	}
	getTile(pos) {
		return this.cData[pos.getInChunkIndex()];
	}
}
class ChunkLevel {
	constructor(rawObj, cpos = console.error("no cpos")) {
		if (rawObj === null) this.cData = ChunkLevel.getDefaultValue().cData;
		else {
			switch (rawObj.cData.version) {
				case "1.0":
				default:
					this.cData = ChunkLevel.updateV1toV2(rawObj.cData);
					break;
				case "2.0":
					this.cData = ChunkLevel.convert(rawObj.cData);
					break;
			}
		}
		this.cpos = cpos;
	}
	init(cpos) {
		this.cpos = cpos;
	}
	dispose(level) {

	}
	static create(level, cpos) {
		return new ChunkLevel(this.getDefaultValue(), cpos);
	}
	static async load(level, cpos, levelName) {
		//return new ChunkLevel(level.rawData.chunks[pos.x][pos.y]);
		return new ChunkLevel(await loadJson(`/maps/${levelName}/${cpos.toString()}.json`) ?? null, cpos);
	}
	static getDefaultValue() {
		const cData = new Object;
		cData.layer1 = new Uint8Array(new ArrayBuffer(chunkSize.w * chunkSize.h)).fill(1);
		cData.layer2 = new Uint8Array(new ArrayBuffer(chunkSize.w * chunkSize.h)).fill(1);
		cData.hitbox = new Uint8Array(new ArrayBuffer(chunkSize.w * chunkSize.h)).fill(0);
		cData.enemy = new Uint8Array(new ArrayBuffer(chunkSize.w * chunkSize.h)).fill(0);
		cData.version = "2.0";
		return { cData: cData };
	}
	toString() {
		const thisCopy = structuredClone(this);
		thisCopy.cData.layer1 = Array.from(thisCopy.cData.layer1);
		thisCopy.cData.layer2 = Array.from(thisCopy.cData.layer2);
		thisCopy.cData.hitbox = Array.from(thisCopy.cData.hitbox);
		thisCopy.cData.enemy = Array.from(thisCopy.cData.enemy);
		return JSON.stringify(thisCopy);
	}
	getTile(pos) {
		return new Tile(
			this.cData.layer1[pos.getInChunkIndex()],
			this.cData.layer2[pos.getInChunkIndex()],
			this.cData.hitbox[pos.getInChunkIndex()],
			this.cData.enemy[pos.getInChunkIndex()],
		)
	}
	setTile(pos, tile) {
		if (tile.layer1 !== null && tile.layer1 !== undefined)
			this.cData.layer1[pos.getInChunkIndex()] = tile.layer1;
		if (tile.layer2 !== null && tile.layer2 !== undefined)
			this.cData.layer2[pos.getInChunkIndex()] = tile.layer2;
		if (tile.hitbox !== null && tile.hitbox !== undefined)
			this.cData.hitbox[pos.getInChunkIndex()] = tile.hitbox;
		if (tile.enemy !== null && tile.enemy !== undefined)
			this.cData.enemy[pos.getInChunkIndex()] = tile.enemy;
		return tile;
	}
	static updateV1toV2(cData1) {
		if (cData1.version === "2.0") return cData1;
		//console.log(cData1)
		const cData2 = new Object;
		cData2.layer1 = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.layer2 = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.hitbox = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.enemy = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.version = "2.0";
		cData1.forEach((value, index) => {
			cData2.layer1[index] = value[0];
			cData2.layer2[index] = value[1];
			cData2.hitbox[index] = value[2];
			cData2.enemy[index] = value[3];
		})

		return cData2;
	}
	static convert(cData1) {
		const cData2 = new Object;
		cData2.layer1 = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.layer2 = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.hitbox = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.enemy = new Int8Array(new ArrayBuffer(chunkSize.w * chunkSize.h));
		cData2.version = "2.0";
		cData2.layer1.set(cData1.layer1);
		cData2.layer2.set(cData1.layer2);
		cData2.hitbox.set(cData1.hitbox);
		cData2.enemy.set(cData1.enemy);


		return cData2;
	}
}

class Tile {
	constructor(layer1 = 0, layer2 = 0, hitbox = 0, enemy = 0) {
		this.layer1 = layer1;
		this.layer2 = layer2;
		this.hitbox = hitbox;
		this.enemy = enemy;
	}
}

Tile.prototype[Symbol.iterator] = function* () {
	yield this.layer1;
	yield this.layer2;
	yield this.hitbox;
	yield this.enemy;
}

class SaveGame {
	static dirHandle = null;
	static saveDirHandle = null;
	static SaveDataFileName = "save.json";
	static SaveDirName = "saves";
	static ext = ".json";
	static fileHandleArray = new Array;
	static fileArray = new Array;
	static curFileHandle = null;
	static reviver(key, value) {
		switch (value?.classType) {
			case "vec2":
				return new Vec2(value.x, value.y);
			case "size":
				return new Size(value.w, value.h);
			case "rect":
				return new Rect(value.x, value.y, value.w, value.h);
			case "range":
				return new Range(value.min, value.max);
			case "startend":
				return new StartEnd(value.startX, value.startY, value.endX, value.endY);
			case "pos":
				return new pos(value.x, value.y);
			case "cpos":
				return new cpos(value.x, value.y);
			case "aabb":
				return new AABB(value.x0, value.y0, value.x1, value.y1);
			case "direction":
				return Direction.dataRestore(value);
			case "weapon":
				return new Weapon().dataRestore(value);
			case "players":
				return new Players().dataRestore(value);
			case "entity":
				const entityClass = regEntity.get(value.registerName);
				return new entityClass().dataRestore(value);
			case undefined:
				break;
			default:
				throw new Error("unknown classType: " + value.classType)
		}
		return value;
	}
	static replacer(key, value) {
		switch (value?.classType) {
			case "vec2":
				return value;
			case "size":
				return value;
			case "rect":
				return value;
			case "range":
				return value;
			case "startend":
				return value;
			case "pos":
				return value;
			case "cpos":
				return value;
			case "aabb":
				return value;
			case "direction":
				return { name: value.name, type: value.type, classType: value.classType };
			case "weapon":
				return value;
			case "players":
				return value.dataConvert();
			case "entity":
				return value.dataConvert();
			case "value":
				return value.dataConvert();
			case undefined:
				break;
			default:
				throw new Error("unknown classType: " + value.classType)
		}
		return value;

	}
	static restoreSaveData(obj) {
		level.entities = obj.entities.level;
		players = obj.players;
		items = obj.items;

		return;
		for (const entityData of obj.entities) {
			Entity.dataRestore(entityData);
		}
		for (const playerData of obj.players) {
			Players.dataRestore(playerData);
		}
		for (const itemData of obj.items) {
			Item.dataRestore(itemData);
		}
	}
	static convertSaveData() {
		let obj = new Object;
		obj.entities = new Object;
		obj.entities.level = level.entities;
		obj.players = players;
		obj.items = items;
		return obj;

		for (const entity of entities) {
			obj.entities.push(entity.dataConvert());
		}
		for (const player of players) {
			obj.players.push(player.dataConvert());
		}
		for (const item of items) {
			obj.items.push(item.dataConvert());
		}

		return obj;
	}
	static initialize() {
		entities = new Array();
		players = new Array();
		items = new Array();

	}
	static async saveInit() {
		const rootDirHandle = await this.createDirHandle();
		const saveDirHandle = await this.createSaveDirHandle(rootDirHandle);
		const saveDirHandleArray = await this.createSaveDirFileHandleArray();
	}
	static saveBeforeMain(fileHandle) {
		const rawData = SaveGame.convertSaveData();
		const jsonData = JSON.stringify(rawData, this.replacer);
		return jsonData;
	}
	static loadAfterMain(json) {
		//same 
		SaveGame.initialize();
		SaveGame.restoreSaveData(JSON.parse(json, SaveGame.reviver));

	}
	static async saveAs(fileName) {
		const fileHandle = await this.createFileHandle(fileName, this.saveDirHandle);
		const jsonData = this.saveBeforeMain(fileHandle);
		this.writeFile(fileHandle, jsonData);
		this.curFileHandle = fileHandle;
	}
	static async loadAs(fileName) {
		const fileHandle = await this.createFileHandle(fileName, this.saveDirHandle);
		const jsonData = await this.loadFile(fileHandle);
		this.loadAfterMain(jsonData);
		this.curFileHandle = fileHandle;
	}
	static async writeFile(fileHandle, contents) {
		const writeAble = await fileHandle.createWritable();
		await writeAble.write(contents);
		await writeAble.close();
	}
	static async loadFile(fileHandle) {
		const file = await fileHandle.getFile();
		return await file.text();
	}
	static async createDirHandle() {
		IsLoading = true;
		const option = { mode: "readwrite", id: "varical" };
		return this.dirHandle ??= await window.showDirectoryPicker(option).then(e => { IsLoading = false; return e; }).catch(e => { console.warn(e); IsLoading = false; return e; });
	}
	static async createSaveDirHandle(rootDirHandle) {
		const option = { mode: "readwrite", id: "varical" };
		return this.saveDirHandle = await rootDirHandle.getDirectoryHandle(this.SaveDirName, { "create": true });
	}
	static async createFileHandle(fileName, dirHandle = this.dirHandle) {
		return this.curFileHandle = await dirHandle.getFileHandle(fileName, { "create": true });
	}
	static async getFileHandleArray(dirHandle) {
		let arr = new Array;
		for await (const e of dirHandle.entries()) {
			arr.push(e);
		}
		return arr;
	}
	static async createSaveDirFileHandleArray() {//くそながいやんけ
		return this.fileHandleArray = await Array.fromAsync((this.saveDirHandle ?? void await this.saveInit() ?? this.saveDirHandle).values());
	}
	static async createSaveDirFileArray() {
		const array = await this.createSaveDirFileHandleArray()
		return this.fileArray = await Promise.all(array.map(async v => v.getFile()));
		//thanks copilot
	}
	static compareFileDate(a, b) {
		if (a.lastModified > b.lastModified) {
			return -1;
		} else if (b.lastModified > a.lastModified) {
			return 1;
		}
		return 0;
	}
}
//せのお　かわいい

class Game {
	static ver = "24m05w2";

	static sessionTick = 0;
	static isRelease = false;

	static saveloadingnow = false;
	static saveloadfaliedtime = -1;
	static saveloadfaliedtype = -1;
	static saveloadsuccesstime = -111;
	static saveloadsuccesstype = -111;
	static PopUpDelay = 100;

	static PlayingScreen = false;

	static move_limit = 32767;
	static weapon_canlock = false;
	static PI = Math.floor(Math.PI * Math.pow(10, 5)) / Math.pow(10, 5);

	static colorPallet = {
		"magenta": "magenta",//accsent
		"green": "lime",
		"blue": "blue",
		"black": "black",// common
		"gray": "gray",
		"white": "white"
	}

	static map = new Object;

	static map_path = {
		"VillageAround": "param/maps/VillageAroundMap.map",
		"LvSpot": "param/maps/LvSpotMap.map",
		"Default": "param/maps/Map.map"
	}

	static hitbox = {
		none: 0x0,
		full: 0x1
	}

	static breakableTileAbout = {
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

	static animationTile = {
		7: {

		}
	}

	static DontDrawTile = [
		0
	]

	static enemy_type = [
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

	static gui_system_items = [
		"menu.system.config",
		"menu.system.data",
		"menu.system.about"
	]
	static gui_system_data_items = [
		"menu.system.data.select",
		"menu.system.data.save",
		"menu.system.data.load"
	]

	static config_name = [
		"player",
		"weapon",
		"data",
		"control",
		"sounds",
		"other",
		"debug"
	]

	static config_icons = [
		"player",
		"weapon",
		"colorFloppy",
		"gamepad",
		"sound",
		"other",
		"debug"
	]

	static soundGroupsConfig = {
		"player": "sound_player",
		"tile": "sound_tile",
		"enemy": "sound_enemy",
		"gui": "sound_gui",
		"bgm": "bgm",
		"other": "other"
	}

	static select_y_size = [
		16, 16, 16, 16
	]

	static savemetadata = {
		"codename": "Varical",
		"ver": Game.ver
	}

	static title_items = [
		"newgame",
		"loadgame"
	]

	static UIListScrollable = [
		"items",
		"roles",
		"hud_hp",
		"UIOpen",
		"config"
	]


	static getTileID(maplayer = "map1", x, y) {
		if (typeof Game.map[maplayer] !== "undefined")
			if (y >= 0 && y < Game.map[maplayer].length)
				if (x >= 0 && x < Game.map[maplayer][y].length)
					return Game.map[maplayer][y][x];
	}
	static async NewGame() {
		if (Game.PlayingScreen) return false;

		//コンフィグリセット
		configReset();

		//マップDefault(placeholder)
		// await mapchange("Default");

		Game.StartGame();
	}
	static async LoadGame() {
		if (Game.PlayingScreen) return false;



		Game.StartGame();
	}
	static async StartGame() {
		if (Game.PlayingScreen) return false;

		RioxUiMain.uiList = new Array;
		new RioxUiHud().openUi();

		players[0] = new Player().setControlAble().spawnAt(0, 0, level);
		//PlayerControl = players[0];
		// RioxUiMain.init();
		Cam.level = Player.control.entity.level;

		Game.PlayingScreen = true;
	}
	static async Title() {
		RioxUiMain.uiList = new Array;
		new RioxUiTitle().openUi();

		Game.PlayingScreen = false;
	}
	static onScreenArea(size) {
		let ax = Cam.x;
		let ay = Cam.y;
		let aw = ScreenWidth;
		let ah = ScreenHeight;
		let bx = size.x;
		let by = size.y;
		let bw = size.w;
		let bh = size.h;

		let acx = ax + aw / 2;
		let acy = ay + ah / 2;
		let bcx = bx + bw / 2;
		let bcy = by + bh / 2;

		let dx = Math.abs(acx - bcx);
		let dy = Math.abs(acy - bcy);

		let sx = (aw + bw) / 2;
		let sy = (ah + bh) / 2;

		return dx < sx && dy < sy;
	}
	static characterCheck = false;//文字のことです
}

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

		let busyCorsor = `cursorBusy${timer / 8 % 8 >= 6 ? 0 : 1}`;

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
			this.CursorOldPos.x = this.CursorOldPos.x.limit(0, Infinity);
			this.CursorOldPos.y = this.CursorOldPos.y.limit(0, Infinity);
		}

		for (let i in this.cursors) {
			let cursor = this.cursors[i];
			if (i != this.cursors.length - 1) Sprite.cursorUns.draw(cursor.x, cursor.y);

			if (i == this.cursors.length - 1) Sprite[IsBusy() ? busyCorsor : "cursor"].draw(Math.round(this.CursorOldPos.x + cursorOfseX), this.CursorOldPos.y);
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
	constructor(element) {
		this.sound = element;
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
	/**
	 * audio要素を作成します 使用例: new Sound(await createAudioElem(url, volume));
	 * @param {*} url ファイルのURL
	 * @param {*} volume 音量
	 * @returns audio要素
	 */
	static async createAudioElem(url, volume = 1) {
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
	static async init(url, volume = 1) {
		return new Sound(await Sound.createAudioElem(url, Math.min(1, volume)));
	}
}


let IsLoading = true;

//キャンバスのやつ
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
changeCanvasSize(zoomX, zoomY);
function changeCanvasSize(x, y) {
	ctx.scale(1 / zoomX, 1 / zoomY);
	zoomX = x;
	zoomY = y;
	canvas.width = ScreenWidth * zoomX;
	canvas.height = ScreenHeight * zoomY;
	ctx.scale(zoomX, zoomY);
	//アンチエイリアスを無効にする
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
}


//コンテキストメニュー禁止
document.oncontextmenu = () => {
	return false;
};

//フォント
ctx.font = '20px sans-serif';

//デバッグ用の変数の作成
let debug = new Object();
debug.hitboxes = new Array();
debug.hitboxesTile = new Array();
debug.hitbox_visible = false;
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
	"fastLoad": true// test module
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
/*
let fps = 0;
let frameCount = 0;
let startTime;
let endTime;

startTime = new Date().getTime();

let MainProcStartTime = 0;
let MainProcEndTime = 0;
let MainProcTime = 0;
*/


//キーの変数の作成


class KeyData {
	press = false;
	wasPress = false;
	down = false;
	hold = false;
	time = -1;
	now = -1;
	change(isDown) {
		this.wasPress = this.press;
		this.press = isDown;
		//isDown ? this.time++ : this.time = 0;
		//this.now = Game.sessionTick;
	}
	tick() {
		const [holdStartDelay, holdRepeatDelay] = [30, 2]
		this.press ? this.time++ : this.time = -1;
		this.down = this.time == 0;
		this.hold = this.time == 0 || this.time > holdStartDelay && this.time % holdRepeatDelay == 0;
		this.wasPress = this.press;
	}
	hasChanged() {
		return this.press !== this.wasPress;
	}
}

let keyList;
function keyReset() {
	keyList = Array.from(new Array(255)).map(() => new KeyData());
}
keyReset();

class TouchData {
	time = -1;
	pos = null;
}

class KeyGroup {
	constructor(keyCodes, touchBtns, gamepadBtns) {
		this.keyCodes = keyCodes;
		this.touchBtns = touchBtns;
		this.gamepadBtns = gamepadBtns;
	}
	tick() {
		this.press = false;
		this.down = false;
		this.hold = false;
		for (const keyCode of this.keyCodes) {
			const keyData = keyList[keyCode];
			if (keyData.press) this.press ||= true;
			if (keyData.down) this.down ||= true;
			if (keyData.hold) this.hold ||= true;
		}
	}
	press = false;
	down = false;
	hold = false;
}
class KeyGroups {
	static register(groupname, keycode, touchButton, gamepadButton) {
		keyGroups[groupname] = new KeyGroup(keycode, touchButton, gamepadButton);
	}
}
let keyGroups = new Object();
KeyGroups.register("up", [38, 87]);
KeyGroups.register("down", [40, 83]);
KeyGroups.register("left", [37, 65]);
KeyGroups.register("right", [39, 68]);
KeyGroups.register("attack", [32]);
KeyGroups.register("confirm", [90]);
KeyGroups.register("cancel", [88]);
KeyGroups.register("menu", [67]);


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
	console.log(e)
});

// ------------------------------------------------------------
// ゲームパッドの接続を解除すると実行されるイベント
// ------------------------------------------------------------
window.addEventListener("gamepaddisconnected", function (e) {
	var gamepad = e.gamepad;
	console.log(e)
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

const touchList = new Array();
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

class TouchButton {
	constructor(posx, posy, width, height) {
		this.posx = posx;
		this.posy = posy;
		this.width = width;
		this.height = height;
	}
	press = false;
	time = 0;
}

let touchmode = false;



class Sprite {
	static drawByAtlas(imgObj, srcX, srcY, srcWidth, srcHeight, drawX, drawY, area = {}) {
		ctx.save();

		Sprite.drawareaInit(area.x, area.y, area.w, area.h);

		drawImg(imgObj, srcX, srcY, srcWidth, srcHeight, Math.round(drawX), Math.round(drawY));

		ctx.restore();
	}
	static register(name, imgObj, srcX, srcY, srcWidth, srcHeight) {

		this[name] = new Object();
		this[name].img = imgObj;
		this[name].srcX = srcX;
		this[name].srcY = srcY;
		this[name].srcWidth = srcWidth;
		this[name].srcHeight = srcHeight;

		this[name][Symbol.iterator] = function* () {
			yield this.img;
			yield this.srcX;
			yield this.srcY;
			yield this.srcWidth;
			yield this.srcHeight;
		}
		this[name].draw = (x, y, ox = 0, oy = 0, ow = 0, oh = 0) => {
			//console.log(this[name].img, this[name].drawX + ox, this[name].drawY + oy, this[name].drawWidth + ow, this[name].drawHeight + oh, Math.round(x), Math.round(y))
			drawImg(this[name].img, this[name].drawX + ox, this[name].drawY + oy, this[name].srcWidth + ow, this[name].srcHeight + oh, Math.round(x), Math.round(y));
		}
		this[name].draw = (drawX, drawY, area = {}) => {
			ctx.save();
			Sprite.drawareaInit(area.x, area.y, area.w, area.h);

			drawImg(this[name].img, this[name].srcX, this[name].srcY, this[name].srcWidth, this[name].srcHeight, Math.round(drawX), Math.round(drawY));

			ctx.restore();

		}
	}
	static registerNineSlice(name, imgobj, nineSliceSize, baseSizeWidth, baseSizeHeight) {

		this[name] = new Object();
		this[name].img = imgobj;
		this[name].nineSliceSize = nineSliceSize;
		this[name].baseSizeWidth = baseSizeWidth;
		this[name].baseSizeHeight = baseSizeHeight;

		this[name].draw = (dx, dy, dw, dh, area = {}) => {
			ctx.save();
			Sprite.drawareaInit(area.x, area.y, area.w, area.h);

			const baseSize = new Size(this[name].baseSizeWidth, this[name].baseSizeHeight);
			const drawBox = new Rect(dx, dy, dw, dh);
			const slices = [
				[0, 0, nineSliceSize, nineSliceSize, drawBox.x - nineSliceSize, drawBox.y - nineSliceSize, nineSliceSize, nineSliceSize],
				[nineSliceSize, 0, baseSize.w, nineSliceSize, drawBox.x, drawBox.y - nineSliceSize, drawBox.w, nineSliceSize],
				[nineSliceSize + baseSize.w, 0, nineSliceSize, nineSliceSize, drawBox.x + drawBox.w, drawBox.y - nineSliceSize, nineSliceSize, nineSliceSize],
				[0, nineSliceSize, nineSliceSize, baseSize.h, drawBox.x - nineSliceSize, drawBox.y, nineSliceSize, drawBox.h],
				[nineSliceSize, nineSliceSize, baseSize.w, baseSize.h, drawBox.x, drawBox.y, drawBox.w, drawBox.h],
				[nineSliceSize + baseSize.w, nineSliceSize, nineSliceSize, baseSize.h, drawBox.x + drawBox.w, drawBox.y, nineSliceSize, drawBox.h],
				[0, nineSliceSize + baseSize.h, nineSliceSize, nineSliceSize, drawBox.x - nineSliceSize, drawBox.y + drawBox.h, nineSliceSize, nineSliceSize],
				[nineSliceSize, nineSliceSize + baseSize.h, baseSize.w, nineSliceSize, drawBox.x, drawBox.y + drawBox.h, drawBox.w, nineSliceSize],
				[nineSliceSize + baseSize.w, nineSliceSize + baseSize.h, nineSliceSize, nineSliceSize, drawBox.x + drawBox.w, drawBox.y + drawBox.h, nineSliceSize, nineSliceSize],
			]
			for (const slice of slices) {
				drawImg(this[name].img, ...slice.map(v => Math.round(v)));
			}
			ctx.restore();

		}
	}
	static drawareaInit(x, y, startX, startY, endX, endY) {
		const drawX = x + startX;
		const drawY = y + startY;
		const width = endX - startX;
		const height = endY - startY;

		if (allElemDefined(startX, startY, endX, endY)) {
			ctx.beginPath();
			ctx.rect(drawX, drawY, width, height);
			ctx.clip();
		}
	}
	static drawareaInit(X, Y, width, height) {
		if (allElemDefined(X, Y, width, height)) {
			ctx.beginPath();
			ctx.rect(X, Y, width, height);
			ctx.closePath();
			ctx.clip();
		}
	}
	static init() {
		Sprite.register("hp", img.gui, 48, 0, 16, 8);
		Sprite.register("toggleOn", img.gui, 0, 16, 16, 8);
		Sprite.register("toggleOff", img.gui, 0, 24, 16, 8);
		Sprite.register("cursor", img.gui, 32, 0, 8, 8);
		Sprite.register("cursorUns", img.gui, 32, 8, 8, 8);
		Sprite.register("cursorBusy0", img.gui, 40, 0, 8, 8);
		Sprite.register("cursorBusy1", img.gui, 40, 8, 8, 8);
		Sprite.register("itemHealIcon", img.gui, 224, 0, 32, 0);
		Sprite.registerNineSlice("prompt", img.gui_prompt, 8, 8, 8);
	}

}

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
				case "list":
					if (Game.UIListScrollable.includes(UIContent.renderer))
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
	ShouldOpenAnim() {
		let topLayerData = JsonUIOpen[JsonUIOpen.length - 1];

		if (!this.getUIContent(0)?.inactiveHidden?.this) return this.state === 1;
		if (!topLayerData.getUIContent(0)?.inactiveHidden?.target) return this.state === 1;

		return this.state === 1 && jsonui_active(this.index);
	}
	ShouldCloseAnim() {
		let topLayerData = JsonUIOpen[JsonUIOpen.length - 1];

		if (this.getUIContent(0)?.inactiveHidden?.this === false) return this.state === -1;
		if (topLayerData.getUIContent(0)?.inactiveHidden?.target === false) return this.state === -1;

		return this.state === -1 || !jsonui_active(this.index);
	}
	ActiveChangeDetect() {
		//bug fix
		let topLayerData = JsonUIOpen[JsonUIOpen.length - 1];
		this.#noActiveChange = !topLayerData.getUIContent(0)?.inactiveHidden?.target
		if (this.#noActiveChange) return;
		//end

		this.#ActiveChange.active = !this.#ActiveChange.TickAgo && jsonui_active(this.index) && this.#ActiveChange.TickAgo !== undefined;
		this.#ActiveChange.inactive = this.#ActiveChange.TickAgo && !jsonui_active(this.index) && this.#ActiveChange.TickAgo !== undefined;
		this.#ActiveChange.TickAgo = jsonui_active(this.index);


		if (this.#ActiveChange.active) this.activeTime = 0;
		if (this.#ActiveChange.inactive) this.inactiveTime = 0;
	}
	#ActiveChange = {
		active: false,
		inactive: false,
		TickAgo: undefined
	}
	#noActiveChange = false;
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
	}
	draw() {

		for (const UIContent of this.UIGroup) {

			this.defaultProc(UIContent, ...Array.toArray(UIContent.animIn), ...Array.toArray(UIContent.animOut), UIContent.trans);


			let Draw = new JsonUIDraw(UIContent, this, false);
			let UIData = JsonUIOpen[this.index];
			if (UIContent.drawLog === "OffsetX") JsonUIOpen[this.index].data[UIContent.id] = Draw.Offset.x;

			switch (UIContent.type) {
				case "text":
					drawTextFont(translate(jsonui_variable(UIContent.text), undefined, UIContent, undefined, this.index), Draw.Offset.x, Draw.Offset.y, { color: Game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
					break;
				case "button":
					draw_rectangle(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
					drawTextFont(translate(UIContent.text), Draw.Offset.x, Draw.Offset.y, { color: Game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
					break;
				case "tabConfig":
					let sizeOverride = new JsonUIDraw(loadedjson.jsonui[UIID][0], this.index).Offset.x - Draw.Offset.x;
				//console.log(sizeOverride)
				case "tab":
					draw_tab(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt, img.gui_tab_select, UIContent.tabType, UIData.data.selectid === UIContent.id);
					drawTextFont(translate(UIContent.text), Draw.Offset.x, Draw.Offset.y, { color: Game.colorPallet.black, align: "start", startX: 0, startY: 0, endX: Draw.size.x, endY: Draw.size.y });
					break;
				case "rectangle":
					draw_rectangle(Draw.Offset.x, Draw.Offset.y, Draw.size.x, Draw.size.y, img.gui_prompt);
					break;
				case "list":
					this.listRenderer(UIContent, Draw);
					break;
			}
		}

		if (debug.uiActiveTime) {
			drawTextFont(this.activeTime, 0, this.index * 16 + 0, {});
			drawTextFont(this.inactiveTime, 0, this.index * 16 + 8, {});
		}

	}
	getListItems(renderer) {

		// items代入
		switch (renderer) {
			case "items":
				return items;
			case "roles":
			case "hud_hp":
				return players;
			case "UIOpen":
				return Object.keys(loadedjson.jsonui);
			case "config":
				return getConfigsGroup(this.data.tab);
		}
	}
	listRenderer(UIContent, Draw) {
		let drawItems = this.getListItems(UIContent.renderer);
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

						//let drawTextTempl = (text, font = "", AddX = 0, AddY = 0) => draw_text(text, Math.min(itemOffset.x + AddX, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset + AddY, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top, undefined, undefined, font, -1, 0, -ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top);
						let drawTextTempl = (text, color = Game.colorPallet.black, AddX = 0, AddY = 0) => {
							const TextX = itemOffset.x + Draw.Offset.x + AddX;
							const TextY = itemOffset.y + Draw.Offset.y + AddY + DrawOffset;
							const StartX = 0
							const StartY = -DrawOffset - itemOffset.y
							const EndX = Draw.size.x - itemOffset.x - AddX;
							const EndY = Draw.size.y - itemOffset.y - AddY - DrawOffset;

							drawTextFont(text, TextX, TextY, { color: color, align: undefined, startX: StartX, startY: StartY, endX: EndX, endY: EndY });

						}
						let drawImageTempl = (image, sx, sy, sw, sh, AddX = 0, AddY = 0) => {
							const TextX = itemOffset.x + Draw.Offset.x + AddX;
							const TextY = itemOffset.y + Draw.Offset.y + AddY + DrawOffset;
							const StartX = 0
							const StartY = -DrawOffset - itemOffset.y
							const EndX = Draw.size.x - itemOffset.x - AddX;
							const EndY = Draw.size.y - itemOffset.y - AddY - DrawOffset;

							drawImg(image, sx, sy, sw, sh, TextX, TextY, { startX: EndX, startY: EndY, endX: StartX, endY: StartY });
						}

						switch (UIContent.items[key].tag) {
							case "atlas_img":
								drawImg(img.items, getTileAtlasXY(drawItem.id).x, getTileAtlasXY(drawItem.id).y - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
								break;
							case "text":
								drawTextTempl(translate(UIContent.items[key].text));
								break;
							case "ttftext":
								draw_text_ttf(translate(UIContent.items[key].text));
								break;
							case "ItemRender":
								drawImageTempl(img.items, ...getTileAtlasXY(drawItem.icon), 16, 16);
								break;
							case "ItemName":
								drawTextTempl(drawItem.getDisplayName());
								break;
							case "ItemCount":
								drawTextTempl(drawItem.count, Game.colorPallet.magenta);
								break;
							case "ItemEfficacy":
								drawTextTempl(drawItem.getDisplayEfficacy, "start", "black", 32, 0);
								drawImageTempl(...drawItem.getDisplayEfficacyIcon());
								break;
							case "ConfigName":
								drawTextTempl(translate(drawItem.name));
								break;
							case "ConfigValue":
								switch (drawItem.type) {
									case "bool":
										if (drawItem.value)
											drawImageTempl(img.gui, 0, 16, 16, 8);
										else
											drawImageTempl(img.gui, 0, 24, 16, 8);
										break;
									default:
										drawTextTempl(translate(drawItem.value));
										break;
								}
								break;
							case "debugtest":
								drawTextTempl(`${ObjOut.top},${ObjOut.bottom}`, "_purple");
								break;
							case "role_icon":
								drawImg(img.gui, players[itemIndex].id * 8, 48 - ObjOut.top, itemSize.x, ObjOut.bottom + ObjOut.top, Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top);
								break;
							case "role_hp":
								drawTextTempl(players[itemIndex].health);
								break;
							case "img":
							case "image":
								Sprite[UIContent.items[key].img].draw(Math.min(itemOffset.x, Draw.size.x) + Draw.Offset.x, Math.min(DrawOffset, Draw.size.y) + Draw.Offset.y + itemOffset.y - ObjOut.top, 0, -ObjOut.top, 0, ObjOut.bottom + ObjOut.top - itemSize.y);
								break;
							case "uilist":
								drawTextTempl(drawItem, "_purple");
								break;
						}
					}
				}
				break;
		}
	}
	control() {
		let UIContent = this.getUIContent(this.select);

		//アロー関数だとthisが使える
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
					if (!(param[0] in items)) break;
					items[param[0]].mayUse(param[1]);
					break;
				case "data":
					JsonUIOpen[this.index].data[param[0]] = param[1];
					break;
				case "ChangeConfig":
					let configData = config[this.data.configRender.select];
					switch (configData.type) {
						case "bool":
							configData.value = !configData.value;
							break;
					}
					break;
			}
		}

		if (UIContent.trans !== undefined) {
			if (UIContent.trans.tickBefore !== undefined) trigger(UIContent.trans.tickBefore);
			for (let transkey of Object.keys(KeyGroups).filter((key) => key in UIContent.trans)) {
				if (KeyGroups[transkey]) trigger(UIContent.trans[transkey]);
			}
			if (UIContent.trans.tickAfter !== undefined) trigger(UIContent.trans.tickAfter);

		}
		if (UIContent.type === "list" && Game.UIListScrollable.includes(UIContent?.renderer)) {
			let data = this.data[UIContent.id];
			if (true) {
				if (keyGroups.down.hold && data.select < items.length - 1) data.select++
				if (keyGroups.up.hold && data.select > 0) data.select--
				if (keyGroups.down.hold || keyGroups.up) PlaySound("select", "gui");

				if (data.select * 16 - data.scroll <= 0)
					data.scroll += Math.floor((data.select * 16 - data.scroll) / 2);
				if (data.select * 16 - data.scroll + 16 > new Vec2(...UIContent.size).y)
					data.scroll += Math.ceil((data.select * 16 - data.scroll + 16 - new Vec2(...UIContent.size).y) / 2);
			} else {
				if (keyGroups.down.hold) data.scroll++;
				if (keyGroups.up.hold) data.scroll--;
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
			case "list":
				if (Game.UIListScrollable.includes(UIContent.renderer))
					JsonUICursor.push(new Vec2(Draw.Offset.x + Draw.CursorOffset.x, Draw.Offset.y + Draw.CursorOffset.y + data.select * 16 - data.scroll));
				else
					JsonUICursor.push(new Vec2(Draw.Offset.x + Draw.CursorOffset.x, Draw.Offset.y + Draw.CursorOffset.y));
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

}
function jsonui_draw() {
	for (let UIData of JsonUIOpen) {
		UIData.draw();
	}
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


function loadJsonuiSelect(UIIndex = JsonUIOpen.length - 1) {
	return JsonUIOpen[UIIndex].select;
}


function jsonui_open(type, DefaultX, DefaultY, DefaultSelectID, param) {
	JsonUIOpen.push(new JsonUI(type, DefaultX, DefaultY, DefaultSelectID, param));
}

let JsonUIOpen = new Array();

let JsonUICursor = new Cursor();

class RioxUiMain {
	static tickmain() {
		this.keyPress();
		for (const ui of this.uiList) {
			ui.tick();
		}
	}
	static drawmain() {
		for (const ui of this.uiList) {
			if (!ui.isFocused() && ui.exitCondition() && !(ui.isOverlay || ui.noUnFocusHide)) continue;
			ui.drawMain();
			ui.debugDrawTick();
		}
		this.drawCursor();
	}
	static keyPress() {
		if (this.uiList.length <= 0) return;
		const ui = this.uiList.findLast((e) => !e.exited && !e.isOverlay);
		for (const [key, value] of Object.entries(keyGroups)) {
			if (value.press) ui.keyPressed(key, "press");
			if (value.down) ui.keyPressed(key, "down");
			if (value.hold) ui.keyPressed(key, "hold");
		}
	}
	static isPreventPlayerMove() {
		const ui = this.uiList.findLast((e) => !e.exited && !e.isOverlay);
		return ui.preventPlayerMove ?? false;
	}
	static getUiof(index) {
		return RioxUiMain.uiList[index];
	}
	static uiList = new Array();
	static cursor = new Cursor();
	static drawCursor() {
		if (this.uiList.length <= 0) return;
		const ui = this.uiList.findLast((element) => !element.exited);
		const cursorVec2 = ui.getCursorVec2();
		if (cursorVec2) this.cursor.push(cursorVec2);
		this.cursor.draw();
	}

}

class RioxUiAnim {
	/**
	 * 
	 * @param {second} second 
	 * @param {number} size 
	 * @param {number} offset 
	 * @param {second} delay 
	 * @param {RioxUiAnimType} type 
	 * @param {Easings} easing 
	 */
	loop = false;
	constructor(second, size, offset, delay, type, easing) {
		this.second = second;
		this.size = size;
		this.offset = offset;
		this.delay = delay;
		this.type = type;
		this.easing = easing;
		this.now = Date.now() / 1000;
	}
	get end() {
		return this.now + this.second;
	}
	getProgress() {
		return (1 - (this.end - Date.now() / 1000 + this.delay) / this.second).limit(0, 1);
	}
	getAnimationValue() {
		return (-1 + this.easing(this.getProgress())) * this.size + this.offset;
	}
	animatedVec2(Vec2) {
		switch (this.type) {
			case RioxUiAnimType.Vec2X:
				Vec2.x += this.getAnimationValue();
				break;
			case RioxUiAnimType.Vec2Y:
				Vec2.y += this.getAnimationValue();
				break;
		}
		return Vec2;
	}
	static animatedVec2(Vec2, anims) {
		anims = Array.toArray(anims);
		for (const anim of anims) {
			Vec2 = anim.animatedVec2(Vec2);
		}
		return Vec2;
	}
}
class RioxUiAnimType {
	static register(name) {
		RioxUiAnimType[name] = Symbol(name);
	}
}
RioxUiAnimType.register("Vec2X");
RioxUiAnimType.register("Vec2Y");

class Easings {
	static none(x) {
		return x;
	}
	static easeOutElastic(x) {
		const c4 = (2 * Math.PI) / 3;

		return x === 0
			? 0
			: x === 1
				? 1
				: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
	}
	static easeInExpo(x) {
		return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
	}
	static easeOutExpo(x) {
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
	}
	static easeInQuart(x) {
		return Math.pow(x, 4);
	}
	static easeOutQuart(x) {
		return 1 - Math.pow(1 - x, 4);
	}
	static slip(x) {
		return Math.log10(8 * x * 4);
	}
	static scatter(x) {
		if (x < 0.5) return make_slip_animation(x);
		if (x >= 0.5) return 1;
	}
	static jump(x) {
		if (x < 1) return Math.sin(x * 6.28 - 2);
		if (x >= 1) return Math.sin(4.28);
	}
}

class RioxUiVariable {
	_wm = new Map();
	set(key, value) {
		let clone = Object.create(Object.getPrototypeOf(this), structuredClone(Object.getOwnPropertyDescriptors(this)));
		clone._wm.set(key, value);
		return clone;
	}
	clear() {
		this._wm = new Map();
	}
	delete(k) {
		let clone = Object.create(Object.getPrototypeOf(this), structuredClone(Object.getOwnPropertyDescriptors(this)));
		clone._wm.delete(k);
		return clone;
	}
	get(k) {
		return this._wm.get(k);
	}
	has(k) {
		return this._wm.has(k);
	}
}

class RioxUiBase {
	preventPlayerMove = false;
	exited = false;
	defaultVariable = new RioxUiVariable;
	isOverlay = false;
	noUnFocusHide = false;
	#lastFocus = false;
	static openUi() {
		return new this().openUi(...arguments);
	}
	openUi(variable = this.defaultVariable) {
		this.defaultVariable = variable;
		return RioxUiMain.uiList.push(this);
	}
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
	}
	debugDrawTick() {
	}
	drawChild(arg, child, relVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		const [Vec2Par = new Vec2(0, 0), sizePar = new Size(ScreenWidth, ScreenHeight), variablePar = this.defaultVariable, animationsPar = []] = arg;
		child.drawMain(new Vec2(Vec2Par.x + relVec2.x, Vec2Par.y + relVec2.y), size, variable, animations);
	}
	keyPressed(keyGroup, type) {

	}
	tick() {
		if (this.exited && this.exitCondition()) this.exit();
		this.focusCheck();
	}
	exitCondition() {
		return true;
	}
	mayExitCondition() {
		return true;
	}
	exit() {
		RioxUiMain.uiList.splice(this.getIndex(), 1);
	}
	getIndex() {
		return RioxUiMain.uiList.indexOf(this);
	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		this.exited = true;
		return true;
	}
	getCursorVec2() {
		return false;
	}
	focusCheck() {
		if (!this.#lastFocus && this.isFocused()) this.focusStart();
		if (this.#lastFocus && !this.isFocused()) this.focusEnd();
		this.#lastFocus = this.isFocused();
	}
	isFocused() {
		const ui = RioxUiMain.uiList.findLast((element) => !element.exited && !element.isOverlay);
		return this === ui;
	}
	focusStart() { }
	focusEnd() { }
}

class RioxUiListBase extends RioxUiBase {
	selectItemIndex = 0;
	listScroll = 0;
	listRealScroll = 0;
	itemListPanel = new RioxUiBase;
	listArray = new Array;
	listSizeTemp = Infinity;
	debugLavel = new RioxUiLavelBase;
	#animOffset = 0;
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		if (this.listArray.length > 0) {
			const animVec2 = RioxUiAnim.animatedVec2(new Vec2(0, 0), animations);
			variable = variable.set("area", new Rect(drawVec2.x + animVec2.x, drawVec2.y + animVec2.y, ...size));

			// this.drawChild(arguments, this.debugLavel, new Vec2(64 + 32, 0), new Size(16, 16), variable.set("text", `${this.listScroll.toFixed(3)},${this.listRealScroll.toFixed(3)}\n${((this.listRealScroll - this.listScroll) / 2).toFixed(3)}`).set("area", {}), animations);
			this.listSizeTemp = size.h / 16 - 1;
			for (const renderIndex in this.listArray.slice(Math.floor(this.listScroll / 16), Math.floor(this.listScroll / 16) + Math.ceil(size.h / 16 + 1))) {
				const index = +renderIndex + Math.floor(this.listScroll / 16);
				const item = this.listArray[index];
				const DrawOffset = renderIndex * 16 - this.listScroll % 16;

				let animOffset = 0;
				if (this.animArray !== undefined)
					animOffset = this.animArray[index] * 8;
				//console.log(this.animArray)

				this.drawChild(arguments, this.itemListPanel, new Vec2(animOffset, DrawOffset), size, this.variableModify(variable, item), animations);
			}

		}
	}
	tick() {
		super.tick();

		// めちゃくちゃ汚くてすまんw!!
		let offset = this.selectItemIndex - this.listScroll / 16;
		while (this.selectItemIndex - this.listRealScroll / 16 < 0) this.listRealScroll--;
		while (this.selectItemIndex - this.listRealScroll / 16 > this.listSizeTemp) this.listRealScroll++;
		if (offset < 0) this.listScroll += (this.listRealScroll - this.listScroll) / 2;
		if (offset > this.listSizeTemp) this.listScroll += (this.listRealScroll - this.listScroll) / 2;

	}
	variableModify(variable, item) {
		return variable;
	}
	selectItemIndexMoveBy(value) {
		const beforeIndex = this.selectItemIndex;
		this.selectItemIndex += value;
		this.selectItemIndex = this.selectItemIndex.limit(0, Math.max(0, this.listArray.length - 1));
		return beforeIndex !== this.selectItemIndex;
	}
	selectItemIndexMoveTo(value) {
		const beforeIndex = this.selectItemIndex;
		this.selectItemIndex = value.limit(0, Math.max(0, this.listArray.length - 1));//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectItemIndex;
	}
	get selectItem() {
		return this.listArray[this.selectItemIndex];
	}
	itemClick(selectItem) {
		return selectItem;
	}

}

class RioxUiListBaseAnimation extends RioxUiListBase {
	animArray = new Array;
	tick() {
		super.tick();
		if (this.animArray.length !== this.listArray.length)
			this.animArray = new Array(this.listArray.length).fill(1);
		// console.log(this.animArray)
		for (const index in this.animArray) {
			if (+index === this.selectItemIndex)
				this.animArray[index] += (0 - this.animArray[index]) / 2;
			else
				this.animArray[index] += (1 - this.animArray[index]) / 2;
		}
	}
}

class RioxUiLavelBase extends RioxUiBase {
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
		drawTextFont(variable.get("text") ?? "", ...drawVec2, { color: variable.get("color") }, variable.get("area"));
	}
}
class RioxUiLavelBaseRightAlign extends RioxUiBase {
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
		drawVec2.x += size.w;
		drawTextFont(variable.get("text") ?? "", ...drawVec2, { color: variable.get("color"), align: "right" }, variable.get("area"));
	}
}
class RioxUiButtonBase extends RioxUiBase {
	lavel = new RioxUiLavelBase;
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		{
			drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
			Sprite.prompt.draw(...drawVec2, ...size, undefined);
		}
		if (variable.has("text"))
			this.drawChild(arguments, this.lavel, new Vec2(0, 0), size, variable, animations);
	}
}
class RioxUiInputBase extends RioxUiBase {
	lavel = new RioxUiLavelBase;
	value = "";
	placeholder = "";
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		{
			drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
			Sprite.prompt.draw(...drawVec2, ...size, undefined);
		}
		this.drawChild(arguments, this.lavel, new Vec2(0, 0), size, variable.set("text", this.value || this.placeholder), animations);
	}
	edit() {
		this.value = prompt("placeholder", this.value);
		keyReset();
	}
}
class RioxUiPanelBase extends RioxUiBase {
	lavel = new RioxUiLavelBase;
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		{
			drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
			Sprite.prompt.draw(...drawVec2, ...size, undefined);
		}
		if (variable.has("text")) {
			Sprite.prompt.draw(drawVec2.x, drawVec2.y - 16, ...new Size(64, 16), new Rect(drawVec2.x - 8, drawVec2.y - 16 - 8, 64 + 8 + 8, 16 + 8 - 4));
			this.drawChild(arguments, this.lavel, new Vec2(0, -16), size, variable, animations);
		}
	}
}
class RioxUiPrompt extends RioxUiBase {
	lavelTitle = new RioxUiLavelBase;
	lavelText = new RioxUiLavelBase;
	yesButton = new RioxUiLavelBase;
	noButton = new RioxUiLavelBase;
	bgColor = "#daffff";
	selectButton = this.yesButton;
	drawMain(drawVec2 = new Vec2(64, 32), size = new Size(144, 64), variable = this.defaultVariable, animations = []) {
		Sprite.prompt.draw(...drawVec2, ...size, undefined);
		this.drawBgColor(drawVec2);
		if (variable.has("title"))
			this.drawChild(arguments, this.lavelTitle, new Vec2(drawVec2.x, drawVec2.y), new Size(144, 16), variable.set("text", variable.get("title")), animations);
		if (variable.has("text"))
			this.drawChild(arguments, this.lavelText, new Vec2(drawVec2.x, drawVec2.y + 8), new Size(144, 64), variable.set("text", variable.get("text")), animations);
		this.drawChild(arguments, this.yesButton, new Vec2(drawVec2.x + size.w - 48, drawVec2.y + size.h - 8), size, variable.set("text", "yes"), animations);
		this.drawChild(arguments, this.noButton, new Vec2(drawVec2.x + size.w - 16, drawVec2.y + size.h - 8), size, variable.set("text", "no"), animations);
	}
	drawBgColor(drawVec2) {
		ctx.save();
		ctx.fillStyle = this.bgColor;
		ctx.fillRect(drawVec2.x, drawVec2.y, 144, 8);
		ctx.restore();
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			switch (keyGroup) {
				case "right":
					this.selectButton = this.yesButton;
					break;
				case "left":
					this.selectButton = this.noButton;
					break;
				case "right":
				case "confirm":
					this.buttonClick(this.selectButton);
					break;
			}
		}
	}
	buttonClick(button) {
		switch (button) {
			case this.yesButton:
				this.yesFunc();
				this.mayExit();
				break;
			case this.noButton:
				this.noFunc();
				this.mayExit();
				break;
			default:
		}
	}
	getCursorVec2() {
		return new Vec2()
	}
	yesFunc() { }
	noFunc() { }
}

class RioxUiHud extends RioxUiBase {
	preventPlayerMove = false;
	noUnFocusHide = true;
	playerPanel = new RioxUiPanelBase;
	playerLavel = new RioxUiLavelBase;
	fpsLavel = new RioxUiLavelBase;
	playerPanelAnim = new RioxUiAnim(0.1, 10, null, 0, RioxUiAnimType.Vec2Y, Easings.easeInExpo);
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.playerPanel, new Vec2(8, 8), new Size(48, players.length * 8), variable, this.playerPanelAnim);
		this.drawChild(arguments, this.fpsLavel, new Vec2(0, ScreenHeight - 8), new Size(48, 8), variable.set("text", `FPS:${+fps},TPS:${+tps}`), []);
		for (const index in players) {
			const player = players[index];
			this.drawChild(arguments, this.playerLavel, new Vec2(8, index * 8 + 8), new Size(48, 8), variable.set("text", player.health), this.playerPanelAnim);
		}
	}
	keyPressed(keyGroup, type) {
		switch (keyGroup) {
			case "menu":
				if (type === "down")
					new RioxUiMenu().openUi();
				break;
			default:
				break;
		}
	}
}

class RioxUiMenu extends RioxUiBase {
	preventPlayerMove = true;
	menuTabParty = new RioxUiButtonBase;
	menuTabPartyAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	menuTabItems = new RioxUiButtonBase;
	menuTabItemsAnim = new RioxUiAnim(0.1, 64, 0, 0.015, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	menuTabEquip = new RioxUiButtonBase;
	menuTabEquipAnim = new RioxUiAnim(0.1, 64, 0, 0.030, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	menuTabConfig = new RioxUiButtonBase;
	menuTabConfigAnim = new RioxUiAnim(0.1, 64, 0, 0.045, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	menuTabSave = new RioxUiButtonBase;
	menuTabSaveAnim = new RioxUiAnim(0.1, 64, 0, 0.060, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	selectTabIndex = 0;
	tabs = [this.menuTabParty, this.menuTabItems, this.menuTabEquip, this.menuTabConfig, this.menuTabSave];
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.menuTabParty, new Vec2(16, 16), new Size(48, 8), variable.set("text", "Party"), this.menuTabPartyAnim);
		this.drawChild(arguments, this.menuTabItems, new Vec2(16, 32), new Size(48, 8), variable.set("text", "items"), this.menuTabItemsAnim);
		this.drawChild(arguments, this.menuTabEquip, new Vec2(16, 48), new Size(48, 8), variable.set("text", "Equip"), this.menuTabEquipAnim);
		this.drawChild(arguments, this.menuTabConfig, new Vec2(16, 64), new Size(48, 8), variable.set("text", "Config"), this.menuTabConfigAnim);
		this.drawChild(arguments, this.menuTabSave, new Vec2(16, 80), new Size(48, 8), variable.set("text", "Save"), this.menuTabSaveAnim);
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			switch (keyGroup) {
				case "up":
					this.selectTabIndexMoveBy(-1);
					break;
				case "down":
					this.selectTabIndexMoveBy(1);
					break;
				case "right":
				case "confirm":
					this.tabClick(this.selectTab);
				default:
					break;
			}
		}
		if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
			if (type === "down")
				this.mayExit();

	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		super.mayExit();
		this.menuTabPartyAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabItemsAnim = new RioxUiAnim(0.1, -64, -64, 0.015, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabEquipAnim = new RioxUiAnim(0.1, -64, -64, 0.030, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabConfigAnim = new RioxUiAnim(0.1, -64, -64, 0.045, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabSaveAnim = new RioxUiAnim(0.1, -64, -64, 0.060, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	exitCondition() {
		return this.menuTabSaveAnim.getProgress() >= 1;
	}
	focusEnd() {
		super.focusEnd();
		this.menuTabPartyAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabItemsAnim = new RioxUiAnim(0.1, -64, -64, 0.015, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabEquipAnim = new RioxUiAnim(0.1, -64, -64, 0.030, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabConfigAnim = new RioxUiAnim(0.1, -64, -64, 0.045, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabSaveAnim = new RioxUiAnim(0.1, -64, -64, 0.060, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	focusStart() {
		super.focusStart();
		this.menuTabPartyAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabItemsAnim = new RioxUiAnim(0.1, 64, 0, 0.015, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabEquipAnim = new RioxUiAnim(0.1, 64, 0, 0.030, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabConfigAnim = new RioxUiAnim(0.1, 64, 0, 0.045, RioxUiAnimType.Vec2X, Easings.easeInExpo);
		this.menuTabSaveAnim = new RioxUiAnim(0.1, 64, 0, 0.060, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	selectTabIndexMoveBy(value) {
		const beforeIndex = this.selectTabIndex;
		this.selectTabIndex += value;
		this.selectTabIndex = this.selectTabIndex.limit(0, this.tabs.length - 1);
		return beforeIndex !== this.selectTabIndex;
	}
	selectTabIndexMoveTo(value) {
		const beforeIndex = this.selectTabIndex;
		this.selectTabIndex = value.limit(0, this.tabs.length - 1);//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectTabIndex;
	}
	get selectTab() {
		return this.tabs[this.selectTabIndex];
	}
	tabClick(tab) {
		switch (tab) {
			case this.menuTabItems:
				RioxUiMenuTabItems.openUi();
				break;
			case this.menuTabConfig:
				RioxUiMenuTabConfig.openUi();
				break;
			case this.menuTabSave:
				RioxUiMenuTabSave.openUi();
				break;
			default:
			//console.warn(tab);
		}
	}
	getCursorVec2() {
		return new Vec2(8, this.selectTabIndex * 16 + 16);
	}
}

class RioxUiItemIcon extends RioxUiBase {
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
		Sprite.drawByAtlas(img.items, ...getTileAtlasXY(variable.get("icon")), 16, 16, ...drawVec2, variable.get("area"));
	}
}
class RioxUiInventoryItem extends RioxUiBase {
	itemIcon = new RioxUiItemIcon;
	itemNameLavel = new RioxUiLavelBase;
	itemCountLavel = new RioxUiLavelBase;
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.itemIcon, new Vec2(0, 0), new Size(16, 16), variable.set("icon", variable.get("icon")), animations);
		this.drawChild(arguments, this.itemNameLavel, new Vec2(16, 0), new Size(16, 8), variable.set("text", variable.get("displayName")), animations);
		this.drawChild(arguments, this.itemCountLavel, new Vec2(64, 0), new Size(16, 8), variable.set("text", variable.get("count")).set("color", Game.colorPallet.magenta), animations);
	}
}

class RioxUiMenuTabItemsList extends RioxUiListBase {
	itemListPanel = new RioxUiInventoryItem;
	variableModify = (variable, item) => {
		return variable.set("icon", item.icon).set("displayName", item.getDisplayName()).set("count", item.count)
	}
	itemGroup = Item.groupHeal;
	listArray = inventory;
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return selectItem.mayUse();
	}
	configGroupUpdate(itemGroup) {
		this.itemGroup = itemGroup;
		this.listArray = Item.group(this.itemGroup);
	}
}

class RioxUiMenuTabItemGroupTab extends RioxUiListBaseAnimation {
	itemListPanel = new RioxUiLavelBase;
	variableModify = (variable, item) => {
		return variable.set("text", translate(`item.${item.description}`));
	}
	listArray = [
		Item.groupHeal,
		Item.groupMaterial,
	]
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return //selectItem.mayUse();
	}
	configGroupUpdate(configGroup) {
		this.itemListPanel.configGroupUpdate(configGroup);
	}
}

class RioxUiMenuTabItems extends RioxUiBase {
	preventPlayerMove = true;
	rootPanel = new RioxUiPanelBase;
	rootPanelAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	listPanel = new RioxUiMenuTabItemsList;
	tabPanel = new RioxUiMenuTabItemGroupTab;
	selectTabIndex = 0;
	tabs = [this.tabPanel, this.listPanel];
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		const panelVec2 = new Vec2(40, 24);
		const panelSize = new Size(240, 144);
		this.drawChild(arguments, this.rootPanel, new Vec2(40, 24), new Size(64 - 8, 144), variable.set("text", "Config"), this.rootPanelAnim);
		this.drawChild(arguments, this.rootPanel, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
		this.drawChild(arguments, this.tabPanel, new Vec2(40, 24), new Size(64 - 8, 144), variable, this.rootPanelAnim);
		this.drawChild(arguments, this.listPanel, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
	}
	tick() {
		super.tick();
		this.tabPanel.tick();
		this.listPanel.tick();
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			if (this.selectTab === this.listPanel) {
				// right panel
				switch (keyGroup) {
					case "up":
						this.listPanel.selectItemIndexMoveBy(-1);
						break;
					case "down":
						this.listPanel.selectItemIndexMoveBy(1);
						break;
					case "right":
					case "confirm":
						this.listPanel.itemClick(this.listPanel.selectItem);
						break;
					case "left":
					case "cancel":
						this.selectTabIndexMoveBy(-1);
						break;
					default:
						break;
				}
			} else if (this.selectTab === this.tabPanel) {
				// left panel
				switch (keyGroup) {
					case "up":
						this.tabPanel.selectItemIndexMoveBy(-1);
						this.listPanel.configGroupUpdate(this.tabPanel.selectItem);
						break;
					case "down":
						this.tabPanel.selectItemIndexMoveBy(1);
						this.listPanel.configGroupUpdate(this.tabPanel.selectItem);
						break;
					case "right":
					case "confirm":
						this.selectTabIndexMoveBy(1);
						break;
					case "left":
					case "cancel":
						this.mayExit();
						break;
					default:
						break;
				}
			}
		}
		if (keyGroup === "menu")
			if (type === "down")
				this.mayExit();

	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		super.mayExit();
		this.rootPanelAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	exitCondition() {
		return this.rootPanelAnim.getProgress() >= 1;
	}
	getCursorVec2() {
		return new Vec2([40, 104][this.selectTabIndex] - 4, 24 + this.selectTab.selectItemIndex * 16 - this.selectTab.listScroll);
	}

	selectTabIndexMoveBy(value) {
		const beforeIndex = this.selectTabIndex;
		this.selectTabIndex += value;
		this.selectTabIndex = this.selectTabIndex.limit(0, this.tabs.length - 1);
		return beforeIndex !== this.selectTabIndex;
	}
	selectTabIndexMoveTo(value) {
		const beforeIndex = this.selectTabIndex;
		this.selectTabIndex = value.limit(0, this.tabs.length - 1);//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectTabIndex;
	}
	get selectTab() {
		return this.tabs[this.selectTabIndex];
	}

}

class RioxUiConfigToggle extends RioxUiBase {
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		drawVec2 = RioxUiAnim.animatedVec2(drawVec2, animations);
		Sprite.toggleOn.draw(drawVec2);
	}
}

class RioxUiConfigItem extends RioxUiBase {
	configNameLavel = new RioxUiLavelBase;
	configValueLavel = new RioxUiLavelBase;
	configToggle = new RioxUiConfigToggle;
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.configNameLavel, new Vec2(0, 0), new Size(16, 8), variable.set("text", translate(`config.${variable.get("name")}`)), animations);
	}
}

class RioxUiMenuTabConfigList extends RioxUiListBase {
	itemListPanel = new RioxUiConfigItem;
	variableModify = (variable, item) => {
		return variable.set("name", item.name);
	}
	configGroup = Config.groupPlayer;
	listArray = Array.from(Config.group(this.configGroup).values());
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return selectItem.uiToggle();
	}
	configGroupUpdate(configGroup) {
		this.configGroup = configGroup;
		this.listArray = Array.from(Config.group(this.configGroup).values());
	}
}

class RioxUiMenuTabconfigGroupTab extends RioxUiListBaseAnimation {
	itemListPanel = new RioxUiLavelBase;
	variableModify = (variable, item) => {
		return variable.set("text", translate(`config.${item.description}`));
	}
	listArray = [
		Config.groupPlayer,
		Config.groupWeapon,
		Config.groupData,
		Config.groupControl,
		Config.groupSound,
		Config.groupOther,
		Config.groupDebug,
	]
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return
	}
	configGroupUpdate(configGroup) {
		this.itemListPanel.configGroupUpdate(configGroup);
	}
}

class RioxUiMenuTabConfig extends RioxUiBase {
	preventPlayerMove = true;
	rootPanel = new RioxUiPanelBase;
	rootPanelAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	tabPanel = new RioxUiMenuTabconfigGroupTab;
	listPanel = new RioxUiMenuTabConfigList;
	selectTabIndex = 0;
	tabs = [this.tabPanel, this.listPanel];
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		const panelVec2 = new Vec2(40, 24);
		const panelSize = new Size(240, 144);
		this.drawChild(arguments, this.rootPanel, new Vec2(40, 24), new Size(64 - 8, 144), variable.set("text", "Config"), this.rootPanelAnim);
		this.drawChild(arguments, this.rootPanel, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
		this.drawChild(arguments, this.tabPanel, new Vec2(40, 24), new Size(64 - 8, 144), variable, this.rootPanelAnim);
		this.drawChild(arguments, this.listPanel, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
	}
	tick() {
		super.tick();
		this.tabPanel.tick();
		this.listPanel.tick();
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			if (this.selectTab === this.listPanel) {
				// right panel
				switch (keyGroup) {
					case "up":
						this.listPanel.selectItemIndexMoveBy(-1);
						break;
					case "down":
						this.listPanel.selectItemIndexMoveBy(1);
						break;
					case "right":
					case "confirm":
						this.listPanel.itemClick(this.listPanel.selectItem);
						break;
					case "left":
					case "cancel":
						this.selectTabIndexMoveBy(-1);
						break;
					default:
						break;
				}
			} else if (this.selectTab === this.tabPanel) {
				// left panel
				switch (keyGroup) {
					case "up":
						this.tabPanel.selectItemIndexMoveBy(-1);
						this.listPanel.configGroupUpdate(this.tabPanel.selectItem);
						break;
					case "down":
						this.tabPanel.selectItemIndexMoveBy(1);
						this.listPanel.configGroupUpdate(this.tabPanel.selectItem);
						break;
					case "right":
					case "confirm":
						this.selectTabIndexMoveBy(1);
						break;
					case "left":
					case "cancel":
						this.mayExit();
						break;
					default:
						break;
				}
			}
		}
		if (keyGroup === "menu")
			if (type === "down")
				this.mayExit();

	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		super.mayExit();
		this.rootPanelAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	exitCondition() {
		return this.rootPanelAnim.getProgress() >= 1;
	}
	getCursorVec2() {
		return new Vec2([40, 104][this.selectTabIndex] - 4, 24 + this.selectTab.selectItemIndex * 16 - this.selectTab.listScroll);
	}

	selectTabIndexMoveBy(value) {
		const beforeIndex = this.selectTabIndex;
		this.selectTabIndex += value;
		this.selectTabIndex = this.selectTabIndex.limit(0, this.tabs.length - 1);
		return beforeIndex !== this.selectTabIndex;
	}
	selectTabIndexMoveTo(value) {
		const beforeIndex = this.selectTabIndex;
		this.selectTabIndex = value.limit(0, this.tabs.length - 1);//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectTabIndex;
	}
	get selectTab() {
		return this.tabs[this.selectTabIndex];
	}

}

class RioxUiSaveDataItem extends RioxUiBase {
	saveDataNameLavel = new RioxUiLavelBase;
	saveDataLastModifiedLavel = new RioxUiLavelBase;
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.saveDataNameLavel, new Vec2(0, 0), new Size(16, 8), variable.set("text", variable.get("fileName")), animations);
	}
}

class RioxUiMenuTabSaveDataList extends RioxUiListBase {
	itemListPanel = new RioxUiSaveDataItem;
	variableModify(variable, item) {
		return variable.set("fileName", this.fileNameNoExt(item.name));
	}
	fileNameNoExt(fileName) {
		if (!fileName.includes(".")) return fileName;
		const dotPoint = fileName.lastIndexOf(".");
		return fileName.slice(0, dotPoint);
	}
	listArray = new Array;
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return;
	}
	async refresh() {
		await SaveGame.createSaveDirFileArray();
		this.listArray = SaveGame.fileArray.sort(SaveGame.compareFileDate);
	}
}

class RioxUiMenuTabSave extends RioxUiBase {
	basePanel = new RioxUiPanelBase;
	saveButton = new RioxUiButtonBase;
	saveAsButton = new RioxUiButtonBase;
	savesListPanel = new RioxUiMenuTabSaveDataList;
	saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	selectbuttonIndex = 0;
	buttons = [this.saveButton, this.saveAsButton, this.savesListPanel];
	constructor() {
		super(...arguments);
		this.savesListPanel.refresh();
	}
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		if (!this.isFocused() && this.saveButtonAnim.getProgress() >= 1) return;
		this.drawChild(arguments, this.saveButton, new Vec2(64, 32), new Size(48, 8), variable.set("text", "Save"), this.saveButtonAnim);
		this.drawChild(arguments, this.saveAsButton, new Vec2(64, 32 + 16), new Size(48, 8), variable.set("text", "Saveas"), this.saveButtonAnim);
		this.drawChild(arguments, this.basePanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
		this.drawChild(arguments, this.savesListPanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			switch (keyGroup) {
				case "up":
					if (this.savesListPanel.selectItemIndex <= 0)
						this.selectButtonIndexMoveBy(-1);
					else
						this.savesListPanel.selectItemIndexMoveBy(-1);
					break;
				case "down":
					if (this.selectButton !== this.savesListPanel)
						this.selectButtonIndexMoveBy(1);
					else
						this.savesListPanel.selectItemIndexMoveBy(1);
					break;
				case "right":
				case "confirm":
					if (this.selectButton !== this.savesListPanel)
						this.buttonClick(this.selectButton);
					else
						this.savesListPanel.itemClick(this.savesListPanel.selectItem);
					break;
				default:
					break;
			}
		}
		if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
			if (type === "down")
				this.mayExit();

	}
	tick() {
		super.tick();
		this.savesListPanel.tick();
	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		super.mayExit();

		this.saveButtonAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	exitCondition() {
		return this.saveButtonAnim.getProgress() >= 1;
	}
	selectButtonIndexMoveBy(value) {
		const beforeIndex = this.selectbuttonIndex;
		this.selectbuttonIndex += value;
		this.selectbuttonIndex = this.selectbuttonIndex.limit(0, this.buttons.length - 1);
		return beforeIndex !== this.selectbuttonIndex;
	}
	selectButtonIndexMoveTo(value) {
		const beforeIndex = this.selectbuttonIndex;
		this.selectbuttonIndex = value.limit(0, this.buttons.length - 1);//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectbuttonIndex;
	}
	get selectButton() {
		return this.buttons[this.selectbuttonIndex];
	}
	buttonClick(button) {
		switch (button) {
			case this.saveButton:
				break;
			case this.saveAsButton:
				RioxUiMenuTabSaveAs.openUi();
				break;
			default:
		}
	}
	getCursorVec2() {
		if (this.selectButton !== this.savesListPanel)
			return new Vec2(32 + 16, this.selectbuttonIndex * 16 + 32);
		else
			return new Vec2(32 + 16, this.savesListPanel.selectItemIndex * 16 - this.savesListPanel.listScroll + 64);

	}
	focusEnd() {
		super.focusEnd();
		this.saveButtonAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	focusStart() {
		super.focusStart();
		this.saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
}

class RioxUiMenuTabSaveDataListSaveAs extends RioxUiMenuTabSaveDataList {
	async refresh() {
		await super.refresh();
		let fileNameInput = this.fileNameInput;
		this.listArray.unshift({ get name() { return fileNameInput.value } });
	}
	fileNameInput = null;// parent's clild
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return this.save(selectItem);
	}
	async save(selectItem) {
		if (selectItem instanceof File && !confirm(translate("menu.save.replace", [selectItem.name]))) return;

		SaveGame.saveAs(selectItem.name + (selectItem instanceof File ? "" : SaveGame.ext))/*.catch(e => {
			if (e.name === "TypeError")
				alert("ファイル名が有効な文字列ではありません");
			else
				throw e;
		});*/
		keyReset();
	}
}

class RioxUiMenuTabSaveAs extends RioxUiBase {
	basePanel = new RioxUiPanelBase;
	saveButton = new RioxUiButtonBase;
	fileNameInput = new RioxUiInputBase;
	savesListPanel = new RioxUiMenuTabSaveDataListSaveAs;
	saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo);
	selectbuttonIndex = 0;
	buttons = [this.fileNameInput, this.savesListPanel];
	constructor() {
		super(...arguments);
		this.savesListPanel.refresh();
		this.savesListPanel.fileNameInput = this.fileNameInput;
		this.fileNameInput.placeholder = translate("menu.save.enterNewName");
	}
	compareFileDate(a, b) {
		if (a.lastModified > b.lastModified) {
			return -1;
		} else if (b.lastModified > a.lastModified) {
			return 1;
		}
		return 0;
	}
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.fileNameInput, new Vec2(64, 32), new Size(48, 8), variable.set("text", "Save"), this.saveButtonAnim);
		this.drawChild(arguments, this.basePanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
		this.drawChild(arguments, this.savesListPanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			switch (keyGroup) {
				case "up":
					if (this.savesListPanel.selectItemIndex <= 0)
						this.selectButtonIndexMoveBy(-1);
					else
						this.savesListPanel.selectItemIndexMoveBy(-1);
					break;
				case "down":
					if (this.selectButton !== this.savesListPanel)
						this.selectButtonIndexMoveBy(1);
					else
						this.savesListPanel.selectItemIndexMoveBy(1);
					break;
				case "right":
				case "confirm":
					if (this.selectButton !== this.savesListPanel)
						this.buttonClick(this.selectButton);
					else
						this.savesListPanel.itemClick(this.savesListPanel.selectItem);
					break;
				default:
					break;
			}
		}
		if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
			if (type === "down")
				this.mayExit();

	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		super.mayExit();

		this.saveButtonAnim = new RioxUiAnim(0.1, -64, -64, 0.0, RioxUiAnimType.Vec2X, Easings.easeInExpo);
	}
	exitCondition() {
		return this.saveButtonAnim.getProgress() >= 1;
	}
	selectButtonIndexMoveBy(value) {
		const beforeIndex = this.selectbuttonIndex;
		this.selectbuttonIndex += value;
		this.selectbuttonIndex = this.selectbuttonIndex.limit(0, this.buttons.length - 1);
		return beforeIndex !== this.selectbuttonIndex;
	}
	selectButtonIndexMoveTo(value) {
		const beforeIndex = this.selectbuttonIndex;
		this.selectbuttonIndex = value.limit(0, this.buttons.length - 1);//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectbuttonIndex;
	}
	get selectButton() {
		return this.buttons[this.selectbuttonIndex];
	}
	buttonClick(button) {
		switch (button) {
			case this.fileNameInput:
				this.fileNameInput.edit();
				break;
			case this.saveAsButton:
				RioxUiMenuTabSaveAs.openUi();
				break;
			default:
		}
	}
	getCursorVec2() {
		if (this.selectButton !== this.savesListPanel)
			return new Vec2(32 + 16, this.selectbuttonIndex * 16 + 32);
		else
			return new Vec2(32 + 16, this.savesListPanel.selectItemIndex * 16 - this.savesListPanel.listScroll + 64);

	}
}

class RioxUiTitle extends RioxUiBase {
	newGameButton = new RioxUiLavelBase;
	loadGameButton = new RioxUiLavelBase;
	selectButtonIndex = 0;
	buttons = [this.newGameButton, this.loadGameButton];
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.newGameButton, new Vec2(16, 16), new Size(48, 8), variable.set("text", "New Game"), []);
		this.drawChild(arguments, this.loadGameButton, new Vec2(16, 32), new Size(48, 8), variable.set("text", "Load Game"), []);
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			switch (keyGroup) {
				case "up":
					this.selectButtonIndexMoveBy(-1);
					break;
				case "down":
					this.selectButtonIndexMoveBy(1);
					break;
				case "right":
				case "confirm":
					this.buttonClick(this.selectButton);
				default:
					break;
			}
		}

	}
	selectButtonIndexMoveBy(value) {
		const beforeIndex = this.selectButtonIndex;
		this.selectButtonIndex += value;
		this.selectButtonIndex = this.selectButtonIndex.limit(0, this.buttons.length - 1);
		return beforeIndex !== this.selectButtonIndex;
	}
	selectButtonIndexMoveTo(value) {
		const beforeIndex = this.selectButtonIndex;
		this.selectButtonIndex = value.limit(0, this.buttons.length - 1);//Array.prototype.lastIndex??? 
		return beforeIndex !== this.selectButtonIndex;
	}
	get selectButton() {
		return this.buttons[this.selectButtonIndex];
	}
	buttonClick(tab) {
		switch (tab) {
			case this.newGameButton:
				Game.NewGame();
				break;
			case this.loadGameButton:
				// Game.LoadGame();
				RioxUiTitleSaveSelect.openUi();
				break;
			default:
			//console.warn(tab);
		}
	}
	getCursorVec2() {
		return new Vec2(8, this.selectButtonIndex * 16 + 16);
	}
}

class RioxUiTitleSaveDataList extends RioxUiMenuTabSaveDataList {
	itemClick(selectItem) {
		if (this.listArray.length === 0) return false;
		return this.load(selectItem);
	}
	async load(selectItem) {
		// if (selectItem instanceof File && !confirm(translate("menu.save.replace", [selectItem.name]))) return;

		SaveGame.loadAs(selectItem.name + (selectItem instanceof File ? "" : SaveGame.ext))
		keyReset();
		Game.LoadGame();
	}
}
class RioxUiTitleSaveSelect extends RioxUiBase {
	basePanel = new RioxUiPanelBase;
	savesListPanel = new RioxUiTitleSaveDataList;
	saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo); constructor() {
		super(...arguments);
		this.savesListPanel.refresh();
	}
	drawMain(drawVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations = []) {
		this.drawChild(arguments, this.basePanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
		this.drawChild(arguments, this.savesListPanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
	}
	tick() {
		super.tick();
		this.savesListPanel.tick();
	}
	keyPressed(keyGroup, type) {
		if (type === "hold") {
			switch (keyGroup) {
				case "up":
					this.savesListPanel.selectItemIndexMoveBy(-1);
					break;
				case "down":
					this.savesListPanel.selectItemIndexMoveBy(1);
					break;
				case "right":
				case "confirm":
					this.savesListPanel.itemClick(this.savesListPanel.selectItem);
				default:
					break;
			}
		}
		if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
			if (type === "down")
				this.mayExit();
	}
	mayExit() {
		if (!this.mayExitCondition()) return false;
		super.mayExit();

		this.saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, RioxUiAnimType.Vec2X, Easings.easeOutExpo);

	}
	exitCondition() {
		return this.saveButtonAnim.getProgress() >= 1;
	}
	getCursorVec2() {
		return new Vec2(32 + 16, this.savesListPanel.selectItemIndex * 16 - this.savesListPanel.listScroll + 64);
	}
}


//言語設定
Game.lang = loadedjson.en_us;
let lang = "en_us";

//json読み込み
document.addEventListener("readystatechange", loadingassets)
loadingScreenMain();

function canDraw(loopID) {
	return document.hasFocus() || loopID % 60 === 0;
}

function loop() {
	DRAW();
	loopID = requestAnimationFrame(loop);
}
intervalID = setInterval(MAIN, 1000 / 60);

function MAIN() {
	tps.Start();
	//FPS計測

	Game.lang = Object.assign(loadedjson.en_us ?? {}, loadedjson[lang] ?? {});

	keycheck();
	GamepadUpdate();
	touch_button_proc();

	if (Game.PlayingScreen) PLAYMAIN();

	if (!Game.PlayingScreen) TITLEMAIN();

	RioxUiMain.tickmain();
	//Sprite.hp.draw(0, 0)


	//タイマー
	Game.sessionTick++;
	tps.End();
}

function DRAW() {
	fps.Start();

	ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);

	if (Game.PlayingScreen) PLAYDRAW();

	if (!Game.PlayingScreen) TITLEDRAW();

	RioxUiMain.drawmain();
	Debug.draw();

	fps.End();
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
	document.title = "Verical" + Game.ver

	//コンフィグリセット
	configReset();

	Item.init();
	Sprite.init();
	Entity.init();
	Particle.init();

	// jsonui_open("hud");


	//アンロード時に確認メッセージを表示する
	// if (config.beforeunload) beforeUnloadEnventID = setTimeout(beforeUnloadOn, 1000 * 10);


	gamestarted = true;
}

function PLAYMAIN() {

	// if (!IsLoading) Game.map = Object.assign(loadedjson.Map, loadedjson.MapMeta);
	playTime = SavedPlayTime + (new Date() - GameStartedTime);

	level.autoLoadDispose(Cam);

	player_tick();

	entity_tick();

	particle_proc();

	enemy_spawn_event();

	//jsonui_main();


}

function PLAYDRAW() {
	Cam.tick();

	game_draw();

	//jsonui_draw();



	//デバッグ
	if (!Game.isRelease) debug_proc();
}

function TITLEMAIN() {
}
function TITLEDRAW() {
}

function keydownfunc(e) {
	touchmode = false;

	keyList[e.keyCode].change(true);

	if (key_arrow.includes(e.keyCode)) e.preventDefault();

	if (debug.visible && e.keyCode == 80) cancelAnimationFrame(loopID);
	if (debug.visible && e.keyCode == 79) { OneFrameOnly = true; requestAnimationFrame(loop); };
}

function keyupfunc(e) {
	keyList[e.keyCode].change(false);



	if (debug.visible && e.keyCode == 80) { OneFrameOnly = false; requestAnimationFrame(loop); };
}

function updateTouch(event) {
	// 要素の位置座標を取得
	let clientRect = canvas.getBoundingClientRect();
	// 距離取得
	let x = clientRect.left;
	let y = clientRect.top;

	let i = 0;
	touchList.splice(0, Infinity)
	for (const touch of event.touches) {
		//console.log(touch)
		let obj = {
			"x": touch.clientX - clientRect.left,
			"y": touch.clientY - clientRect.top,
			"timer": timer
		}
		touchList[i] = obj;
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
	for (const key of keyList) {
		key.tick();
	}
	for (const keyGroup of Object.values(keyGroups)) {
		keyGroup.tick();
	}

	return

	for (const key of keyList) {
		key.down = key.timer == timer;
		key.hold = key.presstime == 0 || key.presstime > 10 && key.presstime % 2 == 0;
		key.press ? key.presstime++ : key.presstime = -1;
	}

	for (const i in touchpos) {
		touchtime[i] ??= 0;
		touchtime[i]++;
	}
	for (const i in touchtime) {
		touchtime[i] ??= 0;
	}



	for (const i in key_groups_list) {
		key_groups[i] = false;
		key_groups_down[i] = false;
		key_groups_hold[i] = false;
		for (const j in key_groups_list[i]) {
			if (keyList[key_groups_list[i][j]].press) key_groups[i] = true;

			if (keyList[key_groups_list[i][j]].down) key_groups_down[i] = true;

			if (keyList[key_groups_list[i][j]].hold) key_groups_hold[i] = true;
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

function testProcTimeStart(tps) {//処理の時間を計測
	MainProcStartTime = performance.now();
}
function testProcTimeEnd(tps) {//処理の時間を計測
	MainProcEndTime = performance.now();
	MainProcTime = Math.floor(MainProcEndTime - MainProcStartTime);
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
function getTileAtlasXY(id, xy) {
	if (xy !== undefined) console.warn("legacy xy is deprecated")
	if (xy == 0) return id % 16 * 16
	if (xy == 1) return Math.floor(id / 16) * 16
	let obj = new Object;
	obj.x = id % 16 * 16;
	obj.y = Math.floor(id / 16) * 16;
	obj[Symbol.iterator] = function* () {
		yield this.x;
		yield this.y;
	};
	return obj;
}

function playerAtlasXY(id, xy) {
	return playerAtlas[id] * 16
}

/*
function ElemId(id) {
	return document.getElementById(id);
}
function ElemIdRepText(id, text) {
	return document.getElementById(id).innerText = String(text);
}
*/
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

Array.toArray = function (input) {
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
/*
function floor(num, k = 0) {
	if (Math.sign(k) === 1) return Math.floor(num / 10 ** k) * 10 ** k;

	if (Math.sign(k) == -1) return Math.floor(num * 10 ** -k) / 10 ** -k;

	if (k == 0) return Math.floor(num);
}
*/
/**
 * 範囲制限します
 * @param {number} input
 * @param {number} min 
 * @param {number} max 
 * @returns 範囲制限した数値
 */
/*
function limit(input, min, max) {
	return Math.min(Math.max(min, input), max);
}
*/

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
			gets.push(loadJson(willLoadJson[i].src, willLoadJson[i].name, willLoadJson[i].meta === "jsonui"));
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
			gets.push(dynamicAwait(loadJson, !load.fastLoad || willLoadJson[i].nessesary, willLoadJson[i].src, willLoadJson[i].name));
		}
		for (const i in willLoadSounds) {
			gets.push(dynamicAwait(loadSound, !load.fastLoad || willLoadSounds[i].nessesary, willLoadSounds[i].src, willLoadSounds[i].name, willLoadSounds[i].meta));
		}

		await Promise.all(gets);
	}

	if (gamestarted) return;

	if (load.ejectLog) console.log("game is starting");
	game_start_proc();
	Game.Title()
	IsLoading = false;
	loopID = requestAnimationFrame(loop);

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

async function loadJson(filename, name, useReviver) {
	try {
		//あざす　https://gxy-life.com/2PC/javascript/json_table20220514/
		let startTime = new Date().getTime();

		const response = await fetch(filename);

		const jsonObject = await response.json();

		let endTime = new Date().getTime();
		if (name != undefined)
			debug.jsonLoadTime[name] = endTime - startTime;

		document.getElementById("jsonLoadCount").innerText = String(++load.jsoncount);
		if (load.ejectLog)
			console.log('loaded: ' + filename);


		if (name != undefined)
			loadedjson[name] = jsonObject;

		return jsonObject;
	}
	catch { return null };

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
	sounds[name] = await Sound.init(url, volume);
	document.getElementById("soundLoadCount").innerText = String(++load.soundcount);
	if (load.ejectLog) console.log('loaded: ' + url);

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
	//player_movelog_reset()
	mapchange(player.mapID, player.x, player.y, false)

	return LastSavedFileData;
}

async function savedatawrite(dir = true) {
	let obj = new Object();

	obj.metadata = Game.savemetadata;
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
	return Game.saveloadingnow || IsLoading;
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

function getNearestEntityDistance(pos, instance, level) {
	let distance = new Array();
	for (const entity of level.entities) {
		if (!entity instanceof instance) continue;
		distance.push(getDistance(...pos, entity.pos.x, entity.pos.y));
	}
	return Math.min.apply(null, distance);

}
function getNearestEntity(pos, instance, level) {
	//if (typeof d == "undefined") d = false;
	let distance = new Array();
	for (const entity of entities) {
		if (!entity instanceof instance) continue;
		distance.push(getDistance(...pos, entity.pos.x, entity.pos.y));
	}
	return distance.indexOf(Math.min.apply(null, distance));

}

function getDistance(ax, ay, bx, by) {
	return Math.abs(Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)));
}

//数字のindex番目取得
function NumberofIndex(num, index, shinsu = 10) {
	//if (typeof shinsu == "undefined") shinsu = 10;
	return num.toString(shinsu)[index];
}

//アニメーションいろいろ(0.0～1.0)
/**
 * @deprecated
 */
function make_jump_animation(x) {
	if (x < 1) return Math.sin(x * 6.28 - 2);
	if (x >= 1) return Math.sin(4.28);
}

/**
 * @deprecated
 */
function make_slip_animation(x) {
	return Math.log10(8 * x * 4);
}

/**
 * @deprecated
 */
function make_scatter_animation(x) {
	if (x < 0.5) return make_slip_animation(x);
	if (x >= 0.5) return 1;
}
//あざす https://easings.net/ja
/**
 * @deprecated
 */
function easeOutElastic(x) {
	const c4 = (2 * Math.PI) / 3;

	return x === 0
		? 0
		: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
/**
 * @deprecated
 */
function easeOutExpo(x) {
	return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
/**
 * @deprecated
 */
function easeInExpo(x) {
	return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
function replaceTile(id, maplayer, x, y) {
	Game.map[maplayer][y][x] = id;
	return id;
}

function changeHitbox(bool, x, y) {
	Game.map["hitbox"][y][x] = bool;
	return bool;
}
function replaceHitboxTile(bool, x, y) {
	Game.map["hitbox"][y][x] = bool;
	return bool;
}

function allElemDefined(...elem) {
	if (elem === undefined || elem === null) return false;

	return elem.every(element => element !== undefined && element !== null);
}

//当たり判定
function hitbox(x, y, level) {

	let gethitBox = (x, y) => level.getTile(new pos(x, y))?.hitbox ?? null

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

	return dx < sx && dy < sy;
}

function hitbox_repo(ax, ay, aw, ah, px, py, color = "black") {
	//あざす https://yttm-work.jp/collision/collision_0004.html

	debug_hitbox_push(ax, ay, aw, ah, color);
	debug_hitbox_push(px, py, 1, 1, color);

	return (px >= ax && px <= (ax + aw) &&
		py >= ay && py <= (ay + ay));
}

function hitbox_reci(ax, ay, aw, ah, bx, by, bw, bh, color = "black") {

	debug_hitbox_push(ax, ay, aw, ah, color);
	debug_hitbox_push(bx, by, bw, bh, color);

	let da = ax - bx;
	let db = ay - by;
	let dc = Math.sqrt(da ** 2 + db ** 2);

	let ar = 2 / Math.sqrt(2 * Math.max(aw, ah));
	let br = 2 / Math.sqrt(2 * Math.max(bw, bh));

	return dc <= ar + br;
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

function hitbox_entity_rect(ax, ay, aw, ah, instance, color = "black") {

	let hit = new Array();

	for (const entity of entities.filter(value => allElemDefined(instance) ? true : value instanceof instance)) {
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

			let TileID = level.getTile(new tpos(x + ix, y + iy))?.layer1 ?? null;

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
	//PlayerControl.tick();

	for (const player of players) {
		player.tick();
	}

	return
	if (PlayerControl.pos.x != PlayerControl.movelog[0].x || PlayerControl.pos.y != PlayerControl.movelog[0].y)
		PlayerControl.movelog.unshift(new Vec2(PlayerControl.pos.x, PlayerControl.pos.y));
}

function player_movelog_reset() {
	if (!PlayerControl) return;
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
	for (const i in Game.map.warp) {
		let [x, y, w, h] = [Game.map.warp[i].x * 16, Game.map.warp[i].y * 16, Game.map.warp[i].w * 16, Game.map.warp[i].h * 16];
		if (isNaN(w)) w = 16; if (isNaN(h)) h = 16;

		if (hitbox_rect(x, y, w, h, player.x, player.y, 16, 16)) {
			let [x, y] = [player.x, player.y];
			if (Game.map.warp[i].relpos != undefined) {
				[x, y] = [Game.map.warp[i].relpos?.x * 16 + x, Game.map.warp[i].relpos.y * 16 + y];
				mapchange(Game.map.warp[i].to, x, y);
				return;
			}
			if (Game.map.warp[i].abspos != undefined) {
				[x, y] = [Game.map.warp[i].abspos?.x * 16, Game.map.warp[i].abspos.y * 16];
				mapchange(Game.map.warp[i].to, x, y);
				return;
			}
			{
				mapchange(Game.map.warp[i].to);
				return;
			}
		}

	}
}

function map_change_proc_check(i, x, y, w = 16, h = 16) {
	if (hitbox_rect(x, y, w, h, player.x, player.y, 16, 16)) {
		mapchange(Game.map.warp[i].to.mapID, Game.map.warp[i].to.x * 16, Game.map.warp[i].to.y * 16)
	}
}

async function mapchange(ID, x, y, loadonly = false) {

	IsLoading = true; {
		let gets = new Array();
		gets.push(loadJson(Game.map_path[ID], "Map"));
		gets.push(loadJson(Game.map_path[ID] + "meta", "MapMeta"));

		await Promise.all(gets);
	}
	PlayerControl.mapID = ID;

	if (!loadonly) {
		entities = new Array();//初期化
		for (let entity of loadedjson.MapMeta.entity ?? []) {
			new regEntity[entity.id](entity.x, entity.y, entity.dialogueID);
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
	return PlayerControl?.movelog?.[i * 16]?.x;
}

function subplayery(i) {
	return PlayerControl?.movelog?.[i * 16]?.y;
}

function subplayerx(i) {
	return players[i].pos.x;
}

function subplayery(i) {
	return players[i].pos.y;
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
	return loadedjson.item[items[i].id][data];
}
/**
 * 翻訳後の文字列を返します
 * @param {string} key 翻訳キー
 * @param  {...string} param パラメーター
 * @returns 
 */
function translate(key, ...param) {
	if (typeof Game.lang[key] != "string") return key;

	let text = Game.lang[key];
	for (let i in param) {
		text = text.replace("%" + i, param[i]);
	}
	return text;
}
function translate(key, args) {
	key = key.toString();
	if (!(key in Game.lang)) return key;
	let text = Game.lang[key];
	let formattedText;
	if (args === undefined) return text;
	for (const [i, arg] of args.entries()) {
		const regExp = new RegExp(`\\{${i}\\}`, 'g');
		formattedText = text.replace(regExp, arg);
	}
	return formattedText;
}

function entity_tick() {
	for (const element of Cam.level.entities) {
		element.tick();
	}
}

function enemy_spawn_event() {
	//沸き上限
	//if (getInstanceOf(entities, EntityEnemy).length >= 50) return;

	for (let i = 0; i < 360; i += 3) {
		let r = 16;
		let x = Math.floor(PlayerControl?.pos?.x / 16 + Math.cos(i) * r);
		let y = Math.floor(PlayerControl?.pos?.y / 16 + Math.sin(i) * r);
		enemy_spawn_check(x, y);
	}
}

function enemy_spawn_check(x, y) {
	//debug_hitbox_push(x * 16, y * 16, 16, 16);

	if (Random(0, 10) < 9) return;

	//敵をスポーンする場所かを調べる
	let ID = level.getTile(new tpos(x, y));
	if (ID == null || typeof ID != "number") return false;

	//敵が既にスポーンされてないか調べる
	for (const enemy of entities.filter(value => value instanceof EntityEnemy)) {
		if (enemy.spawn.x == x * 16 && enemy.spawn.y == y * 16) return false;
	}
	if (!regEntity.hasOwnProperty(ID)) return false;

	new regEntity[ID](x * 16, y * 16);
	return true;

}

function particle_proc() {

	if (IsLoading) return;
	for (const particle of Cam.level.particles) {
		particle.tick();
	}
}

function debug_proc() {
	if (!debug.visible) return;

	if (keyList[75].press) debug.camy++;
	if (keyList[73].press) debug.camy--;
	if (keyList[76].press) debug.camx++;
	if (keyList[74].press) debug.camx--;


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

	ctx.strokeRect(PlayerControl?.bb.x0 - Cam.x, PlayerControl.bb.y0 - Cam.y, PlayerControl.bb.x1 - PlayerControl.bb.x0, PlayerControl.bb.y1 - PlayerControl.bb.y0)


	//文字描画
	draw_texts(debug.info, 64, 64)
	{
		let draw_text_debug = [
			`FPS:${+fps}`,
			`m:${fps.Time}ms`,
			`TPS:${+tps}`,
			`m:${tps.Time}ms`,
			`t:${timer}`,
			`e:${entities.length}`,
			`p:${particles.length}`

		]

		draw_texts(draw_text_debug, 0, 136)
	}

	{
		let draw_text_debug = [
			`x:${PlayerControl?.pos?.x}(${Math.floor(PlayerControl?.pos?.x / 16)})`,
			`y:${PlayerControl?.pos?.y}(${Math.floor(PlayerControl?.pos?.y / 16)})`,

		]

		draw_texts(draw_text_debug, 64, 0)
	}
	draw_text("dc:" + debug.camx + "," + debug.camy, 0, 24);


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
	for (let i = 0, j = 0; i < keyList.length; i++) {
		const key = keyList[i]
		if (keyList[i].press) {
			drawTextFont(String.fromCharCode(i), 78 * 4, j * 8, {});
			drawTextFont(`${i}`, 74 * 4, j * 8, {});
			j++;
		}
	}
	{
		let x = 0, flag = 0;
		for (const [name, KeyGroup] of Object.entries(keyGroups)) {
			flag = false;
			if (KeyGroup.press) {
				drawTextFont(name.slice(0, 2), 68 * 4, x * 8, {});
				flag ||= true;
			}
			if (KeyGroup.down) {
				drawTextFont(name.slice(0, 2), 64 * 4, x * 8, {});
				flag ||= true;
			}
			if (KeyGroup.hold) {
				drawTextFont(name.slice(0, 2), 60 * 4, x * 8, {});
				flag ||= true;
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
	for (const entity of entities) {
		let index = entities.indexOf(entity);
		draw_text(entity.health.toString(), entity.pos.x - Cam.x, entity.pos.y - Cam.y - 16);
		draw_text(index.toString(), entity.pos.x - Cam.x, entity.pos.y - Cam.y - 8);
	}

	for (const pause of debug.pause_frame) {
		if (timer == pause) cancelAnimationFrame(loopID);
	}


	draw_text("project2023\nbeta build\n" + Game.ver, 15 * 16 - 8, 10 * 16 - 8)

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
 * @deprecated　drawTextFontつかって構文は同じ
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
function drawTextFont(text, textX, textY, { color = Game.colorPallet.black, align = "start", startX, startY, endX, endY } = {}, area = {}) {
	ctx.save();
	const Font = DEFAULT_FONT;

	const fontSize = 8;
	// フォントは大きさ半分で書いてるので２倍にします
	const fontSIzeExpand = fontIsloaded(Font) ? 2 : 1;
	const fontOffsetFix = fontIsloaded(Font) ? 8 : 8;
	//										dotFont:defaultFont

	text = text.toString();
	//text = replaceUnsupportedCharacters(String(text), Font);

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
	Sprite.drawareaInit(area.x, area.y, area.w, area.h);


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

function getDrawPos(pos, offset) {
	return new Vec2(pos.x + offset.x - Cam.x, pos.y + offset.y - Cam.y);
}

function game_draw() {

	draw_tiles("layer1");

	//draw_player()

	draw_weapons();

	draw_particle();

	draw_entity();

	draw_tiles("layer2");

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
function DrawSprite(i, x, y, ox = 0, oy = 0, ow = 0, oh = 0) {
	let sprite = Sprite[i];
	console.log(sprite)
	drawImg(sprite.img, sprite.drawX + ox, sprite.drawY + oy, sprite.width + ow, sprite.height + oh, Math.round(x), Math.round(y));
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
	let get = i => img[i] === undefined ? undefined : Math.floor(img[i]);
	ctx.drawImage(img[0], get(1), get(2), get(3), get(4), get(5), get(6), get(7) ?? get(3), get(8) ?? get(4))
}

function draw_tiles(maplayer) {

	let plx = Math.floor(Cam.x / 16);
	let ply = Math.floor(Cam.y / 16);

	for (let y = 0; y < 13; y++) {
		for (let x = 0; x < 21; x++) {
			let drawLevel = Cam.level;
			let tileID = drawLevel.getTile(new tpos(x + plx, y + ply))?.[maplayer];

			//const drawOffsetFix = value => Math.sign(value) < 0 ? 16 + (1 + value) % 16 - 1 : value % 16 - 1;
			const drawOffsetFix = value => ((value < 0 && value % 16 === 0 ? 1 : 0) + value) % 16 + (value < 0 ? 16 : 0);
			const drawOffset = new Vec2(x * 16 - drawOffsetFix(Cam.x), y * 16 - drawOffsetFix(Cam.y));
			const drawSize = new Vec2(16, 16);

			//軽量化
			if (!Game.DontDrawTile.includes(tileID))
				ctx.drawImage(img.tiles, ...getTileAtlasXY(tileID), ...drawSize, ...drawOffset, ...drawSize);

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
		"x": (4 * Math.sign(Game.rotate_pos[rotate][0]) * (rotate % 2)) - 8 + (Math.sign(Game.rotate_pos[rotate][0]) * 1),
		"y": (4 * Math.sign(Game.rotate_pos[rotate][1]) * (rotate % 2)) - 8 + (Math.sign(Game.rotate_pos[rotate][1]) * 1)
	};

	ctx.drawImage(img.sweep, rotate * 32, 0, 32, 32, (x + weapon_offset.x), (y + weapon_offset.y), 32, 32);

	//draw_text(`${weapon_offset.x}\n${weapon_offset.y}`,x,y+16)
}

function draw_entity() {

	for (const entity of Cam.level.entities) {
		if (entity.drawCondition()) entity.draw();
	}
}
function draw_particle() {

	for (let particle of Cam.level.particles) {
		if (particle.drawCondition()) particle.draw();
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

	if (keyGroups.up.down && title_gui.item_select > 0) title_gui.item_select--;
	if (keyGroups.down.down && title_gui.item_select < Game.title_items.length - 1) title_gui.item_select++;

	if (keyGroups.confirm.down || keyGroups.right.down) {
		Game.NewGame();
		return
		Game.LoadGame();
	}
}

function draw_loading_screen() {

	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, ScreenWidth, ScreenHeight);
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";
	drawTextFont(`loading:${Math.floor(getAllLoadedCount() / getAllWillLoadLength() * 100)}%\nImage: ${load.jsoncount}/${willLoadJson.length}\nJson: ${load.imgcount}/${willLoadImg.length}\nSound: ${load.soundcount}/${willLoadSounds.length}`, ScreenWidth / 2, ScreenHeight / 2, { color: Game.colorPallet.white, align: "center" });

	let progressBar = new Rect((ScreenWidth - 128) / 2, ScreenHeight - 16, 128, 8);

	ctx.strokeRect(progressBar.x, progressBar.y, progressBar.w, progressBar.h);
	ctx.fillRect(progressBar.x + 2, progressBar.y + 2, getAllLoadedCount() / getAllWillLoadLength() * (progressBar.w - 4), progressBar.h - 4);
}

function title_gui_draw(dx = 64, dy = 64) {
	return;

	let cursor = new Array();

	draw_gui_items(Game.title_items, undefined, dx, dy, 100, 0, 16, 100);
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
		Game.saveloadingnow = true;
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
			Game.saveloadfaliedtime = timer;
			Game.saveloadfaliedtype = menu.item_select[1];
		}
		if (result != undefined) {
			Game.saveloadsuccesstime = timer;
			Game.saveloadsuccesstype = menu.item_select[1];
		}

		Game.saveloadingnow = false;
	}
}

function configReset() {
	return

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
	if (Configs.get(Game.soundGroupsConfig[group]))
		sounds[src].play(DoNotStop)
}

//AIマジ感謝
function isCharacterSupportedByFont(character, fontFamily) {
	if (!Game.characterCheck) return true;
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
	if (!Game.characterCheck) return true;
	// これでフォントが読み込みされているかを判定しています //
	// 読み込みされていない場合はfalseを返します           //
	// なんか動くのでヨシ!                               //ずれんな
	return isCharacterSupportedByFont("a", fontFamily);
}

function getInstanceOf(array, instance) {
	console.warn("")
	return array.filter(value => allElemDefined(instance) ? true : value instanceof instance);
}

Number.prototype.between = function (min, max) {
	return this >= min && this <= max;
};
Number.prototype.limit = function (min, max) {
	return Math.min(Math.max(min, this), max);
};

function groupBy(array, key) {
	return array.reduce((acc, obj) => {
		const property = obj[key];
		if (!acc.has(property)) {
			// キーがまだMapに存在しない場合は、新しい配列を作成
			acc.set(property, []);
		}
		// キーに対応する配列にオブジェクトを追加
		acc.get(property).push(obj);
		return acc;
	}, new Map());
}

Number.prototype.degreesToRadians = function () {
	return (this * Math.PI) / 180;
}
Number.prototype.radiansToDegrees = function () {
	return (this * 180) / Math.PI;
}