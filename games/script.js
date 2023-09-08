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
let gamestarted;
let DoSayErrorMassege = true;
window.onerror = (message, file, lineNo, colNo, error) => {
    if (DoSayErrorMassege) alert("エラーが発生しました\n再読み込みしてください");
    //if (gamestarted)requestAnimationFrame(main);
}

//画面に表示される時は4倍になるので注意
let zoom = 4;

//その他の変数の作成
let timer = 0;
let loopID;
const siteName = ["http://127.0.0.1:8000", "https://satoshiinu.github.io/games"]

//読み込むもの
let willLoadImg = [
    ["img/tiles.png", "tiles"],
    ["img/items.png", "items"],
    ["img/players/players.png", "players"],
    ["img/enemy.png", "enemy"],
    ["img/misc/particle.png", "particle"],
    ["img/misc/sweep.png", "sweep"],
    ["img/players/item_models.png", "item_model"],
    ["img/gui/gui.png", "gui"],
    ["img/gui/gui_item_about.png", "gui_item_about"],
    ["img/gui/gui_texts.png", "gui_texts"],
    ["img/gui/tab.png", "gui_tab"],
    ["img/gui/under_page_scroll.png", "gui_under_page_scroll"],
    ["img/gui/message.png", "gui_message"],
    ["img/gui/prompt.png", "gui_prompt"],
    ["img/gui/prompt2.png", "gui_prompt_more"],
    ["img/gui/scroll_bar.png", "gui_scroll_bar"],
    ["img/gui/ability.png", "gui_menu"],
    ["img/gui/icons.png", "gui_icons"],
    ["img/gui/touch.png", "touch_button"]
]
Object.freeze(willLoadImg);

const willLoadJson = [
    ["param/maps/Map.map", "Map"],

    ["param/atlas.json", "atlas"],
    ["param/enemy.json", "enemy"],
    ["param/particle.json", "particle"],
    ["param/item.json", "item"],
    ["param/icons.json", "icons"],

    ["param/lang/en_us.json", "en_us"],
    ["param/config.json", "configs"]
]
Object.freeze(willLoadJson);

//クラス
class Item {
    constructor(ID, count = 99) {
        this.id = ID;
        this.count = count;
    }
}

class Player {
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
            "lock": 0
        }
        this.hp = 500
        this.hp_max = 500
        this.damage_cooldown = 0,
            this.id = ID
        this.exp = {
            exp: 0,
            lv: 0
        }
        this.ability = {
            river: false
        }

    }
}

class Enemy {
    constructor(spx, spy, id) {
        this.x = spx * 16
        this.y = spy * 16
        this.sp = [spx, spy]
        this.id = id
        this.xspd = 0
        this.yspd = 0
        this.xknb = 0
        this.yknb =
            this.move = [false, false, false, false, 0]
        this.attack = {
            "hostility": false,
            "timer": 0,
            "cool_down": 0
        }
        this.hp = loadedjson.enemy[id].hp
        this.damage_cooldown = 0
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
        this.moving = false
    }
}

class NPC {
    constructor(x, y, id) {
        this.x = x * 16
        this.y = y * 16
        this.sp = [x, y]
    }

}

class Keys {
    constructor() {
        this.press = false;
        this.pressLag = false;
        this.down = false;
        this.hold = false;
        this.timer = 0;
        this.time = -1;
        this.timen = -1;
        this.presstime = -1;
    }
}

//設定
let game = new Object();

game.ver = "beta"

game.saveloadingnow = false;
game.saveloadfaliedtime=-1;
game.saveloadfaliedtype=-1;
game.PopUpDelay=100;

game.move_limit = 32767;
game.weapon_canlock = false;
game.PI = Math.floor(Math.PI * Math.pow(10, 5)) / Math.pow(10, 5);

game.map = new Object;

game.map_path = {
    "VillageAround": "param/maps/VillageAroundMap.map",
    "LvSpot": "param/maps/LvSpotMap.map",
    "Default": "param/maps/Map.map"
}

game.rotate_pos = [
    [0, 1],//　 ↓
    [-1, 1],//  ↙
    [-1, 0],//  ←
    [-1, -1],// ↖
    [0, -1],//  ↑
    [1, -1],//  ↗　
    [1, 0],//　 →
    [1, 1],//　 ↘
]

game.facing_pos = [
    [0, 1],//　 ↓
    [-1, 0],//  ←
    [0, -1],//  ↑
    [1, 0],//　 →
]

game.tab_offset = [
    64, 128, 128, 128
]

game.gui_item_count = [
    15, 7, 15, 7
]

game.breakableTile = [
    9, 10, 11
]

game.breakableTileAbout = {
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

game.gui_system_items = [
    "menu.system.config",
    "menu.system.data"
]
game.gui_system_data_items = [
    "menu.system.data.save",
    "menu.system.data.load",
    "menu.system.data.select",
    "menu.system.data.download",
    "menu.system.data.upload"
]

game.select_y_size = [
    16, 16, 16, 16
]
game.savemetadata = {
    "codename": "project2023",
    "ver": game.ver
}


let IsLoading = true;

//config変数の作成
let config = {
    "canrotateonattacking": false,
    "weapon_auto_aiming": true
}


//デバッグ用の変数の作成
let debug = new Object();
debug.hitboxes = new Array();
debug.hitbox_visible = true;
debug.text_visible = false;
debug.about_visible = false;

debug.camx = 0;
debug.camy = 0;


//json読み込み
let loadedjson = new Object();
let loadjsoncount = 0;
let loadimgcount = 0;

//セーブデータ読み込み用の変数の作成
let dirHandle;
let LastSavedFileData;
let SaveDataFileName = "save.json"
let LastSavedTime;

//FPS計測の変数を作成
let fps = 0;
let frameCount = 0;
let startTime;
let endTime;

let MainProcStartTime = 0;
let MainProcEndTime = 0;
let MainProcTime = 0;

startTime = new Date().getTime();


//プレイヤーの変数の作成
let player = {
    "x": 0,
    "y": 224,
    "xknb": 0,
    "yknb": 0,
    "mapID": "",
    "items": [
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
        }
    ]
}



player.xspd = 0, player.yspd = 0;
player.scrollx = player.x + 160, player.scrolly = player.y + 24;
player.scroll_offsetx = 0, player.scroll_offsety = 0;
player.drawx = 0, player.drawy = 0;
player.anim = 0;
player.rotate = 0, player.facing = 0;
player.canRotate = true;
player.up = false, player.down = false, player.right, player.left = false;
player.moved = false, player.moving = false;
player.moveTimer = 0;
player.movelog = new Array();

let players = new Array();


players[0] = new Player(0);

player.weapon = new Object();
player.weapon.attack = 5;


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


//キー判定
addEventListener("keyup", keyupfunc);
addEventListener("keydown", keydownfunc);

//画像の設定

let img = new Object();


//フォント
img.font = new Object();

//読み込みやつ
let uni = {
    "00": true,
    "20": true,
    "30": true
}

//フォント読み込み
for (let i in uni) {
    if (uni[('00' + i.toString(16)).slice(-2)]) {
        img.font["uni_" + ('00' + i.toString(16)).slice(-2)] = new Image();
        img.font["uni_" + ('00' + i.toString(16)).slice(-2)].src = "img/font/uni_" + ('00' + i.toString(16)).slice(-2) + ".png";
    }
}

img.font.uni_00_purple = new Image();
img.font.uni_00_purple.src = "img/font/uni_00_purple.png";


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

//メッセージ変数作成
let message = {
    "message.text": "",
    "message.visible": false
}

//メニューの変数の作成
let menu = {
    "tab": 0,
    "tab_select": true,
    "item_select": 0,
    "role_select": false,
    "who_use": 0,
    "scroll": 0,
    "system_right": false,
    "system_select": 0,
    "CursorOldPos": { "x": 0, "y": 0 },
    "CursorNeedUpdate": false,
    "visible": false
}
//承認ウィンドウの変数の作成
let window_confirm = {
    "visible": false,
    "selected": false,
    "func_ok": () => { },
    "func_cancel": () => { },
    "text": "",
    "title": "",
    "pos": { "x": 0, "y": 0 }
}

//キャンバスのやつ
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 320 * zoom;
canvas.height = 180 * zoom;

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

//タッチ操作
//あざす https://web-breeze.net/js-touch-event/
// 各タッチイベントのイベントリスナー登録
canvas.addEventListener("touchstart", function () { updateDisplay(event) })
canvas.addEventListener("touchend", function () { updateDisplay(event) })
canvas.addEventListener("touchmove", function () {
    event.preventDefault()  // 画面スクロールを防止
    updateDisplay(event)
})
canvas.addEventListener("touchcancel", function () { updateDisplay(event) })

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

//言語設定
game.lang = loadedjson.en_us;

//json読み込み
loadingassets();

function main() {

    //FPS計測
    fpsCount();
    main_proc_time(true);

    
    if (!IsLoading) game.map = Object.assign(loadedjson.Map, loadedjson.MapMeta)

    //キャンバスの初期化
    ctx.clearRect(0, 0, 320 * zoom, 180 * zoom);

    keycheck();
    touch_button_proc();

    game.lang = loadedjson.en_us;

    //プレイヤーの動作
    player_proc();

    //敵の動作
    enemy_proc();

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
    gui_proc()


    //描画メイン
    game_draw();

    //GUI描画
    gui_draw();

    //デバッグ
    if (debug.text_visible) debug_proc();


    //タイマー
    timer++;



    main_proc_time(false);
    //ループ
    loopID = requestAnimationFrame(main);
}

async function game_start_proc() {

    await mapchange("Default");

    //コンフィグ初期化
    for (const i in loadedjson.configs.configs) {
        let configs = loadedjson.configs.configs[i];

        config[configs.variable] = configs.default;
        //console.log(config[configs.variable])
    }

    gamestarted = true;
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
    parameter.preventDefault();
}

function keyupfunc(parameter) {
    let key_code = parameter.keyCode
    keys[key_code].press = false;
    keys[key_code].pressLag = false;
    keys[key_code].timer = 0;
}

function updateDisplay(event) {
    // 要素の位置座標を取得
    let clientRect = canvas.getBoundingClientRect();
    // 距離取得
    let x = clientRect.left;
    let y = clientRect.top;

    let i = 0;
    touchpos.splice(0, Infinity)
    for (const touch of event.touches) {
        let t = {
            "x": touch.clientX - clientRect.left,
            "y": touch.clientY - clientRect.top,
            "timer": timer
        }
        touchpos[i] = t;
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
            let rect_pos_x = touchButtons[i].x * zoom;
            let rect_pos_y = touchButtons[i].y * zoom;
            let rect_width = touchButtons[i].width * zoom;
            let rect_height = touchButtons[i].height * zoom;

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
        if (keys[i].timer == timer) keys[i].down = true;
        if (keys[i].timer != timer) keys[i].down = false;
        if (keys[i].timen == timer) keys[i].hold = true;
        if (keys[i].timen != timer) keys[i].hold = false;
    }

    for (const i in touchpos) {
        if (typeof touchtime[i] === "undefined") touchtime[i] = 0;
        touchtime[i]++;
    }
    for (const i in touchtime) {
        if (typeof touchpos[i] === "undefined") touchtime[i] = 0;
    }



    for (const i in key_groups_list) {
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

function getTileAtlasXY(id, xy) {
    if (xy == 0) return id % 16 * 16
    if (xy == 1) return Math.floor(id / 16) * 16
}

function getPlayerAtlasXY(id, xy) {
    return playerAtlas[id] * 16
}

function Random(min, max) {
    //あざす https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    return Math.random() * (max - min) + min;
}

function slice(str, len = 5) {
    if (str.length > len)
        return str.slice(0, len - 1) + "…";

    if (str.length <= len)
        return str;
}

function floor(num, k) {
    if (Math.sign(k) === 1) return Math.floor(num / 10 ** k) * 10 ** k

    if (Math.sign(k) == -1) return Math.floor(num * 10 ** -k) / 10 ** -k
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

//json読み込み
async function loadingassets() {
    console.log("jsons are loading");
    {
        let gets = new Array();
        for (const i in willLoadJson) {
            gets.push(getJson(willLoadJson[i][0], willLoadJson[i][1]))
        }

        await Promise.all(gets);
    }

    console.log("jsons are loaded");
    console.log("images are loading");

    {
        let gets = new Array();
        for (const i in willLoadImg) {
            gets.push(loadImage(willLoadImg[i][0], willLoadImg[i][1]));
        }

        await Promise.all(gets);
    }

    console.log("images are loaded");

    if (gamestarted) return;

    console.log("game is starting");
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

async function getJson(filename, name) {
    //あざす　https://gxy-life.com/2PC/javascript/json_table20220514/
    let startTime = new Date().getTime();

    //取得ここから
    const response = await fetch(
        filename  // jsonファイルの場所
    );
    const members = await response.json();
    //取得ここまで

    let endTime = new Date().getTime();
    members.loadTime = endTime - startTime;
    loadjsoncount++;
    console.log('loaded : ' + filename);

    if (!gamestarted) {
        ctx.clearRect(0, 0, 320 * zoom, 180 * zoom);
        ctx.fillText(`loading parameter: ${loadjsoncount}/${willLoadJson.length}`, 320 / 2 * zoom, 180 / 2 * zoom);
    }

    loadedjson[name] = members;
    return members;
}

//あざす https://pisuke-code.com/js-load-image-synchronously/
/// 1.Promiseを使った同期読み込み
async function loadImage(imgUrl, name) {
    img[name] = null;
    let promise = new Promise(function (resolve) {
        img[name] = new Image();
        img[name].onload = function () {
            /// 読み込み完了後...
            loadimgcount++
            if (!gamestarted) {
                ctx.clearRect(0, 0, 320 * zoom, 180 * zoom);
                ctx.fillText(`loading images: ${loadimgcount}/${willLoadImg.length}`, 320 / 2 * zoom, 180 / 2 * zoom);
            }

            console.log('loaded : ' + imgUrl);
            resolve();
        }
        /// 読み込み開始...
        img[name].src = imgUrl;
    });
    /// 読込完了まで待つ
    await promise;
    return img[name];
}


//あざす　https://feeld-uni.com/?p=2162
async function loadconfig() {
    //let dirHandle;
    let fileData;

    try{
        if (typeof dirHandle == "undefined") dirHandle = await window.showDirectoryPicker();
    }catch{
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

    try{
        if (typeof dirHandle == "undefined") dirHandle = await window.showDirectoryPicker();
    }catch{
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

async function savepathselect() {
    let fileData;

    try{
        if (typeof dirHandle == "undefined") dirHandle = await window.showDirectoryPicker();
    }catch{
        return undefined;
    }

    const file = await dirHandle.getFileHandle(SaveDataFileName, {
        create: true
    });

    // Read the file text.
    fileData = await file.getFile();
    LastSavedFileData = fileData;
    let text = await fileData.text();

    return fileData;
}

async function savedataload() {
    let obj = await loadconfig();
    if(obj == undefined)return;

    if (obj.iphash != await getHash(await getIP())) if (!confirm("前回セーブしたIPと違います\n第三者のセーブデータをロードすることは推奨しません\nロードしますか?")) return;

    player = obj.player;
    players = obj.players;
    enemy = obj.enemy;
    LastSavedTime = new Date(obj.LastSavedTime);
    player_movelog_reset()
    mapchange(player.mapID, player.x, player.y, false)

    return LastSavedFileData;
}

async function savedatawrite() {
    let obj = new Object();

    obj.metadata = game.savemetadata;
    obj.LastSavedTime = new Date();
    obj.player = player;
    obj.players = players;
    obj.enemy = enemy;
    obj.iphash = await getHash(await getIP());

    await saveconfig(obj);
    if(obj == undefined)return;

    LastSavedTime = new Date(obj.LastSavedTime);
    return LastSavedFileData;
}

//あざす https://zenn.dev/batton/articles/c84a99913b5430
async function getHash(message) {
    // const encoder = new TextEncoder();
    // const data = encoder.encode(message);
    // const hash = await crypto.subtle.digest('SHA-256', data);
    // return hash;

    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}

//あざす https://onl.sc/bWZEx2w
async function getIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = response.json;
    return data.ip
}

function calcAngleDegrees(x, y) {
    //あざす https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
    return Math.atan2(y, x) * 180 / Math.PI;
}


function getNearestEnemy(x, y, d) {
    if (typeof d == "undefined") d = false;
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

function getTileID(maplayer = "map1", x, y) {
    if (typeof game.map[maplayer] !== "undefined")
        if (y >= 0 && y < game.map[maplayer].length)
            if (x >= 0 && x < game.map[maplayer][y].length)
                return game.map[maplayer][y][x];


}

function TF(bool, True = "", False = "") {
    if (bool) return True;
    if (!bool) return False;
}

//数字のindex番目取得
function NumberofIndex(num, index, shinsu) {
    if (typeof shinsu == "undefined") shinsu = 10;
    return (String(num.toString(shinsu))[index]);
}

//アニメーションいろいろ(0～1)
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

function replaceTile(id, maplayer, x, y) {
    game.map[maplayer][y][x] = id;
    return id;
}

function changeHitbox(bool, x, y) {
    game.map["hitbox"][y][x] = bool;
    return bool;
}

//当たり判定
function hitbox(x, y) {
    if (getTileID("hitbox", Math.floor(x / 16 + 0), Math.floor(y / 16 + 0))) return true;
    if (getTileID("hitbox", Math.floor(x / 16 + 0.95), Math.floor(y / 16 + 0))) return true;
    if (getTileID("hitbox", Math.floor(x / 16 + 0), Math.floor(y / 16 + 0.95))) return true;
    if (getTileID("hitbox", Math.floor(x / 16 + 0.95), Math.floor(y / 16 + 0.95))) return true;

    return false;
}

function hitbox_rect(ax, ay, aw, ah, bx, by, bw, bh, color) {
    //あざす https://yttm-work.jp/collision/collision_0002.html
    if (typeof color == "undefined") color = "black";

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

function hitbox_reci(ax, ay, aw, ah, bx, by, bw, bh, color) {
    if (typeof color == "undefined") color = "black";

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

function hitbox_enemy_rect(ax, ay, aw, ah, color) {
    if (typeof color == "undefined") color = "black";

    let hit = new Array();

    for (const i in enemy) {
        let enemy_hitbox_x = get_enemy_data(i, "width");
        let enemy_hitbox_y = get_enemy_data(i, "height");
        if (hitbox_rect(enemy[i].x, enemy[i].y, enemy_hitbox_x, enemy_hitbox_y, ax, ay, aw, ah, color)) hit.push(i * 1);
    }

    return hit;
}

function hitbox_rema(ax, ay, aw, ah, color, checktile, maplayer) {
    if (typeof color == "undefined") color = "black";

    let x = Math.round(ax / 16);
    let y = Math.round(ay / 16);

    let hit = new Array();

    for (let ix = 0; ix < Math.ceil(aw / 16); ix++) {
        for (let iy = 0; iy < Math.ceil(ah / 16); iy++) {

            debug_hitbox_push((x + ix) * 16, (y + iy) * 16, 16, 16, color);

            let TileID = getTileID(maplayer, x + ix, y + iy)

            if (typeof checktile == "undefined") hit.push([(x + ix), (y + iy), TileID]);
            if (typeof checktile != "undefined" && !Array.isArray(checktile)) if (checktile == TileID) hit.push([(x + ix), (y + iy), TileID]);
            if (typeof checktile != "undefined" && Array.isArray(checktile)) if (checktile.includes(TileID)) hit.push([(x + ix), (y + iy), TileID]);
        }
    }
    return hit;
}

function player_proc() {

    if (IsLoading) return;
    if (canPlayerMoveForOpenGui()) player_move_proc();
    player_attack()

    mapchange_proc()

    for (const i in players) {

        //ダメージクールダウンの処理
        players[i].damage_cooldown--;

        player_knockback_move(i);

    }

    if ([player.x, player.y] != [player.movelog[0], player.movelog[1]]) player.movelog.unshift([player.x, player.y]);
}

function player_move_proc() {

    if (player.canRotate && (!key_groups.attack || config.canrotateonattacking)) rotate();

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
                enemy_damage(hit_enemy[j], player.weapon.attack, players[i].rotatex, players[i].rotatey);
            }

            //岩壊す
            let breaks = hitbox_rema(players[i].weapon.x - 8, players[i].weapon.y - 8, 32, 32, "red", game.breakableTile, "map1");
            for (let i in breaks) {
                //console.log(breaks[0])
                if (game.breakableTileAbout[breaks[i][2]].breakProbability > Math.random()) {
                    replaceTile(game.breakableTileAbout[breaks[i][2]].becomeTile, "map1", breaks[i][0], breaks[i][1]);
                    changeHitbox(false, breaks[i][0], breaks[i][1]);
                    createParticle(breaks[i][0] * 16 + 8, breaks[i][1] * 16 + 8, 2, 8);
                }

                createParticle(breaks[i][0] * 16 + 8, breaks[i][1] * 16 + 8, 2, 0.2);
            }


            //オートエイム
            if (players[i].weapon.timer <= 12 && (hit_enemy.length == 0 || !game.weapon_canlock) && config.weapon_auto_aiming) {
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
function rotate() {
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

function mapchange_proc() {
    for (const i in game.map.warp) {
        if (hitbox_rect(game.map.warp[i].x * 16, game.map.warp[i].y * 16, 16, 16, player.x, player.y, 16, 16)) mapchange(game.map.warp[i].to.mapID, game.map.warp[i].to.x * 16, game.map.warp[i].to.y * 16);
        if (IsLoading) break;
    }
}

async function mapchange(ID, x, y, loadonly = false) {

    IsLoading = true;
    await getJson(game.map_path[ID], "Map");
    await getJson(game.map_path[ID] + "meta", "MapMeta");
    player.mapID = ID;

    if (!loadonly) {
        enemy.splice(0, Infinity);

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

function get_text(i) {
    if (typeof game.lang[i] == "string") return game.lang[i];
    if (typeof game.lang[i] != "string") return i;

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

function enemy_damage(i, damage, rx, ry) {
    //クールダウン判定
    if (enemy[i].damage_cooldown > 0) return false;

    //敵対処理
    enemy[i].attack.hostility = true
    enemy[i].attack.timer = 1000;

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
        if (enemy[i].hp <= 0) createParticle(enemy[i].x, enemy[i].y, 0, 5);

        if ((getDistance(player.x, player.y, enemy[i].x, enemy[i].y) > 256 && !enemy[i].attack.hostility) ||
            enemy[i].hp <= 0) {
            enemy.splice(i, 1);
        }
    }
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
    let ID = getTileID("enemy", x, y);
    if (ID == 0 || typeof ID != "number") return;

    //敵が既にスポーンされてないか調べる
    for (const i in enemy) {
        if (enemy[i].sp[0] == x && enemy[i].sp[1] == y) return;
    }
    enemy.push(new Enemy(x, y, ID));

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
            "lifetime": Random(loadedjson.particle[id].lifetime[0], loadedjson.particle[id].lifetime[1]),
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
        ctx.strokeRect((debug.hitboxes[i].a - player.scrollx) * zoom, (debug.hitboxes[i].b - player.scrolly) * zoom, debug.hitboxes[i].c * zoom, debug.hitboxes[i].d * zoom);
    }
    debug.hitboxes.splice(0);


    //文字描画
    {
        let draw_text_debug = [
            `FPS:${fps}`,
            `m:${MainProcTime}ms`,
            `t:${timer}`,
            `e:${enemy.length}`,
            `p:${particle.length}`

        ]

        draw_texts(draw_text_debug, 0, 140)
    }

    {
        let draw_text_debug = [
            `x:${player.x}(${Math.floor(player.x / 16)})`,
            `y:${player.y}(${Math.floor(player.y / 16)})`,

        ]

        draw_texts(draw_text_debug, 64, 0)
    }
    draw_text("dc:" + debug.camx + "," + debug.camy, 0, 24);



    for (let i = 0, j = 0; i < keys.length; i++) {
        if (keys[i].press) {
            draw_text(String.fromCharCode(i), 78 * 4, j * 8);
            draw_text(`${i}`, 74 * 4, j * 8);
            j++;
        }
    }

    let px = 0, dx = 0;
    for (const key in key_groups) {
        if (key_groups[key]) {
            draw_text(key.slice(0, 2), 68 * 4, px * 8);
            px++;
        }
        if (key_groups_down[key]) {
            draw_text(key.slice(0, 2), 64 * 4, dx * 8);
            dx++;
        }
    }


    //敵描画
    for (const i in enemy) {
        draw_text(enemy[i].hp.toString(), enemy[i].x - player.scrollx, enemy[i].y - player.scrolly - 16);
        draw_text(i.toString(), enemy[i].x - player.scrollx, enemy[i].y - player.scrolly - 8);
    }

    //about debug
    if (debug.about_visible) {
        //player
        if (document.getElementById("debugtype").selectedIndex == 0) {
            let id = document.getElementById("debugplayerid").value
            if (id >= players.length) id = players.length - 1;

            draw_text("players" + id, 128 + 64, 0);
            let j = 0;
            for (const key in players[id]) {
                j++;
                let keyname = (key + "    ").slice(0, 4) + ("    " + key).slice(-1, 4);
                draw_text(keyname + ":" + players[id][key], 128 + 64, j * 8 + 8);
            }
        }

        //enemy
        if (document.getElementById("debugtype").selectedIndex == 1) {
            let id = document.getElementById("debugplayerid").value;
            if (id >= enemy.length - 1) id = enemy.length - 1;

            draw_text("enemy" + id, 128 + 64, 0);
            let j = 0;
            for (const key in enemy[id]) {
                j++;
                let keyname = (key + "    ").slice(0, 4) + ("    " + key).slice(-1, 4);
                draw_text(keyname + ":" + enemy[id][key], 128 + 64, j * 8 + 8);
            }

            ctx.strokeStyle = "red";
            if (id < enemy.length - 1) ctx.strokeRect((enemy[id].x - player.scrollx) * zoom, (enemy[id].y - player.scrolly) * zoom, get_enemy_data(id, "width") * zoom, get_enemy_data(id, "height") * zoom);
        }
    }

    //タッチデバック
    debug_draw_touch();

}

function debug_hitbox_push(a, b, c, d, color) {
    if (typeof color == "undefined") color = "black";

    if (!debug.hitbox_visible) return
    if (!debug.text_visible) return

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
        draw_text("" + i + touchtime[i], touchpos[i].x / zoom, touchpos[i].y / zoom)
    }
}

function draw_text(text, textx, texty, textwidth, textheight, font = "") {

    for (let i = 0, at = 0, offsetx = 0, offsety = 0; at < text.length; i++) {

        //改行
        if (text.charAt(at) == "\n") {
            offsety++;
            offsetx = 0;
        }

        if (text.charAt(at).match(/^(\n|\r|\t|\b|\f|\v|\0)$/) != null) at++;

        //描画
        if (at <= text.length) draw_font(text.charAt(at), (textx + offsetx * 8), (texty + offsety * 8), font);

        //桁
        at++;

        //X上げる
        offsetx++;


        //自動改行
        if (typeof textwidth != 'undefined' && textwidth < offsetx) {
            offsety++;
            offsetx = 0;
        }
        //はみ出し判定
        if (typeof textwidth != 'undefined' && textheight < offsety) {
            return "over height";
        }
    }
    return undefined;
}

function draw_font(text, textx, texty, font = "") {
    let codeP = ("0000" + text.charCodeAt(0).toString(16)).slice(-4);
    let fontimg = img.font["uni_" + NumberofIndex(codeP, 0, 16) + NumberofIndex(codeP, 1, 16) + font]

    if (fontimg == undefined) return;

    ctx.drawImage(fontimg, parseInt(NumberofIndex(codeP, 3, 16), 16) * 8, parseInt(NumberofIndex(codeP, 2, 16), 16) * 8, 8, 8, textx * zoom, texty * zoom, 8 * zoom, 8 * zoom);

}

function draw_texts(text, x, y) {

    for (const i in text) {
        draw_text(text[i], x, i * 8 + y)
    }
}

function draw_icon(i, x, y) {
    let id = loadedjson.icons[i]
    ctx.drawImage(img.gui_icons, id % 8 * 8, Math.floor(id / 8) * 8, 8, 8, x * zoom, y * zoom, 8 * zoom, 8 * zoom);

}

function draw_prompt(dx, dy, dw, dh, img) {
    //numlockごみ
    ctx.drawImage(img, 0, 0, 8, 8, (dx - 8) * zoom, (dy - 8) * zoom, 8 * zoom, 8 * zoom);
    ctx.drawImage(img, 8, 0, 8, 8, dx * zoom, (dy - 8) * zoom, dw * zoom, 8 * zoom);
    ctx.drawImage(img, 16, 0, 8, 8, (dx + dw) * zoom, (dy - 8) * zoom, 8 * zoom, 8 * zoom);


    ctx.drawImage(img, 0, 8, 8, 8, (dx - 8) * zoom, dy * zoom, 8 * zoom, dh * zoom);
    ctx.drawImage(img, 16, 8, 8, 8, (dx + dw) * zoom, dy * zoom, 8 * zoom, dh * zoom);


    ctx.drawImage(img, 0, 16, 8, 8, (dx - 8) * zoom, (dy + dh) * zoom, 8 * zoom, 8 * zoom);
    ctx.drawImage(img, 8, 16, 8, 8, dx * zoom, (dy + dh) * zoom, dw * zoom, 8 * zoom);
    ctx.drawImage(img, 16, 16, 8, 8, (dx + dw) * zoom, (dy + dh) * zoom, 8 * zoom, 8 * zoom);

    ctx.drawImage(img, 8, 8, 8, 8, dx * zoom, dy * zoom, dw * zoom, dh * zoom);
}

function draw_under_page_scroll(x, y) {

    draw("gui_under_page_scroll", x, y);
    draw("gui_under_page_left", x + 2 * 8, y + 8);
    draw("gui_under_page_right", x + 13 * 8, y + 8);
}

function draw_hp(p, x, y) {
    ctx.drawImage(img.gui, 0, 0, 11, 3, (x - 1) * zoom, (y - 1) * zoom, 11 * zoom, 3 * zoom);
    ctx.drawImage(img.gui, 0, Math.floor(p * 9 + 3), 9, 1, x * zoom, y * zoom, 9 * zoom, 1 * zoom);
}


function game_draw() {

    //タイル描画
    draw_tiles("map1");

    //アニメーション
    player_animation();

    //一応残してる　できるだけ使わないこと
    player.drawx = player.x - player.scrollx;
    player.drawy = player.y - player.scrolly;

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
    ctx.drawImage(img[t.img], t.atlas[0], t.atlas[1], t.atlas[2], t.atlas[3], Math.round(x) * zoom, Math.round(y) * zoom, t.atlas[2] * zoom, t.atlas[3] * zoom);
}

function draw_player() {

    //プレイヤー描画
    for (const i in players) {
        ctx.drawImage(img.players, player.anim * 16, player.facing * 32, 16, 24, subplayerdrawx(i) * zoom, (subplayerdrawy(i) - 8) * zoom, 16 * zoom, 24 * zoom);
    }
}

function draw_npc() {

    //プレイヤー描画
    for (const i in npc) {
        ctx.drawImage(img.players, 0, 0, 16, 24, (npc[i].x - player.scrollx) * zoom, (npc[i].y - player.scrolly - 8) * zoom, 16 * zoom, 24 * zoom);
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

            //                                        v#アニメーション速度# 
            //                                             v#フレーム数#
            let weapon_rotation = Math.floor((timer / 1) % 8)

            draw_weapon(weapon_rotation, players[i].weapon.x - player.scrollx, players[i].weapon.y - player.scrolly);
            draw_sweep(weapon_rotation, players[i].weapon.x - player.scrollx, players[i].weapon.y - player.scrolly);

            //draw_weapon(weapon_rotation, 180 - player.scrollx, 180 - player.scrolly);
            //draw_sweep(weapon_rotation, 180 - player.scrollx, 180 - player.scrolly);
        }
    }
}

function draw_weapon(rotate, x, y) {

    ctx.drawImage(img.item_model, weapon.atlas[rotate][0], weapon.atlas[rotate][1], weapon.atlas[rotate][2], weapon.atlas[rotate][3], (x + weapon.offset[rotate][0]) * zoom, (y + weapon.offset[rotate][1]) * zoom, weapon.atlas[rotate][2] * zoom, weapon.atlas[rotate][3] * zoom);

}

function draw_sweep(rotate, x, y) {

    let weapon_offset = {
        //<$調整$    斜めの時の位置調整                    #斜め検知# ><$調整$>< エフェクトの円周の大きさ調整       $大きさ$>
        "x": (4 * Math.sign(game.rotate_pos[rotate][0]) * (rotate % 2)) - 8 + (Math.sign(game.rotate_pos[rotate][0]) * 1),
        "y": (4 * Math.sign(game.rotate_pos[rotate][1]) * (rotate % 2)) - 8 + (Math.sign(game.rotate_pos[rotate][1]) * 1)
    };

    ctx.drawImage(img.sweep, rotate * 32, 0, 32, 32, (x + weapon_offset.x) * zoom, (y + weapon_offset.y) * zoom, 32 * zoom, 32 * zoom);

    //draw_text(`${weapon_offset.x}\n${weapon_offset.y}`,x,y+16)
}

function player_animation() {

    //プレイヤー画像指定
    if (!player.moving) {
        player.anim = 2;
    }
    else {
        if (Math.floor(player.moveTimer % 4) == 0) player.anim = 0;
        if (Math.floor(player.moveTimer % 4) == 1) player.anim = 2;
        if (Math.floor(player.moveTimer % 4) == 2) player.anim = 1;
        if (Math.floor(player.moveTimer % 4) == 3) player.anim = 2;
    }

}

function draw_tiles(maplayer) {

    let plx = Math.floor(player.scrollx / 16);
    let ply = Math.floor(player.scrolly / 16);

    for (let y = 0; y < 13; y++) {
        for (let x = 0; x < 21; x++) {
            let tileID = getTileID(maplayer, x + plx, y + ply);
            ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, (x * 16 + (16 - player.scrollx % 16) - 16) * zoom, (y * 16 + (16 - player.scrolly % 16) - 16) * zoom, 16 * zoom, 16 * zoom);

        }
    }
}

function draw_enemy() {

    for (const i in enemy) {
        let t = enemy[i];

        let anim = Math.sin(enemy[i].attack_anim.tick / 20 * game.PI);

        if (t.id == 1) ctx.drawImage(img.enemy, slime_animation(i)[0], slime_animation(i)[1], 16, 16, (t.x - player.scrollx) * zoom, (t.y - player.scrolly - anim * 16) * zoom, 16 * zoom, 16 * zoom);
        if (t.id == 2) ctx.drawImage(img.enemy, 0, 16, 16, 32, (t.x - player.scrollx) * zoom, (t.y - player.scrolly) * zoom, 16 * zoom, 32 * zoom);

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

    return [x * 16, y * 16]
}

function draw_particle() {

    for (const i in particle) {
        let t = particle[i];
        if (t.id == 0) ctx.drawImage(img.particle, Math.floor(t.tick / t.lifetime * 8) * 16, 0, 16, 16, (t.x - player.scrollx + particle_death_offset(i)[0]) * zoom, (t.y - player.scrolly + particle_death_offset(i)[1]) * zoom, 16 * zoom, 16 * zoom);
        if (t.id == 1) ctx.drawImage(img.particle, 0, 16, 16, 16, (t.x - player.scrollx + t.varix * 16 * make_scatter_animation(t.tick / t.lifetime)) * zoom, (t.y - player.scrolly - make_jump_animation(t.tick / t.lifetime * 2) * 4) * zoom, 16 * zoom, 16 * zoom);
        if (t.id == 2) ctx.drawImage(img.particle, 16, 16, 16, 16, (t.x - player.scrollx + t.varix * 16 * make_scatter_animation(t.tick / t.lifetime)) * zoom, (t.y - player.scrolly - make_jump_animation(t.tick / t.lifetime * 2) * 4) * zoom, 16 * zoom, 16 * zoom);
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
        ctx.drawImage(img.gui_menu, players[i].id * 8, 48, 8, 8, 8 * zoom, (i * 8 + 1 * 8) * zoom, 8 * zoom, 8 * zoom);
        ctx.drawImage(img.gui_menu, 0, 32, 16, 8, 16 * zoom, (i * 8 + 1 * 8) * zoom, 16 * zoom, 8 * zoom);
        draw_text(players[i].hp + "", 32, (i * 8 + 1 * 8));
    }

    //メッセージ描画
    if (message.visible) {
        draw_prompt(5 * 8, 13 * 8, 32 * 8, 8 * 8, img.gui_message);
        draw_text(message.text, 40, 104, 31);
    }

    //メニュー描画
    if (menu.visible) {
        ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (5 * 8 - 4) * zoom, (3 * 8 - 4) * zoom, 64 * zoom, 32 * zoom);
        ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (13 * 8 - 4) * zoom, (3 * 8 - 4) * zoom, 64 * zoom, 32 * zoom);
        ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (21 * 8 - 4) * zoom, (3 * 8 - 4) * zoom, 64 * zoom, 32 * zoom);
        ctx.drawImage(img.gui_tab, 0, 0, 64, 32, (29 * 8 - 4) * zoom, (3 * 8 - 4) * zoom, 64 * zoom, 32 * zoom);

        draw_prompt(5 * 8, 5 * 8, 32 * 8, 16 * 8, img.gui_prompt);

        ctx.drawImage(img.gui_tab, game.tab_offset[menu.tab], menu.tab_select * 32 + 32, 64, 32, ((5 + 8 * menu.tab) * 8 - 4) * zoom, (3 * 8 - 4) * zoom, 64 * zoom, 32 * zoom);

        //タブテキスト描画
        draw_icon("party", 5 * 8, 3 * 8);
        draw_text(get_text("menu.tab.party"), 6 * 8, 3 * 8);
        draw_icon("items", 13 * 8, 3 * 8);
        draw_text(get_text("menu.tab.items"), 14 * 8, 3 * 8);
        draw_icon("equip", 21 * 8, 3 * 8);
        draw_text(get_text("menu.tab.equip"), 22 * 8, 3 * 8);
        draw_icon("config", 29 * 8, 3 * 8);
        draw_text(get_text("menu.tab.config"), 30 * 8, 3 * 8);

        //party
        if (menu.tab === 0) {
            ctx.drawImage(img.players, 0, 0, 16, 16, 5 * 8 * zoom, 5 * 8 * zoom, 16 * zoom, 16 * zoom);
            draw("hp", 5 * 8, 8 * 8);
            draw_text(players[0].hp + "", 7 * 8, 8 * 8);
        }

        //items
        if (menu.tab === 1) {
            for (let i in player.items.slice(menu.scroll, menu.scroll + 8)) {
                draw_gui_item(40, 5 * 8 + i * 16, Number(i) + menu.scroll);
            }
            draw_scroll_bar(18 * 16, 6 * 8, menu.scroll / Math.max(menu.scroll, player.items.length - 8), 128 - 16);
        }

        //equip
        if (menu.tab === 2) {

        }

        //config
        if (menu.tab === 3) {
            //右のリスト
            //config
            if (menu.system_select === 0) {
                let configs = loadedjson.configs.configs;

                let func = (
                    function (i) {
                        if (config[configs[i].variable]) draw("switch_on", 33 * 8, i * 16 + 5 * 8);
                        if (!config[configs[i].variable]) draw("switch_off", 33 * 8, i * 16 + 5 * 8);
                        if (configs[i].default == config[configs[i].variable]) draw_font("D", 35 * 8, i * 16 + 5 * 8);
                    }
                )
                draw_gui_items(loadedjson.configs.configs, "name", 14 * 8, 5 * 8, 25, 8, 16, func)
            }

            //data
            if (menu.system_select === 1) {
                draw_gui_items(game.gui_system_data_items, false, 14 * 8, 5 * 8, 25, 2, 16);

                let [savepath, savename, SavedTime] = ["???", "???", "???"];
                if (typeof LastSavedFileData !== "undefined") savename = LastSavedFileData.name;

                if (typeof dirHandle !== "undefined" && typeof LastSavedFileData !== "undefined")
                    savepath = slice(dirHandle.name, 5) + "/" + LastSavedFileData.name;

                if (typeof LastSavedTime !== "undefined") SavedTime = LastSavedTime.toLocaleString();


                if(game.saveloadfaliedtime+game.PopUpDelay>timer )
                draw_text(get_text("menu.loadfailed.type"+game.saveloadfaliedtype), 14 * 8, 18 * 8);

                draw_text(get_text("menu.LastSavedTime") + SavedTime, 14 * 8, 19 * 8);

                draw_text(get_text("menu.saved") + savepath, 14 * 8, 20 * 8, 22);
            }

            //左のリスト
            draw_gui_items(game.gui_system_items, false, 6 * 8, 5 * 8, 25, 2, 16);

            //縦線
            ctx.drawImage(img.gui_prompt_more, 0, 0, 8, 8, 12 * 8 * zoom, 4 * 8 * zoom, 8 * zoom, 8 * zoom);
            ctx.drawImage(img.gui_prompt, 0, 8, 8, 8, 12 * 8 * zoom, 5 * 8 * zoom, 8 * zoom, 16 * 8 * zoom);
            ctx.drawImage(img.gui_prompt_more, 0, 8, 8, 8, 12 * 8 * zoom, 21 * 8 * zoom, 8 * zoom, 8 * zoom);

        }




        //カーソル//
        let select_y_size = game.select_y_size[menu.tab];
        //タブ
        cursor.push([menu.tab * 64 + 4 * 8, 3 * 8]);

        if (!menu.tab_select) {
            /*アイテム*/
            if (menu.tab != 3) cursor.push([5 * 8, (menu.item_select - menu.scroll) * select_y_size + 5 * 8]);

            /*右*/if (menu.tab == 3) /*_________________*/cursor.push([5 * 8, (menu.system_select - menu.scroll) * select_y_size + 5 * 8]);
            /*左*/if (menu.tab == 3 && menu.system_right) cursor.push([13 * 8, (menu.item_select - menu.scroll) * select_y_size + 5 * 8]);
        }



    }

    //誰が使いますか
    if (menu.role_select) {

        draw_prompt(10 * 8, 10 * 8, 7 * 8, 7 * 8, img.gui_prompt);
        draw_text(get_text("menu.item_use.who_use"), 10 * 8, 10 * 8);

        for (const i in players) {
            ctx.drawImage(img.gui_menu, players[i].id * 8, 48, 8, 8, 10 * 8 * zoom, (11 * 8 + i * 8) * zoom, 8 * zoom, 8 * zoom);
            ctx.drawImage(img.gui_menu, 0, 32, 16, 8, 11 * 8 * zoom, (11 * 8 + i * 8) * zoom, 16 * zoom, 8 * zoom);
            draw_text(players[i].hp + "", 13 * 8, (11 * 8 + i * 8));
        }
    }

    //メッセージ描画
    if (window_confirm.visible) {
        let it = window_confirm;
        draw_prompt(it.pos.x, it.pos.y, 8 * 8, 8 * 8, img.gui_prompt);
        draw_text(it.text, pos.x, pos.y, 7);
        cursor.push([it.pos.x + 32 - it.selected * 32, it.pos.y + 64 - 16])
    }


    //カーソル描画//
    {
        if (menu.CursorNeedUpdate) {
            menu.CursorNeedUpdate = false;
            menu.CursorOldPos.x = cursor[cursor.length - 1][0];
            menu.CursorOldPos.y = cursor[cursor.length - 1][1];
        }

        if (cursor.length !== 0) {
            menu.CursorOldPos.x += (cursor[cursor.length - 1][0] - menu.CursorOldPos.x) / 2;
            menu.CursorOldPos.y += (cursor[cursor.length - 1][1] - menu.CursorOldPos.y) / 2;
        }

        for (let i in cursor) {
            if (i != cursor.length - 1) draw("cursor_uns", cursor[i][0], cursor[i][1]);

            if (i == cursor.length - 1) draw("cursor", menu.CursorOldPos.x, menu.CursorOldPos.y);
        }
    }
    //タッチボタン描画
    draw_touch_button();

}


function draw_gui_item(x, y, i) {
    //console.log(i)
    //アイテムの名前描画
    draw_text(get_text("item." + get_item_data(i, "name") + ".name"), 8 * 3 + x, y);

    let count_offset = 13 * 8;
    draw_text(" x", x + count_offset, y);
    draw_text(player.items[i].count + "", x + count_offset + 2 * 8, y, undefined, undefined, "_purple");

    ctx.drawImage(img.items, getTileAtlasXY(player.items[i].id, 0), getTileAtlasXY(player.items[i].id, 1), 16, 16, 24 + x * zoom, y * zoom, 16 * zoom, 16 * zoom);

    if (get_item_data(i, "efficacy") == "health") {
        draw("gui_item_text_health", 3 * 8 + x, y + 8);
        draw_text(get_item_data(i, "heal_power") + "", 7 * 8 + x, y + 8, undefined, undefined, "_purple");
    }
}

function draw_scroll_bar(x, y, p = 0, height = 64) {
    if (isNaN(p)) p = 0;

    ctx.drawImage(img.gui_scroll_bar, 0, 0, 8, 1, x * zoom, y * zoom, 8 * zoom, 1 * zoom);
    ctx.drawImage(img.gui_scroll_bar, 0, 1, 8, 1, x * zoom, 2 + y * zoom, 8 * zoom, -2 + height * zoom);
    ctx.drawImage(img.gui_scroll_bar, 0, 7, 8, 1, x * zoom, (y + height - 1) * zoom, 8 * zoom, 1 * zoom);

    draw("scroll_bar", x, y + (height - 8) * p)

    //デバッグ
    if (debug.text_visible) draw_text("p:" + p, 128, 32);
}

function draw_gui_config() {
    let configs = loadedjson.configs.configs;

    let func = (
        function (i) {
            if (config[configs[i].variable]) draw("switch_on", 33 * 8, i * 16 + 5 * 8);
            if (!config[configs[i].variable]) draw("switch_off", 33 * 8, i * 16 + 5 * 8);
            if (configs[i].default == config[configs[i].variable]) draw_font("D", 35 * 8, i * 16 + 5 * 8);
        }
    )
    draw_gui_items(loadedjson.configs.configs, "name", 14 * 8, 5 * 8, 25, 8, 16, func);

}

function draw_gui_items(array, a = false, x, y, w, h, s = 8, func = () => { }) {
    for (const i in array) {
        if (!a) draw_text(get_text(array[i]), x, i * s + y, w, h);
        if (a) draw_text(get_text(array[i][a]), x, i * s + y, w, h);
        func(i);
    }
}

function gui_proc() {

    if (game.saveloadingnow) return;

    if (IsLoading) {
        gui_close();
        return;
    }

    //メッセージ消す
    if (key_groups_down.confirm) gui_close("message");

    //メニュー表示 非表示
    if (key_groups_down.menu) {
        if (menu.visible) {
            gui_close("menu");
        } else {
            gui_open("menu");
        }
    }

    //承認ウィンドウ
    if (window_confirm.visible) {
        if (key_groups_down.right) window_confirm.selected = false;
        if (key_groups_down.left) window_confirm.selected = true;

        if (key_groups_down.down || key_groups_down.confirm) {
            if (window_confirm.selected) window_confirm.func_ok();
            if (!window_confirm.selected) window_confirm.func_cancel();
            gui_close("confirm");
            return;
        }
        if (key_groups_down.cancel || key_groups_down.menu) {
            window_confirm.func_cancel();
            gui_close("confirm");
            return;
        }
        return;
    }

    let scroll_limit = Infinity;

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
        //コンフィグ変更
        if (menu.system_right && menu.system_select == 0) config_change_proc();
        if (menu.system_right && menu.system_select == 1) save_load_proc();


        if (menu.system_right) {
            if ((key_groups_down.left || key_groups_down.cancel || (key_groups_down.up && menu.item_select == 0)) && !menu.tab_select) {
                menu.system_right = false;
                menu.item_select = menu.system_select;

                return;
            }
        } else {
            if (!menu.tab_select) menu.system_select = menu.item_select;
            if ((key_groups_down.right || key_groups_down.confirm) && !menu.tab_select) {
                menu.system_right = true;
                menu.system_select = menu.item_select;
                menu.item_select = 0;

                return;
            }
        }

    }

    //メニュー動作
    if (menu.visible && !menu.role_select) {
        let count = game.gui_item_count[menu.tab];

        if (menu.tab_select) {//カーソル上
            //タブの動き
            if (key_groups_down.right && menu.tab < 3) menu.tab++;
            if (key_groups_down.left && menu.tab > 0) menu.tab--;

            //　　　　　　　　　　　　　　　　　　　　　　　　　      　　　アイテムタブ　　設定タブ　　　　カーソルを下にずらす
            if ((key_groups_down.confirm || key_groups_down.down) && (menu.tab == 1 || menu.tab == 3)) menu.tab_select = false

            //メニュー閉じる
            if (key_groups_down.cancel) {
                menu.visible = false;
            }
            return;

        } else {//カーソル下
            //カーソルを上にずらす
            if (key_groups_down.up && menu.item_select == 0 && !menu.system_right) menu.tab_select = true;
            //if (key_groups_down.up && menu.item_select == 0 && menu.system_right) menu.system_right=false;

            //アイテムセレクト上下
            if (key_groups_hold.down && menu.scroll <= count) menu.item_select++;
            if (key_groups_hold.up && menu.scroll >= 0) menu.item_select--;

            if (menu.item_select - menu.scroll > count && menu.scroll < scroll_limit) menu.scroll++;
            if (menu.item_select - menu.scroll < 0 && menu.scroll > 0) menu.scroll--;

            if (menu.item_select - menu.scroll > count) menu.item_select--;
            if (menu.item_select - menu.scroll < 0) menu.item_select++;

            //カーソルを上にずらす(閉じる)
            if (key_groups_down.cancel) {
                menu.item_select = 0;
                menu.tab_select = true
            }
            return;
        }
    }

    if (menu.role_select) {
        //誰が使うか閉じる
        if (key_groups_down.cancel) {
            menu.role_select = false;

            return;
        }
    }

}

function gui_close(input) {
    if (!Array.isArray(input)) input = [input];//配列にする
    let all = false;
    if (typeof input === "undefined") all = true;//undefinedならall

    if (input.includes("menu") || all) {
        menu.visible = false;
        //誰が使いますか画面も閉じる
        menu.role_select = false;

        menu.item_select = 0;
        menu.system_right = false;
        menu.system_select = 0;
        menu.role_select = 0;
        menu.tab_select = true;
    }
    if (input.includes("message") || all) {
        message.visible = false;
    }
    if (input.includes("confirm") || all) {
        window_confirm.visible = false;
    }
}

function gui_open(input) {
    if (!Array.isArray(input)) input = [input];//配列にする

    if (input.includes("menu")) {
        menu.visible = true;
        menu.CursorOldPos.x = 0;
        menu.CursorOldPos.y = 24;
    }
    if (input.includes("message")) {
        message.visible = true;
        message.text = "text";
        console.log('gui_open("message")is not recommended')
    }
    if (input.includes("confirm")) {
        let conf = window_confirm;
        conf.visible = true;
    }
}

//メッセージを表示する
function messageView(text) {
    //console.log(text);
    message.visible = true;
    message.text = text;

}

//ウィンドウを表示する
function confirmView(text = "text", title = "title", x = 0, y = 0, func_ok = () => { }, func_cancel = () => { }) {
    //console.log(text);
    window_confirm.visible = true;
    window_confirm.text = text;
    window_confirm.title = title;
    window_confirm.pos.x = x;
    window_confirm.pos.y = y;
    window_confirm.func_ok = func_ok;
    window_confirm.func_cancel = func_cancel;

}
function canPlayerMoveForOpenGui() {
    if (message.visible) return false;
    if (menu.visible) return false;
    if (window_confirm.visible) return false;

    return true;
}

function item_use_proc() {
    if (menu.visible && !menu.tab_select && (key_groups_down.confirm || key_groups_down.right) && menu.item_select <= player.items.length - 1 && menu.tab == 1) {

        //誰が使いますか画面を出す
        if (get_item_data(menu.item_select, "role_select") && !menu.role_select) {
            menu.role_select = true;
            return;
        }

        //アイテム使用
        if (!get_item_data(menu.item_select, "role_select") || menu.role_select) {
            if (!get_item_data(menu.item_select, "role_select")) menu.who_use = 0;

            item_use(menu.item_select);
        }
        menu.role_select = false;

        //アイテムの数を減らす
        player.items[menu.item_select].count--;
        //アイテムの数が0だったら消す
        if (player.items[menu.item_select].count == 0) player.items.splice(menu.item_select, 1);
    }
}

async function save_load_proc() {
    if (menu.visible && !menu.tab_select && (key_groups_down.confirm || key_groups_down.right) && menu.tab == 3 && menu.system_right) {
        game.saveloadingnow = true;
        let result;

        if (menu.item_select === 0) result = await savedatawrite();
        if (menu.item_select === 1) result = await savedataload()
        if (menu.item_select === 2) result = await savepathselect();
        if (menu.item_select === 3) result = await savedataload()
        if (menu.item_select === 4) result = await savepathselect();
        //failed
        if(result == undefined){
            game.saveloadfaliedtime=timer;
            game.saveloadfaliedtype=menu.item_select;
        }

        game.saveloadingnow = false;
    }

}

function item_use(i) {//i = itemselectINDEX

    if (get_item_data(i, "efficacy") == "health") player_heal(menu.who_use, get_item_data(i, "heal_power"));
}

function config_change_proc() {
    if (menu.visible && !menu.tab_select && (key_groups_down.confirm || key_groups_down.right) && menu.item_select <= loadedjson.configs.configs.length - 1 && menu.tab == 3) {
        let configvar = loadedjson.configs.configs[menu.item_select].variable;
        config[configvar] = !config[configvar];
        //console.log(configvar)
    }
}

