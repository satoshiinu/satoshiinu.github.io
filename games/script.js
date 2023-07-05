 ///////////////////////////////////////////////////
// Copyright 2023 satoshiinu. All rights reserved. //
 ///////////////////////////////////////////////////

//"use strict"

//エラーメッセージ処理
var DoSayErrorMassege = true;
window.onerror = (message, file, lineNo, colNo, error) => {
    if(DoSayErrorMassege) alert("エラーが発生しました\n再読み込みしてください");
}

//画面に表示される時は4倍になるので注意
const zoom = 4;

//その他の変数の作成
var timer = 0;

//デバッグ用の変数の作成
var debug = new Object();
debug.hitbox_visual = true;
debug.hitboxes = new Array();

//プレイヤーの変数の作成
var player = new Object();
player.x = 25 * 16;
player.y = 25 * 16;
player.xspd = 0;
player.yspd = 0;
player.scrollx = player.x + 160;
player.scrolly = player.y + 24;
player.scroll_offsetx = 0;
player.scroll_offsety = 0;
player.image = undefined;
player.anim = 0;
player.rotate = 0;
player.canRotate = true;
player.up = false
player.down = false
player.right = false
player.left = false
player.attack = 0;

//敵の変数の作成
var enemy = new Array();

enemy_spawn(25, 25);
enemy_spawn(25, 26);
enemy_spawn(20, 20);

//キーの変数の作成
var key = new Object();

var keys = new Array();

for (let i = 0; i < 255; i++) {
    keys[i] = {
        "press": false,
        "pressLag": false,
        "down": false,
        "timer": 0,
        "time": -1
    }
}

//キー判定
addEventListener("keyup", keyupfunc);
addEventListener("keydown", keydownfunc);

//画像の設定
var img = new Object();

img.tiles = new Image();
img.tiles.src = "img/tiles.png";

img.players = new Image();
img.players.src = "img/players.png";

img.enemy = new Image();
img.enemy.src = "img/enemy.png";

img.gui = new Object();
img.gui.message = new Image();
img.gui.message.src = "img/gui/message.png";

img.gui.prompt = new Image();
img.gui.prompt.src = "img/gui/prompt.png";


img.font = new Object();

uni = {
    "00" : true
}

for (var i = 0; i < 255; i++) {
    if (uni[('00' + i.toString(16)).slice(-2)]) {
        img.font["uni_" + ('00' + i.toString(16)).slice(-2)] = new Image();
        img.font["uni_" + ('00' + i.toString(16)).slice(-2)].src = "img/font/uni_" + ('00' + i.toString(16)).slice(-2) + ".png";
    }
}


//タイルの設定
var tile_image_list = [img.empty, img.tile, img.tile2];

var tile_collision = [false, true, false, true];

//
const tileAtlas   = [0, 1, 2, 3, 4, 5, 6];
const playerAtlas = [ 0, 1, 2];



//マップ読み込み
var loadedjson = new Object();
loadJson("param/maps/Map.json", "Map");
//console.log("LOADED");

//メッセージ変数作成
var message = new Object;
message.text = "";
message.visible = false;

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



function main() {
    //キャンバスの初期化
    ctx.clearRect(0, 0, 320 * zoom, 180 * zoom);

    //プレイヤーの動作
    player_proc();

    //敵の動作
    if(true) enemy_proc();

    //スクロール座標を取得
    player.scrollx = player.x - 160 + player.scroll_offsetx;
    player.scrolly = player.y - 80 + player.scroll_offsety;
    if (player.scrollx < 0      ) player.scrollx = 0;
    if (player.scrolly < 0      ) player.scrolly = 0;
    if (player.scrollx > 1280) player.scrollx = 1280;
    if (player.scrolly > 1420) player.scrolly = 1420;

    //メッセージ消す
    if (keys[90].time == timer) message.visible = false;


    //タイル描画
    var plx = Math.floor(player.scrollx / 16);
    var ply = Math.floor(player.scrolly / 16);
    for (var y = 0; y < 13; y++) {
        for (var x = 0; x < 21; x++) {
            try {
                var tileID = loadedjson["Map"]["map1"][y + ply][x + plx];
                ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, (x * 16 + (16 - player.scrollx % 16) - 16) * zoom, (y * 16 + (16 - player.scrolly % 16) - 16) * zoom, 16 * zoom, 16 * zoom);
            }
            catch { }
        }
    }

    //プレイヤー画像指定
    if (Math.abs(player.xspd) + Math.abs(player.yspd) < 3) {
        player.anim = 2;
    }
    else {
        if (player.attack > 0) {
            player.anim = 2;
        }
        else {
            if (timer % 50 > 0.00) player.anim = 0;
            if (timer % 50 > 12.5) player.anim = 2;
            if (timer % 50 > 25.0) player.anim = 1;
            if (timer % 50 > 37.5) player.anim = 2;
        }
    }
    //player.image = eval("img.player."+player.rotate+"_"+player.anim);//本当はeval使いたくない

    //プレイヤー描画
    ctx.drawImage(img.players, player.anim * 16, player.rotate * 32, 16, 24, (player.x - player.scrollx) * zoom, (player.y - player.scrolly - 8) * zoom, 16 * zoom, 24 * zoom);


    //敵描画
    for (const i in enemy) {
        ctx.drawImage(img.enemy, 0, 0, 16, 16, (enemy[i]["x"] - player.scrollx) * zoom, (enemy[i]["y"] - player.scrolly) * zoom, 16 * zoom, 16 * zoom);
        //console.log(enemy[i]);
    }    


    //タイル描画2
    for (var y = 0; y < 13; y++) {
        for (var x = 0; x < 21; x++) {
            try {
                var tileID = loadedjson["Map"]["map2"][y + ply][x + plx];
                ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, (x * 16 + (16 - player.scrollx % 16) - 16) * zoom, (y * 16 + (16 - player.scrolly % 16) - 16) * zoom, 16 * zoom, 16 * zoom);
            }
            catch { }
        }
    }

    ctx.strokeStyle = `rgb(
        ${hsv2rgb([timer * 2 % 360, 1, 1])[0]},
        ${hsv2rgb([timer * 2 % 360, 1, 1])[1]},
        ${hsv2rgb([timer * 2 % 360, 1, 1])[2]}`

    ctx.strokeStyle = "black"

    //当たり判定描画
    for (const i in debug.hitboxes) {
        ctx.strokeRect( (debug.hitboxes[i][0] - player.scrollx) * zoom, (debug.hitboxes[i][1] - player.scrolly) * zoom, debug.hitboxes[i][2] * zoom, debug.hitboxes[i][3] * zoom );
        //console.log(debug.hitboxes[i][0] + " " + debug.hitboxes[i][1] + " " + debug.hitboxes[i][2] + " " + debug.hitboxes[i][3]);
        //console.log(debug.hitboxes[i]);
    }
    debug.hitboxes.splice(0);

    debug_proc();

    //メッセージ描画
    if (message.visible) {
        //ctx.drawImage(img.gui.message, 0, 0, 16 * 16, 4 * 16, 32 * zoom, 96 * zoom, 16 * 16 * zoom, 4 * 16 * zoom);
        drawPrompt(5 * 8,13 * 8,32 * 8,8 * 8);
        drawText(message.text,40,104,31);
    }
    
    //console.log("x:" + player.x + ",y:" + player.y + ",xspd:" + player.xspd + ",yspd:" + player.yspd)


    //タイマー
    timer++;
    //ループ
    requestAnimationFrame(main);
}


requestAnimationFrame(main);



function keydownfunc(parameter) {
    var key_code = parameter.keyCode;
    if (keys[key_code].press) keys[key_code].pressLag = true;
    keys[key_code].press = true;
    keys[key_code].timer++;
    if (keys[key_code].press && !keys[key_code].pressLag) keys[key_code].time = timer;
    if (keys[key_code].press && !keys[key_code].pressLag) keys[key_code].down = true;
    parameter.preventDefault();
}

function keyupfunc(parameter) {
    var key_code = parameter.keyCode
    keys[key_code].press = false;
    keys[key_code].pressLag = false;
    keys[key_code].down = false;
    keys[key_code].timer = 0;
}

//プレイヤーの動き
function move_func(mvx, mvy, checkhitbox) {
    for (var i=0 ; i < Math.round(Math.abs(mvx)) ; i++) {
        player.x += Math.sign(mvx);
        if (hitbox(player.x, player.y) && checkhitbox ) player.x -= Math.sign(mvx);
    }
    for (var i=0 ; i < Math.round(Math.abs(mvy)) ; i++) {
        player.y += Math.sign(mvy);
        if (hitbox(player.x, player.y) && checkhitbox ) player.y -= Math.sign(mvy);
    }
}

//当たり判定
function hitbox(x, y) {
    try {
        if (loadedjson["Map"]["hitbox"][Math.floor(y / 16 + 0)][Math.floor(x / 16 + 0)]) return true;
        if (loadedjson["Map"]["hitbox"][Math.floor(y / 16 + 0)][Math.floor(x / 16 + 0.95)]) return true;
        if (loadedjson["Map"]["hitbox"][Math.floor(y / 16 + 0.95)][Math.floor(x / 16 + 0)]) return true;
        if (loadedjson["Map"]["hitbox"][Math.floor(y / 16 + 0.95)][Math.floor(x / 16 + 0.95)]) return true;
    } catch { }
}

//向きを取得
function rotate() {
    player.up = keys[38].press || keys[87].press;
    player.down = keys[40].press || keys[83].press;
    player.right = keys[39].press || keys[68].press;
    player.left = keys[37].press || keys[65].press;
    if ( player.up && !player.down && !player.right && !player.left) player.rotate = 2;
    if (!player.up &&  player.down && !player.right && !player.left) player.rotate = 0;
    if (!player.up && !player.down &&  player.right && !player.left) player.rotate = 3;
    if (!player.up && !player.down && !player.right &&  player.left) player.rotate = 1;
    if ( player.up && !player.down &&  player.right && !player.left) player.rotate = 3;
    if ( player.up && !player.down && !player.right &&  player.left) player.rotate = 1;
    if (!player.up &&  player.down &&  player.right && !player.left) player.rotate = 3;
    if (!player.up &&  player.down && !player.right &&  player.left) player.rotate = 1;
    if (!player.up && !player.down &&  player.right &&  player.left) player.rotate = 0;
    if ( player.up &&  player.down && !player.right && !player.left) player.rotate = 0;
    if ( player.up && !player.down &&  player.right &&  player.left) player.rotate = 2;
    if (!player.up &&  player.down &&  player.right &&  player.left) player.rotate = 0;
    if ( player.up &&  player.down &&  player.right && !player.left) player.rotate = 3;
    if ( player.up &&  player.down && !player.right &&  player.left) player.rotate = 1;
    if ( player.up &&  player.down &&  player.right &&  player.left) player.rotate = 0;
}

function getTileAtlasXY(id, xy) {
    if (xy == 0) return id % 16 * 16
    if (xy == 1) return Math.floor ( id / 16 ) * 16
}

function getPlayerAtlasXY(id, xy) {
    return playerAtlas[id] * 16
}


function hexColour(c) {
    if (c < 256) {
        return Math.abs(c).toString(16);
    }
    return 0;
}

function decColour(c) {
    if (c < 256) {
        return Math.abs(c).toString(10);
    }
    return 0;
}

function setMapData(json,name) {
    //eval("map." + name + " = json"); 
    map.map = json;
    //console.log(map.map);
    //ret = json;
    //return map.map
}

function readMapData(filePath,name) {
    var i = [];
    //console.log(filePath);
    if (filePath.indexof(';') == -1) {

        try {
            fetch(filePath)
                .then((response) => response.json())
                .then((data) => setMapData(data,name));

        }
        catch {
            alert("no");
        }
    } else {
        alert("ファイルパスが不正です");
    }
    //console.log(map.map);
    return map.map;
}

function player_proc() {

    player_move()
    player_attack()

}

function player_move() {

    //移動
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

    if (player.up) player.yspd -= 0.5;
    if (player.down) player.yspd += 0.5;
    if (player.right) player.xspd += 0.5;
    if (player.left) player.xspd -= 0.5;

    //プレイヤー移動
    move_func(player.xspd, player.yspd, true);

    if (player.canRotate) rotate()
}

function player_attack() {

    var weapon_hitbox_x = 6;
    var weapon_hitbox_y = 16;

    if (player.rotate == 0 && player.attack != 0) if (hitbox_entity_rect(player.x + 00, player.y + 16, weapon_hitbox_x, weapon_hitbox_y)) console.log("hit!");
    if (player.rotate == 1 && player.attack != 0) if (hitbox_entity_rect(player.x - 16, player.y + 04, weapon_hitbox_y, weapon_hitbox_x)) console.log("hit!");
    if (player.rotate == 2 && player.attack != 0) if (hitbox_entity_rect(player.x + 08, player.y - 16, weapon_hitbox_x, weapon_hitbox_y)) console.log("hit!");
    if (player.rotate == 3 && player.attack != 0) if (hitbox_entity_rect(player.x + 16, player.y + 04, weapon_hitbox_y, weapon_hitbox_x)) console.log("hit!");

    if (player.attack != 0) player.attack++;
    if (player.attack >= 25) player.attack = 0;
    if (keys[32].time == timer) player.attack = 1;

}

function enemy_proc() {

    for (const i in enemy) {
        enemy_move(i)

        //if (hitbox_entity_rect(player.x, player.y, 16, 16)) console.log("hit!");
    }
}

function enemy_move(i){

        if (enemy[i]["xspd"] > 0) {
            enemy[i]["xspd"] = Math.floor(enemy[i]["xspd"] * 0.85 * 1000) / 1000;
        } else {
            enemy[i]["xspd"] = Math.ceil(enemy[i]["xspd"] * 0.85 * 1000) / 1000;
        }
        if (enemy[i]["yspd"] > 0) {
            enemy[i]["yspd"] = Math.floor(enemy[i]["yspd"] * 0.85 * 1000) / 1000;
        } else {
            enemy[i]["yspd"] = Math.ceil(enemy[i]["yspd"] * 0.85 * 1000) / 1000;
        }

        var enemy_speed = 0.25

        if (enemy[i]["move"][0]) enemy[i]["yspd"] -= enemy_speed;
        if (enemy[i]["move"][1]) enemy[i]["yspd"] += enemy_speed;
        if (enemy[i]["move"][2]) enemy[i]["xspd"] += enemy_speed;
        if (enemy[i]["move"][3]) enemy[i]["xspd"] -= enemy_speed;
        if (enemy[i]["move"][4] > 0) enemy[i]["move"][4] -= 1;

        //console.log("id: " + i + ",move: " + enemy.move[i][4]);

        if (!enemy[i]["move"][4] > 0) {
            enemy[i]["move"][0] = false;
            enemy[i]["move"][1] = false;
            enemy[i]["move"][2] = false;
            enemy[i]["move"][3] = false;

            if (Math.random() > 0.95) {
                if (Math.random() > 0.9) enemy[i]["move"][0] = true;
                if (Math.random() > 0.9) enemy[i]["move"][1] = true;
                if (Math.random() > 0.9) enemy[i]["move"][2] = true;
                if (Math.random() > 0.9) enemy[i]["move"][3] = true;
                if ( enemy[i]["move"][0] || enemy[i]["move"][1] || enemy[i]["move"][2] || enemy[i]["move"][3] ) enemy[i]["move"][4] = Math.floor(Math.random() * 5 + 5);
            }
        }


        for (var j = 0; j < Math.round(Math.abs(enemy[i]["xspd"])); j++) {
            enemy[i]["x"] += Math.sign(enemy[i]["xspd"]);
            if (hitbox(enemy[i]["x"], enemy[i]["y"])) enemy[i]["x"] -= Math.sign(enemy[i]["xspd"]);
        }
        for (var j = 0; j < Math.round(Math.abs(enemy[i]["yspd"])); j++) {
            enemy[i]["y"] += Math.sign(enemy[i]["yspd"]);
            if (hitbox(enemy[i]["x"], enemy[i]["y"])) enemy[i]["y"] -= Math.sign(enemy[i]["yspd"]);
        }
    
}

function enemy_spawn(spx, spy) { 

    //データの作成
    var def = {
        "x": spx * 16,
        "y": spy * 16,
        "xspd": 0,
        "yspd": 0,
        "move": [false, false, false, false, 0],
        "attack": {
            "hostility": [
                false,
                0
            ]
        }
    }
    //データの追加
    enemy.push(def);
}


function loadJson(filename,name) {

    //あざす https://kasumiblog.org/javascript-json-loading/
    // XMLHttpRequestを使ってjsonデータを読み込む
    let requestURL = filename;//jsonへのパス
    let loadname = name;//jsonへのパス
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
}

function messageView(text) {
    console.log(text);
    message.visible = true;
    message.text = text;

}

function NumberofIndex(num,index,shinsu) {
    return (String(num.toString(shinsu))[index]);
}

function drawText(text,x,y,w,h) {

    for (let i = 0, ox = 0 , oy = 0; i < text.length; i++) {
        var codeP = ("0000" + text.codePointAt(i).toString(16)).slice(-4);

        try {
            ctx.drawImage(img.font["uni_" + NumberofIndex(codeP, 0, 16) + NumberofIndex(codeP, 1, 16)], parseInt(NumberofIndex(codeP, 3, 16), 16) * 8, parseInt(NumberofIndex(codeP, 2, 16), 16) * 8, 8, 8, (x + ox * 8) * zoom, (y + oy * 8 )* zoom, 8 * zoom, 8 * zoom);
        } catch { }

        ox++;
        if (typeof w != 'undefined' && w < ox) {
            oy++;
            ox = 0;
        }
        //console.log("x:" + parseInt(NumberofIndex(codeP, 2, 16), 16) + ", y:" + parseInt(NumberofIndex(codeP, 3, 16), 16));
    }
}

function drawPrompt(dx,dy,dw,dh) {
    //numlockごみ
    ctx.drawImage(img.gui.prompt, 0, 0, 8, 8, (dx - 8) * zoom, (dy - 8) * zoom, 8 * zoom, 8 * zoom);
    ctx.drawImage(img.gui.prompt, 8, 0, 8, 8, dx * zoom, (dy - 8) * zoom, dw * zoom, 8 * zoom);
    ctx.drawImage(img.gui.prompt, 16, 0, 8, 8, (dx + dw) * zoom, (dy - 8) * zoom, 8 * zoom, 8 * zoom);


    ctx.drawImage(img.gui.prompt, 0, 8, 8, 8, (dx - 8) * zoom, dy * zoom, 8 * zoom, dh * zoom);
    ctx.drawImage(img.gui.prompt, 16, 8, 8, 8, (dx + dw) * zoom, dy * zoom, 8 * zoom, dh * zoom);


    ctx.drawImage(img.gui.prompt, 0, 16, 8, 8, (dx - 8) * zoom, (dy + dh) * zoom, 8 * zoom, 8 * zoom);
    ctx.drawImage(img.gui.prompt, 8, 16, 8, 8, dx * zoom, (dy + dh) * zoom, dw * zoom, 8 * zoom);
    ctx.drawImage(img.gui.prompt, 16, 16, 8, 8, (dx + dw) * zoom, (dy + dh) * zoom, 8 * zoom, 8 * zoom);

    ctx.drawImage(img.gui.prompt, 8, 8, 8, 8, dx * zoom, dy * zoom, dw * zoom, dh * zoom);
}

function hitbox_rect(ax, ay, aw, ah, bx, by, bw, bh) {

    debug_hitbox_push(ax, ay, aw, ah);
    debug_hitbox_push(bx, by, bw, bh);

    var acx = ax + aw / 2;
    var acy = ay + ay / 2;
    var bcx = bx + bw / 2;
    var bcy = by + by / 2;

    var dx = Math.abs(acx - bcx);
    var dy = Math.abs(acy - bcy);

    var sx = (aw + bw) / 2
    var sy = (ah + bh) / 2

    if (dx < sx && dy < sy) {
        return true;
    } else {
        return false;
    }
}

function hitbox_reci(ax, ay, aw, ah, bx, by, bw, bh) {

    debug_hitbox_push(ax, ay, aw, ah);
    debug_hitbox_push(bx, by, bw, bh);

	var da = ax - bx;
	var db = ay - by;
    var dc = Math.sqrt(da ** 2 + db ** 2);

    var ar = 2 / Math.sqrt(2 * Math.max(aw, ah));
    var br = 2 / Math.sqrt(2 * Math.max(bw, bh));

    if (dc <= ar + br) {
        return true;
    }
    else {
        return false;
    }
}

function hitbox_entity_rect(ax, ay, aw, ah) {

    var entity_hitbox_x = 16;
    var entity_hitbox_y = 16;

    for (const i in enemy) {
        if (hitbox_rect(enemy[i]["x"], enemy[i]["y"], entity_hitbox_x, entity_hitbox_y, ax, ay, aw, ah)) return i
    }
    return false
}


function debug_hitbox_push(a,b,c,d) {

    if(!debug.hitbox_visual) return

    //データの作成
    var def = [
        a,b,c,d
    ]
    
    //データの追加
    debug.hitboxes.push(def);
}

function debug_proc() {
    if (keys[75].time == timer) player.y++;
    if (keys[73].time == timer) player.y--;
    if (keys[76].time == timer) player.x++;
    if (keys[74].time == timer) player.x--;

    drawText("a:" + player.attack, 0, 0);
    drawText("x:" + player.x, 0, 8);
    drawText("y:" + player.y, 0, 16);

    for (var i = 0 , j = 0; i < keys.length; i++) {
        if (keys[i].press) drawText(String.fromCharCode(i), 78 * zoom, j * 8);
        if (keys[i].press) j++
    }
}

function hsv2rgb(hsv) {// あざす https://lab.syncer.jp/Web/JavaScript/Snippet/67/
    var h = hsv[0] / 60;
    var s = hsv[1];
    var v = hsv[2];
    if (s == 0) return [v * 255, v * 255, v * 255];

    var rgb;
    var i = parseInt(h);
    var f = h - i;
    var v1 = v * (1 - s);
    var v2 = v * (1 - s * f);
    var v3 = v * (1 - s * (1 - f));

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
