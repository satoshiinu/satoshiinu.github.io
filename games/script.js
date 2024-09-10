"use strict";
// "use strict"
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
    if (DoSayErrorMassege)
        alert(`エラーが発生しました\n再読み込みしてください\nerror: ${message}}\nat ${file},${lineNo}:${colNo}`);
    STOP_ALL();
    //if (gamestarted)requestAnimationFrame(main);
};
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
const siteName = ["http://127.0.0.1:8000", "https://satoshiinu.github.io/games"];
class willLoadContent {
    src;
    name;
    nessesary;
    meta;
    constructor(src, name, nessesary, meta = 0) {
        this.src = src;
        this.name = name;
        this.nessesary = nessesary;
        this.meta = meta;
    }
}
let willLoadImg = [
    new willLoadContent("img/tiles.png", "tiles", true),
    new willLoadContent("img/tiles/water.png", "water", false),
    new willLoadContent("img/items.png", "items", true),
    new willLoadContent("img/players/players.png", "players", true),
    new willLoadContent("img/enemy.png", "enemy", true),
    new willLoadContent("img/misc/particle.png", "particle", false),
    new willLoadContent("img/misc/sweep.png", "sweep", false),
    new willLoadContent("img/players/item_models.png", "item_model", false),
    new willLoadContent("img/gui/gui.png", "gui", true),
    new willLoadContent("img/gui/prompt.png", "gui_prompt", true),
    new willLoadContent("img/gui/prompt2.png", "gui_prompt_more", true),
    new willLoadContent("img/gui/tab_select.png", "gui_tab_select", true),
    new willLoadContent("img/gui/scroll_bar.png", "gui_scroll_bar", true),
    new willLoadContent("img/gui/touch.png", "touch_button", false),
];
let willLoadJson = [
    new willLoadContent("param/lang/en_us.json", "en_us", true),
    new willLoadContent("param/lang/ja_jp.json", "ja_jp", true),
];
let willLoadSounds = [
    new willLoadContent("audio/select.ogg", "select", false),
    new willLoadContent("audio/break.ogg", "break", false, 0.5),
    new willLoadContent("audio/breakbit.ogg", "breakbit", false, 0.5),
    new willLoadContent("audio/attack.ogg", "attack", false),
    new willLoadContent("audio/attack2.ogg", "damage", false),
    new willLoadContent("audio/attack2.ogg", "death", false),
    new willLoadContent("audio/cancel.ogg", "cancel", false),
];
class Util {
    static calcAngleDegrees(x, y) {
        //あざす https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
        return Math.atan2(y, x) * 180 / Math.PI;
    }
    static getDistance(ax, ay, bx = ax * 2, by = ay * 2) {
        return Math.abs(Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)));
    }
    static allNotNaN(...elems) {
        return elems.every(e => !isNaN(e));
    }
    static allNotNull(...elems) {
        return elems.every(e => e != null);
    }
    static playSound(src = "select", group = "other", DoNotStop = false) {
    }
    static between(min, num, max) {
        return num >= min && num <= max;
    }
    ;
    static limit(min, num, max) {
        return Math.min(Math.max(min, num), max);
    }
    ;
    static degreesToRadians(num) {
        return (num * Math.PI) / 180;
    }
    static radiansToDegrees(num) {
        return (num * 180) / Math.PI;
    }
    static convertArray(input) {
        return new Array().concat(input);
    }
    static getTileAtlasXY(id, size = 16) {
        return new Vec2(id % size * size, Math.floor(id / size) * size);
    }
    static random(min, max = min) {
        //あざす https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        return Math.random() * (max - min) + min;
    }
    static randomInt(min, max = min) {
        return Math.floor(this.random(min, max));
    }
    static prob(probF) {
        return Math.random() < probF;
    }
}
class Vec2Util {
    static marge(src, trg) {
        return new Vec2(src.x + trg.x, src.y + trg.y);
    }
    static copy(src) {
        return new Vec2(src.x, src.y);
    }
    static setX(src, v) {
        src.x = v;
        return src;
    }
    static setY(src, v) {
        src.y = v;
        return src;
    }
    static moveX(src, v) {
        src.x += v;
        return src;
    }
    static moveY(src, v) {
        src.y += v;
        return src;
    }
}
class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `x${this.x}_y${this.y}`;
    }
    classType = "vec2";
}
class Size {
    w;
    h;
    constructor(width, height) {
        this.w = width;
        this.h = height;
    }
    toString() {
        return `w${this.w}_h${this.h}`;
    }
    classType = "size";
}
class Rect {
    x;
    y;
    w;
    h;
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    toString() {
        return `x${this.x}_y${this.y}_w${this.w}_h${this.h}`;
    }
    getMax() {
        return new Vec2(this.x + this.w, this.y + this.h);
    }
    classType = "rect";
}
class StartEnd {
    startX;
    startY;
    endX;
    endY;
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }
    toString() {
        return `startX${this.startX}_startY${this.startY}_endX${this.endX}_endY${this.endY}`;
    }
    classType = "startend";
}
class Pos {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `x${this.x}_y${this.y}`;
    }
    classType = "pos";
    addSaveData() {
        throw Error("Method not implemented.");
    }
    getTilePos() {
        return new CPos(Math.floor(this.x / 16), Math.floor(this.y / 16));
    }
    getChunkPos() {
        return this.getTilePos().getChunkPos();
    }
}
class TPos extends Pos {
    isChunkPos = false;
    getChunkPos() {
        return new CPos(Math.floor(this.x / chunkSize.w), Math.floor(this.y / chunkSize.h));
    }
    getEntityPos() {
        return new Pos(Math.floor(this.x * 16 + 8), Math.floor(this.y * 16 + 8));
    }
    getInChunkPos() {
        return new CPos(Math.abs(this.x % chunkSize.w), Math.abs(this.y % chunkSize.h));
    }
    getInChunkIndex() {
        return this.getInChunkPos().x + this.getInChunkPos().y * chunkSize.w;
    }
    classType = "pos";
}
class CPos extends Pos {
    isChunkPos = true;
    getChunkPos() {
        return this;
    }
    getTileLeftTopPos() {
        return new TPos(this.x * chunkSize.w, this.y * chunkSize.h);
    }
    getTileRightBottomPos() {
        return new TPos(this.x * chunkSize.w + chunkSize.w - 1, this.y * chunkSize.h + chunkSize.h - 1);
    }
    getEntityLeftTopPos() {
        return new TPos(this.x * chunkSize.w * 16, this.y * chunkSize.h * 16);
    }
    getEntityRightBottomPos() {
        return new TPos(this.x * chunkSize.w * 16 + chunkSize.w * 16 - 1, this.y * chunkSize.h * 16 + chunkSize.h * 16 - 1);
    }
    classType = "cpos";
}
class Hitbox {
    static Rect(rectA, rectB) {
        return this.RectNum(rectA.x, rectA.y, rectA.w, rectA.h, rectB.x, rectB.y, rectB.w, rectB.h);
    }
    static RectNum(ax, ay, aw, ah, bx, by, bw, bh) {
        //あざす https://yttm-work.jp/collision/collision_0002.html
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
    static RectPoint(rect, point) {
        return this.RectPointNum(rect.x, rect.y, rect.w, rect.h, point.x, point.y);
    }
    static RectPointNum(rx, ry, rw, rh, px, py) {
        //あざす https://yttm-work.jp/collision/collision_0004.html
        return (px >= rx && px <= (rx + rw) &&
            py >= ry && py <= (ry + ry));
    }
    static RectEllip(rect, ellip) {
        return this.RectEllipNum(rect.x, rect.y, rect.w, rect.h, ellip.x, ellip.y, ellip.w, ellip.h);
    }
    static RectEllipNum(rx, ry, rw, rh, ex, ey, ew, eh) {
        // 楕円の中心座標
        const eCtrX = ex + ew;
        const eCtrY = ey + eh;
        // 長方形の中心座標
        const rCtrX = rx + rw / 2;
        const rCtrY = ry + rh / 2;
        // 楕円を円に近似
        const cirRng = (ew + eh) / 2;
        // 円と長方形の当たり判定
        const cdisX = Math.abs(eCtrX - rCtrX);
        const cdisY = Math.abs(eCtrY - rCtrY);
        if (cdisX > (rw / 2 + cirRng)) {
            return false;
        }
        if (cdisY > (rh / 2 + cirRng)) {
            return false;
        }
        if (cdisX <= (rw / 2)) {
            return true;
        }
        if (cdisY <= (rh / 2)) {
            return true;
        }
        const corDisSq = Math.pow(cdisX - rw / 2, 2) + Math.pow(cdisY - rh / 2, 2);
        return (corDisSq <= Math.pow(cirRng, 2));
        // thanks copilot
    }
    static RectEntity(rect, instrnce) {
        return this.RectEntityNum(rect.x, rect.y, rect.w, rect.h, instrnce);
    }
    static RectEntityNum(rx, ry, rw, rh, instance) {
        let hit = new Array();
        for (const entity of entities.filter(value => typeof instance == "function" ? value instanceof instance : true)) {
            if (entity.bb.simpleOverlap(new AABB(rx, ry, rx + rw, ry + rh)))
                hit.push(entity);
        }
        return hit;
    }
    // static RectTile(rect: Rect, checktile)
    static RectTileNum(ax, ay, aw, ah, level, filterTile, mapLayer = enumMapLayer.Layer1) {
        let x = Math.round(ax / 16);
        let y = Math.round(ay / 16);
        let hit_result = new Array();
        for (let ix = 0; ix < Math.ceil(aw / 16); ix++) {
            for (let iy = 0; iy < Math.ceil(ah / 16); iy++) {
                let Tile = level.getTileState(new TPos(x + ix, y + iy)).getTileByLayer(mapLayer) ?? null;
                let result = {
                    x: x + ix,
                    y: y + iy,
                    tile: Tile
                };
                if (filterTile == null)
                    hit_result.push(result);
                if (filterTile != null && !Array.isArray(filterTile))
                    if (filterTile == Tile)
                        hit_result.push(result);
                if (filterTile != null && Array.isArray(filterTile))
                    if (filterTile.includes(Tile))
                        hit_result.push(result);
            }
        }
        return hit_result;
    }
}
class Registry extends Map {
    getKey(searchValue) {
        return Array.from(this.entries()).find(([key, value]) => value === searchValue)?.[0] ?? null;
    }
    set(key, value) {
        let a = super.set(key, value);
        this.createMapGetter(key);
        return a;
    }
    createMapGetter(key) {
        Object.defineProperty(this, key, {
            get: function () {
                return this.get(key);
            }
        });
    }
    createReadonly(key, value) {
        Object.defineProperty(this, key, {
            get: function () {
                return value;
            }
        });
    }
}
class MapStatic {
    static _map;
    static init() {
        this._map = new Map;
    }
    static get(key) {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.get(key);
    }
    static set(key, value) {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.set(key, value);
    }
    static has(key) {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.has(key);
    }
    static delete(key) {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.delete(key);
    }
    static keys() {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.keys();
    }
    static values() {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.values();
    }
    static entries() {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.entries();
    }
    static forEach(callbackFn, thisArg) {
        if (this._map == null)
            throw Error("map was not initraize");
        return this._map.forEach(callbackFn, thisArg);
    }
}
class RegistryItemType extends Registry {
    register(key, item) {
        return this.set(key, item);
    }
    getTileClass(tileID) {
        return this.get(tileID);
    }
}
class RegistryTileType extends Registry {
    defaultStr = "default";
    register(key, tile) {
        return this.set(key, tile);
    }
    registerDefault(tile) {
        return this.set(this.defaultStr, tile);
    }
    getTileClass(tileID) {
        return this.get(tileID) ?? this.get(this.defaultStr);
    }
}
class RegistryHitboxType extends Registry {
    register(key, aabb) {
        return this.set(key, aabb);
    }
}
class RegistryEntityType extends Registry {
    register(key, baseClass, prop, numid) {
        let obj = {
            create: (...arg) => {
                let createdClass = baseClass.prototype.setProperties === undefined ?
                    new baseClass(...arg) :
                    new baseClass(...arg).setProperties(prop);
                if (baseClass.getParentKey)
                    this.createReadonly.call(createdClass, "creater", obj);
                return createdClass;
            },
            baseClass: baseClass,
            key: key,
            numid: numid,
            prop: prop
        };
        this.set(key, obj);
        return this.set(numid, obj);
    }
}
class RegistryParticleType extends Registry {
    rockBreak;
    deathSmoke;
    blueSlime;
    register(key, baseClass, prop) {
        let obj = {
            create: (...arg) => {
                let createdClass = Object.getPrototypeOf(baseClass).hasOwnProperty("setProperties") ?
                    new baseClass(...arg) :
                    new baseClass(...arg).setProperties(prop);
                if (baseClass.getParentKey)
                    this.createReadonly.call(createdClass, "creater", obj);
                return createdClass;
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
        };
        return this.set(key, obj);
    }
}
class AABB {
    x0;
    x1;
    y0;
    y1;
    misc;
    constructor(x0, y0, x1, y1, misc = 0) {
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
    static tester0;
    static tester1;
    static tester2;
    static tester3;
    static hitboxAABB;
    static hitboxView = new Array;
    static hitboxesTile = new Array;
    static draw() {
        this.drawHitboxView();
        this.drawEntityBB(Cam?.level);
    }
    static drawAABB(aabb) {
        if (ctx == null)
            throw Error("canvas context is null!");
        let drawX = aabb.x0;
        let drawY = aabb.y0;
        let drawW = aabb.x1 - aabb.x0;
        let drawH = aabb.y1 - aabb.y0;
        ctx.strokeRect(drawX - Cam.x, drawY - Cam.y, drawW, drawH);
    }
    static drawHitboxView() {
        if (Configs.get("debugHitboxShow").value == false)
            return;
        for (const aabb of this.hitboxView) {
            this.drawAABB(aabb);
        }
        this.hitboxView = new Array;
    }
    static drawEntityBB(level) {
        if (level == null)
            return;
        if (Configs.get("debugEntityHitboxShow").value == false)
            return;
        if (level?.entities == null)
            return;
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
var enumConfigGroup;
(function (enumConfigGroup) {
    enumConfigGroup["Player"] = "player";
    enumConfigGroup["Weapon"] = "weapon";
    enumConfigGroup["Data"] = "data";
    enumConfigGroup["Control"] = "control";
    enumConfigGroup["Sound"] = "sound";
    enumConfigGroup["Other"] = "other";
    enumConfigGroup["Debug"] = "debug";
})(enumConfigGroup || (enumConfigGroup = {}));
class Config {
    value;
    name;
    group;
    constructor(name, group) {
        this.name = name;
        this.group = group;
        Configs.set(name, this);
    }
    set(value) {
    }
    uiToggle() {
    }
    static getGroupConfig(group) {
        return Array.from(Configs.entries()).reduce((pre, [key, value]) => {
            if (value.group === group)
                pre.set(key, value);
            return pre;
        }, new Map());
    }
    ;
}
class ConfigBool extends Config {
    value;
    constructor(name, group, defaultValue = false) {
        super(name, group);
        this.value = defaultValue;
    }
    set(value) {
        this.value = value;
    }
    uiToggle() {
        this.value = !this.value;
    }
}
class ConfigNumber extends Config {
    value;
    constructor(name, group, defaultValue = 0) {
        super(name, group);
        this.value = defaultValue;
    }
    set(value) {
        this.value = value;
    }
    uiToggle() {
        inputReset();
        this.value = +(prompt("set value", this.value.toString()) ?? this.value);
    }
}
new ConfigBool("attackRotateRock", enumConfigGroup.Weapon, true);
new ConfigBool("autoAim", enumConfigGroup.Weapon, true);
new ConfigBool("fileExtension", enumConfigGroup.Data, false);
new ConfigBool("roleSelectAutoClose", enumConfigGroup.Other, false);
new ConfigBool("debugHitboxShow", enumConfigGroup.Debug, false);
new ConfigBool("debugEntityHitboxShow", enumConfigGroup.Debug, false);
new ConfigNumber("debugTickDelay", enumConfigGroup.Debug, 1);
new ConfigNumber("debugUiAnimRangeRadio", enumConfigGroup.Debug, 1);
new ConfigBool("debugAlwaysMoving", enumConfigGroup.Debug, false);
new ConfigBool("debugAlwaysMoved", enumConfigGroup.Debug, false);
class Direction {
    static rotateKey = new Array;
    static facingKey = new Array;
    static rotate = new Array;
    static facing = new Array;
    static down = this.register(0, 1, { degrees: 0.0, rotateIndex: 0, facingIndex: 0, weaponOffset: new Vec2(0, 0) }); //　          ↓
    static downleft = this.register(-1, 1, { degrees: -45.0, rotateIndex: 1, facingIndex: undefined, weaponOffset: new Vec2(-8, 0) }); //    ↙
    static left = this.register(-1, 0, { degrees: -90.0, rotateIndex: 2, facingIndex: 1, weaponOffset: new Vec2(-16, 0) }); //           ←
    static upleft = this.register(-1, -1, { degrees: -135.0, rotateIndex: 3, facingIndex: undefined, weaponOffset: new Vec2(-8, -8) }); //     ↖
    static up = this.register(0, -1, { degrees: 180.0, rotateIndex: 4, facingIndex: 2, weaponOffset: new Vec2(0, -16) }); //             ↑
    static upright = this.register(1, -1, { degrees: 45.0, rotateIndex: 5, facingIndex: undefined, weaponOffset: new Vec2(0, -8) }); //     ↗
    static right = this.register(1, 0, { degrees: 90.0, rotateIndex: 6, facingIndex: 3, weaponOffset: new Vec2(0, 0) }); //          →
    static downright = this.register(1, 1, { degrees: 135.0, rotateIndex: 7, facingIndex: undefined, weaponOffset: new Vec2(0, 0) }); //   ↘
    static {
        this.registerRotateKey(true, false, false, false, this.up);
        this.registerRotateKey(false, true, false, false, this.down);
        this.registerRotateKey(false, false, true, false, this.left);
        this.registerRotateKey(false, false, false, true, this.right);
        this.registerRotateKey(true, false, true, false, this.upleft);
        this.registerRotateKey(true, false, false, true, this.upright);
        this.registerRotateKey(false, true, true, false, this.downleft);
        this.registerRotateKey(false, true, false, true, this.downright);
        this.registerRotateKey(true, false, true, true, this.up);
        this.registerRotateKey(false, true, true, true, this.down);
        this.registerRotateKey(true, true, true, false, this.left);
        this.registerRotateKey(true, true, false, true, this.right);
        this.registerFacingKey(true, false, false, false, this.up);
        this.registerFacingKey(false, true, false, false, this.down);
        this.registerFacingKey(false, false, true, false, this.left);
        this.registerFacingKey(false, false, false, true, this.right);
        this.registerFacingKey(true, false, true, false, this.left);
        this.registerFacingKey(true, false, false, true, this.right);
        this.registerFacingKey(false, true, true, false, this.left);
        this.registerFacingKey(false, true, false, true, this.right);
        this.registerFacingKey(true, false, true, true, this.up);
        this.registerFacingKey(false, true, true, true, this.down);
        this.registerFacingKey(true, true, true, false, this.left);
        this.registerFacingKey(true, true, false, true, this.right);
    }
    static register(dx, dy, { rotateIndex = 0, facingIndex = 0, weaponOffset = new Vec2(0, 0), degrees = 0 } = {}) {
        const direction = new Direction(dx, dy, rotateIndex, facingIndex, weaponOffset, degrees);
        this.rotate[rotateIndex] = direction.toRotate();
        this.facing[facingIndex] = direction.toFacing();
        Object.freeze(direction);
        return direction;
    }
    static registerRotateKey(up, down, right, left, direction) {
        class RotateKey {
            up = up;
            down = down;
            right = right;
            left = left;
            direction = direction.toRotate();
        }
        this.rotateKey.push(new RotateKey());
    }
    static registerFacingKey(up, down, right, left, direction) {
        class FacingKey {
            up = up;
            down = down;
            right = right;
            left = left;
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
    static getDirectionByString(key) {
        switch (key) {
            case "down":
                return this.down;
            case "downleft":
                return this.downleft;
            case "left":
                return this.left;
            case "upleft":
                return this.upleft;
            case "up":
                return this.up;
            case "upright":
                return this.upright;
            case "right":
                return this.right;
            case "downright":
                return this.downright;
            default:
                return this.down;
        }
    }
    static readSaveData({ key = "", type = "" }) {
        const direction = this.getDirectionByString(key);
        return direction;
        switch (type) {
            case "rotate":
                return direction.toRotate();
            case "facing":
                return direction.toFacing();
            default:
                return direction;
        }
    }
    // dinamic method 
    classType = "direction";
    dx;
    dy;
    rotateIndex;
    facingIndex;
    weaponOffset;
    degrees;
    constructor(dx, dy, rotateIndex, facingIndex, weaponOffset, degrees) {
        this.dx = dx;
        this.dy = dy;
        this.rotateIndex = rotateIndex;
        this.facingIndex = facingIndex;
        this.weaponOffset = weaponOffset;
        this.degrees = degrees;
    }
    toRotate() {
        const valueOf = () => this.rotateIndex;
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { valueOf: valueOf, type: "rotate" });
    }
    toFacing() {
        const valueOf = () => this.facingIndex;
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { valueOf: valueOf, type: "facing" });
    }
}
class PerformanceTester {
    startTime = NaN;
    endTime = NaN;
    time = NaN;
    parSec = NaN;
    countStartTime = NaN;
    countEndTime = NaN;
    count = 0;
    procStart() {
        this.startTime = performance.now();
    }
    procEnd() {
        this.endTime = performance.now();
        this.time = Math.floor(this.endTime - this.startTime);
        this.countEndTime = performance.now();
        this.count++;
        if (this.countEndTime - this.countStartTime >= 1000) {
            this.parSec = this.count;
            this.count = 0;
            this.countStartTime = performance.now();
        }
    }
    constructor() {
        this.countStartTime = performance.now();
        this.procStart();
    }
}
const tickPerf = new PerformanceTester;
const drawPerf = new PerformanceTester;
class ItemStack {
    item;
    count;
    inventory;
    constructor(item, count) {
        this.item = item;
        this.count = count ?? 1;
    }
    setInventory(inventory) {
        this.inventory = inventory;
    }
    setCount(count) {
        this.count = count;
        if (this.inventory != null && this.count <= 0) {
            const index = this.inventory.indexOf(this);
            this.inventory.splice(index, 1);
        }
    }
    grow(value = 1) {
        this.setCount(this.count + value);
    }
    shrink(value = 1) {
        this.grow(-value);
    }
    split(value) {
        const count = Math.min(value, this.count);
        const copyItemStack = this.copyWithCount(count);
        this.shrink(count);
        return copyItemStack;
    }
    copy() {
        return new ItemStack(this.item, this.count);
    }
    copyWithCount(count) {
        const itemStack = this.copy();
        itemStack.setCount(count);
        return itemStack;
    }
    use(player) {
        //アイテム使用
        if (!this.item.mustRoleSelect || player != null) {
            if (this.item.use(player)) {
                this.shrink(1);
                return true;
            }
            return false;
        }
        //誰が使いますか画面を出す
        // jsonui_open("item_role_select", 128, 64, undefined, index);
        throw Error("this item must role select but it is not role selected. player is null");
    }
}
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
    icon = 0;
    setIcon(icon) {
        this.icon = icon;
        return this;
    }
    name = "";
    setName(name) {
        this.name = name;
        return this;
    }
    healPower = 0;
    setHealPower(healPower) {
        this.healPower = healPower;
        return this;
    }
    group = enumItemGroup.Heal;
    setGroup(group) {
        this.group = group;
        return this;
    }
    createReadonly(key, value) {
        Object.defineProperty(this, key, {
            get: function () {
                return value;
            }
        });
    }
}
let ItemType = new RegistryItemType;
var enumItemGroup;
(function (enumItemGroup) {
    enumItemGroup["Heal"] = "heal";
    enumItemGroup["Use"] = "use";
    enumItemGroup["Other"] = "other";
})(enumItemGroup || (enumItemGroup = {}));
class Item extends ItemProperties {
    static getParentKey = true; //necesary
    mustRoleSelect = false;
    static Heal;
    static groupMaterial;
    constructor() {
        super();
    }
    static init() {
        ItemType.register("empty", new ItemEmpty());
        ItemType.register("apple", new ItemHealable().setGroup(enumItemGroup.Heal).setIcon(1).setHealPower(20));
        ItemType.register("dummy", new Item().setGroup(enumItemGroup.Other).setIcon(0));
        ItemType.register("mineralWater", new ItemProjectile().setGroup(enumItemGroup.Use).setIcon(0));
    }
    use(player) {
        return true;
    }
    static register(id, itemClass) {
        ItemType.set(id, itemClass);
    }
    getRegistryName() {
        for (const [key, item] of ItemType.entries())
            if (item == this)
                return key;
        return null;
    }
    getDisplayName() {
        return translate(`item.${this.getRegistryName()}.name`);
    }
    getDisplayEfficacy() {
        return translate("item.efficacy.none");
    }
    getDisplayEfficacyIcon() {
        return null;
    }
    addSaveData() {
        let obj = new Object();
        // Object.assign(obj, this);
        // obj.registerName = this.getRegisterName();
        return obj;
    }
    readSaveData(obj) {
        // Object.assign(this, structuredClone(obj));
    }
    static readSaveData(obj) {
        // regItems[obj.registerName]().readSaveData();
    }
}
class ItemEmpty extends Item {
}
class ItemmustRoleSelect extends Item {
    mustRoleSelect = true;
}
class ItemHealable extends ItemmustRoleSelect {
    use(player) {
        if (player == null)
            return false;
        return player.entity.heal(this.healPower);
    }
    getDisplayEfficacy() {
        return translate("none");
    }
    getDisplayEfficacyIcon() {
        return Sprite.get("itemHealIcon");
    }
}
class ItemProjectile extends Item {
    use(player) {
        if (player == null)
            return false;
        if (player.entity.level == null)
            throw Error("player's entity's level is not exist!");
        new EntityMineralWater(player.entity.pos.x, player.entity.pos.y, player.entity.level, player.entity.rotate.degrees);
        return true;
    }
    getDisplayEfficacy() {
        return translate("none");
    }
    getDisplayEfficacyIcon() {
        return Sprite.get("itemHealIcon");
    }
}
let TileType = new RegistryTileType;
let HitboxType = new RegistryHitboxType;
class Tile {
    static init() {
        TileType.registerDefault(new Tile);
        TileType.register(0x00, new Tile);
        TileType.register(0x01, new Tile);
        TileType.register(0x02, new Tile);
        TileType.register(0x03, new Tile);
        TileType.register(0x04, new Tile);
        TileType.register(0x05, new Tile);
        TileType.register(0x06, new Tile);
        TileType.register(0x07, new Tile);
        TileType.register(0x08, new Tile);
        TileType.register(0x09, new TileRock(false));
        TileType.register(0x0a, new TileRockStrong(false));
        TileType.register(0x0b, new TileRockStrong(true));
        TileType.register(0x0c, new Tile);
        TileType.register(0x0d, new Tile);
        TileType.register(0x0e, new Tile);
        TileType.register(0x0f, new Tile);
        TileType.register(0x10, new Tile);
        TileType.register(0x11, new Tile);
        TileType.register(0x12, new Tile);
        TileType.register(0x13, new Tile);
        TileType.register(0x14, new Tile);
        TileType.register(0x15, new Tile);
        TileType.register(0x16, new Tile);
        TileType.register(0x17, new Tile);
        TileType.register(0x18, new Tile);
        TileType.register(0x19, new Tile);
        TileType.register(0x1a, new Tile);
        TileType.register(0x1b, new Tile);
        TileType.register(0x1c, new Tile);
        TileType.register(0x1d, new Tile);
        TileType.register(0x1e, new Tile);
        TileType.register(0x1f, new Tile);
        TileType.register(0x20, new Tile);
        TileType.register(0x21, new Tile);
        TileType.register(0x22, new Tile);
        TileType.register(0x23, new Tile);
        TileType.register(0x24, new Tile);
        TileType.register(0x25, new Tile);
        TileType.register(0x26, new Tile);
        TileType.register(0x27, new Tile);
        TileType.register(0x28, new Tile);
        TileType.register(0x29, new Tile);
        TileType.register(0x2a, new Tile);
        TileType.register(0x2b, new Tile);
        TileType.register(0x2c, new Tile);
        TileType.register(0x2d, new Tile);
        TileType.register(0x2e, new Tile);
        TileType.register(0x2f, new Tile);
        TileType.register(0x30, new Tile);
        TileType.register(0x31, new Tile);
        TileType.register(0x32, new Tile);
        TileType.register(0x33, new Tile);
        TileType.register(0x34, new Tile);
        TileType.register(0x35, new Tile);
        TileType.register(0x36, new Tile);
        TileType.register(0x37, new Tile);
        TileType.register(0x38, new Tile);
        TileType.register(0x39, new Tile);
        TileType.register(0x3a, new Tile);
        TileType.register(0x3b, new Tile);
        TileType.register(0x3c, new Tile);
        TileType.register(0x3d, new Tile);
        TileType.register(0x3e, new Tile);
        TileType.register(0x3f, new Tile);
        HitboxType.register(0x0, null);
        HitboxType.register(0x1, new AABB(0, 0, 16, 16));
    }
    isBreakable = false;
    getBreakProbability() {
        return 0;
    }
    getBreakBecomeTile() {
        return 0;
    }
}
class TileRock extends Tile {
    isStone;
    constructor(isStone) {
        super();
        this.isStone = isStone;
    }
    isBreakable = true;
    getBreakProbability() {
        return 0.1;
    }
    getBreakBecomeTile() {
        return this.isStone ? 13 : 12;
    }
}
class TileRockStrong extends TileRock {
    getBreakProbability() {
        return 0.05;
    }
}
class Cam {
    static level;
    static x = 0;
    static y = 0;
    static offset = new Vec2(0, 0);
    static tick() {
        let playerEntity = Game.mainPlayer;
        this.level = playerEntity.level;
        this.x = Math.floor(playerEntity.pos.x - 160 + this.offset.x);
        this.y = Math.floor(playerEntity.pos.y - 80 + this.offset.y);
        return;
        if (this.x < 0)
            this.x = 0;
        if (this.y < 0)
            this.y = 0;
        if (this.x > 1280)
            this.x = 1280;
        if (this.y > 1420)
            this.y = 1420;
    }
}
class Phys {
    static ogPos;
    static pos;
    static bb;
    static wasCollisioned;
    static size;
    //thanks mc
    static move(xa, ya, level) {
        if (Math.abs(xa) < 1)
            xa = 0;
        if (Math.abs(ya) < 1)
            ya = 0;
        this.ogPos = new Pos(this.pos.x, this.pos.y);
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
    static level() {
        throw Error("Method not implemented.");
    }
    static setPos(x, y) {
        this.bb = new AABB(x - this.size.w / 2, y - this.size.h / 2, x + this.size.w / 2, y + this.size.h / 2);
    }
}
class Inventory extends Array {
    addItemStack(newItemStack) {
        for (const alreadyItemStack of this) {
            if (newItemStack.item == alreadyItemStack.item) {
                alreadyItemStack.grow(newItemStack.count);
                return true;
            }
        }
        this.push(newItemStack);
        return true;
    }
    getGroupItem(group) {
        return this.filter(e => e.item.group == group);
    }
    ;
}
class Player {
    static control;
    static classType = "playerstatic";
    classType = "player";
    entity;
    uuid = crypto.randomUUID();
    loadCache;
    static inventory = new Inventory;
    static loadCache;
    constructor(spawnX, spawnY, spawnLevel) {
        this.entity = new EntityPlayer(spawnX, spawnY, spawnLevel);
    }
    static setControlAble(player) {
        this.control = player;
    }
    setControlAble() {
        Player.setControlAble(this);
        return this;
    }
    updatePlayerLevel() {
        if (this.entity.level == null)
            throw Error("player's entity's level is not exist");
        if (this.isControl())
            Cam.level = this.entity.level;
    }
    tick() {
        this.updatePlayerLevel();
    }
    isControl() {
        return Player.control === this;
    }
    addSaveData() {
        let obj = new Object();
        obj.classType = this.classType;
        obj.entity = this.entity.addSaveData();
        obj.uuid = this.uuid;
        return obj;
    }
    readSaveData(obj) {
        //weapon.setPlayer(this);
        // this.spawnAt(obj.pos.x, obj.pos.y, levelDepthes.get(obj.levelDepth));
        this.uuid = obj.uuid;
        return this;
    }
    static addSaveData() {
        let obj = new Object();
        obj.controlUUID = this.control.uuid;
        obj.classType = this.classType;
        obj.inventory = this.inventory;
        return obj;
    }
    static readSaveData({ controlUUID = null }) {
        const player = players.find(e => e.uuid == controlUUID);
        if (player == null)
            throw Error(`UUID:${controlUUID} player is not exist!`);
        this.control = player;
        return this;
    }
    clearLoadCache() {
        delete this.loadCache;
        return this;
    }
    addLoadCache(obj) {
        this.loadCache = obj;
        return this;
    }
    static clearLoadCache() {
        delete this.loadCache;
        return this;
    }
    static addLoadCache(obj) {
        this.loadCache = obj;
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
    type;
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
        Object.defineProperty(this, key, {
            get: function () {
                return value;
            }
        });
    }
}
//仮
class PosGetSet {
    parent;
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
        Phys.setPos.call(this.parent, value, this.y);
    }
    set y(value) {
        Phys.setPos.call(this.parent, this.x, value);
    }
    toString() {
        return `x${this.x}_y${this.y}`;
    }
    classType = "posGetSet";
    neverSave = true;
    addSaveData() {
        let obj = new Object;
        obj.x = this.x;
        obj.y = this.y;
        //obj.classType = this.classType;
        return obj;
    }
}
class EnemySpawnChecker {
    static enemySpawnCheckTick(centerX, centerY, level) {
        //沸き上限
        if (level.entities.filter(e => e instanceof EntityEnemy).length >= 50)
            return;
        for (let i = 0; i < 360; i += 3) {
            let r = 16;
            let x = Math.floor(centerX / 16 + Math.cos(i) * r);
            let y = Math.floor(centerY / 16 + Math.sin(i) * r);
            this.enemySpawnCheckAt(x, y, level);
        }
    }
    static enemySpawnCheckAt(x, y, level) {
        if (Util.random(0, 10) < 9)
            return;
        //敵をスポーンする場所かを調べる
        let ID = level.getTileState(new TPos(x, y)).enemy;
        if (ID == null || typeof ID != "number")
            return false;
        //敵が既にスポーンされてないか調べる
        for (const enemy of level.entities.filter(value => value instanceof EntityEnemy)) {
            if (enemy.spawn.x == x * 16 && enemy.spawn.y == y * 16)
                return false;
        }
        if (!EntityType.has(ID))
            return false;
        //spawn
        EntityType.get(ID).create(x * 16, y * 16, level);
        return true;
    }
}
//えぐい　かみきりすぎたぁーーー
class Entity extends EntityProperties {
    static getParentKey = true; //necesary
    neverSave = false;
    neverDispose = false;
    velocity = new Vec2(0, 0);
    bb = new AABB(0, 0, 0, 0);
    spawn = new Vec2(0, 0);
    // pos = new PosGetSet(this);
    ogPos = new Pos(0, 0);
    wasMoved = false;
    isMoving = false;
    classType = "entity";
    level;
    wasCollisioned = new Vec2(false, false);
    alive = true;
    movingTick = 0;
    movedTick = 0;
    lifeTime = 0;
    uuid = crypto.randomUUID();
    hasSpawned = false;
    size;
    moveSpeed = 0.25;
    maxHealth = 20;
    health = 20;
    creater;
    loadCache;
    static init() {
        EntityType.register("slimeBlue", EntitySlime, EntityProperties.of().setType(enumEntitySlimeType.blue), 0x01);
        EntityType.register("mineralWater", EntityMineralWater, EntityProperties.of(), null);
        EntityType.register("crab", EntityCrab, EntityProperties.of(), 0x10);
    }
    constructor(spawnX = 0, spawnY = 0, level, size = new Size(15, 15)) {
        super();
        this.level = level;
        this.spawn.x = spawnX;
        this.spawn.y = spawnY;
        this.size = size;
        this.setPos(spawnX, spawnY);
        this.health ??= this.maxHealth;
        if (!this.hasSpawned)
            level.entities.push(this);
        this.hasSpawned = true;
    }
    tick() {
        this.moveBase();
        if (this.isMoving)
            this.movingTick++;
        else
            this.movingTick = 0;
        if (this.wasMoved)
            this.movedTick++;
        else
            this.movedTick = 0;
        if (this.despawned)
            this.#despawn();
        this.lifeTime++;
    }
    moveBase() {
        //スピード調整
        if (this.velocity.x > 0) {
            this.velocity.x = Math.floor(this.velocity.x * 0.85 * 1000) / 1000;
        }
        else {
            this.velocity.x = Math.ceil(this.velocity.x * 0.85 * 1000) / 1000;
        }
        if (this.velocity.y > 0) {
            this.velocity.y = Math.floor(this.velocity.y * 0.85 * 1000) / 1000;
        }
        else {
            this.velocity.y = Math.ceil(this.velocity.y * 0.85 * 1000) / 1000;
        }
        //動き替える
        this.velocityCalc();
        this.move(this.velocity.x, this.velocity.y);
        this.isMoving = this.velocity.x > 0 || this.velocity.y > 0;
        this.wasMoved = this.ogPos.x !== this.pos.x || this.ogPos.y !== this.pos.y;
        if (Configs.get("debugAlwaysMoving").value)
            this.isMoving = true;
        if (Configs.get("debugAlwaysMoved").value)
            this.wasMoved = true;
    }
    move(xa, ya) {
        if (Math.abs(xa) < 1)
            xa = 0;
        if (Math.abs(ya) < 1)
            ya = 0;
        this.ogPos = new Pos(this.pos.x, this.pos.y);
        let ogXa = xa;
        let ogYa = ya;
        let aabbs = this.level.getCubes(this.bb.expand(xa, ya));
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
    setPos(xa, ya) {
        this.bb = new AABB(xa - this.size.w / 2, ya - this.size.h / 2, xa + this.size.w / 2, ya + this.size.h / 2);
    }
    get pos() {
        return new Pos((this.bb.x0 + this.bb.x1) / 2, (this.bb.y0 + this.bb.y1) / 2);
    }
    velocityCalc() { }
    draw() {
        let drawOffset = new Vec2(-8, -8);
        drawImg(Images.get("enemy"), 0, 0, 16, 16, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
    }
    drawCondition() {
        return Game.onScreenArea(new Rect(this.pos.x, this.pos.y, this.size.w, this.size.h));
    }
    getDrawPos(offset = new Vec2(0, 0)) {
        return new Vec2(Math.floor(this.pos.x + offset.x - Cam.x), Math.floor(this.pos.y + offset.y - Cam.y));
    }
    damage(damage = 0, rx = 0, ry = 0, byPlayer = false) {
        return false;
    }
    heal(amount = 0) {
        this.health += amount;
        return true;
    }
    despawned = false;
    despawn() {
        this.despawned = true;
    }
    #despawn() {
        if (this.level == null)
            throw Error("entity's level is not exist!");
        const index = this.level.entities.indexOf(this);
        this.level.entities.splice(index, 1);
    }
    static register(name, id, classObj) {
        regEntity.set(name, classObj);
        // regEntityId.set(id, classObj);
    }
    getRegistryKey() {
        return this.creater.key;
    }
    addSaveData(obj = new Object) {
        obj.pos = this.pos;
        obj.velocity = this.velocity;
        obj.spawn = this.spawn;
        obj.movedTick = this.movedTick;
        obj.movingTick = this.movingTick;
        obj.wasMoved = this.wasMoved;
        obj.isMoving = this.isMoving;
        obj.createrKey = this.creater?.key;
        obj.bb = this.bb;
        obj.health = this.health;
        obj.levelDepth = this?.level?.depth ?? undefined;
        obj.uuid = this.uuid;
        obj.classType = "entity";
        return obj;
    }
    readSaveData(obj) {
        this.setPos(obj.pos.x, obj.pos.y);
        this.velocity = obj.velocity;
        this.spawn = obj.spawn;
        this.movedTick = obj.movedTick;
        this.movingTick = obj.movingTick;
        this.wasMoved = obj.wasMoved;
        this.isMoving = obj.isMoving;
        this.bb = obj.bb;
        this.health = obj.health;
        this.level = levelDepthes.get(obj.levelDepth);
        this.uuid = obj.uuid;
        return this;
    }
    static allOverlaps(aabb, level, anyClass) {
        let hit = new Array();
        for (const entity of level.entities.filter(value => typeof anyClass === "function" ? value instanceof anyClass : true)) {
            if (entity.bb.simpleOverlap(aabb))
                hit.push(entity);
        }
        return hit;
    }
    debugDrawText(text, offset = new Vec2(0, 0)) {
        Font.drawText(text, this.pos.x + offset.x - Cam.x, this.pos.y + offset.y - Cam.y);
    }
    clearLoadCache() {
        delete this.loadCache;
        return this;
    }
    addLoadCache(obj) {
        this.loadCache = obj;
        return this;
    }
    canChunkDispose(cpos) {
        let eposLT = cpos.getEntityLeftTopPos();
        let eposRB = cpos.getEntityRightBottomPos();
        if (eposLT.x <= this.pos.x && this.pos.x <= eposRB.x)
            if (eposLT.y <= this.pos.y && this.pos.y <= eposRB.y)
                return true;
        return false;
    }
    tryChunkDispose(cpos, doSave) {
        if (!this.canChunkDispose(cpos))
            return false;
    }
    static getNearestEntityDistance(pos, instance, level) {
        let distance = new Array();
        for (const entity of level.entities) {
            if (entity instanceof instance === false)
                continue;
            distance.push(Util.getDistance(pos.x, pos.y, entity.pos.x, entity.pos.y));
        }
        return Math.min.apply(null, distance);
    }
    static getNearestEntity(pos, instance, level) {
        let distance = new Array();
        let distEntity = new Array();
        for (const entity of level.entities) {
            if (entity instanceof instance === false)
                continue;
            distance.push(Util.getDistance(pos.x, pos.y, entity.pos.x, entity.pos.y));
            distEntity.push(entity);
        }
        return distEntity[distance.indexOf(Math.min.apply(null, distance))];
    }
}
class EntityLiving extends Entity {
    tick() {
        super.tick();
        this.overlapKnockBack();
    }
    overlapKnockBack() {
        const hit_enemy = Entity.allOverlaps(this.bb, this.level, EntityLiving);
        for (const entity of hit_enemy) {
            entity.velocity.x += Math.sign(entity.pos.x - this.pos.x) * 1;
            entity.velocity.y += Math.sign(entity.pos.y - this.pos.y) * 1;
        }
    }
}
class EntityPlayer extends EntityLiving {
    neverSave = true;
    neverDispose = true;
    damageCooldown = 0;
    facing = Direction.down;
    rotate = Direction.down;
    maxHealth = 500;
    health = this.maxHealth;
    levelDepth;
    weapon;
    constructor(spawnX = 0, spawnY = 0, level) {
        super(spawnX, spawnY, level, new Size(10, 10));
    }
    isControl() {
        return Game.mainPlayer === this;
    }
    velocityCalc() {
        const preventPlayerMove = RioxUiMain.isPreventPlayerMove();
        let key = { up: false, down: false, right: false, left: false };
        if (this.isControl()) {
            if (!preventPlayerMove) {
                key.up = KeyGroups.up.isPressed();
                key.down = KeyGroups.down.isPressed();
                key.right = KeyGroups.right.isPressed();
                key.left = KeyGroups.left.isPressed();
                if (this.weapon?.despawned)
                    this.weapon = undefined;
                if (KeyGroups.attack.isPressed() && this.weapon == undefined)
                    this.weapon = new EntityPlayerWeapon(this.pos.x, this.pos.y, this.level, this);
            }
            else {
                key.up = false;
                key.down = false;
                key.right = false;
                key.left = false;
            }
        }
        else {
        }
        if (!preventPlayerMove && !KeyGroups.attack.isPressed() || !Configs.get("attackRotateRock")) {
            this.facing = Direction.getFacingByKey(key.up, key.down, key.left, key.right) ?? this.facing;
            this.rotate = Direction.getRotateByKey(key.up, key.down, key.left, key.right) ?? this.rotate;
        }
        //移動判定
        if (key.up || key.down || key.right || key.left) {
            this.isMoving = true;
        }
        else {
            this.isMoving = false;
        }
        //速度移動
        if (key.up)
            this.velocity.y -= 0.425;
        if (key.down)
            this.velocity.y += 0.425;
        if (key.right)
            this.velocity.x += 0.425;
        if (key.left)
            this.velocity.x -= 0.425;
    }
    draw() {
        const drawOffset = new Vec2(-8, -19);
        const drawPos = this.getDrawPos(drawOffset);
        drawImg(Images.get("players"), (this.getAnimFlame() ?? 0) * 16, this.facing.toFacing() * 32, 16, 24, drawPos.x, drawPos.y);
    }
    getAnimFlame() {
        if (this.wasMoved) {
            switch (Math.floor(this.movedTick / 7 % 4)) {
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
class EntityPlayerWeapon extends Entity {
    neverSave = true;
    neverDispose = true;
    owner;
    startRotate;
    startPos;
    autoAimTarget;
    weaponTick = 0;
    weaponSpeed = 5;
    floatmode = true;
    constructor(spawnX = 0, spawnY = 0, level, owner) {
        super(spawnX, spawnY, level, new Size(40, 40));
        this.owner = owner;
        this.startRotate = owner.rotate;
        this.startPos = owner.pos;
        this.setPos(owner.pos.x, owner.pos.y);
    }
    getAttackRange() {
        return 15;
    }
    tick() {
        super.tick();
        if (!KeyGroups.attack.isPressed())
            this.floatmode = false;
        const floatmode = Entity.allOverlaps(new AABB(this.pos.x - this.getAttackRange(), this.pos.y - this.getAttackRange(), this.pos.x + this.getAttackRange(), this.pos.y + this.getAttackRange()), this.level, EntityEnemy).length > 0;
        if (this.weaponTick < 12)
            this.moveTick(this.weaponSpeed += 0.25, false);
        else if (floatmode ? this.weaponTick > 48 : this.weaponTick > 12)
            this.moveTick(this.weaponSpeed += 0.25, true);
        else
            this.moveTick(this.weaponSpeed *= 0.25, false);
        this.move(this.owner.velocity.x * 0.8, this.owner.velocity.y * 0.8);
        this.weaponAttackTick();
        if (this.weaponTick > 12) {
            const hit_enemy = Entity.allOverlaps(new AABB(this.pos.x - 8, this.pos.y - 8, this.pos.x + 8, this.pos.y + 8), this.level, EntityPlayer);
            if (hit_enemy.length > 0)
                this.despawn();
        }
        if (this.weaponTick > 100)
            this.despawn();
        // if (KeyGroups.attack.down && this.weaponTick > 0) this.weaponSpeed *= 2;
        if (KeyGroups.attack.isPressStarted() && (floatmode ? this.weaponTick > 48 : this.weaponTick > 12)) {
            this.weaponTick = 0;
            this.weaponSpeed = 5;
        }
        this.weaponTick++;
    }
    moveTick(speed, playerHoming) {
        let speedX, speedY;
        if (playerHoming) {
            speedX = Math.sign(this.owner.pos.x - this.pos.x) * speed;
            speedY = Math.sign(this.owner.pos.y - this.pos.y) * speed;
        }
        else {
            speedX = this.startRotate.dx * speed;
            speedY = this.startRotate.dy * speed;
        }
        this.move(speedX, speedY);
    }
    weaponAttackTick() {
        const breakLayer = enumMapLayer.Layer1;
        if (this.weaponTick > 0) {
            //攻撃
            let hit_enemy = new Array();
            hit_enemy = Entity.allOverlaps(new AABB(this.pos.x - this.getAttackRange(), this.pos.y - this.getAttackRange(), this.pos.x + this.getAttackRange(), this.pos.y + this.getAttackRange()), this.level, EntityEnemy);
            for (const entity of hit_enemy) {
                // console.log(entity)
                const facing = new Vec2(this.startRotate.dx, this.startRotate.dy);
                const knockbackPower = 2.5;
                const attackPower = 10;
                entity.damage(attackPower, facing.x * knockbackPower, facing.y * knockbackPower, true);
            }
            //岩壊す
            let breakTilesAbout = this.level.overlapTiles(new AABB(this.pos.x - 10, this.pos.y - 10, this.pos.x + 10, this.pos.y + 10));
            for (const breakTileAbout of breakTilesAbout) {
                const breakTile = breakTileAbout.tileState.getTile();
                if (!breakTile.isBreakable)
                    continue;
                if (Util.prob(breakTile.getBreakProbability())) {
                    const tileState = this.level.getTileState(breakTileAbout.pos);
                    tileState.layer1 = breakTile.getBreakBecomeTile();
                    tileState.hitbox = HitboxType.get(0);
                    this.level.setTileState(breakTileAbout.pos, tileState);
                    const entiyPos = breakTileAbout.pos.getEntityPos();
                    ParticleType.rockBreak.multiCreate(10, entiyPos.x, entiyPos.y, this.level);
                    Util.playSound("break", "tile");
                }
                const pos = breakTileAbout.pos.getEntityPos();
                ParticleType.rockBreak.multiCreate(0.2, pos.x, pos.y, this.level);
                Util.playSound("breakbit", "tile", true);
            }
            //オートエイム
            if (Entity.getNearestEntityDistance(this.pos, EntityEnemy, this.level) < 100) {
                let entity = Entity.getNearestEntity(this.pos, EntityEnemy, this.level);
                this.autoAimTarget ??= entity;
            }
            if (this.autoAimTarget != null) {
                this.pos.x += Math.sign(this.autoAimTarget.pos.x - this.pos.x) * 200;
                this.pos.y += Math.sign(this.autoAimTarget.pos.y - this.pos.y) * 200;
            }
        }
    }
    draw() {
        const animationSpeed = 1;
        const frameCount = 8;
        const weaponRotation = Direction.getRotateByIndex(Math.floor((this.weaponTick / animationSpeed) % frameCount));
        const drawOffset = new Vec2(-8, -8);
        const drawPos = this.getDrawPos(drawOffset);
        this.drawWeapon(weaponRotation, drawPos.x, drawPos.y);
        this.drawSweep(weaponRotation, drawPos.x, drawPos.y);
        // Font.drawText(this.weaponSpeed.toFixed(3), this.pos.x - Cam.x + drawOffset.x, this.pos.y - Cam.y + drawOffset.y);
    }
    drawWeapon(rotate, drawX, drawY) {
        drawImg(Images.get("item_model"), +rotate * 32, 0, 32, 32, drawX + rotate.weaponOffset.x, drawY + rotate.weaponOffset.y);
    }
    drawSweep(rotate, drawX, drawY) {
        const size = 7;
        let offset = new Vec2(4 * Math.sign(rotate.dx) * (+rotate % 2) - 8 + Math.sign(rotate.dx) * size, 4 * Math.sign(rotate.dy) * (+rotate % 2) - 8 + Math.sign(rotate.dy) * size);
        drawImg(Images.get("sweep"), +rotate * 32, 0, 32, 32, drawX + offset.x, drawY + offset.y);
    }
}
class EntityItem extends Entity {
    itemStack;
    constructor(spawnX = 0, spawnY = 0, level, itemStack) {
        super(spawnX, spawnY, level, new Size(8, 8));
        this.itemStack = itemStack;
    }
    draw() {
        const drawPos = this.getDrawPos();
        Sprite.drawByAtlas(Images.get("items"), Util.getTileAtlasXY(this.itemStack.item.icon).x, Util.getTileAtlasXY(this.itemStack.item.icon).y, 16, 16, drawPos.x, drawPos.y);
    }
}
class EntityEnemy extends EntityLiving {
    damageEffect = {
        Damage: 0,
        ViewTime: 0,
        HealthTime: 0
    };
    damageCooldown = 0;
    attack = {
        coolDown: 0,
        animTime: 0,
        animFlag: false
    };
    get attackCondition() { return true; }
    ;
    attackPower = 10;
    tick() {
        super.tick();
        this.attackTick();
        this.damageCooldown--;
        this.damageEffect.ViewTime--;
        this.damageEffect.HealthTime--;
        if (this.damageEffect.ViewTime <= 0)
            this.damageEffect.Damage = 0;
        if (this.health <= 0) {
            ParticleType.deathSmoke.multiCreate(5, this.pos.x, this.pos.y, this.level);
            this.despawn();
        }
    }
    attackTick() {
        this.attack.coolDown--;
        if (this.attackCondition)
            return;
        //playerid
        let i = 0;
        const target = Game.mainPlayer;
        if (this.bb.simpleOverlap(target.bb)) {
            if (this.attack.coolDown <= 0) {
                this.attack.coolDown = 50;
                this.attack.animFlag = true;
            }
            if (this.attack.animTime == 10)
                target.damage(this.attackPower, -Math.sign(this.pos.x - target.pos.x + 8), -Math.sign(this.pos.y - target.pos.y + 8));
        }
    }
    damage(damage, rx = 0, ry = 0, byPlayer = false) {
        super.damage(damage, rx, ry, byPlayer);
        const knockbackResistance = 1.0;
        //クールダウン判定
        if (this.damageCooldown > 0)
            return false;
        //効果音
        Util.playSound("damage", "enemy", true);
        //ノックバック処理
        this.velocity.x += rx / knockbackResistance;
        this.velocity.y += ry / knockbackResistance;
        //ダメージ処理
        this.health -= damage;
        //クールダウン処理
        this.damageCooldown = 5;
        //エフェクト処理
        this.damageEffect.Damage += damage;
        this.damageEffect.ViewTime = 100;
        this.damageEffect.HealthTime = 250;
        ParticleType.blueSlime.multiCreate(1, this.pos.x, this.pos.y, this.level);
        return true;
    }
    drawDamageEffect() {
        if (this.damageEffect.HealthTime > 0)
            Sprite.drawHealthBar(this.health / this.maxHealth, this.pos.x - Cam.x - 5, this.pos.y - Cam.y);
        if (this.damageEffect.ViewTime > 0)
            Font.drawText(this.damageEffect.Damage.toString(), this.pos.x - Cam.x, this.pos.y - 16 - Math.log10(-8 * (this.damageEffect.ViewTime / 100 - 1)) * 8 - Cam.y);
    }
    addSaveData(obj = new Object) {
        obj.damageEffect = this.damageEffect;
        obj.damageCooldown = this.damageCooldown;
        obj.attack = this.attack;
        super.addSaveData(obj);
        return obj;
    }
    readSaveData(obj) {
        this.damageEffect = obj.damageEffect;
        this.damageCooldown = obj.damageCooldown;
        this.attack = obj.attack;
        super.readSaveData(obj);
        return this;
    }
}
class EntityEnemyNeutralBasic extends EntityEnemy {
    hostilityDelay = 0;
    get hostility() { return this.hostilityDelay > 0; }
    ;
    #movetemp = {
        xp: false,
        xn: false,
        yp: false,
        yn: false,
        movingTime: 0,
        get Moving() {
            return this.movingTime > 0;
        }
    };
    get attackCondition() { return !this.hostility; }
    ;
    tick() {
        super.tick();
        const entityPlayer = Game.mainPlayer;
        const becomeNotHostilityDistance = 256;
        if (this.hostility && Util.getDistance(entityPlayer.pos.x, entityPlayer.pos.y, this.pos.x, this.pos.y) > becomeNotHostilityDistance)
            this.hostilityDelay--;
    }
    velocityCalc() {
        let player = Game.mainPlayer;
        if (this.hostility) {
            if (this.bb.scale(0.9).simpleOverlap(player.bb)) {
                this.wasMoved = false;
                return;
            }
            let r = Util.calcAngleDegrees(player.pos?.x - this.pos.x, player.pos?.y - this.pos.y);
            this.velocity.x += this.moveSpeed * Math.cos(r);
            this.velocity.y += this.moveSpeed * Math.sin(r);
            this.wasMoved = true;
            return;
        }
        else {
            //move random (normal)
            if (this.#movetemp.yn)
                this.velocity.y -= this.moveSpeed;
            if (this.#movetemp.yp)
                this.velocity.y += this.moveSpeed;
            if (this.#movetemp.xp)
                this.velocity.x += this.moveSpeed;
            if (this.#movetemp.xn)
                this.velocity.x -= this.moveSpeed;
            if (this.#movetemp.movingTime > 0)
                this.#movetemp.movingTime -= 1;
            if (this.#movetemp.movingTime <= 0) {
                this.#movetemp.yn = false;
                this.#movetemp.yp = false;
                this.#movetemp.xp = false;
                this.#movetemp.xn = false;
                if (Util.prob(0.05)) {
                    if (Util.prob(0.1))
                        this.#movetemp.yn = true;
                    if (Util.prob(0.1))
                        this.#movetemp.yp = true;
                    if (Util.prob(0.1))
                        this.#movetemp.xp = true;
                    if (Util.prob(0.1))
                        this.#movetemp.xn = true;
                    if (this.#movetemp.yn || this.#movetemp.yp || this.#movetemp.xn || this.#movetemp.yp)
                        this.#movetemp.movingTime = Util.randomInt(5, 10);
                }
            }
            if (this.#movetemp.movingTime > 0) {
                this.wasMoved = true;
            }
            else {
                this.wasMoved = false;
            }
        }
    }
    damage(damage, rx = 0, ry = 0, byPlayer = false) {
        const result = super.damage(damage, rx, ry, byPlayer);
        const becomeNotHostilityDelay = 100;
        this.hostilityDelay = becomeNotHostilityDelay;
        return result;
    }
    addSaveData(obj = new Object) {
        obj.hostilityDelay = this.hostilityDelay;
        super.addSaveData(obj);
        return obj;
    }
    readSaveData(obj) {
        this.hostilityDelay = obj.hostilityDelay;
        super.readSaveData(obj);
        return this;
    }
}
class EntityAnimationHelper {
    animTick = 0;
    animFlag = false;
    animLength;
    constructor(animLength) {
        this.animLength = animLength;
    }
    tick() {
        if (this.animFlag)
            this.animTick++;
        if (this.animTick >= this.animLength) {
            this.animTick = 0;
            this.animFlag = false;
        }
    }
    play() {
        this.animFlag = true;
        this.animTick = 0;
    }
}
var enumEntitySlimeType;
(function (enumEntitySlimeType) {
    enumEntitySlimeType[enumEntitySlimeType["blue"] = 0] = "blue";
})(enumEntitySlimeType || (enumEntitySlimeType = {}));
class EntitySlime extends EntityEnemyNeutralBasic {
    anim = {
        time: 0,
        flag: false
    };
    size = new Size(16, 16);
    maxHealth = 200;
    health = 200;
    tick() {
        this.animationTick();
        super.tick();
    }
    draw() {
        const srcOffset = new Vec2(0, 0);
        const drawOffset = new Vec2(-8, -8 - 4);
        const srcPos = this.getDrawSourcePos();
        const drawPos = this.getDrawPos(drawOffset);
        drawImg(Images.get("enemy"), srcOffset.x + srcPos.x, srcOffset.y + srcPos.y, 16, 16, drawPos.x, drawPos.y - Easings.jump(this.attack.animTime / 20) * 5);
        this.drawDamageEffect();
    }
    animationTick() {
        if (this.level == null)
            throw Error("entity's level is not exist!");
        if (this.wasMoved)
            this.anim.flag = true;
        if (this.anim.flag)
            this.anim.time++;
        if (this.anim.time >= 20) {
            this.anim.time = 0;
            this.anim.flag = false;
        }
        if (this.anim.time == 8)
            ParticleType.blueSlime.multiCreate(1, this.pos.x, this.pos.y, this.level);
        if (this.attack.animFlag)
            this.attack.animTime++;
        if (this.attack.animTime >= 20) {
            this.attack.animTime = 0;
            this.attack.animFlag = false;
        }
    }
    getDrawSourcePos() {
        let x = 0;
        let y = 0;
        if (this.anim.time > 0)
            x = Math.floor(this.anim.time / 20 * 3);
        if (this.attack.animTime > 0)
            x = Math.floor(this.attack.animTime / 20 * 3);
        return new Vec2(x * 16, y * 16);
    }
    addSaveData(obj = new Object) {
        obj.anim = this.anim;
        super.addSaveData(obj);
        return obj;
    }
    readSaveData(obj) {
        this.anim = obj.anim;
        super.readSaveData(obj);
        return this;
    }
}
class EntityCrab extends EntityEnemy {
    maxHealth = 400;
    health = 400;
    size = new Size(32, 32);
    moveSpeed = 0.25;
    armAnimRight = new EntityAnimationHelper(60);
    armAnimLeft = new EntityAnimationHelper(60);
    autoTurnWalkTick = 50;
    turnDelay = 20;
    damageMoveDelay = 3;
    targetStartRange = 8 * 16;
    targetEndRange = 16 * 16;
    facingSign = 1;
    walkTickAfterTurn = 0;
    turnTick = 0;
    damageTick = 0;
    target = null;
    tick() {
        super.tick();
        if (this.wasCollisioned.x ||
            this.walkTickAfterTurn > this.autoTurnWalkTick)
            this.turn();
        this.walkTickAfterTurn++;
        this.turnTick--;
        this.damageTick--;
        this.armAnimLeft.tick();
        this.armAnimRight.tick();
        if (Util.prob(0.01))
            this.armAnimLeft.play();
        if (Util.prob(0.01))
            this.armAnimRight.play();
    }
    checkTarget() {
        let player = Game.mainPlayer;
        let playerRange = Util.getDistance(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
        this.debugDrawText(playerRange.toString());
    }
    turn() {
        this.facingSign *= -1; // turn
        this.walkTickAfterTurn = 0;
        this.turnTick = this.turnDelay;
    }
    damage(damage, rx = 0, ry = 0, byPlayer = false) {
        const result = super.damage(damage, rx, ry, byPlayer);
        this.damageTick = this.damageMoveDelay;
        return result;
    }
    velocityCalc() {
        if (this.turnTick <= 0 && this.damageTick <= 0)
            this.velocity.x += this.moveSpeed * this.facingSign;
    }
    animationTick() {
    }
    getDrawSourcePos() {
        return new Vec2(0, 0);
    }
    getArmDrawSourcePos(dir) {
        const armAnim = (() => {
            switch (dir) {
                case Direction.right:
                    return this.armAnimRight;
                case Direction.left:
                    return this.armAnimLeft;
                default:
                    throw Error("invalid direction");
            }
        })();
        const animFlames = [
            0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0
        ];
        const animFlame = Math.floor(armAnim.animTick / armAnim.animLength * animFlames.length);
        return new Vec2(animFlames[animFlame] * 16, 0);
    }
    getLegDrawSourcePos(dir) {
        const WALKANIML = 12;
        return new Vec2(!(this.lifeTime % WALKANIML > WALKANIML / 2) != !(dir == Direction.left) ? 16 : 0, 16);
    }
    armStateLeft = 0;
    armStateRight = 0;
    draw() {
        let enumPartType;
        (function (enumPartType) {
            enumPartType[enumPartType["Arm"] = 0] = "Arm";
            enumPartType[enumPartType["Leg"] = 1] = "Leg";
        })(enumPartType || (enumPartType = {}));
        const jumpOffsetY = -Easings.jump(Math.max(0, this.turnTick) / this.turnDelay) * 3;
        const drawPart = (dir, partType) => {
            const srcOrigin = new Vec2(0, 48);
            if (ctx == null)
                throw new Error("canvas context is null!");
            ctx.save();
            const srcOffset = (() => {
                switch (partType) {
                    case enumPartType.Arm:
                        return this.getArmDrawSourcePos(dir);
                    case enumPartType.Leg:
                        return this.getLegDrawSourcePos(dir);
                    default:
                        throw Error("invalid part type");
                }
            })();
            const drawOffset = new Vec2(0, -16 + jumpOffsetY + (partType == enumPartType.Leg ? 16 : 0));
            ctx.scale(dir.dx, 1);
            const drawPos = this.getDrawPos(drawOffset);
            drawImg(Images.get("enemy"), srcOrigin.x + srcOffset.x, srcOrigin.y + srcOffset.y, 16, 16, dir.dx * drawPos.x, drawPos.y);
            ctx.restore();
        };
        drawPart(Direction.left, enumPartType.Arm);
        drawPart(Direction.right, enumPartType.Arm);
        drawPart(Direction.left, enumPartType.Leg);
        drawPart(Direction.right, enumPartType.Leg);
        this.drawDamageEffect();
        // this.debugDrawText(this.turnTick.toString());
        //Font.drawText(`x:${this.wasCollisioned.x},y:${this.wasCollisioned.y}`, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
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
            return this.movingTime > 0;
        }
    };
    moveScript() {
        if (this.#movetemp.yn)
            this.velocity.y -= this.moveSpeed;
        if (this.#movetemp.yp)
            this.velocity.y += this.moveSpeed;
        if (this.#movetemp.xp)
            this.velocity.x += this.moveSpeed;
        if (this.#movetemp.xn)
            this.velocity.x -= this.moveSpeed;
        if (this.#movetemp.movingTime > 0)
            this.#movetemp.movingTime -= 1;
        if (this.#movetemp.movingTime > 0) {
            this.#movetemp.yn = false;
            this.#movetemp.yp = false;
            this.#movetemp.xp = false;
            this.#movetemp.xn = false;
            if (Util.prob(0.05)) {
                if (Util.prob(0.1))
                    this.#movetemp.yn = true;
                if (Util.prob(0.1))
                    this.#movetemp.yp = true;
                if (Util.prob(0.1))
                    this.#movetemp.xp = true;
                if (Util.prob(0.1))
                    this.#movetemp.xn = true;
                if (this.#movetemp.yn || this.#movetemp.yp || this.#movetemp.xn || this.#movetemp.yp)
                    this.#movetemp.movingTime = Util.randomInt(5, 10);
            }
        }
        if (this.#movetemp.movingTime > 0) {
            this.wasMoved = true;
        }
        else {
            this.wasMoved = false;
        }
    }
    addSaveData(obj = new Map) {
        obj.set("movetemp", this.#movetemp);
        super.addSaveData(obj);
        return obj;
    }
    readSaveData(obj) {
        this.#movetemp = obj.get("movetemp");
        super.readSaveData(obj);
        return this;
    }
}
const regEntity = new Map;
const regEntityId = new Map;
function register(obj, name, clas, prop) {
    obj[name] = (...arg) => {
        return new clas(prop, ...arg);
    };
    obj[name].constructor = clas;
}
class EntityProjectile extends Entity {
    power = 10;
    inertia = 0.9;
    homing = false;
    rotateDegrees = 0;
    constructor(spawnX = 0, spawnY = 0, level, rotateDegress) {
        super(spawnX, spawnY, level);
        this.setRotateDegrees(rotateDegress);
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
    setRotateDegrees(d) {
        this.rotateDegrees = d;
        this.velocity.x = Math.sin(Util.degreesToRadians(this.rotateDegrees)) * this.power;
        this.velocity.y = Math.cos(Util.degreesToRadians(this.rotateDegrees)) * this.power;
        return this;
    }
    velocityCalc() {
    }
    moveBase() {
        //スピード調整
        if (this.velocity.x > 0) {
            this.velocity.x = Math.floor(this.velocity.x * this.inertia * 1000) / 1000;
        }
        else {
            this.velocity.x = Math.ceil(this.velocity.x * this.inertia * 1000) / 1000;
        }
        if (this.velocity.y > 0) {
            this.velocity.y = Math.floor(this.velocity.y * this.inertia * 1000) / 1000;
        }
        else {
            this.velocity.y = Math.ceil(this.velocity.y * this.inertia * 1000) / 1000;
        }
        //動き替える
        this.velocityCalc();
        this.move(this.velocity.x, this.velocity.y);
    }
}
class EntityMineralWater extends EntityProjectile {
    power = 10;
    inertia = 0.9;
    homing = false;
}
let particles = new Array();
let ParticleType = new RegistryParticleType(); //ばぐのもと？
class ParticleProperties {
    type;
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
        Object.defineProperty(this, key, {
            get: function () {
                return value;
            }
        });
    }
}
class Particle extends ParticleProperties {
    hasSpawned = false;
    spawn = new Pos(0, 0);
    time = 0;
    random;
    bb = new AABB(0, 0, 0, 0);
    level;
    ogPos = new Pos(0, 0);
    size = new Size(16, 16);
    lifetime = 0;
    static init() {
        ParticleType.register("rockBreak", ParticleSplinter, ParticleProperties.of().setType(enumParticleSplinterType.rockBreak));
        ParticleType.register("blueSlime", ParticleSplinter, ParticleProperties.of().setType(enumParticleSplinterType.blueSlime));
        ParticleType.register("deathSmoke", ParticleSmoke, ParticleProperties.of().setType(ParticleSplinter.TypeDeath));
    }
    constructor(spawnX, spawnY, level) {
        super();
        if (level == null)
            throw Error("particle spawn level is not exist!");
        this.level = level;
        this.spawn.x = spawnX;
        this.pos.x = spawnX;
        this.spawn.y = spawnY;
        this.pos.y = spawnY;
        this.setPos(spawnX, spawnY);
        this.random = [Util.random(-1, 1), Util.random(-1, 1)];
        if (!this.hasSpawned)
            level.particles.push(this);
        this.hasSpawned = true;
    }
    spawnAt(spawnX, spawnY, level) {
        if (level == null)
            throw Error("particle spawn level is not exist!");
        this.level = level;
        this.spawn.x = spawnX;
        this.pos.x = spawnX;
        this.spawn.y = spawnY;
        this.pos.y = spawnY;
        this.setPos(spawnX, spawnY);
        if (!this.hasSpawned)
            level.particles.push(this);
        this.hasSpawned = true;
    }
    // countが1以上ならその個数 1未満なら確率で1個
    static createMulti(count = 1) {
        let multiparticles = new Array;
        if (count < 1.0 && !Util.prob(count))
            return multiparticles;
        for (let i = 0; i < count; i++) {
            multiparticles.push(this);
        }
        return multiparticles;
    }
    static getCreateCount(count = 1) {
        if (count < 1.0 && !Util.prob(count))
            return 0;
        return Math.ceil(count);
    }
    draw() {
        const drawOffset = this.getDrawOffset();
        const srcPos = this.getDrawSourcePos();
        drawImg(Images.get("particle"), srcPos.x, srcPos.y, 16, 16, this.pos.x + drawOffset.x - Cam.x, this.pos.y + drawOffset.y - Cam.y);
    }
    drawCondition() {
        return Game.onScreenArea(new Rect(this.pos.x, this.pos.y, this.size.w, this.size.h));
    }
    getDrawOffset() {
        return new Vec2(0, 0);
    }
    getDrawSourcePos() {
        return new Vec2(0, 0);
    }
    tick() {
        this.time++;
        if (this.lifetime <= this.time)
            this.despawn();
    }
    despawn() {
        if (this.level == null)
            throw Error("particle's level is not exist");
        const index = this.level.particles.indexOf(this);
        this.level.particles.splice(index, 1);
    }
    move(xa, ya) {
        if (Math.abs(xa) < 1)
            xa = 0;
        if (Math.abs(ya) < 1)
            ya = 0;
        this.ogPos = new Pos(this.pos.x, this.pos.y);
        let ogXa = xa;
        let ogYa = ya;
        let aabbs = this.level.getCubes(this.bb.expand(xa, ya));
        Debug.hitboxesTile.push(...aabbs);
        for (let aabb of aabbs) {
            xa = aabb.clipXCollide(this.bb, xa);
        }
        this.bb.move(xa, 0);
        for (let aabb of aabbs) {
            ya = aabb.clipYCollide(this.bb, ya);
        }
        this.bb.move(0, ya);
        this.pos.x = Math.round((this.bb.x0 + this.bb.x1) / 2);
        this.pos.y = Math.round((this.bb.y0 + this.bb.y1) / 2);
    }
    setPos(xa, ya) {
        this.bb = new AABB(xa - this.size.w / 2, ya - this.size.h / 2, xa + this.size.w / 2, ya + this.size.h / 2);
    }
    get pos() {
        return new Pos(Math.round((this.bb.x0 + this.bb.x1) / 2), Math.round((this.bb.y0 + this.bb.y1) / 2));
    }
}
var enumParticleSplinterType;
(function (enumParticleSplinterType) {
    enumParticleSplinterType[enumParticleSplinterType["death"] = 0] = "death";
    enumParticleSplinterType[enumParticleSplinterType["rockBreak"] = 1] = "rockBreak";
    enumParticleSplinterType[enumParticleSplinterType["blueSlime"] = 2] = "blueSlime";
})(enumParticleSplinterType || (enumParticleSplinterType = {}));
class ParticleSplinter extends Particle {
    static TypeDeath(TypeDeath) {
        throw Error("Method not implemented.");
    }
    size = new Size(8, 8);
    DrawOffset = new Vec2(0, 0);
    lifetime = Util.randomInt(25, 50);
    getDrawOffset() {
        return new Vec2(this.random[0] * 16 * Easings.scatter(this.time / this.lifetime), -Easings.jump(this.time / this.lifetime * 2) * 4);
    }
    getDrawSourcePos() {
        switch (this.type) {
            default:
            case enumParticleSplinterType.rockBreak:
                return new Vec2(16, 16);
            case enumParticleSplinterType.blueSlime:
                return new Vec2(0, 16);
        }
    }
}
var enumParticleSmokeType;
(function (enumParticleSmokeType) {
    enumParticleSmokeType[enumParticleSmokeType["death"] = 0] = "death";
})(enumParticleSmokeType || (enumParticleSmokeType = {}));
class ParticleSmoke extends Particle {
    size = new Size(8, 8);
    DrawOffset = new Vec2(0, 0);
    lifetime = Util.randomInt(25, 50);
    getDrawOffset() {
        return new Pos(this.random[0] * this.time / 10, -Math.abs(this.random[1] * this.time / 10)
            - this.time / 5 - this.random[1] * 4);
    }
    getDrawSourcePos() {
        switch (this.type) {
            default:
            case enumParticleSmokeType.death:
                return new Vec2(Math.floor(this.time / this.lifetime * 8) * 16, 0);
        }
    }
}
const chunkSize = new Size(256, 256);
class LevelUnInit {
    // property only;
    classType = "level";
    levelName = "test";
}
class Level {
    classType = "level";
    rawData = null;
    chunks = new Map;
    entities = new Array;
    chunkEntities = new Map;
    particles = new Array;
    levelName = "test";
    depth;
    constructor(depth, levelName) {
        this.depth = depth;
        this.levelName = levelName;
    }
    async chunkLoad(cpos) {
        //新しいチャンクで待機
        this.chunks.set(cpos.getChunkPos().toString(), ChunkLevel.create(cpos, this.levelName));
        return this.chunks.set(cpos.getChunkPos().toString(), await ChunkLevel.load(cpos, this.levelName));
    }
    async chunkCreate(cpos) {
        return this.chunks.set(cpos.getChunkPos().toString(), ChunkLevel.create(cpos, this.levelName));
    }
    init() {
        this.chunks = new Map;
        this.entities = new Array;
        this.particles = new Array;
    }
    toString() {
    }
    getTileState(pos) {
        if (pos.isChunkPos)
            throw Error("is cpos");
        return this.getChunk(pos)?.getTileState(pos) ?? new TileState;
    }
    setTileState(pos, tileState) {
        if (pos.isChunkPos)
            throw Error("is cpos");
        return this.getChunk(pos)?.setTileState(pos, tileState);
    }
    getChunk(pos) {
        return this.chunks.get(pos.getChunkPos().toString()) ?? null;
    }
    hasChunk(cpos) {
        let cposArr = Util.convertArray(cpos);
        // cposArr.forEach(value => value.getChunkPos());
        for (const cpos of cposArr) {
            if (this.chunks.has(cpos.toString()))
                return true;
            // if (Object.keys(this.chunks).includes(cpos.toString())) return true;
        }
        return false;
    }
    autoLoadDispose(plPos) {
        const plCpos = new TPos(plPos.x / 16, plPos.y / 16).getChunkPos();
        const loadcpos = [
            new CPos(plCpos.x + 1, plCpos.y + 1),
            new CPos(plCpos.x + 0, plCpos.y + 1),
            new CPos(plCpos.x - 1, plCpos.y + 1),
            new CPos(plCpos.x + 1, plCpos.y + 0),
            new CPos(plCpos.x + 0, plCpos.y + 0),
            new CPos(plCpos.x - 1, plCpos.y + 0),
            new CPos(plCpos.x + 1, plCpos.y - 1),
            new CPos(plCpos.x + 0, plCpos.y - 1),
            new CPos(plCpos.x - 1, plCpos.y - 1)
        ];
        for (const cpos of loadcpos) {
            if (this.hasChunk(cpos))
                continue;
            this.chunkLoad(cpos);
        }
        for (const chunkKey of Object.keys(this.chunks)) {
            if (!loadcpos.map(value => value.toString()).includes(chunkKey)) {
                const chunk = this.chunks.get(chunkKey);
                if (chunk == null)
                    continue;
                chunk.entitySave(this, { dispose: true });
                this.chunks.delete(chunkKey);
            }
        }
    }
    entitySaveAll() {
        for (const chunkKey of Object.keys(this.chunks)) {
            const chunk = this.chunks.get(chunkKey);
            if (chunk == null)
                continue;
            chunk.entitySave(this, { dispose: false });
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
                const hitbox = this.getTileState(new TPos(Math.floor(x), Math.floor(y))).getHitbox();
                if (hitbox == null)
                    continue;
                Debug.hitboxAABB = hitbox;
                aabbs.push(new AABB(Math.floor(x) * 16 + hitbox.x0, Math.floor(y) * 16 + hitbox.y0, Math.floor(x) * 16 + hitbox.x1, Math.floor(y) * 16 + hitbox.y1));
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
    overlapTiles(aabbSrc, checkTile = null, checkLayer = enumMapLayer.Layer1) {
        let aabb = aabbSrc.scale(1);
        let x = Math.round(aabb.x0 / 16);
        let y = Math.round(aabb.y0 / 16);
        let hit = new Array();
        let debugenabled = Configs.get("debugHitboxShow").value;
        if (debugenabled)
            Debug.hitboxView.push(aabbSrc);
        let debug;
        for (let ix = 0; ix < Math.ceil((aabb.x1 - aabb.x0) / 16); ix++) {
            for (let iy = 0; iy < Math.ceil((aabb.y1 - aabb.y0) / 16); iy++) {
                let tilestate = this.getTileState(new TPos(x + ix, y + iy)) ?? null;
                let result = {
                    pos: new TPos(x + ix, y + iy),
                    tileState: tilestate
                };
                if (!Util.allNotNull(checkTile))
                    hit.push(result);
                if (Util.allNotNull(checkTile) && Util.convertArray(checkTile).includes(result.tileState?.[checkLayer]))
                    hit.push(result);
                if (debugenabled)
                    Debug.hitboxView.push(new AABB(x + ix, y + iy, x + ix + 1, y + iy + 1).scale(16));
                debug = result.tileState;
            }
        }
        return hit;
    }
    addSaveData() {
        let obj = new Object;
        obj.levelName = this.levelName;
        return obj;
    }
}
class LevelDepthesRegistry extends Map {
    set(levelDepthName, defaultLevelName) {
        return super.set(levelDepthName, new Level(levelDepthName, defaultLevelName));
    }
    init(levelDepthName) {
        const defaultLevelName = super.get(levelDepthName).levelName;
        return super.set(levelDepthName, new Level(levelDepthName, defaultLevelName));
    }
    addSaveData() {
        let obj = new Object;
        for (const [key, value] of this.entries()) {
            obj[key] = new Object;
            obj[key].levelName = value.levelName;
        }
        return obj;
    }
    allInit() {
        for (const level of this.values()) {
            level.init();
        }
    }
}
let levelDepthes = new LevelDepthesRegistry;
levelDepthes.set("main", "test");
class ChunkLevel {
    cData;
    cpos;
    constructor(rawObj, cpos) {
        if (rawObj === null)
            this.cData = ChunkLevel.getDefaultValue().cData;
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
    static create(cpos, levelName = "PlaceHolder") {
        return new ChunkLevel(this.getDefaultValue(), cpos);
    }
    static async load(cpos, levelName) {
        //return new ChunkLevel(level.rawData.chunks[pos.x][pos.y]);
        return new ChunkLevel(await Jsones.fetchAndParse(`./maps/${levelName}/${cpos.toString()}.json`) ?? null, cpos);
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
    getTileState(pos) {
        const index = pos.getInChunkIndex();
        return new TileState(this.cData.layer1[index], this.cData.layer2[index], this.cData.hitbox[index], this.cData.enemy[index]);
    }
    setTileState(pos, tile) {
        const index = pos.getInChunkIndex();
        if (tile.layer1 != null)
            this.cData.layer1[index] = tile.layer1;
        if (tile.layer2 != null)
            this.cData.layer2[index] = tile.layer2;
        if (tile.hitbox != null)
            this.cData.hitbox[index] = tile.hitbox;
        if (tile.enemy != null)
            this.cData.enemy[index] = tile.enemy;
        return tile;
    }
    static updateV1toV2(cData1) {
        if (cData1.version === "2.0")
            return cData1;
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
        });
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
    entitySave(level, { dispose = false }) {
        level.chunkEntities.set(this.cpos.toString(), new Array);
        for (let entity of level.entities) {
            if (entity.neverSave)
                continue;
            if (!entity.canChunkDispose(this.cpos))
                continue;
            level.chunkEntities.get(this.cpos.toString()).push(entity);
            if (dispose && !entity.neverDispose)
                entity.despawn();
        }
    }
}
class TileState {
    layer1;
    layer2;
    hitbox;
    enemy;
    constructor(layer1 = 0, layer2 = 0, hitbox = 0, enemy = 0) {
        this.layer1 = layer1;
        this.layer2 = layer2;
        this.hitbox = hitbox;
        this.enemy = enemy;
    }
    getTileByLayer(mapLayer) {
        switch (mapLayer) {
            case enumMapLayer.Layer1:
                return this.getTile();
            case enumMapLayer.Layer2:
                return this.getTileAlt();
            case enumMapLayer.Enemy:
                return this.getEnemy();
            case enumMapLayer.Hitbox:
                return this.getHitbox();
            default:
                throw Error("undefined map layer");
        }
    }
    getTile() {
        return TileType.getTileClass(this.layer1);
    }
    getTileAlt() {
        return TileType.getTileClass(this.layer2);
    }
    getEnemy() {
        return EntityType.get(this.enemy);
    }
    getHitbox() {
        return HitboxType.get(this.hitbox);
    }
}
//受験やだー
class SaveGame {
    static rootDirHandle;
    static savesDirHandle;
    static SaveDataFileName = "save.json";
    static SaveDirName = "saves";
    static ext = ".json";
    static identifier = "varical";
    static fileHandleArray = new Array;
    static saveDataArray = new Array;
    static curSaveFileHandle;
    static reviver(key, value) {
        switch (value?.classType) {
            case "vec2":
                return new Vec2(value.x, value.y);
            case "size":
                return new Size(value.w, value.h);
            case "rect":
                return new Rect(value.x, value.y, value.w, value.h);
            case "startend":
                return new StartEnd(value.startX, value.startY, value.endX, value.endY);
            case "pos":
                return new Pos(value.x, value.y);
            case "cpos":
                return new CPos(value.x, value.y);
            case "aabb":
                return new AABB(value.x0, value.y0, value.x1, value.y1);
            case "direction":
                return Direction.readSaveData(value);
            case "weapon":
            case "player":
            case "playerstatic":
            case "entity":
                return value;
            case undefined:
                break;
            default:
                throw Error("unknown classType: " + value.classType);
        }
        return value;
    }
    static replacer(key, value) {
        if (value?.neverSave)
            return undefined;
        switch (value?.classType) {
            case "vec2":
            case "size":
            case "rect":
            case "startend":
            case "pos":
            case "cpos":
            case "aabb":
            case "weapon":
            case "player":
            case "playerstatic":
            case "entity":
            case "posGetSet":
            case "level":
                return value;
            case "direction":
                return { name: value.name, type: value.type, classType: value.classType };
            case undefined:
                break;
            default:
                throw Error("unknown classType: " + value.classType);
        }
        return value;
    }
    static restoreSaveData(obj) {
        for (const [levelDepth, level] of levelDepthes.entries()) {
            level.entities = new Array;
            level.particles = new Array;
        }
        Game.players = new Array;
        Game.inventory = new Inventory;
        for (const [levelDepth, level] of levelDepthes.entries()) {
            for (const entity of obj.entities[levelDepth]) {
                let entityInstance = EntityType.get(entity.createrKey).create(entity.pos.x, entity.pos.y, levelDepthes.get(entity.levelDepth));
            }
        }
        for (const player of obj.players) {
            const level = levelDepthes.get(player.levelDepth).readSaveData(player);
            const mainPlayerUuid = obj.mainPlayerUuid;
            const isMainPlayer = player.uuid == mainPlayerUuid;
            Game.createNewPlayer(player.pos.x, player.pos.y, level, { isMainPlayer: isMainPlayer });
            Game.players.push(new EntityPlayer(player.pos.x, player.pos.y, levelDepthes.get(player.levelDepth)).readSaveData(player));
        }
        return;
    }
    static convertSaveData() {
        let obj = new Object;
        obj.entities = new Object;
        for (const [levelDepth, level] of levelDepthes.entries()) {
            obj.entities[levelDepth] ??= new Array;
            for (const entity of level.entities) {
                if (!entity.neverSave)
                    obj.entities[levelDepth].push(entity.addSaveData());
            }
        }
        obj.players ??= new Array;
        for (const player of Game.players) {
            obj.players.push(player.addSaveData());
        }
        obj.mainPlayerUuid = Game.mainPlayer.uuid;
        obj.inventory ??= new Array;
        for (const itemStack of Game.inventory) {
            obj.inventory.push(itemStack.addSaveData());
        }
        obj.levelDepthes = levelDepthes.addSaveData();
        return obj;
    }
    static initialize() {
    }
    static async saveInit() {
        const rootDirHandle = await this.createRootDirHandle();
        const savesDirHandle = await this.createsavesDirHandle(rootDirHandle);
        const savesDirHandleArray = await this.createSaveDirFileHandleArray();
    }
    static saveBeforeMain(fileHandle) {
        const rawData = SaveGame.convertSaveData();
        const jsonData = JSON.stringify(rawData, this.replacer, 4);
        return jsonData;
    }
    static loadAfterMain(json) {
        //same <- what do you mean?
        SaveGame.initialize();
        SaveGame.restoreSaveData(JSON.parse(json, SaveGame.reviver));
    }
    static async saveAs(fileName, savesDirHandle = this.savesDirHandle) {
        const fileHandle = await this.getSaveFileHandle(fileName, savesDirHandle, { "create": true });
        const jsonData = this.saveBeforeMain(fileHandle);
        this.writeFile(fileHandle, jsonData);
        this.curSaveFileHandle = fileHandle;
    }
    static async loadAs(fileName, savesDirHandle = this.savesDirHandle) {
        const fileHandle = await this.getSaveFileHandle(fileName, savesDirHandle, { "create": false });
        const jsonData = await this.loadFile(fileHandle);
        this.loadAfterMain(jsonData);
        this.curSaveFileHandle = fileHandle;
    }
    static async writeFile(fileHandle, contents) {
        const writeAble = await fileHandle.createWritable();
        await writeAble.write(contents);
        await writeAble.close();
    }
    static async writeFileName(fileName, dirHandle, contents) {
        const fileHandle = await this.getSaveFileHandle(fileName, dirHandle, { "create": true });
        return await this.writeFile(fileHandle, contents);
    }
    static async loadFile(fileHandle) {
        const file = await fileHandle.getFile();
        return await file.text();
    }
    static async loadFileName(fileName, dirHandle) {
        const fileHandle = await this.getSaveFileHandle(fileName, dirHandle, { "create": false });
        return await this.loadFile(fileHandle);
    }
    static async deleteFile(fileHandle, dirHandle, options = { recursive: false }) {
        return await this.deleteFileName(fileHandle.name, dirHandle, options);
    }
    static async deleteFileName(fileName, dirHandle, options = { recursive: false }) {
        return await dirHandle.removeEntry(fileName, options);
    }
    // static async moveFile(fileHandleSrc: FileSystemFileHandle, fileHandleTrg: FileSystemFileHandle, dirHandle: FileSystemDirectoryHandle) {
    //     return await fileHandleSrc.move(fileHandleTrg.name);
    // }
    // static async moveFileName(fileNameSrc: string, fileNameTrg: string, dirHandle: FileSystemDirectoryHandle) {
    //     const fileHandleSrc = await dirHandle.getDirectoryHandle(fileNameSrc, { "create": false });
    //     return await fileHandleSrc.move(fileNameTrg);
    // }
    // static async copyFile(fileHandleSrc: FileSystemFileHandle, fileHandleTrg: FileSystemFileHandle, dirHandle: FileSystemDirectoryHandle) {
    //     return await fileHandleSrc.copy(fileHandleTrg.name);
    // }
    // static async copyFileName(fileNameSrc: string, fileNameTrg: string, dirHandle: FileSystemDirectoryHandle) {
    //     const fileHandleSrc = await dirHandle.getDirectoryHandle(fileNameSrc, { "create": false });
    //     return await fileHandleSrc.copy(fileNameTrg);
    // }
    static async createRootDirHandle(options = { mode: "readwrite", id: this.identifier }) {
        IsLoading = true;
        return this.rootDirHandle ??= await window.showDirectoryPicker(options).then((e) => { IsLoading = false; return e; }).catch((e) => { console.warn(e); IsLoading = false; return e; });
    }
    static async createsavesDirHandle(rootDirHandle, options = { "create": true }) {
        return this.savesDirHandle = await rootDirHandle.getDirectoryHandle(this.SaveDirName, options);
    }
    static async getSaveFileHandle(fileName, dirHandle = this.rootDirHandle, options = { "create": true }) {
        if (dirHandle == null)
            throw Error("SaveGame.rootDirHandle is null");
        const curDirHandle = await dirHandle.getDirectoryHandle(fileName, options);
        return await curDirHandle.getFileHandle(this.SaveDataFileName, { "create": true });
    }
    static async getFileHandleArray(dirHandle) {
        let arr = new Array;
        for await (const e of dirHandle.entries()) {
            arr.push(e);
        }
        return arr;
    }
    static async createSaveDirFileHandleArray(ignoreDir = false) {
        return this.fileHandleArray = (await Array.fromAsync((this.savesDirHandle ?? void await this.saveInit() ?? this.savesDirHandle ?? []).values())).filter((e) => !ignoreDir);
    }
    static async createSaveDirFileArray() {
        const array = await this.createSaveDirFileHandleArray(false);
        return this.saveDataArray = await Promise.all(array.map(async (dir) => await SaveGame.getFileHandleBySaveDir(dir)));
        //thanks copilot
    }
    static async getFileHandleBySaveDir(Handle) {
        if (Handle instanceof FileSystemDirectoryHandle === false)
            return Handle;
        return await Handle.getFileHandle(this.SaveDataFileName);
    }
    static compareFileDate(a, b) {
        if (a.lastModified > b.lastModified) {
            return -1;
        }
        else if (b.lastModified > a.lastModified) {
            return 1;
        }
        return 0;
    }
}
var enumMapLayer;
(function (enumMapLayer) {
    enumMapLayer["Layer1"] = "layer1";
    enumMapLayer["Layer2"] = "layer2";
    enumMapLayer["Enemy"] = "enemy";
    enumMapLayer["Hitbox"] = "hitbox";
})(enumMapLayer || (enumMapLayer = {}));
var enumScreen;
(function (enumScreen) {
    enumScreen[enumScreen["Title"] = 0] = "Title";
    enumScreen[enumScreen["Play"] = 1] = "Play";
})(enumScreen || (enumScreen = {}));
class Game {
    static name = "Kanical";
    static ver = "24m08w4";
    static sessionTick = 0;
    static isRelease = false;
    static started = false;
    static isLoading = false;
    static darkMode = false;
    static saveloadfaliedtime = -1;
    static saveloadfaliedtype = -1;
    static saveloadsuccesstime = -111;
    static saveloadsuccesstype = -111;
    static PopUpDelay = 100;
    static PlayingScreen = false;
    static screen = enumScreen.Title;
    static move_limit = 32767;
    static weapon_canlock = false;
    static PI = Math.floor(Math.PI * Math.pow(10, 5)) / Math.pow(10, 5);
    static players = new Array;
    static mainPlayer;
    static inventory;
    static colorPallet = {
        "magenta": "magenta", //accsent
        "green": "lime",
        "blue": "blue",
        "black": "black", // common
        "gray": "gray",
        "white": "white"
    };
    static map = new Object;
    static map_path = {
        "VillageAround": "param/maps/VillageAroundMap.map",
        "LvSpot": "param/maps/LvSpotMap.map",
        "Default": "param/maps/Map.map"
    };
    static hitbox = {
        none: 0x0,
        full: 0x1
    };
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
    };
    static animationTile = {
        7: {}
    };
    static DontDrawTile = [
        0
    ];
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
    ];
    static gui_system_items = [
        "menu.system.config",
        "menu.system.data",
        "menu.system.about"
    ];
    static gui_system_data_items = [
        "menu.system.data.select",
        "menu.system.data.save",
        "menu.system.data.load"
    ];
    static config_name = [
        "player",
        "weapon",
        "data",
        "control",
        "sounds",
        "other",
        "debug"
    ];
    static config_icons = [
        "player",
        "weapon",
        "colorFloppy",
        "gamepad",
        "sound",
        "other",
        "debug"
    ];
    static soundGroupsConfig = {
        "player": "sound_player",
        "tile": "sound_tile",
        "enemy": "sound_enemy",
        "gui": "sound_gui",
        "bgm": "bgm",
        "other": "other"
    };
    static select_y_size = [
        16, 16, 16, 16
    ];
    static savemetadata = {
        "codename": "kanical",
        "ver": Game.ver
    };
    static title_items = [
        "newgame",
        "loadgame"
    ];
    static UIListScrollable = [
        "items",
        "roles",
        "hud_hp",
        "UIOpen",
        "config"
    ];
    static lang;
    static rotate_pos;
    static preInit() {
        //クエリパラメータ 取得
        // const searchParams = new URLSearchParams(window.location.search);
        // if (searchParams.get("debug") != null) debug.visible = searchParams.has("debug");
        //タイトル変更
        document.title = Game.name + Game.ver;
        // あざす https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            Game.darkMode = event.matches;
        });
        performance.mark("preInitStart");
        Item.init();
        Tile.init();
        Entity.init();
        Particle.init();
        Sprite.init();
        performance.mark("preInitEnd");
        performance.measure("preInitTime", "preInitStart", "preInitEnd");
        gamestarted = true;
    }
    static init() {
        this.players = [];
    }
    static tick() {
        tickPerf.procStart();
        //FPS計測
        Game.lang = Object.assign(Jsones.get("en_us") ?? {}, Jsones.get(lang) ?? {});
        inputTick();
        switch (Game.screen) {
            case enumScreen.Play:
                Game.tickPlay();
                break;
            case enumScreen.Title:
                Game.tickTitle();
                break;
            default:
                throw Error("invalid screen");
        }
        RioxUiMain.tickmain();
        //Sprite.hp.draw(0, 0)
        //タイマー
        Game.sessionTick++;
        tickPerf.procEnd();
    }
    static tickPlay() {
        playTime = SavedPlayTime + (+new Date() - +GameStartedTime);
        Cam.level.autoLoadDispose(new Pos(Cam.x, Cam.y));
        if (!Game.isBusy()) {
            for (const player of players) {
                player.tick();
            }
            if (Game.sessionTick % Configs.get("debugTickDelay").value == 0) {
                for (const entity of Cam.level.entities) {
                    entity.tick();
                }
                for (const particle of Cam.level.particles) {
                    particle.tick();
                }
            }
        }
        EnemySpawnChecker.enemySpawnCheckTick(Game.mainPlayer.pos.x, Game.mainPlayer.pos.y, Cam.level);
    }
    static tickTitle() { }
    static displayTick() {
        if (ctx == null)
            throw new Error("canvas context is null!");
        drawPerf.procStart();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        switch (Game.screen) {
            case enumScreen.Play:
                Game.drawPlay();
                break;
            case enumScreen.Title:
                Game.drawTitle();
                break;
            default:
                throw Error("invalid screen");
        }
        RioxUiMain.drawmain();
        drawTouchArea();
        Debug.draw();
        drawPerf.procEnd();
    }
    static drawPlay() {
        Cam.tick();
        Game.drawTiles(enumMapLayer.Layer1);
        for (const entity of Cam.level.entities.sort((a, b) => a?.pos?.y - b?.pos?.y)) {
            if (entity.drawCondition())
                entity.draw();
        }
        for (let particle of Cam.level.particles.sort((a, b) => a?.pos?.y - b?.pos?.y)) {
            if (particle.drawCondition())
                particle.draw();
        }
        Game.drawTiles(enumMapLayer.Layer2);
    }
    static drawTitle() { }
    static isBusy() {
        return Game.isLoading;
    }
    static drawTiles(maplayer) {
        if (ctx == null)
            throw new Error("canvas context is null!");
        const plx = Math.floor(Cam.x / 16);
        const ply = Math.floor(Cam.y / 16);
        const drawOffsetFix = (value) => ((value < 0 && value % 16 === 0 ? 1 : 0) + value) % 16 + (value < 0 ? 16 : 0);
        for (let y = 0; y < 13; y++) {
            for (let x = 0; x < 21; x++) {
                let drawLevel = Cam.level;
                let tileID = drawLevel.getTileState(new TPos(x + plx, y + ply))?.[maplayer];
                //const drawOffsetFix = value => Math.sign(value) < 0 ? 16 + (1 + value) % 16 - 1 : value % 16 - 1;
                const drawOffset = new Vec2(x * 16 - drawOffsetFix(Cam.x), y * 16 - drawOffsetFix(Cam.y));
                const drawSize = new Vec2(16, 16);
                //軽量化
                if (!Game.DontDrawTile.includes(tileID))
                    ctx.drawImage(Images.get("tiles"), Util.getTileAtlasXY(tileID).x, Util.getTileAtlasXY(tileID).y, drawSize.x, drawSize.y, drawOffset.x, drawOffset.y, drawSize.x, drawSize.y);
            }
        }
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
    static getScrScallingFactor() {
        const clientRect = canvas.getBoundingClientRect();
        return clientRect.width / ScreenWidth;
    }
    static createNewPlayer(spawnX, spawnY, level, { isMainPlayer = false }) {
        const player = new EntityPlayer(spawnX, spawnY, level);
        if (isMainPlayer)
            Game.mainPlayer = player;
        this.players.push(player);
        return player;
    }
    static characterCheck = false; //文字のことです
    static gameStartedPlayTime = 0;
    static gameStartedTime;
    static getPlayTime() {
        if (this.gameStartedTime == null)
            return 0;
        return (this.gameStartedPlayTime) + (+new Date()) - (+this.gameStartedTime);
    }
    static level() {
        return levelDepthes.get("main");
    }
}
class Core {
    static async newGame() {
        if (Game.screen != enumScreen.Title)
            return false;
        Core.startGame();
    }
    static async loadGame() {
        if (Game.screen != enumScreen.Title)
            return false;
        Core.startGame();
    }
    static async startGame() {
        if (Game.screen != enumScreen.Title)
            return false;
        levelDepthes.init("main");
        Game.init();
        RioxUiMain.uiInit();
        new RioxUiHud().openUi();
        Game.createNewPlayer(0, 0, Game.level(), { isMainPlayer: true });
        Game.inventory = new Inventory;
        if (Game.mainPlayer.level == null)
            throw Error("controlable player's entity's level is not exist at game initialize");
        Cam.level = Game.mainPlayer.level;
        Game.gameStartedTime = new Date();
        Game.screen = enumScreen.Play;
    }
    static async openTitle() {
        RioxUiMain.uiInit();
        new RioxUiTitle().openUi();
        Game.screen = enumScreen.Title;
    }
    static async init() {
    }
}
class loadingManager {
    static ejectLog = !false;
    static updateScreen() {
        if (Game.screen != enumScreen.Title)
            return false;
        if (ctx == null)
            throw new Error("canvas context is null!");
        ctx.save();
        ctx.fillStyle = "blue";
        ctx.fillRect(0, 0, ScreenWidth, ScreenHeight);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        const DEBUG = true;
        if (DEBUG) {
            ctx.font = "10px Courier New";
            ctx.textAlign = "center";
            ctx.fillText(`loading:${Math.floor(this.getAllLoadedCount() / this.getAllWillLoadLength() * 100)}%`, ScreenWidth / 2, ScreenHeight / 2 - 40);
            const aboutOffset = new Vec2(ScreenWidth / 2, ScreenHeight / 2 - 10);
            ctx.fillText(`Image: ${Images.progress}/${Images.contentsLength}`, aboutOffset.x, aboutOffset.y);
            ctx.fillText(`Json: ${Jsones.progress}/${Jsones.contentsLength}`, aboutOffset.x, aboutOffset.y + 15);
            ctx.fillText(`Sound: ${Sounds.progress}/${Sounds.contentsLength}`, aboutOffset.x, aboutOffset.y + 30);
            ctx.fillText(`Sound: ${Font.images.progress}/${Font.images.contentsLength}`, aboutOffset.x, aboutOffset.y + 45);
            ctx.textAlign = "left";
            ctx.fillText(`p: ${this.getAllLoadedCount()},l: ${this.getAllWillLoadLength()}`, 0, 15);
        }
        let progressBar = new Rect((ScreenWidth - 128) / 2, ScreenHeight - 16, 128, 8);
        ctx.strokeRect(progressBar.x, progressBar.y, progressBar.w, progressBar.h);
        ctx.fillRect(progressBar.x + 2, progressBar.y + 2, this.getAllLoadedCount() / this.getAllWillLoadLength() * (progressBar.w - 4), progressBar.h - 4);
        ctx.font = "15px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.floor(this.getAllLoadedCount() / this.getAllWillLoadLength() * 100)}%`, ScreenWidth / 2, progressBar.y - 10);
        ctx.restore();
    }
    static getAllWillLoadLength() {
        return Images.contentsLength + Jsones.contentsLength + Sounds.contentsLength + Font.images.contentsLength;
    }
    static getAllLoadedCount() {
        return Images.progress + Jsones.progress + Sounds.progress + Font.images.progress;
    }
    static async loadAllAssets() {
        {
            const get = new Array;
            get.push(Images.load());
            get.push(Jsones.load());
            get.push(Sounds.load());
            get.push(Font.load());
            await Promise.all(get);
        }
        if (gamestarted)
            return;
        if (this.ejectLog)
            console.log("game is starting");
        Game.preInit();
        Core.openTitle();
        Game.isLoading = false;
        loopID = requestAnimationFrame(drawLoop);
        return;
        //よしゃあああaaikrretataaaaaaaaa　2023/08/07 20:38
    }
}
class Cursor {
    CursorOldPos;
    CursorNeedUpdate;
    cursors;
    constructor() {
        this.CursorOldPos = new Vec2(0, 0);
        this.CursorNeedUpdate = false;
        this.CursorOldPos.x = 0;
        this.CursorOldPos.y = 0;
        this.cursors = new Array();
    }
    draw() {
        let cursorOfseX = 0;
        cursorOfseX += Easings.easeOutExpo(timer % 100 / 100) * 5;
        cursorOfseX += Easings.easeOutExpo(1 - timer % 100 / 100) * 5;
        cursorOfseX -= 8;
        if (Game.isBusy())
            cursorOfseX = 0;
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
            this.CursorOldPos.x = Util.limit(0, this.CursorOldPos.x, Infinity);
            this.CursorOldPos.y = Util.limit(0, this.CursorOldPos.y, Infinity);
        }
        // for in は 変数に文字列入るから注意!!
        for (let i in this.cursors) {
            let cursor = this.cursors[+i];
            if (+i != this.cursors.length - 1)
                Sprite.get("cursorUns").draw(cursor.x, cursor.y);
            if (+i == this.cursors.length - 1)
                Sprite.get(Game.isBusy() ? busyCorsor : "cursor").draw(Math.round(this.CursorOldPos.x + cursorOfseX), this.CursorOldPos.y);
        }
        this.cursors = new Array(); //初期化
    }
    push(pos) {
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
    sound;
    play;
    stop;
    constructor(element) {
        this.sound = element;
        this.play = function (DoNotStop = false) {
            if (!DoNotStop)
                this.sound.currentTime = 0;
            this.sound.play();
        };
        this.stop = function () {
            this.sound.currentTime = 0;
            this.sound.pause();
        };
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
                reject(audio.error);
            };
            // 'canplaythrough'イベントが発火したら、Promiseを解決する
            audio.addEventListener('canplaythrough', () => {
                resolve(audio);
            }, { once: true });
            // 読み込みを開始
            audio.load();
            setTimeout(reject, 60000); //タイムアウト処理追加したぜ！
        });
    }
    static async init(url, volume = 1) {
        return new Sound(await Sound.createAudioElem(url, Math.min(1, volume)));
    }
}
let IsLoading = true;
//キャンバスのやつ
const canvas = document.getElementById('canvas');
if (canvas == null)
    throw Error("canvas is missing!");
const ctx = canvas.getContext('2d');
if (ctx == null)
    throw Error("canvas context is null!");
// changeCanvasSize(zoomX, zoomY);
function changeCanvasSize(x, y) {
    if (ctx == null)
        throw Error("canvas context is null!");
    ctx.scale(1 / zoomX, 1 / zoomY);
    zoomX = x;
    zoomY = y;
    canvas.width = ScreenWidth * zoomX;
    canvas.height = ScreenHeight * zoomY;
    ctx.scale(zoomX, zoomY);
    //アンチエイリアスを無効にする
    ctx.imageSmoothingEnabled = false;
}
canvas.width = ScreenWidth;
canvas.height = ScreenHeight;
ctx.imageSmoothingEnabled = false;
//コンテキストメニュー禁止
document.oncontextmenu = () => {
    return !touchmode;
};
//フォント
ctx.font = '20px sans-serif';
//キーの変数の作成
class KeyData {
    clickCount = 0;
    press = false;
    wasPress = false;
    down = false;
    hold = false;
    time = -1;
    change(isDown) {
        this.wasPress = this.press;
        this.press = isDown;
        if (isDown)
            this.clickCount++;
        //isDown ? this.time++ : this.time = 0;
        //this.now = Game.sessionTick;
    }
    tick() {
        const [holdStartDelay, holdRepeatDelay] = [30, 2];
        this.press ? this.time++ : this.time = -1;
        this.down = this.time == 0;
        this.hold = this.time == 0 || this.time > holdStartDelay && this.time % holdRepeatDelay == 0;
        this.wasPress = this.press;
    }
    hasChanged() {
        return this.press !== this.wasPress;
    }
}
class TouchData extends KeyData {
    area;
    sprite;
    constructor(area, sprite) {
        super();
        this.area = area;
        this.sprite = sprite;
    }
    getScreenArea() {
        const scale = Game.getScrScallingFactor();
        const area = this.area;
        return new Rect(area.x * scale, area.y * scale, area.w * scale, area.h * scale);
    }
    draw() {
        if (ctx == null)
            throw new Error("canvas context is null!");
        ctx.save();
        ctx.globalAlpha = 0.50;
        const area = this.area;
        const sprite = this.sprite ?? new Rect(0, 0, 16, 16);
        drawImg(Images.get("touch_button"), sprite.x, sprite.y, sprite.w, sprite.h, area.x, area.y, area.w, area.h);
        ctx.restore();
    }
}
const keyList = {};
const DPadPos = new Vec2(64, ScreenHeight - 64);
const touchDatum = {
    up: new TouchData(new Rect(DPadPos.x, DPadPos.y - 16, 16, 16), new Rect(16, 0, 16, 16)),
    down: new TouchData(new Rect(DPadPos.x, DPadPos.y + 16, 16, 16), new Rect(32, 0, 16, 16)),
    left: new TouchData(new Rect(DPadPos.x - 16, DPadPos.y, 16, 16), new Rect(48, 0, 16, 16)),
    right: new TouchData(new Rect(DPadPos.x + 16, DPadPos.y, 16, 16), new Rect(64, 0, 16, 16)),
    attack: new TouchData(new Rect(ScreenWidth / 2, ScreenHeight - 64, 32, 16), new Rect(80, 0, 32, 16)),
    confirm: new TouchData(new Rect(ScreenWidth - 112, ScreenHeight - 64, 16, 16), new Rect(112, 0, 16, 16)),
    cancel: new TouchData(new Rect(ScreenWidth - 88, ScreenHeight - 64, 16, 16), new Rect(128, 0, 16, 16)),
    menu: new TouchData(new Rect(ScreenWidth - 64, ScreenHeight - 64, 16, 16), new Rect(144, 0, 16, 16))
};
let gamepads = new Array;
function inputReset() {
    for (const keyData of Object.values(keyList)) {
        keyData.press = false;
    }
    for (const touchData of Object.values(touchDatum)) {
        touchData.press = false;
    }
}
inputReset();
function drawTouchArea() {
    if (!touchmode)
        return;
    for (const touchData of Object.values(touchDatum)) {
        touchData.draw();
    }
}
class KeyGroup {
    keyCodes;
    touchDatum;
    gamepadBtns;
    constructor(keyCodes, touchDatum, gamepadBtns) {
        this.keyCodes = keyCodes;
        this.touchDatum = touchDatum;
        this.gamepadBtns = gamepadBtns;
    }
    /*
    tick() {
        this.press = false;
        this.down = false;
        this.hold = false;
        for (const keyCode of this.keyCodes) {
            const keyData = keyList[keyCode] ?? new KeyData;
            if (keyData.press) this.press ||= true;
            if (keyData.down) this.down ||= true;
            if (keyData.hold) this.hold ||= true;
            this.clickCount += keyData.clickCount;
            keyData.clickCount = 0;
        }
        for (const touchData of this.touchDatas) {
            if (touchData.press)
                if (touchData.press) this.press ||= true;
            if (touchData.down) this.down ||= true;
            if (touchData.hold) this.hold ||= true;
            this.clickCount += touchData.clickCount;
            touchData.clickCount = 0;
        }
    }

    press = false;
    down = false;
    hold = false;
    */
    clickCount = 0;
    isPressed() {
        for (const keyCode of this.keyCodes) {
            const keyData = keyList[keyCode] ?? new KeyData;
            if (keyData.press)
                return true;
        }
        for (const touchData of this.touchDatum) {
            if (touchData.press)
                return true;
        }
        return false;
    }
    isPressStarted() {
        for (const keyCode of this.keyCodes) {
            const keyData = keyList[keyCode] ?? new KeyData;
            if (keyData.down)
                return true;
        }
        for (const touchData of this.touchDatum) {
            if (touchData.down)
                return true;
        }
        return false;
    }
    clickInit() {
        const keyDatum = this.keyCodes.map(keyCode => keyList[keyCode] ?? new KeyData);
        const datum = new Array().concat(keyDatum, this.touchDatum);
        this.clickCount = datum.reduce((pre, cur) => pre + cur.clickCount, 0);
    }
    consumeClick() {
        if (isNaN(+this.clickCount))
            throw Error("FATAL ERROR: clickCount is NaN");
        if (this.clickCount == 0) {
            return false;
        }
        else {
            this.clickCount--;
            return true;
        }
    }
}
const KeyGroups = {
    up: new KeyGroup(["KeyW", "ArrowUp"], [touchDatum.up], []),
    down: new KeyGroup(["KeyS", "ArrowDown"], [touchDatum.down], []),
    left: new KeyGroup(["KeyA", "ArrowLeft"], [touchDatum.left], []),
    right: new KeyGroup(["KeyD", "ArrowRight"], [touchDatum.right], []),
    attack: new KeyGroup(["Space"], [touchDatum.attack], []),
    confirm: new KeyGroup(["KeyZ"], [touchDatum.confirm], []),
    cancel: new KeyGroup(["KeyX"], [touchDatum.cancel], []),
    menu: new KeyGroup(["KeyC"], [touchDatum.menu], []),
};
function inputTick() {
    for (const keyData of Object.values(keyList)) {
        keyData.tick();
    }
    for (const touchData of Object.values(touchDatum)) {
        touchData.tick();
    }
    // for (const keyGroup of Object.values(KeyGroups)) {
    //     keyGroup.tick();
    // }
}
const ignorekeyCode = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
];
//コントローラー
//キー判定
addEventListener("keydown", keydownfunc);
addEventListener("keyup", keyupfunc);
addEventListener("touchstart", checkTouchDownPoint);
addEventListener("touchend", checkTouchUpPoint);
// これ1つのクラスにまとめてもいいけどめんどいなーべつにこれでいいし
function keydownfunc(e) {
    touchmode = false;
    if (e.code in keyList == false)
        keyList[e.code] = new KeyData;
    keyList[e.code].change(true);
    if (ignorekeyCode.includes(e.code))
        e.preventDefault();
}
function keyupfunc(e) {
    if (e.code in keyList == false)
        keyList[e.code] = new KeyData;
    keyList[e.code].change(false);
}
function checkTouchDownPoint(e) { checkTouchData(e, true); }
function checkTouchUpPoint(e) { checkTouchData(e, false); }
function checkTouchData(e, down) {
    touchmode = true;
    const clientRect = canvas.getBoundingClientRect();
    for (const touch of e.changedTouches) {
        const posX = touch.clientX - clientRect.left;
        const posY = touch.clientY - clientRect.top;
        for (const touchData of Object.values(touchDatum)) {
            if (!Hitbox.RectEllip(touchData.getScreenArea(), new Rect(posX, posY, touch.radiusX, touch.radiusY)))
                continue;
            touchData.press = down ?? false;
            touchData.clickCount++;
        }
    }
}
// ------------------------------------------------------------
// ゲームパッドを接続すると実行されるイベント
// ------------------------------------------------------------
window.addEventListener("gamepadconnected", function (e) {
    var gamepad = e.gamepad;
    console.log(e);
});
// ------------------------------------------------------------
// ゲームパッドの接続を解除すると実行されるイベント
// ------------------------------------------------------------
window.addEventListener("gamepaddisconnected", function (e) {
    var gamepad = e.gamepad;
    console.log(e);
});
//タッチ操作
//あざす https://web-breeze.net/js-touch-event/
// 各タッチイベントのイベントリスナー登録
canvas.addEventListener("touchstart", function (event) { updateTouch(event); });
canvas.addEventListener("touchend", function (event) { updateTouch(event); });
canvas.addEventListener("touchmove", function (event) {
    event.preventDefault(); // 画面スクロールを防止
    updateTouch(event);
});
canvas.addEventListener("touchcancel", function (event) { updateTouch(event); });
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
];
class TouchButton {
    posx;
    posy;
    width;
    height;
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
class SpriteRegistry extends Map {
    init() {
        this.register("hp", Images.get("gui"), 48, 0, 16, 8);
        this.register("toggleOn", Images.get("gui"), 0, 16, 16, 8);
        this.register("toggleOff", Images.get("gui"), 0, 24, 16, 8);
        this.register("cursor", Images.get("gui"), 32, 0, 8, 8);
        this.register("cursorUns", Images.get("gui"), 32, 8, 8, 8);
        this.register("cursorBusy0", Images.get("gui"), 40, 0, 8, 8);
        this.register("cursorBusy1", Images.get("gui"), 40, 8, 8, 8);
        this.register("itemHealIcon", Images.get("gui"), 224, 0, 32, 0);
        this.registerNineSlice("prompt", Images.get("gui_prompt"), 8, 8, 8);
    }
    drawByAtlas(imgObj, srcX, srcY, srcWidth, srcHeight, drawX, drawY, area = new Rect(NaN, NaN, NaN, NaN)) {
        if (ctx == null)
            throw Error("canvas context is null!");
        ctx.save();
        Sprite.drawareaInit(area.x, area.y, area.w, area.h);
        drawImg(imgObj, srcX, srcY, srcWidth, srcHeight, Math.round(drawX), Math.round(drawY));
        ctx.restore();
    }
    register(key, imgObj, srcX, srcY, srcWidth, srcHeight) {
        const sprite = new Object();
        sprite.img = imgObj;
        sprite.srcX = srcX;
        sprite.srcY = srcY;
        sprite.srcWidth = srcWidth;
        sprite.srcHeight = srcHeight;
        sprite[Symbol.iterator] = function* () {
            yield this.img;
            yield this.srcX;
            yield this.srcY;
            yield this.srcWidth;
            yield this.srcHeight;
        };
        sprite.draw = (drawX, drawY, area = new Rect(0, 0, ScreenWidth, ScreenHeight)) => {
            if (ctx == null)
                throw Error("canvas context is null!");
            ctx.save();
            Sprite.drawareaInit(area.x, area.y, area.w, area.h);
            drawImg(sprite.img, sprite.srcX, sprite.srcY, sprite.srcWidth, sprite.srcHeight, Math.round(drawX), Math.round(drawY));
            ctx.restore();
        };
        super.set(key, sprite);
        return sprite;
    }
    registerNineSlice(key, imgobj, nineSliceSize, baseSizeWidth, baseSizeHeight) {
        const sprite = new Object();
        sprite.img = imgobj;
        sprite.nineSliceSize = nineSliceSize;
        sprite.baseSizeWidth = baseSizeWidth;
        sprite.baseSizeHeight = baseSizeHeight;
        sprite.draw = (dx, dy, dw, dh, area = new Rect(0, 0, ScreenWidth, ScreenHeight)) => {
            if (ctx == null)
                throw Error("canvas context is null!");
            ctx.save();
            Sprite.drawareaInit(area.x, area.y, area.w, area.h);
            const baseSize = new Size(sprite.baseSizeWidth, sprite.baseSizeHeight);
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
            ];
            for (const slice of slices) {
                drawImg(sprite.img, Math.round(slice[0]), Math.round(slice[1]), Math.round(slice[2]), Math.round(slice[3]), Math.round(slice[4]), Math.round(slice[5]), Math.round(slice[6]), Math.round(slice[7]));
            }
            ctx.restore();
        };
        super.set(key, sprite);
        return sprite;
    }
    drawareaInit(X, Y, width, height) {
        // console.trace(X, Y, width, height)
        if (ctx == null)
            throw Error("canvas context is null!");
        if (Util.allNotNaN(X, Y, width, height)) {
            ctx.beginPath();
            ctx.rect(X, Y, width, height);
            ctx.closePath();
            ctx.clip();
        }
    }
    drawHealthBar(p, x, y) {
        if (ctx == null)
            throw new Error("canvas context is null!");
        ctx.drawImage(Images.get("gui"), 0, 0, 11, 3, (x - 1), (y - 1), 11, 3);
        ctx.drawImage(Images.get("gui"), 0, Math.floor(p * 9 + 3), 9, 1, x, y, 9, 1);
    }
}
const Sprite = new SpriteRegistry;
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
class RioxUiMain {
    static tickmain() {
        this.keyPress();
        for (const ui of this.uiList) {
            ui.tick();
        }
    }
    static drawmain() {
        for (const ui of this.uiList) {
            if (!ui.isFocused() && ui.exitCondition() && !(ui.isOverlay || ui.noUnFocusHide || ui.isContextMenu))
                continue;
            ui.drawMain(this.getUiDrawPos(ui), new Size(ScreenWidth, ScreenHeight), ui.defaultVariable, new Array);
            ui.debugDrawTick();
        }
        this.drawCursor();
    }
    static keyPress() {
        if (this.uiList.length <= 0)
            return;
        const ui = this.uiList.toReversed().find((e) => !e.exited && !e.isOverlay);
        for (const [keyName, KeyGroup] of Object.entries(KeyGroups)) {
            KeyGroup.clickInit();
            while (KeyGroup.consumeClick())
                ui.keyPressed(keyName, "click");
            if (KeyGroup.isPressed())
                ui.keyPressed(keyName, "press");
            if (KeyGroup.isPressStarted())
                ui.keyPressed(keyName, "start");
        }
    }
    static isPreventPlayerMove() {
        const ui = this.uiList.toReversed().find((e) => !e.exited && !e.isOverlay);
        return ui.preventPlayerMove ?? false;
    }
    static getUiof(index) {
        return RioxUiMain.uiList[index];
    }
    static uiList = new Array;
    static cursor = new Cursor;
    static drawCursor() {
        if (this.uiList.length <= 0)
            return;
        const ui = this.uiList.toReversed().find((element) => !element.exited);
        const cursorPos = ui.getCursorPos();
        const drawPos = this.getUiDrawPos(ui);
        if (cursorPos != null)
            this.cursor.push(Vec2Util.marge(cursorPos, drawPos));
        this.cursor.draw();
    }
    static uiInit() {
        this.uiList = new Array;
    }
    static getUiDrawPos(ui) {
        const index = this.uiList.indexOf(ui); //てきとう
        if (index == -1)
            throw Error("could not find ui");
        // console.log(index, Array.from(this.#getReversedUiListGen(index)))
        return ui.getDefaultDrawPos(this.#getReversedUiListGen(index));
    }
    static #getReversedUiListGen(startIndex) {
        const uiList = this.uiList;
        return function* () {
            for (const ui of uiList.toSpliced(startIndex).toReversed()) {
                yield ui;
            }
        }();
    }
}
var enumRioxUiAnimType;
(function (enumRioxUiAnimType) {
    enumRioxUiAnimType[enumRioxUiAnimType["Vec2X"] = 0] = "Vec2X";
    enumRioxUiAnimType[enumRioxUiAnimType["Vec2Y"] = 1] = "Vec2Y";
})(enumRioxUiAnimType || (enumRioxUiAnimType = {}));
class RioxUiAnim {
    /**
     *
     * @param {second} second
     * @param {number} size
     * @param {number} offset
     * @param {second} delay
     * @param {enumRioxUiAnimType} type
     * @param {Easings} easing
     */
    loop = false;
    duration;
    size;
    offset;
    delay;
    type;
    easing;
    now;
    constructor(durationSec, size, offset, delay, animtype, easingFunc) {
        this.duration = durationSec * (Configs.get("debugUiAnimRangeRadio").value ?? 1);
        this.size = size;
        this.offset = offset;
        this.delay = delay;
        this.type = animtype;
        this.easing = easingFunc;
        this.now = Date.now() / 1000;
    }
    setSecond(second) {
        this.duration = second;
        return this;
    }
    setSize(size) {
        this.size = size;
        return this;
    }
    setOffset(offset) {
        this.offset = offset;
        return this;
    }
    setDelay(delay) {
        this.delay = delay;
        return this;
    }
    setAnimType(animtype) {
        this.type = animtype;
        return this;
    }
    setEasing(func) {
        this.easing = func;
        return this;
    }
    restart() {
        this.now = Date.now() / 1000;
        return this;
    }
    get end() {
        return this.now + this.duration;
    }
    getProgress() {
        return Util.limit(0, 1 - (this.end - Date.now() / 1000 + this.delay) / this.duration, 1);
    }
    getAnimationValue() {
        return (-1 + this.easing(this.getProgress())) * this.size + this.offset;
    }
    animatedPos(Vec2) {
        switch (this.type) {
            case enumRioxUiAnimType.Vec2X:
                Vec2.x += this.getAnimationValue();
                break;
            case enumRioxUiAnimType.Vec2Y:
                Vec2.y += this.getAnimationValue();
                break;
        }
        return Vec2;
    }
    static animatedPos(Vec2, anims) {
        anims = Util.convertArray(anims);
        for (const anim of anims) {
            Vec2 = anim.animatedPos(Vec2);
        }
        return Vec2;
    }
}
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
        if (x < 0.5)
            return Math.log10(8 * x * 4);
        if (x >= 0.5)
            return 1;
        return 0;
    }
    static jump(x) {
        if (x < 1)
            return Math.sin(x * 6.28 - 2);
        if (x >= 1)
            return Math.sin(4.28);
        return 0;
    }
}
var enumOrientation;
(function (enumOrientation) {
    enumOrientation[enumOrientation["Vertical"] = 0] = "Vertical";
    enumOrientation[enumOrientation["Horizontal"] = 1] = "Horizontal";
})(enumOrientation || (enumOrientation = {}));
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
    isContextMenu = false; //これがtrueだと後ろのUIを隠さない
    #lastFocus = false;
    static openUi(...args) {
        return new this().openUi(...args);
    }
    openUi(...args) {
        // this.defaultVariable = variable;
        return RioxUiMain.uiList.push(this);
    }
    drawMain(drawPos, size, variable, animations) {
    }
    debugDrawTick() {
    }
    drawChild(arg, child, relVec2 = new Vec2(0, 0), size = new Size(ScreenWidth, ScreenHeight), variable = this.defaultVariable, animations) {
        const [Vec2Par = new Vec2(0, 0), sizePar = new Size(ScreenWidth, ScreenHeight), variablePar = this.defaultVariable, animationsPar = []] = arg;
        child.drawMain(new Vec2(Vec2Par.x + relVec2.x, Vec2Par.y + relVec2.y), size, variable, animations);
    }
    drawChildMulti(arg, children, rootOffset = new Vec2(0, 0), offsetForChild = new Vec2(0, 0), size = new Size(0, 0), variable = this.defaultVariable, variableModifier, animations) {
        for (const [index, child] of children.entries()) {
            const pos = new Vec2(rootOffset.x + index * offsetForChild.x, rootOffset.y + index * offsetForChild.y);
            this.drawChild(arg, child, pos, size, variableModifier == null ? variable : variableModifier[index](variable), animations == null ? [] : animations[index]);
        }
    }
    createVariableModifieres(root) {
        const result = new Array;
        for (const [index, variables] of root.entries()) {
            result.push((variable) => {
                for (const [key, value] of variables) {
                    variable = variable.set(key, value);
                }
                return variable;
            });
        }
        return result;
    }
    keyPressed(keyGroup, type) {
    }
    tick() {
        if (this.exited && this.exitCondition())
            this.exit();
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
    getDefaultDrawPos(uiListGen) {
        return new Vec2(0, 0);
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        this.exited = true;
        return true;
    }
    getCursorPos(offset) {
        return null;
    }
    focusCheck() {
        if (!this.#lastFocus && this.isFocused())
            this.focusStart();
        if (this.#lastFocus && !this.isFocused())
            this.focusEnd();
        this.#lastFocus = this.isFocused();
    }
    isFocused() {
        const lastUi = RioxUiMain.uiList.toReversed().find((e) => !e.exited && !e.isOverlay && !e.isContextMenu);
        return this === lastUi;
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
    debugLabel = new RioxUiLabelBasic;
    #animOffset = 0;
    animSelectArray = new Array;
    animOpenArray = new Array;
    openAnimationTick = 0;
    drawMain(drawPos, size, variable, animations) {
        if (this.listArray.length > 0) {
            const animVec2 = RioxUiAnim.animatedPos(new Vec2(0, 0), animations);
            variable = variable.set("area", new Rect(drawPos.x + animVec2.x, drawPos.y + animVec2.y, size.w, size.h));
            // this.drawChild(arguments, this.debugLabel, new Vec2(64 + 32, 0), new Size(16, 16), variable.set("text", `${this.listScroll.toFixed(3)},${this.listRealScroll.toFixed(3)}\n${((this.listRealScroll - this.listScroll) / 2).toFixed(3)}`).set("area", {}), animations);
            this.listSizeTemp = size.h / 16 - 1;
            for (const renderIndex in this.listArray.slice(Math.floor(this.listScroll / 16), Math.floor(this.listScroll / 16) + Math.ceil(size.h / 16 + 1))) {
                const index = +renderIndex + Math.floor(this.listScroll / 16);
                const item = this.listArray[index];
                const DrawOffset = +renderIndex * 16 - this.listScroll % 16;
                const openAnimOffset = RioxUiAnim.animatedPos(new Vec2(0, 0), this.animOpenArray[index] ?? []);
                const selectOffset = (this.animSelectArray[index] ?? 0) * 8;
                this.drawChild(arguments, this.itemListPanel, new Vec2(openAnimOffset.x + selectOffset, openAnimOffset.y + DrawOffset), size, this.variableModify(variable, item), animations);
            }
        }
    }
    getOpenAnimation(index) {
        return 0;
        const FROM_LEFT = true;
        const DELAY = 2;
        const SIZE = 16;
        const offset = Easings.easeOutExpo(Util.limit(0, this.openAnimationTick / DELAY - index, 1)) * SIZE - SIZE;
        return Math.ceil(offset);
    }
    resetOpenAnimation() {
        this.animOpenArray = [];
    }
    tick() {
        super.tick();
        this.openAnimationTick++;
        this.checkAnimArray();
        // めちゃくちゃ汚くてすまんw!!
        let offset = this.selectItemIndex - this.listScroll / 16;
        while (this.selectItemIndex - this.listRealScroll / 16 < 0)
            this.listRealScroll--;
        while (this.selectItemIndex - this.listRealScroll / 16 > this.listSizeTemp)
            this.listRealScroll++;
        if (offset < 0)
            this.listScroll += (this.listRealScroll - this.listScroll) / 2;
        if (offset > this.listSizeTemp)
            this.listScroll += (this.listRealScroll - this.listScroll) / 2;
    }
    checkAnimArray() {
        while (this.animOpenArray.length < this.listArray.length)
            this.animOpenArray.push(new RioxUiAnim(0.1, 16, 0, 0.015 * this.animOpenArray.length, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo));
        while (this.animOpenArray.length > this.listArray.length)
            this.animOpenArray.pop();
    }
    variableModify(variable, item) {
        return variable;
    }
    selectItemIndexMoveBy(value) {
        const beforeIndex = this.selectItemIndex;
        this.selectItemIndex += value;
        this.selectItemIndex = Util.limit(0, this.selectItemIndex, Math.max(0, this.listArray.length - 1));
        return beforeIndex !== this.selectItemIndex;
    }
    selectItemIndexMoveTo(value) {
        const beforeIndex = this.selectItemIndex;
        this.selectItemIndex = Util.limit(0, value, Math.max(0, this.listArray.length - 1)); //Array.prototype.lastIndex??? 
        return beforeIndex !== this.selectItemIndex;
    }
    get selectItem() {
        return this.listArray[this.selectItemIndex];
    }
    itemClick(selectItem) {
        return true;
    }
}
class RioxUiListBaseAnimation extends RioxUiListBase {
    tick() {
        super.tick();
        if (this.animSelectArray == null)
            throw Error("animSelectarray is not exist!");
        if (this.animSelectArray.length !== this.listArray.length)
            this.animSelectArray = new Array(this.listArray.length).fill(1);
        for (const index in this.animSelectArray) {
            if (+index === this.selectItemIndex)
                this.animSelectArray[index] += (0 - this.animSelectArray[index]) / 2;
            else
                this.animSelectArray[index] += (1 - this.animSelectArray[index]) / 2;
        }
    }
}
class RioxUiLabelBasic extends RioxUiBase {
    defaultText = "";
    drawMain(drawPos, size, variable, animations) {
        drawPos = RioxUiAnim.animatedPos(drawPos, animations);
        Font.drawText(variable.get("text") ?? this.defaultText, drawPos.x, drawPos.y, { color: variable.get("color") }, variable.get("area"));
    }
    setDefaultText(text) {
        this.defaultText = text;
        return this;
    }
}
class RioxUiLabelBasicRightAlign extends RioxUiLabelBasic {
    drawMain(drawPos, size, variable, animations) {
        drawPos = RioxUiAnim.animatedPos(drawPos, animations);
        drawPos.x += size.w;
        Font.drawText(variable.get("text") ?? "", drawPos.x, drawPos.y, { color: variable.get("color"), align: "right" }, variable.get("area"));
    }
}
class RioxUiButtonBasic extends RioxUiBase {
    label = new RioxUiLabelBasic;
    drawMain(drawPos, size, variable, animations) {
        {
            drawPos = RioxUiAnim.animatedPos(drawPos, animations);
            Sprite.get("prompt").draw(drawPos.x, drawPos.y, size.w, size.h, undefined);
        }
        this.drawChild(arguments, this.label, new Vec2(0, 0), size, variable, []);
    }
    setDefaultText(text) {
        this.label.setDefaultText(text);
        return this;
    }
}
class RioxUiInputBasic extends RioxUiBase {
    label = new RioxUiLabelBasic;
    value = "";
    placeholder = "";
    drawMain(drawPos, size, variable, animations) {
        {
            drawPos = RioxUiAnim.animatedPos(drawPos, animations);
            Sprite.get("prompt").draw(drawPos.x, drawPos.y, size.w, size.h, undefined);
        }
        this.drawChild(arguments, this.label, new Vec2(0, 0), size, variable.set("text", this.value || this.placeholder), []);
    }
    edit() {
        this.value = prompt("placeholder", this.value) ?? this.value;
        inputReset();
    }
    setDefaultText(text) {
        this.label.setDefaultText(text);
        return this;
    }
}
class RioxUiPanelBasic extends RioxUiBase {
    label = new RioxUiLabelBasic;
    drawMain(drawPos, size, variable, animations) {
        {
            drawPos = RioxUiAnim.animatedPos(drawPos, animations);
            Sprite.get("prompt").draw(drawPos.x, drawPos.y, size.w, size.h, undefined);
        }
        if (variable.has("text") || this.label.defaultText) {
            Sprite.get("prompt").draw(drawPos.x, drawPos.y - 16, 64, 16, new Rect(drawPos.x - 8, drawPos.y - 16 - 8, 64 + 8 + 8, 16 + 8 - 4));
            this.drawChild(arguments, this.label, new Vec2(0, -16), size, variable, []);
        }
    }
    setDefaultText(text) {
        this.label.setDefaultText(text);
        return this;
    }
}
class RioxUiSpriteBasic extends RioxUiBase {
    drawMain(drawPos, size, variable, animations) {
        drawPos = RioxUiAnim.animatedPos(drawPos, animations);
        Sprite.drawByAtlas(Images.get("items"), Util.getTileAtlasXY(variable.get("icon")).x, Util.getTileAtlasXY(variable.get("icon")).y, 16, 16, drawPos.x, drawPos.y, variable.get("area"));
    }
}
class RioxUiSimpleTabBase extends RioxUiBase {
    selectTabIndex = 0;
    tabs = [];
    tabAnims = [];
    drawMain(drawPos, size, variable, animations) {
        this.drawChildMulti(arguments, this.tabs, this.drawRootOffset(), this.drawChildOffset(), this.drawSize(), variable, undefined, this.tabAnims);
    }
    drawRootOffset() {
        throw Error("drawRootOffset is not defined");
    }
    drawChildOffset() {
        throw Error("drawChildOffset is not defined");
    }
    drawSize() {
        throw Error("drawSize is not defined");
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
            if (type === "start")
                this.mayExit();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        for (const tabAnim of this.tabAnims) {
            tabAnim.setSize(-64).setOffset(-64).restart();
        }
        return result;
    }
    exitCondition() {
        if (this.tabAnims.length == 0)
            return true;
        return this.tabAnims[0].getProgress() >= 1;
    }
    selectTabIndexMoveBy(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex += value;
        this.selectTabIndex = Util.limit(0, this.selectTabIndex, this.tabs.length - 1);
        return beforeIndex !== this.selectTabIndex;
    }
    selectTabIndexMoveTo(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex = Util.limit(0, value, this.tabs.length - 1); //Array.prototype.lastIndex??? 
        return beforeIndex !== this.selectTabIndex;
    }
    get selectTab() {
        return this.tabs[this.selectTabIndex];
    }
    tabClick(tab) {
    }
    getCursorOffsetPos() {
        return null;
    }
    getCursorPos() {
        const offset = this.getCursorOffsetPos();
        if (offset == null)
            return null;
        return new Vec2(offset.x, this.selectTabIndex * 16 + offset.y);
    }
    cursorOffsetPosUseAuto() {
        const offset = this.drawRootOffset();
        return new Vec2(offset.x - 8, offset.y);
    }
}
class RioxUiSimpleStackTabBase extends RioxUiSimpleTabBase {
    getDefaultDrawPos(uiListGen) {
        const belowUi = uiListGen.next().value;
        const belowUiDrawPos = belowUi.getDefaultDrawPos(...arguments);
        // console.log(belowUiDrawPos)
        const stackOffset = this.getStackOffset();
        return new Vec2(belowUiDrawPos.x + stackOffset.x, belowUiDrawPos.y + stackOffset.y);
    }
    getStackOffset() {
        return new Vec2(32, 0);
    }
}
class RioxUiPrompt extends RioxUiBase {
    labelTitle = new RioxUiLabelBasic;
    labelText = new RioxUiLabelBasic;
    yesButton = new RioxUiLabelBasic;
    noButton = new RioxUiLabelBasic;
    bgColor = "#daffff";
    selectButton = this.yesButton;
    drawMain(drawPos = new Vec2(64, 32), size = new Size(144, 64), variable = this.defaultVariable, animations = []) {
        Sprite.get("prompt").draw(drawPos.x, drawPos.y, size.w, size.h, undefined);
        this.drawBgColor(drawPos);
        if (variable.has("title"))
            this.drawChild(arguments, this.labelTitle, new Vec2(drawPos.x, drawPos.y), new Size(144, 16), variable.set("text", variable.get("title")), animations);
        if (variable.has("text"))
            this.drawChild(arguments, this.labelText, new Vec2(drawPos.x, drawPos.y + 8), new Size(144, 64), variable.set("text", variable.get("text")), animations);
        this.drawChild(arguments, this.yesButton, new Vec2(drawPos.x + size.w - 48, drawPos.y + size.h - 8), size, variable.set("text", "yes"), animations);
        this.drawChild(arguments, this.noButton, new Vec2(drawPos.x + size.w - 16, drawPos.y + size.h - 8), size, variable.set("text", "no"), animations);
    }
    drawBgColor(drawPos) {
        if (ctx == null)
            throw new Error("canvas context is null!");
        ctx.save();
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(drawPos.x, drawPos.y, 144, 8);
        ctx.restore();
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
    getCursorPos() {
        return new Vec2(0, 0);
    }
    yesFunc() { }
    noFunc() { }
}
class RioxUiPlayer extends RioxUiBase {
    itemIcon = new RioxUiItemIcon;
    itemNameLabel = new RioxUiLabelBasic;
    itemCountLabel = new RioxUiLabelBasic;
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.itemNameLabel, new Vec2(8, 0), new Size(32, 8), variable.set("text", variable.get("health")), animations);
    }
}
class RioxUiPlayerList extends RioxUiListBase {
    itemListPanel = new RioxUiPlayer;
    variableModify = (variable, player) => {
        if (player == null)
            return variable;
        return variable.set("health", player.health.toString());
    };
    listArray = Game.players;
    itemClick(selectItem) {
        return false;
    }
}
class RioxUiHud extends RioxUiBase {
    preventPlayerMove = false;
    noUnFocusHide = true;
    playerListPanel = new RioxUiPlayerList;
    playerPanel = new RioxUiPanelBasic;
    playerLabel = new RioxUiLabelBasic;
    fpsLabel = new RioxUiLabelBasic;
    playerPanelAnim = new RioxUiAnim(0.1, 10, 0, 0, enumRioxUiAnimType.Vec2Y, Easings.easeInExpo);
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.playerPanel, new Vec2(8, 8), new Size(48, this.playerListPanel.listArray.length * 8), variable, this.playerPanelAnim);
        this.drawChild(arguments, this.playerListPanel, new Vec2(8, 8), new Size(48, this.playerListPanel.listArray.length * 8), variable, this.playerPanelAnim);
        this.drawChild(arguments, this.fpsLabel, new Vec2(0, ScreenHeight - 8), new Size(48, 8), variable.set("text", `FPS:${drawPerf.parSec},TPS:${tickPerf.parSec}`), []);
    }
    keyPressed(keyGroup, type) {
        switch (keyGroup) {
            case "menu":
                if (type === "start")
                    new RioxUiMenu().openUi();
                break;
            default:
                break;
        }
    }
}
class RioxUiMenu extends RioxUiBase {
    DEBUG_MODE = true;
    preventPlayerMove = true;
    menuTabParty = new RioxUiButtonBasic().setDefaultText("Party");
    menuTabPartyAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    menuTabItems = new RioxUiButtonBasic().setDefaultText("Items");
    menuTabItemsAnim = new RioxUiAnim(0.1, 64, 0, 0.015, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    menuTabEquip = new RioxUiButtonBasic().setDefaultText("Equip");
    menuTabEquipAnim = new RioxUiAnim(0.1, 64, 0, 0.030, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    menuTabConfig = new RioxUiButtonBasic().setDefaultText("Config");
    menuTabConfigAnim = new RioxUiAnim(0.1, 64, 0, 0.045, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    menuTabSystem = new RioxUiButtonBasic().setDefaultText("System");
    menuTabSystemAnim = new RioxUiAnim(0.1, 64, 0, 0.065, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    menuTabSave = new RioxUiButtonBasic().setDefaultText("Save");
    menuTabSaveAnim = new RioxUiAnim(0.1, 64, 0, 0.075, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    selectTabIndex = 0;
    tabs = [this.menuTabParty, this.menuTabItems, this.menuTabEquip, this.menuTabConfig, this.menuTabSystem, this.menuTabSave];
    tabAnims = [this.menuTabPartyAnim, this.menuTabItemsAnim, this.menuTabEquipAnim, this.menuTabConfigAnim, this.menuTabSystemAnim, this.menuTabSaveAnim];
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.menuTabParty, new Vec2(0, 0), new Size(48, 8), variable, this.menuTabPartyAnim);
        this.drawChild(arguments, this.menuTabItems, new Vec2(0, 16), new Size(48, 8), variable, this.menuTabItemsAnim);
        this.drawChild(arguments, this.menuTabEquip, new Vec2(0, 32), new Size(48, 8), variable, this.menuTabEquipAnim);
        this.drawChild(arguments, this.menuTabConfig, new Vec2(0, 48), new Size(48, 8), variable, this.menuTabConfigAnim);
        this.drawChild(arguments, this.menuTabSystem, new Vec2(0, 64), new Size(48, 8), variable, this.menuTabSystemAnim);
        this.drawChild(arguments, this.menuTabSave, new Vec2(0, 80), new Size(48, 8), variable, this.menuTabSaveAnim);
    }
    drawMainTest(drawPos, size, variable, animations) {
        const variableModifies = [
            [["text", "Party"]],
            [["text", "items"]],
            [["text", "Equip"]],
            [["text", "Config"]],
            [["text", "System"]],
            [["text", "Save"]],
        ];
        const variableModifier = this.createVariableModifieres(variableModifies);
        this.drawChildMulti(arguments, this.tabs, new Vec2(16, 16), new Vec2(0, 16), new Size(48, 8), variable, variableModifier, this.tabAnims);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
            if (type === "start")
                this.mayExit();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        this.menuTabPartyAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabItemsAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabEquipAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabConfigAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabSystemAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabSaveAnim.setSize(-64).setOffset(-64).restart();
        return result;
    }
    exitCondition() {
        return this.menuTabSaveAnim.getProgress() >= 1;
    }
    focusEnd() {
        super.focusEnd();
        this.menuTabPartyAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabItemsAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabEquipAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabConfigAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabSystemAnim.setSize(-64).setOffset(-64).restart();
        this.menuTabSaveAnim.setSize(-64).setOffset(-64).restart();
    }
    focusStart() {
        super.focusStart();
        this.menuTabPartyAnim.setSize(64).setOffset(0).restart();
        this.menuTabItemsAnim.setSize(64).setOffset(0).restart();
        this.menuTabEquipAnim.setSize(64).setOffset(0).restart();
        this.menuTabConfigAnim.setSize(64).setOffset(0).restart();
        this.menuTabSystemAnim.setSize(64).setOffset(0).restart();
        this.menuTabSaveAnim.setSize(64).setOffset(0).restart();
    }
    selectTabIndexMoveBy(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex += value;
        this.selectTabIndex = Util.limit(0, this.selectTabIndex, this.tabs.length - 1);
        return beforeIndex !== this.selectTabIndex;
    }
    selectTabIndexMoveTo(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex = Util.limit(0, value, this.tabs.length - 1); //Array.prototype.lastIndex??? 
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
            case this.menuTabSystem:
                RioxUiMenuTabSystem.openUi();
                break;
            case this.menuTabSave:
                RioxUiMenuTabSave.openUi();
                break;
            default:
            //console.warn(tab);
        }
    }
    getDefaultDrawPos(uiListGen) {
        return new Vec2(16, 16);
    }
    getCursorPos() {
        return new Vec2(-8, this.selectTabIndex * 16);
    }
}
class RioxUiItemIcon extends RioxUiBase {
    drawMain(drawPos, size, variable, animations) {
        drawPos = RioxUiAnim.animatedPos(drawPos, animations);
        Sprite.drawByAtlas(Images.get("items"), Util.getTileAtlasXY(variable.get("icon")).x, Util.getTileAtlasXY(variable.get("icon")).y, 16, 16, drawPos.x, drawPos.y, variable.get("area"));
    }
}
class RioxUiInventoryItem extends RioxUiBase {
    itemIcon = new RioxUiItemIcon;
    itemNameLabel = new RioxUiLabelBasic;
    itemCountLabel = new RioxUiLabelBasic;
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.itemIcon, new Vec2(0, 0), new Size(16, 16), variable.set("icon", variable.get("icon")), animations);
        this.drawChild(arguments, this.itemNameLabel, new Vec2(16, 0), new Size(16, 8), variable.set("text", variable.get("displayName")), animations);
        this.drawChild(arguments, this.itemCountLabel, new Vec2(64, 0), new Size(16, 8), variable.set("text", variable.get("count")).set("color", Game.colorPallet.magenta), animations);
    }
}
class RioxUiMenuTabItemsList extends RioxUiListBase {
    itemListPanel = new RioxUiInventoryItem;
    variableModify = (variable, itemStack) => {
        if (itemStack == null)
            return variable;
        const item = itemStack.item;
        return variable.set("icon", item.icon).set("displayName", item.getDisplayName()).set("count", itemStack.count.toString());
    };
    inventory = Player.inventory;
    itemGroup = enumItemGroup.Heal;
    listArray = this.inventory.getGroupItem(this.itemGroup);
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        if (selectItem.item.mustRoleSelect)
            return new RioxUiMenuTabItemWhoUseMenu(selectItem).openUi(), true;
        else
            return selectItem.use();
    }
    configGroupUpdate(itemGroup) {
        this.itemGroup = itemGroup;
        this.listArray = this.inventory.getGroupItem(this.itemGroup);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
            switch (keyGroup) {
                case "up":
                    this.selectItemIndexMoveBy(-1);
                    break;
                case "down":
                    this.selectItemIndexMoveBy(1);
                    break;
                case "right":
                case "confirm":
                    this.itemClick(this.selectItem);
                    break;
                default:
                    break;
            }
        }
    }
}
class RioxUiMenuTabItemGroupTab extends RioxUiListBaseAnimation {
    itemListPanel = new RioxUiLabelBasic;
    variableModify = (variable, item) => {
        return variable.set("text", translate(`item.group.${item}`));
    };
    listArray = Object.values(enumItemGroup);
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        return false;
    }
    configGroupUpdate(configGroup) {
    }
    keyPressed(keyGroup, type, itemList) {
        if (type === "click") {
            switch (keyGroup) {
                case "up":
                    this.selectItemIndexMoveBy(-1) && itemList != null && itemList.resetOpenAnimation();
                    break;
                case "down":
                    this.selectItemIndexMoveBy(1) && itemList != null && itemList.resetOpenAnimation();
                    break;
                default:
                    break;
            }
        }
    }
}
class RioxUiMenuTabItemWhoUseMenuPlayerList extends RioxUiPlayerList {
    itemClick(selectItem, player) {
        if (this.listArray.length === 0)
            return false;
        return selectItem.use(player);
    }
    keyPressed(keyGroup, type, selectItemStack) {
        if (type === "click") {
            switch (keyGroup) {
                case "up":
                    this.selectItemIndexMoveBy(-1);
                    break;
                case "down":
                    this.selectItemIndexMoveBy(1);
                    break;
                case "right":
                case "confirm":
                    if (selectItemStack != null)
                        this.itemClick(selectItemStack, this.selectItem); // this.selectItem is player 
                    if (Configs.get("roleSelectAutoClose"))
                        this.mayExit();
                    break;
                default:
                    break;
            }
        }
        if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
            if (type === "start")
                this.mayExit();
    }
}
class RioxUiMenuTabItemWhoUseMenu extends RioxUiBase {
    preventPlayerMove = true;
    isContextMenu = true;
    playerListPanel = new RioxUiMenuTabItemWhoUseMenuPlayerList;
    playerPanel = new RioxUiPanelBasic;
    selectItemStack;
    playerPanelAnim = new RioxUiAnim(0.1, 10, 0, 0, enumRioxUiAnimType.Vec2Y, Easings.easeInExpo);
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.playerPanel, new Vec2(128, 64), new Size(48, players.length * 8), variable, this.playerPanelAnim);
        this.drawChild(arguments, this.playerListPanel, new Vec2(128, 64), new Size(48, players.length * 8), variable, this.playerPanelAnim);
    }
    constructor(selectItemStack) {
        super();
        this.selectItemStack = selectItemStack;
    }
    keyPressed(keyGroup, type) {
        this.playerListPanel.keyPressed(keyGroup, type, this.selectItemStack);
        if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
            if (type === "start")
                this.mayExit();
    }
    getCursorPos() {
        return new Vec2(120, 64 + this.playerListPanel.selectItemIndex * 8);
    }
}
class RioxUiMenuTabItems extends RioxUiBase {
    preventPlayerMove = true;
    rootPanelTab = new RioxUiPanelBasic().setDefaultText("Inventory");
    rootPanelList = new RioxUiPanelBasic();
    rootPanelAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    listPanel = new RioxUiMenuTabItemsList();
    tabPanel = new RioxUiMenuTabItemGroupTab();
    selectTabIndex = 0;
    tabs = [this.tabPanel, this.listPanel];
    drawMain(drawPos, size, variable, animations) {
        const panelVec2 = new Vec2(40, 24);
        const panelSize = new Size(240, 144);
        this.drawChild(arguments, this.rootPanelTab, new Vec2(40, 24), new Size(64 - 8, 144), variable, this.rootPanelAnim);
        this.drawChild(arguments, this.rootPanelList, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
        this.drawChild(arguments, this.tabPanel, new Vec2(40, 24), new Size(64 - 8, 144), variable, this.rootPanelAnim);
        this.drawChild(arguments, this.listPanel, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
    }
    tick() {
        super.tick();
        this.tabPanel.tick();
        this.listPanel.tick();
        this.listPanel.configGroupUpdate(this.tabPanel.selectItem);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
            if (this.selectTab === this.listPanel) {
                // right panel
                this.listPanel.keyPressed(keyGroup, type);
                switch (keyGroup) {
                    case "left":
                    case "cancel":
                        this.selectTabIndexMoveBy(-1);
                        break;
                    default:
                        break;
                }
            }
            else if (this.selectTab === this.tabPanel) {
                // left panel
                this.tabPanel.keyPressed(keyGroup, type, this.listPanel);
                switch (keyGroup) {
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
            if (type === "start")
                this.mayExit();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        this.rootPanelAnim = new RioxUiAnim(0.1, -64, -64, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeInExpo);
        return result;
    }
    exitCondition() {
        return this.rootPanelAnim.getProgress() >= 1;
    }
    getCursorPos() {
        return new Vec2([40, 104][this.selectTabIndex] - 4, 24 + this.selectTab.selectItemIndex * 16 - this.selectTab.listScroll);
    }
    selectTabIndexMoveBy(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex += value;
        this.selectTabIndex = Util.limit(0, this.selectTabIndex, this.tabs.length - 1);
        return beforeIndex !== this.selectTabIndex;
    }
    selectTabIndexMoveTo(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex = Util.limit(0, value, this.tabs.length - 1); //Array.prototype.lastIndex??? 
        return beforeIndex !== this.selectTabIndex;
    }
    get selectTab() {
        return this.tabs[this.selectTabIndex];
    }
}
class RioxUiConfigToggle extends RioxUiBase {
    drawMain(drawPos, size, variable, animations) {
        drawPos = RioxUiAnim.animatedPos(drawPos, animations);
        Sprite.get("toggleOn").draw(drawPos);
    }
}
class RioxUiConfigItem extends RioxUiBase {
    configNameLabel = new RioxUiLabelBasic;
    configValueLabel = new RioxUiLabelBasic;
    configToggle = new RioxUiConfigToggle;
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.configNameLabel, new Vec2(0, 0), new Size(16, 8), variable.set("text", translate(`config.${variable.get("configName")}`)).set("area", new Rect(drawPos.x, drawPos.y, size.w - 64, size.h)), animations);
        this.drawChild(arguments, this.configValueLabel, new Vec2(128, 0), new Size(16, 8), variable.set("text", variable.get("configValue").toString()), animations);
    }
}
class RioxUiMenuTabConfigList extends RioxUiListBase {
    itemListPanel = new RioxUiConfigItem;
    variableModify(variable, item) {
        return variable.set("configName", item.name).set("configValue", item.value);
    }
    // default values
    configGroup = enumConfigGroup.Player;
    listArray = Array.from(Config.getGroupConfig(this.configGroup).values());
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        return selectItem.uiToggle(), true;
    }
    configGroupUpdate(configGroup) {
        this.configGroup = configGroup;
        this.listArray = Array.from(Config.getGroupConfig(this.configGroup).values());
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
            switch (keyGroup) {
                case "up":
                    this.selectItemIndexMoveBy(-1);
                    break;
                case "down":
                    this.selectItemIndexMoveBy(1);
                    break;
                case "right":
                case "confirm":
                    this.itemClick(this.selectItem);
                    break;
                default:
                    break;
            }
        }
    }
}
class RioxUiMenuTabconfigGroupTab extends RioxUiListBaseAnimation {
    itemListPanel = new RioxUiLabelBasic;
    variableModify = (variable, item) => {
        return variable.set("text", translate(`config.group.${item}`));
    };
    listArray = Object.values(enumConfigGroup);
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        return false;
    }
    configGroupUpdate(configGroup) {
    }
    keyPressed(keyGroup, type, itemList) {
        if (type === "click") {
            switch (keyGroup) {
                case "up":
                    this.selectItemIndexMoveBy(-1) && itemList != null && itemList.resetOpenAnimation();
                    break;
                case "down":
                    this.selectItemIndexMoveBy(1) && itemList != null && itemList.resetOpenAnimation();
                    break;
                default:
                    break;
            }
        }
    }
}
class RioxUiMenuTabConfig extends RioxUiBase {
    preventPlayerMove = true;
    rootPanelTab = new RioxUiPanelBasic().setDefaultText("Config");
    rootPanelList = new RioxUiPanelBasic();
    rootPanelAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    tabPanel = new RioxUiMenuTabconfigGroupTab();
    listPanel = new RioxUiMenuTabConfigList();
    selectTabIndex = 0;
    tabs = [this.tabPanel, this.listPanel];
    drawMain(drawPos, size, variable, animations) {
        const panelVec2 = new Vec2(40, 24);
        const panelSize = new Size(240, 144);
        this.drawChild(arguments, this.rootPanelTab, new Vec2(40, 24), new Size(64 - 8, 144), variable, this.rootPanelAnim);
        this.drawChild(arguments, this.rootPanelList, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
        this.drawChild(arguments, this.tabPanel, new Vec2(40, 24), new Size(64 - 8, 144), variable, this.rootPanelAnim);
        this.drawChild(arguments, this.listPanel, new Vec2(40 + 64, 24), new Size(240 - 64, 144), variable, this.rootPanelAnim);
    }
    tick() {
        super.tick();
        this.tabPanel.tick();
        this.listPanel.tick();
        this.listPanel.configGroupUpdate(this.tabPanel.selectItem);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
            if (this.selectTab === this.listPanel) {
                // right panel
                this.listPanel.keyPressed(keyGroup, type);
                switch (keyGroup) {
                    case "left":
                    case "cancel":
                        this.selectTabIndexMoveBy(-1);
                        break;
                    default:
                        break;
                }
            }
            else if (this.selectTab === this.tabPanel) {
                // left panel
                this.tabPanel.keyPressed(keyGroup, type, this.listPanel);
                switch (keyGroup) {
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
            if (type === "start")
                this.mayExit();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        this.rootPanelAnim = new RioxUiAnim(0.1, -64, -64, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeInExpo);
        return result;
    }
    exitCondition() {
        return this.rootPanelAnim.getProgress() >= 1;
    }
    getCursorPos() {
        return new Vec2([40, 104][this.selectTabIndex] - 4, 24 + this.selectTab.selectItemIndex * 16 - this.selectTab.listScroll);
    }
    selectTabIndexMoveBy(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex += value;
        this.selectTabIndex = Util.limit(0, this.selectTabIndex, this.tabs.length - 1);
        return beforeIndex !== this.selectTabIndex;
    }
    selectTabIndexMoveTo(value) {
        const beforeIndex = this.selectTabIndex;
        this.selectTabIndex = Util.limit(0, value, this.tabs.length - 1); //Array.prototype.lastIndex??? 
        return beforeIndex !== this.selectTabIndex;
    }
    get selectTab() {
        return this.tabs[this.selectTabIndex];
    }
}
class RioxUiSaveDataItem extends RioxUiBase {
    saveDataNameLabel = new RioxUiLabelBasic;
    saveDataLastModifiedLabel = new RioxUiLabelBasic;
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.saveDataNameLabel, new Vec2(0, 0), new Size(16, 8), variable.set("text", variable.get("fileName")), animations);
    }
}
class RioxUiMenuTabSaveDataList extends RioxUiListBase {
    itemListPanel = new RioxUiSaveDataItem;
    variableModify(variable, item) {
        return variable.set("fileName", item.name);
    }
    fileNameNoExt(fileName) {
        if (!fileName.includes("."))
            return fileName;
        const dotPoint = fileName.lastIndexOf(".");
        return fileName.slice(0, dotPoint);
    }
    listArray = new Array;
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        return RioxUiMenuTabSaveContextMenu.openUi(selectItem, SaveGame.savesDirHandle);
    }
    async refresh() {
        await SaveGame.createSaveDirFileArray();
        this.listArray = SaveGame.fileHandleArray.sort(SaveGame.compareFileDate);
    }
}
class RioxUiMenuTabSave extends RioxUiBase {
    preventPlayerMove = true;
    basePanel = new RioxUiPanelBasic;
    saveButton = new RioxUiButtonBasic;
    saveAsButton = new RioxUiButtonBasic;
    savesListPanel = new RioxUiMenuTabSaveDataList;
    saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    selectbuttonIndex = 0;
    buttons = [this.saveButton, this.saveAsButton, this.savesListPanel];
    constructor() {
        super();
        this.savesListPanel.refresh();
    }
    drawMain(drawPos, size, variable, animations) {
        if (!this.isFocused() && this.saveButtonAnim.getProgress() >= 1)
            return;
        this.drawChild(arguments, this.saveButton, new Vec2(64, 32), new Size(48, 8), variable.set("text", "Save"), this.saveButtonAnim);
        this.drawChild(arguments, this.saveAsButton, new Vec2(64, 32 + 16), new Size(48, 8), variable.set("text", "Saveas"), this.saveButtonAnim);
        this.drawChild(arguments, this.basePanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
        this.drawChild(arguments, this.savesListPanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
            if (type === "start")
                this.mayExit();
    }
    tick() {
        super.tick();
        this.savesListPanel.tick();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        this.saveButtonAnim = new RioxUiAnim(0.1, -64, -64, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeInExpo);
        return result;
    }
    exitCondition() {
        return this.saveButtonAnim.getProgress() >= 1;
    }
    selectButtonIndexMoveBy(value) {
        const beforeIndex = this.selectbuttonIndex;
        this.selectbuttonIndex += value;
        this.selectbuttonIndex = Util.limit(0, this.selectbuttonIndex, this.buttons.length - 1);
        return beforeIndex !== this.selectbuttonIndex;
    }
    selectButtonIndexMoveTo(value) {
        const beforeIndex = this.selectbuttonIndex;
        this.selectbuttonIndex = Util.limit(0, value, this.buttons.length - 1); //Array.prototype.lastIndex??? 
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
    getCursorPos() {
        if (this.selectButton !== this.savesListPanel)
            return new Vec2(32 + 16, this.selectbuttonIndex * 16 + 32);
        else
            return new Vec2(32 + 16, this.savesListPanel.selectItemIndex * 16 - this.savesListPanel.listScroll + 64);
    }
    focusEnd() {
        super.focusEnd();
        this.saveButtonAnim = new RioxUiAnim(0.1, -64, -64, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeInExpo);
    }
    focusStart() {
        super.focusStart();
        this.saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeInExpo);
    }
}
class RioxUiMenuTabSaveDataListSaveAs extends RioxUiMenuTabSaveDataList {
    preventPlayerMove = true;
    async refresh() {
        await super.refresh();
        if (this.fileNameInput == null)
            throw Error("fileNameInput was not initialize");
        let fileNameInput = this.fileNameInput;
        this.listArray.unshift({ get name() { return fileNameInput.value; } });
    }
    fileNameInput; // parent's clild
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        return this.save(selectItem);
    }
    async save(selectItem) {
        if (selectItem instanceof File && !confirm(translate("menu.save.replace", selectItem.name)))
            return;
        SaveGame.saveAs(selectItem.name); /*.catch(e => {
            if (e.name === "TypeError")
                alert("ファイル名が有効な文字列ではありません");
            else
                throw e;
        });*/
        inputReset();
    }
}
class RioxUiMenuTabSaveAs extends RioxUiBase {
    preventPlayerMove = true;
    basePanel = new RioxUiPanelBasic;
    saveButton = new RioxUiButtonBasic;
    fileNameInput = new RioxUiInputBasic;
    savesListPanel = new RioxUiMenuTabSaveDataListSaveAs;
    saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    selectbuttonIndex = 0;
    buttons = [this.fileNameInput, this.savesListPanel];
    saveAsButton;
    constructor() {
        super();
        this.savesListPanel.refresh();
        this.savesListPanel.fileNameInput = this.fileNameInput;
        this.fileNameInput.placeholder = translate("menu.save.enterNewName");
    }
    compareFileDate(a, b) {
        if (a.lastModified > b.lastModified) {
            return -1;
        }
        else if (b.lastModified > a.lastModified) {
            return 1;
        }
        return 0;
    }
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.fileNameInput, new Vec2(64, 32), new Size(48, 8), variable.set("text", "Save"), this.saveButtonAnim);
        this.drawChild(arguments, this.basePanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
        this.drawChild(arguments, this.savesListPanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
            if (type === "start")
                this.mayExit();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        this.saveButtonAnim = new RioxUiAnim(0.1, -64, -64, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeInExpo);
        return result;
    }
    exitCondition() {
        return this.saveButtonAnim.getProgress() >= 1;
    }
    selectButtonIndexMoveBy(value) {
        const beforeIndex = this.selectbuttonIndex;
        this.selectbuttonIndex += value;
        this.selectbuttonIndex = Util.limit(0, this.selectbuttonIndex, this.buttons.length - 1);
        return beforeIndex !== this.selectbuttonIndex;
    }
    selectButtonIndexMoveTo(value) {
        const beforeIndex = this.selectbuttonIndex;
        this.selectbuttonIndex = Util.limit(0, value, this.buttons.length - 1); //Array.prototype.lastIndex??? 
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
    getCursorPos() {
        if (this.selectButton !== this.savesListPanel)
            return new Vec2(32 + 16, this.selectbuttonIndex * 16 + 32);
        else
            return new Vec2(32 + 16, this.savesListPanel.selectItemIndex * 16 - this.savesListPanel.listScroll + 64);
    }
}
class RioxUiMenuTabSaveContextMenu extends RioxUiBase {
    preventPlayerMove = true;
    isContextMenu = true;
    basePanel = new RioxUiPanelBasic;
    replaceButton = new RioxUiLabelBasic;
    loadButton = new RioxUiLabelBasic;
    renameButton = new RioxUiLabelBasic;
    deleteButton = new RioxUiLabelBasic;
    selectButtonIndex = 0;
    buttons = [this.replaceButton, this.loadButton, this.renameButton, this.deleteButton];
    fileHandle;
    fileDirHandle;
    openUi(fileHandle, fileDirHandle, ...args) {
        const result = super.openUi();
        this.fileHandle = fileHandle;
        this.fileDirHandle = fileDirHandle;
        return result;
    }
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.basePanel, new Vec2(128, 64), new Size(64, 64), variable, []);
        this.drawChild(arguments, this.replaceButton, new Vec2(128, 64), new Size(48, 8), variable.set("text", "replace"), []);
        this.drawChild(arguments, this.loadButton, new Vec2(128, 64 + 16), new Size(48, 8), variable.set("text", "load"), []);
        this.drawChild(arguments, this.renameButton, new Vec2(128, 64 + 32), new Size(48, 8), variable.set("text", "rename"), []);
        this.drawChild(arguments, this.deleteButton, new Vec2(128, 64 + 48), new Size(48, 8), variable.set("text", "delete"), []);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
                    break;
                default:
                    break;
            }
        }
        if (keyGroup === "menu" || keyGroup === "left" || keyGroup === "cancel")
            if (type === "start")
                this.mayExit();
    }
    selectButtonIndexMoveBy(value) {
        const beforeIndex = this.selectButtonIndex;
        this.selectButtonIndex += value;
        this.selectButtonIndex = Util.limit(0, this.selectButtonIndex, this.buttons.length - 1);
        return beforeIndex !== this.selectButtonIndex;
    }
    selectButtonIndexMoveTo(value) {
        const beforeIndex = this.selectButtonIndex;
        this.selectButtonIndex = Util.limit(0, value, this.buttons.length - 1); //Array.prototype.lastIndex??? 
        return beforeIndex !== this.selectButtonIndex;
    }
    get selectButton() {
        return this.buttons[this.selectButtonIndex];
    }
    buttonClick(tab) {
        switch (tab) {
            case this.replaceButton:
                SaveGame.saveAs(this.fileHandle.name, this.fileDirHandle);
                break;
            case this.loadButton:
                SaveGame.loadAs(this.fileHandle.name, this.fileDirHandle);
                break;
            case this.renameButton:
                //SaveGame.moveFileName(this.fileHandle.name, prompt("name"), this.fileDirHandle);
                break;
            case this.deleteButton:
                SaveGame.deleteFileName(this.fileHandle.name, this.fileDirHandle, { recursive: true });
                break;
            default:
        }
        inputReset();
    }
    getCursorPos() {
        return new Vec2(128 - 8, this.selectButtonIndex * 16 + 64);
    }
}
class RioxUiMenuTabSystem extends RioxUiSimpleStackTabBase {
    preventPlayerMove = true;
    isContextMenu = true;
    tabTitle = new RioxUiButtonBasic().setDefaultText("Title");
    tabTitleAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    tabDebug = new RioxUiButtonBasic().setDefaultText("Debug");
    tabDebugAnim = new RioxUiAnim(0.1, 64, 0, 0.015, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    selectTabIndex = 0;
    tabs = [this.tabTitle, this.tabDebug];
    tabAnims = [this.tabTitleAnim, this.tabDebugAnim];
    drawMain(drawPos, size, variable, animations) {
        super.drawMain(drawPos, size, variable, animations);
    }
    drawRootOffset() {
        return new Vec2(0, 0);
    }
    drawChildOffset() {
        return new Vec2(0, 16);
    }
    drawSize() {
        return new Size(48, 8);
    }
    keyPressed(keyGroup, type) {
        super.keyPressed(keyGroup, type);
    }
    tabClick(tab) {
        switch (tab) {
            case this.tabTitle:
                Core.openTitle();
                break;
            case this.tabDebug:
                new RioxUiMenuTabSystemDebug().openUi();
                break;
            default:
        }
    }
    getCursorOffsetPos() {
        return this.cursorOffsetPosUseAuto();
    }
}
class RioxUiMenuTabSystemDebug extends RioxUiSimpleStackTabBase {
    preventPlayerMove = true;
    isContextMenu = true;
    tabReloadAssets = new RioxUiButtonBasic().setDefaultText("reloadAssets");
    tabReloadAssetsAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    selectTabIndex = 0;
    tabs = [this.tabReloadAssets];
    tabAnims = [this.tabReloadAssetsAnim];
    drawMain(drawPos, size, variable, animations) {
        super.drawMain(drawPos, size, variable, animations);
    }
    drawRootOffset() {
        return new Vec2(0, 0);
    }
    drawChildOffset() {
        return new Vec2(0, 16);
    }
    drawSize() {
        return new Size(48, 8);
    }
    keyPressed(keyGroup, type) {
        super.keyPressed(keyGroup, type);
    }
    tabClick(tab) {
        switch (tab) {
            case this.tabReloadAssets:
                loadingManager.loadAllAssets();
                break;
            default:
        }
    }
    getCursorOffsetPos() {
        return this.cursorOffsetPosUseAuto();
    }
}
class RioxUiTitle extends RioxUiBase {
    newGameButton = new RioxUiLabelBasic;
    loadGameButton = new RioxUiLabelBasic;
    selectButtonIndex = 0;
    buttons = [this.newGameButton, this.loadGameButton];
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.newGameButton, new Vec2(16, 16), new Size(48, 8), variable.set("text", "New Game"), []);
        this.drawChild(arguments, this.loadGameButton, new Vec2(16, 32), new Size(48, 8), variable.set("text", "Load Game"), []);
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
        this.selectButtonIndex = Util.limit(0, this.selectButtonIndex, this.buttons.length - 1);
        return beforeIndex !== this.selectButtonIndex;
    }
    selectButtonIndexMoveTo(value) {
        const beforeIndex = this.selectButtonIndex;
        this.selectButtonIndex = Util.limit(0, value, this.buttons.length - 1); //Array.prototype.lastIndex??? 
        return beforeIndex !== this.selectButtonIndex;
    }
    get selectButton() {
        return this.buttons[this.selectButtonIndex];
    }
    buttonClick(tab) {
        switch (tab) {
            case this.newGameButton:
                Core.newGame();
                break;
            case this.loadGameButton:
                // Game.LoadGame();
                RioxUiTitleSaveSelect.openUi();
                break;
            default:
            //console.warn(tab);
        }
    }
    getCursorPos() {
        return new Vec2(8, this.selectButtonIndex * 16 + 16);
    }
}
class RioxUiTitleSaveDataList extends RioxUiMenuTabSaveDataList {
    itemClick(selectItem) {
        if (this.listArray.length === 0)
            return false;
        return this.load(selectItem);
    }
    async load(selectItem) {
        // if (selectItem instanceof File && !confirm(translate("menu.save.replace", [selectItem.name]))) return;
        SaveGame.loadAs(selectItem.name);
        inputReset();
        Core.loadGame();
    }
}
class RioxUiTitleSaveSelect extends RioxUiBase {
    basePanel = new RioxUiPanelBasic;
    savesListPanel = new RioxUiTitleSaveDataList;
    saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
    constructor() {
        super();
        this.savesListPanel.refresh();
    }
    drawMain(drawPos, size, variable, animations) {
        this.drawChild(arguments, this.basePanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
        this.drawChild(arguments, this.savesListPanel, new Vec2(64, 64), new Size(144, 64), variable, this.saveButtonAnim);
    }
    tick() {
        super.tick();
        this.savesListPanel.tick();
    }
    keyPressed(keyGroup, type) {
        if (type === "click") {
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
            if (type === "start")
                this.mayExit();
    }
    mayExit() {
        if (!this.mayExitCondition())
            return false;
        const result = super.mayExit();
        this.saveButtonAnim = new RioxUiAnim(0.1, 64, 0, 0.0, enumRioxUiAnimType.Vec2X, Easings.easeOutExpo);
        return result;
    }
    exitCondition() {
        return this.saveButtonAnim.getProgress() >= 1;
    }
    getCursorPos() {
        return new Vec2(32 + 16, this.savesListPanel.selectItemIndex * 16 - this.savesListPanel.listScroll + 64);
    }
}
//言語設定
Game.lang = {};
let lang = "en_us";
//json読み込み
document.addEventListener("readystatechange", loadingManager.loadAllAssets);
function canDraw(loopID) {
    return document.hasFocus() || loopID % 60 === 0;
}
function drawLoop() {
    Game.displayTick();
    loopID = requestAnimationFrame(drawLoop);
}
intervalID = setInterval(Game.tick, 1000 / 60);
function STOP_ALL() {
    clearInterval(intervalID);
    cancelAnimationFrame(loopID);
}
function updateTouch(e) {
    // 要素の位置座標を取得
    let clientRect = canvas.getBoundingClientRect();
    // 距離取得
    let x = clientRect.left;
    let y = clientRect.top;
    let i = 0;
    touchList.splice(0, Infinity);
    for (const touch of e.touches) {
        //console.log(touch)
        let obj = {
            "x": touch.clientX - clientRect.left,
            "y": touch.clientY - clientRect.top,
            "timer": timer
        };
        touchList[i] = obj;
        i++;
    }
    touchmode = true;
    //console.log(touchpos[0])
}
function draw_touch_button() {
    if (!touchmode)
        return;
    for (const i in touchButtons) {
        // drawImg("touch_button_" + touchButtons[i].type, touchButtons[i].x, touchButtons[i].y)
    }
}
// ログを再構築
function GamepadUpdate() {
    // 最新の Gamepad のリストを取得する
    gamepads = navigator.getGamepads();
}
;
for (let i = 0; i < gamepads.length; i++) {
    var a = new Array();
    // Gamepad オブジェクトを取得
    var gamepad = gamepads[i];
    // Gamepad オブジェクトが存在する
    if (gamepad) {
        console.log(gamepad);
        // Gamepad オブジェクトが存在しない
    }
    else {
    }
    // テキストを更新
}
function touch_button_proc() { }
/*
function touch_button_proc() {
    if (!touchmode) return;
    //for(const i in touchpos)if(touchpos[i].timer!=timer)touchpos.splice(i,1)

    for (const i of touchButtons) {
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
                }
            }
        }
    }
}
*/
class ImagesRegistry extends Map {
    contentsLength = 0;
    progress = 0;
    async load() {
        const get = new Array;
        get.push(this.loadImage("img/tiles.png", "tiles"));
        get.push(this.loadImage("img/tiles/water.png", "water"));
        get.push(this.loadImage("img/items.png", "items"));
        get.push(this.loadImage("img/players/players.png", "players"));
        get.push(this.loadImage("img/enemy.png", "enemy"));
        get.push(this.loadImage("img/misc/particle.png", "particle"));
        get.push(this.loadImage("img/misc/sweep.png", "sweep"));
        get.push(this.loadImage("img/players/item_models.png", "item_model"));
        get.push(this.loadImage("img/gui/gui.png", "gui"));
        get.push(this.loadImage("img/gui/prompt.png", "gui_prompt"));
        get.push(this.loadImage("img/gui/prompt2.png", "gui_prompt_more"));
        get.push(this.loadImage("img/gui/tab_select.png", "gui_tab_select"));
        get.push(this.loadImage("img/gui/scroll_bar.png", "gui_scroll_bar"));
        get.push(this.loadImage("img/gui/touch_button.png", "touch_button"));
        this.contentsLength = get.length;
        return await Promise.all(get);
    }
    async loadImage(imgUrl, name) {
        const img = new Image();
        let promise = new Promise(resolve => {
            img.onload = () => {
                loadingManager.updateScreen();
                resolve(0);
                this.progress++;
            };
            img.src = imgUrl;
            if (name != null)
                this.set(name, img);
        });
        await promise;
        return img;
    }
}
const Images = new ImagesRegistry;
class JsonesRegistry extends Map {
    contentsLength = 0;
    progress = 0;
    async load() {
        const get = new Array;
        get.push(this.fetchAndParse("param/lang/en_us.json", "en_us"));
        get.push(this.fetchAndParse("param/lang/ja_jp.json", "ja_jp"));
        this.contentsLength = get.length;
        return await Promise.all(get);
    }
    async fetchAndParse(imgUrl, name) {
        const response = await fetch(imgUrl);
        if (!response.ok)
            return null;
        const jsonObj = await response.json();
        if (name != null)
            this.set(name, jsonObj);
        this.progress++;
        loadingManager.updateScreen();
        return jsonObj;
    }
}
const Jsones = new JsonesRegistry;
class SoundsRegistry extends Map {
    contentsLength = 0;
    progress = 0;
    async load() {
        const get = new Array;
        get.push(this.loadSound("audio/select.ogg", "select"));
        get.push(this.loadSound("audio/break.ogg", "break", 0.5));
        get.push(this.loadSound("audio/breakbit.ogg", "breakbit", 0.5));
        get.push(this.loadSound("audio/attack.ogg", "attack"));
        get.push(this.loadSound("audio/attack2.ogg", "damage"));
        get.push(this.loadSound("audio/attack2.ogg", "death"));
        get.push(this.loadSound("audio/cancel.ogg", "cancel"));
        this.contentsLength = get.length;
        return await Promise.all(get);
    }
    async loadSound(adoUrl, name, volume = 1) {
        const sound = await Sound.init(adoUrl, volume);
        loadingManager.updateScreen();
        if (name != null)
            this.set(name, sound);
        this.progress++;
        return sound;
    }
}
const Sounds = new SoundsRegistry;
class FontImagesRegistry extends Map {
    contentsLength = 0;
    progress = 0;
    async load() {
        const get = new Array;
        get.push(this.loadImage(`font/uni_00.png`, 0x00));
        get.push(this.loadImage(`font/uni_20.png`, 0x20));
        get.push(this.loadImage(`font/uni_30.png`, 0x30));
        // for (let i = 0; i <= 255; i++) {
        //     get.push(this.loadImage(`font/uni_${i.toString(16)}.png`, i));
        // }
        this.contentsLength = get.length;
        return await Promise.all(get);
    }
    async loadImage(imgUrl, code) {
        const img = new Image();
        let promise = new Promise(resolve => {
            img.onload = () => {
                resolve(0);
                this.progress++;
            };
            img.src = imgUrl;
            this.set(code, img);
        });
        await promise;
        return img;
    }
}
class Font {
    static images = new FontImagesRegistry;
    static async load() {
        await this.images.load();
    }
    static drawText(text, drawX, drawY, { color = Game.colorPallet.black, align = "start", maxTextSize = NaN, startX = NaN, startY = NaN, endX = NaN, endY = NaN } = {}, area) {
        if (ctx == null)
            throw new Error("canvas context is null!");
        const FONTSIZE = 8;
        ctx.save();
        if (!isNaN(maxTextSize)) {
            ctx.beginPath();
            ctx.rect(drawX, drawY, maxTextSize, (text.match(/\n/g) || []).length * FONTSIZE);
            ctx.closePath();
            ctx.clip();
        }
        if (area != null) {
            Sprite.drawareaInit(area.x, area.y, area.w, area.h);
        }
        for (let i = 0, offsetX = 0, offsetY = 0; i < text.length; i++, offsetX++) {
            const code = text.charCodeAt(i);
            const codeHex = code.toString(16).padStart(4, '0');
            const imageKey = parseInt(`${codeHex[0]}${codeHex[1]}`, 16);
            if (!this.images.has(imageKey))
                continue;
            const image = this.images.get(imageKey);
            if (!image.complete || image.naturalHeight == 0)
                continue;
            if (text.charAt(i) == "\n") {
                offsetX = -1, offsetY++;
                continue;
            }
            drawImg(image, parseInt(codeHex[3], 16) * FONTSIZE, parseInt(codeHex[2], 16) * FONTSIZE, FONTSIZE, FONTSIZE, drawX + offsetX * FONTSIZE, drawY + offsetY * FONTSIZE);
        }
        ctx.restore();
    }
}
//#region Something
/**
 * @deprecated
 * @param {string} text
 * @param {number} textX
 * @param {number} textY
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {"start"|"end"|"left"|"right"|"center"} align
 */
function drawTextFont(text, textX, textY, { color = Game.colorPallet.black, align = "start", maxTextSize = NaN, startX = NaN, startY = NaN, endX = NaN, endY = NaN } = {}, area) {
    if (ctx == null)
        throw new Error("canvas context is null!");
    ctx.save();
    const Font = DEFAULT_FONT;
    const fontSize = 8;
    // フォントは大きさ半分で書いてるので２倍にします
    const fontSIzeExpand = 2;
    const fontOffsetFix = 8;
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
    if (!isNaN(maxTextSize)) {
        ctx.beginPath();
        ctx.rect(textX, textY, maxTextSize, (text.match(/\n/g) || []).length * fontSize);
        ctx.closePath();
        ctx.clip();
    }
    if (area != null) {
        Sprite.drawareaInit(area.x, area.y, area.w, area.h);
    }
    // 行ごとにループ処理
    text.split('\n').forEach((line, index) => {
        // Y座標の位置を行のインデックスと行間で調整
        ctx.fillText(line, textX, textY + index * fontOffsetFix + fontSize); //ここも調整
    });
    // thanks gpt4
    //ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.restore();
}
/**
 * 翻訳後の文字列を返します
 * @param {string} key 翻訳キー
 * @param  {...string} param パラメーター
 * @returns
 */
function translate(key, ...args) {
    key = key.toString();
    if (!(key in Game.lang))
        return key;
    let text = Game.lang[key];
    let formattedText;
    if (args.length == 0)
        return text;
    for (const [i, arg] of args.entries()) {
        const regExp = new RegExp(`\\{${i}\\}`, 'g');
        formattedText = text.replace(regExp, arg);
    }
    return formattedText;
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
function drawImg(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    if (ctx == null)
        throw new Error("canvas context is null!");
    ctx.drawImage(img, Math.floor(sx), Math.floor(sy), Math.floor(sWidth), Math.floor(sHeight), Math.floor(dx), Math.floor(dy), Math.floor(dWidth ?? sWidth), Math.floor(dHeight ?? sHeight));
}
async function fontfix(num) {
    const OFFSET = 8;
    const fontData = await Jsones.fetchAndParse("Proj23Fon.txt");
    const result = {};
    for (const num of Object.keys(fontData).filter(e => !isNaN(+e))) {
        result[num] = new Array;
        for (const [lenI, len] of fontData[num].entries()) {
            const temp = len.toString(2).padStart(8, '0');
            const arrres = temp.split("").reduce((acc, cur, init) => { acc.push(cur, cur); return acc; }, []);
            const textres = arrres.splice(0, 16).join("");
            const numres = parseInt(textres, 2);
            if (lenI * 2 - OFFSET < 16)
                result[num][lenI * 2 - OFFSET] = numres;
            if (lenI * 2 + 1 - OFFSET < 16)
                result[num][lenI * 2 + 1 - OFFSET] = numres;
        }
    }
    return Object.assign(fontData, result);
}
