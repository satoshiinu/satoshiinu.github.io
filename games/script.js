 ///////////////////////////////////////////////////
// Copyright 2023 satoshiinu. All rights reserved. //
 ///////////////////////////////////////////////////

//エラーメッセージ処理
var DoSayErrorMassege = true;
window.onerror = (message, file, lineNo, colNo, error) => {
    if(DoSayErrorMassege) alert("エラーが発生しました\n再読み込みしてください");
}

//画面に表示される時は4倍になるので注意
const zoom = 4

//その他の変数の作成
var timer = 0;

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

//敵の変数の作成
var enemy = [];

enemy_spawn(25, 25);
enemy_spawn(25, 26);
enemy_spawn(20, 20);

//キーの変数の作成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;
key.w = false;
key.a = false;
key.s = false;
key.d = false;
key.z = false;
key.x = false;
key.c = false;

var keys = new Array();

for (let i = 0; i < 255; i++) {
    keys[i] = {
        "press" : false,
        "timer":0
    }
}

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
loadJson("Map.json", "Map");
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


function main() {keyreset()
    //キャンバスの初期化
    ctx.clearRect(0, 0, 1280 * zoom, 720 * zoom)


    //キー判定
    addEventListener("keyup", keyupfunc, false);
    addEventListener("keydown", keydownfunc, false);

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
    player_move(player.xspd, player.yspd, true);

    if(player.canRotate) rotate()

    //敵移動
    if(true) enemy_move();

    //スクロール座標を取得
    player.scrollx = player.x - 160 + player.scroll_offsetx;
    player.scrolly = player.y - 80 + player.scroll_offsety;
    if (player.scrollx < 0      ) player.scrollx = 0;
    if (player.scrolly < 0      ) player.scrolly = 0;
    if (player.scrollx > 1280) player.scrollx = 1280;
    if (player.scrolly > 1420) player.scrolly = 1420;

    //メッセージ消す
    if (keys[90].timer == 1) message.visible = false;

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
    if(Math.abs(player.xspd) + Math.abs(player.yspd) < 3) {
        player.anim = 2;
    } else {
        if(timer % 50 > 0.00) player.anim = 0;
        if(timer % 50 > 12.5) player.anim = 2;
        if(timer % 50 > 25.0) player.anim = 1;
        if(timer % 50 > 37.5) player.anim = 2;
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


    //メッセージ描画
    if (message.visible) {
        //ctx.drawImage(img.gui.message, 0, 0, 16 * 16, 4 * 16, 32 * zoom, 96 * zoom, 16 * 16 * zoom, 4 * 16 * zoom);
        drawPrompt(5 * 8,13 * 8,32 * 8,8 * 8);
        drawText(message.text);
    }
    
    //console.log("x:" + player.x + ",y:" + player.y + ",xspd:" + player.xspd + ",yspd:" + player.yspd)


    //タイマー
    timer++;
    //ループ
    requestAnimationFrame(main);
}


requestAnimationFrame(main);


function keyreset() {
    for (let i = 0; i < 255; i++) {
        keys[i].down = false
        keys[i].up = false
    }
}

function keydownfunc(parameter) {
    var key_code = parameter.keyCode;
    keys[key_code].press = true;
    keys[key_code].timer ++;
    parameter.preventDefault();
}

function keyupfunc(parameter) {
    var key_code = parameter.keyCode
    keys[key_code].press = false;
    keys[key_code].timer = 0;
}

//プレイヤーの動き
function player_move(mvx, mvy, checkhitbox) {
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
    if (filePath.indexOf(';') == -1) {

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

function enemy_move(){
    for (const i in enemy) {



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

        if (enemy[i]["move"][0]) enemy[i]["yspd"] -= 0.5;
        if (enemy[i]["move"][1]) enemy[i]["yspd"] += 0.5;
        if (enemy[i]["move"][2]) enemy[i]["xspd"] += 0.5;
        if (enemy[i]["move"][3]) enemy[i]["xspd"] -= 0.5;
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
}

function enemy_spawn(spx, spy) { 

    //データの作成
    var def = {
        "x": spx * 16,
        "y": spy * 16,
        "xspd": 0,
        "yspd": 0,
        "move": [false, false, false, false, 0]
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

function NumberOfIndex(num,index,shinsu) {
    return (String(num.toString(shinsu))[index]);
}

function drawText(text) {

    for (let i = 0; i < text.length; i++) {
        var codeP = ("0000" + text.codePointAt(i).toString(16)).slice(-4);

        ctx.drawImage(img.font["uni_" + NumberOfIndex(codeP, 0, 16) + NumberOfIndex(codeP, 1, 16) ], parseInt(NumberOfIndex(codeP, 3, 16), 16) * 8, parseInt(NumberOfIndex(codeP, 2, 16), 16) * 8, 8, 8, ((i * 8) + 40) * zoom, 104 * zoom, 8 * zoom, 8 * zoom);

        //console.log("x:" + parseInt(NumberOfIndex(codeP, 2, 16), 16) + ", y:" + parseInt(NumberOfIndex(codeP, 3, 16), 16));
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