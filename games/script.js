 /////////////////////////////
// Copyright 2023 satoshiinu //
 /////////////////////////////

var test = "ee";
var ret = "";
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

//敵の変数の作成
var enemy = new Object;
enemy.x = [];
enemy.y = [];
enemy.xspd = [];
enemy.yspd = [];
enemy.move = [];

enemy_spawn(25, 25);
enemy_spawn(25, 26);
enemy_spawn(20, 20);


//マップの変数の作成
var map = new Object();
readMapData("Map.json", "map");
//console.log(readMapData("Map.json", "map"));
//console.log(map.map);

//キーの変数の作成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;

//画像の設定
var img = new Object();

img.tiles = new Image();
img.tiles.src = "img/tiles.png";

img.players = new Image();
img.players.src = "img/players.png";

img.enemy = new Image();
img.enemy.src = "img/enemy.png";

//タイルの設定
var tile_image_list = [img.empty, img.tile, img.tile2];

var tile_collision = [false, true, false, true];

//
const tileAtlas   = [0, 1, 2, 3, 4, 5, 6];
const playerAtlas = [ 0, 1, 2];


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

    if (key.up) player.yspd -= 0.5;
    if (key.down) player.yspd += 0.5;
    if (key.right) player.xspd += 0.5;
    if (key.left) player.xspd -= 0.5;

    //プレイヤー移動
    player_move(player.xspd, player.yspd, true);

    if(player.canRotate) rotate()

    //敵移動
    enemy_move();

    //スクロール座標を取得
    player.scrollx = player.x - 160 + player.scroll_offsetx;
    player.scrolly = player.y - 80 + player.scroll_offsety;
    if (player.scrollx < 0      ) player.scrollx = 0;
    if (player.scrolly < 0      ) player.scrolly = 0;
    if (player.scrollx > 1280) player.scrollx = 1280;
    if (player.scrolly > 1420) player.scrolly = 1420;

    //タイル描画
    var plx = Math.floor(player.scrollx / 16);
    var ply = Math.floor(player.scrolly / 16);
    for (var y = 0; y < 13; y++) {
        for (var x = 0; x < 21; x++) {
            try {
                var tileID = map.map["map1"][y + ply][x + plx];
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
    for (const i in enemy.x) {
        ctx.drawImage(img.enemy, 0, 0, 16, 16, (enemy.x[i] - player.scrollx) * zoom, (enemy.y[i] - player.scrolly) * zoom, 16 * zoom, 16 * zoom);
    }    


    //タイル描画2
    var plx = Math.floor(player.scrollx / 16);
    var ply = Math.floor(player.scrolly / 16);
    for (var y = 0; y < 13; y++) {
        for (var x = 0; x < 21; x++) {
            try {
                var tileID = map.map["map2"][y + ply][x + plx];
                ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, (x * 16 + (16 - player.scrollx % 16) - 16) * zoom, (y * 16 + (16 - player.scrolly % 16) - 16) * zoom, 16 * zoom, 16 * zoom);
            }
            catch { }
        }
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
    if (key_code == 37) key.left = true;
    if (key_code == 38) key.up = true;
    if (key_code == 39) key.right = true;
    if (key_code == 40) key.down = true;
    parameter.preventDefault();
}

function keyupfunc(parameter) {
    var key_code = parameter.keyCode
    if (key_code == 37) key.left = false;
    if (key_code == 38) key.up = false;
    if (key_code == 39) key.right = false;
    if (key_code == 40) key.down = false;
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
        if (map.map["hitbox"][Math.floor(y / 16 + 0)][Math.floor(x / 16 + 0)]) return true;
        if (map.map["hitbox"][Math.floor(y / 16 + 0)][Math.floor(x / 16 + 0.95)]) return true;
        if (map.map["hitbox"][Math.floor(y / 16 + 0.95)][Math.floor(x / 16 + 0)]) return true;
        if (map.map["hitbox"][Math.floor(y / 16 + 0.95)][Math.floor(x / 16 + 0.95)]) return true;
    } catch { }
}

//向きを取得
function rotate() {
    if ( key.up && !key.down && !key.right && !key.left) player.rotate = 2;
    if (!key.up &&  key.down && !key.right && !key.left) player.rotate = 0;
    if (!key.up && !key.down &&  key.right && !key.left) player.rotate = 3;
    if (!key.up && !key.down && !key.right &&  key.left) player.rotate = 1;
    if ( key.up && !key.down &&  key.right && !key.left) player.rotate = 3;
    if ( key.up && !key.down && !key.right &&  key.left) player.rotate = 1;
    if (!key.up &&  key.down &&  key.right && !key.left) player.rotate = 3;
    if (!key.up &&  key.down && !key.right &&  key.left) player.rotate = 1;
    if (!key.up && !key.down &&  key.right &&  key.left) player.rotate = 0;
    if ( key.up &&  key.down && !key.right && !key.left) player.rotate = 0;
    if ( key.up && !key.down &&  key.right &&  key.left) player.rotate = 2;
    if (!key.up &&  key.down &&  key.right &&  key.left) player.rotate = 0;
    if ( key.up &&  key.down &&  key.right && !key.left) player.rotate = 3;
    if ( key.up &&  key.down && !key.right &&  key.left) player.rotate = 1;
    if ( key.up &&  key.down &&  key.right &&  key.left) player.rotate = 0;
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
    for (const i in enemy.x) {



        if (enemy.xspd[i] > 0) {
            enemy.xspd[i] = Math.floor(enemy.xspd[i] * 0.85 * 1000) / 1000;
        } else {
            enemy.xspd[i] = Math.ceil(enemy.xspd[i] * 0.85 * 1000) / 1000;
        }
        if (enemy.yspd[i] > 0) {
            enemy.yspd[i] = Math.floor(enemy.yspd[i] * 0.85 * 1000) / 1000;
        } else {
            enemy.yspd[i] = Math.ceil(enemy.yspd[i] * 0.85 * 1000) / 1000;
        }

        if (enemy.move[i][0]) enemy.yspd[i] -= 0.5;
        if (enemy.move[i][1]) enemy.yspd[i] += 0.5;
        if (enemy.move[i][2]) enemy.xspd[i] += 0.5;
        if (enemy.move[i][3]) enemy.xspd[i] -= 0.5;
        if (enemy.move[i][4] > 0) enemy.move[i][4] -= 1;

        console.log("id: " + i + ",move: " + enemy.move[i][4]);

        if (!enemy.move[i][4] > 0) {
            enemy.move[i][0] = false;
            enemy.move[i][1] = false;
            enemy.move[i][2] = false;
            enemy.move[i][3] = false;

            if (Math.random() > 0.95) {
                if (Math.random() > 0.9) enemy.move[i][0] = true;
                if (Math.random() > 0.9) enemy.move[i][1] = true;
                if (Math.random() > 0.9) enemy.move[i][2] = true;
                if (Math.random() > 0.9) enemy.move[i][3] = true;
                if (enemy.move[i][0] || enemy.move[i][1] || enemy.move[i][2] || enemy.move[i][3]) enemy.move[i][4] = 10;
            }
        }


        for (var j = 0; j < Math.round(Math.abs(enemy.xspd[i])); j++) {
            enemy.x[i] += Math.sign(enemy.xspd[i]);
            if (hitbox(enemy.x[i], enemy.y[i])) enemy.x[i] -= Math.sign(enemy.xspd[i]);
        }
        for (var j = 0; j < Math.round(Math.abs(enemy.yspd[i])); j++) {
            enemy.y[i] += Math.sign(enemy.yspd[i]);
            if (hitbox(enemy.x[i], enemy.y[i])) enemy.y[i] -= Math.sign(enemy.yspd[i]);
        }
    }
}

function enemy_spawn(spx, spy) {
    enemy.x[enemy.x.length + 1] = spx * 16;
    enemy.y[enemy.y.length + 1] = spy * 16;
    enemy.xspd[enemy.xspd.length + 1] = 0;
    enemy.yspd[enemy.yspd.length + 1] = 0;
    enemy.move[enemy.move.length + 1] = [false, false, false, false, 0];
}