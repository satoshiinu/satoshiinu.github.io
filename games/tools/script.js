
let zoomX = 2;
let zoomY = 2;
let ScreenWidth = 320 * 2;
let ScreenHeight = 180 * 2;

const canvas = document.getElementById('main');
const ctx = canvas.getContext('2d');

canvas.width = ScreenWidth * zoomX;
canvas.height = ScreenHeight * zoomY;
ctx.scale(zoomX, zoomY);

ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const canvasSelectTile = document.getElementById('selectTile');
const ctxst = canvasSelectTile.getContext('2d');
canvasSelectTile.width = 16 * zoomX;
canvasSelectTile.height = 16 * zoomY;
ctxst.scale(zoomX, zoomY);

ctxst.mozImageSmoothingEnabled = false;
ctxst.webkitImageSmoothingEnabled = false;
ctxst.msImageSmoothingEnabled = false;
ctxst.imageSmoothingEnabled = false;


canvas.addEventListener("mousedown", e => {
    if (e.button === 0) tile_click(get_select_tile_pos(e.offsetX, e.offsetY));
    if (e.button === 1) tile_middleclick(get_select_tile_pos(e.offsetX, e.offsetY));
    if (e.button === 2) tile_rightclick(get_select_tile_pos(e.offsetX, e.offsetY));
});
canvas.addEventListener("mouseup", e => {
    if (e.button === 0) tile_click_up(get_select_tile_pos(e.offsetX, e.offsetY));
    if (e.button === 1) tile_middleclick_up(get_select_tile_pos(e.offsetX, e.offsetY));
    if (e.button === 2) tile_rightclick_up(get_select_tile_pos(e.offsetX, e.offsetY));
});
document.addEventListener('mousedown', event => {
    if (event.button === 2) { // buttonプロパティが2の場合は、右クリックを意味します
        document.addEventListener('mousemove', onMouseMoveRight);
    }
});
document.addEventListener('mouseup', event => {
    if (event.button === 2) {
        document.removeEventListener('mousemove', onMouseMoveRight);
    }
});
function onMouseMoveRight(e) {
    tile_rightclick_move(get_select_tile_pos(e.offsetX, e.offsetY));
}

canvas.addEventListener("contextmenu", e => e.preventDefault());

let scroll = {
    x: 0,
    y: 0,
    xspd: 0,
    yspd: 0
}

let select = {
    layer: "layer1",
    tile: 0
}

let img = new Object();
img.tiles = new Image();
img.tiles.src = "../img/tiles.png"
img.enemy = new Image();
img.enemy.src = "../img/enemy_icon.png"

let mapData;
let mapDataFileName = "";

let draw = {
    map1: true,
    map2: true,
    hitbox: true,
    enemy: true
}
let alpha = {
    map1: 1.0,
    map2: 0.5,
    hitbox: 0.5,
    enemy: 0.5
}

class Size {
    constructor(width = 0, height = 0) {
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
}
class Vec2 {
    constructor(x = 0, y = 0) {
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
}

class pos extends Vec2 {
    isChunkPos = false;
    getChunkPos() {
        return new cpos(Math.floor(this.x / chunkSize.w), Math.floor(this.y / chunkSize.h));
    }
    getInChunkPos() {
        return new cpos(Math.abs(this.x % chunkSize.w), Math.abs(this.y % chunkSize.h));
    }
    getInChunkIndex() {
        return this.getInChunkPos(this).x + this.getInChunkPos(this).y * chunkSize.w;
    }
}
class cpos extends Vec2 {
    isChunkPos = true;
    getChunkPos() {
        return this;
    }
}
const chunkSize = new Size(256, 256);

class Level {
    rawData = null;
    chunks = new Object();
    levelName = "test";
    async chunkLoad(cpos) {
        return this.chunks[cpos.getChunkPos().toString()] = await ChunkLevel.load(level, cpos, this.levelName);
    }
    async chunkCreate(cpos) {
        return this.chunks[cpos.getChunkPos().toString()] = await ChunkLevel.create(level, cpos, this.levelName);
    }
    toString() {

    }
    getTile(pos) {
        if (pos.isChunkPos) throw new Error("is cpos");
        return this.getChunk(pos)?.getTile(pos) ?? new Tile;
    }
    setTile(pos, value) {
        return Object.assign(this.getTile(pos), value);
    }
    getChunk(pos) {
        return this.chunks[pos.getChunkPos().toString()] ?? null;
    }
}

const level = new Level;

class ChunkLevel {
    constructor(rawObj, cpos = console.error("error")) {
        if (rawObj === null) rawObj = ChunkLevel.getDefaultValue();
        this.cData = rawObj.cData.map(value => new Tile(...value));
        this.cpos = cpos;
    }
    init(cpos) {
        this.cpos = cpos;
    }
    dispose(level) {
        const index = level.chunk.indexOf(this);
        delete level.chunk;
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

class Tile {
    constructor(layer1 = null, layer2 = null, hitbox = null, enemy = null) {
        this.layer1 = layer1;
        this.layer2 = layer2;
        this.hitbox = hitbox;
        this.enemy = enemy;
    }
    [Symbol.iterator] = function* () {
        yield this.layer1;
        yield this.layer2;
        yield this.hitbox;
        yield this.enemy;
    }
}

class key {
    static code = new Object();
    static group = {
        up: ["ArrowUp", "KeyW"],
        down: ["ArrowDown", "KeyS"],
        left: ["ArrowLeft", "KeyA"],
        right: ["ArrowRight", "KeyD"]
    }
    static pressed(groupName) {
        let result = false;
        this.group[groupName].map(value => {
            if (this.code[value]) result = true;
            return value;
        });
        return result;
    }
}

class fill {
    static pos1 = new pos(null, null);
    static pos2 = new pos(null, null);
    static reset() {
        this.pos1 = new pos(null, null);
        this.pos2 = new pos(null, null);
    }
    static do(tileId = select.tile, layer = select.layer) {
        this.fillAbs(this.pos1.x, this.pos1.y, this.pos2.x - this.pos1.x, this.pos2.y - this.pos1.y, tileId, layer);
        this.reset();
    }
    static fillAbs(posx, posy, width, height, tileId, layer) {
        for (let y = 0; y <= Math.abs(height); y++) {
            for (let x = 0; x <= Math.abs(width); x++) {
                const settile = new Object;
                settile[layer] = tileId;
                level.setTile(new pos(posx + x * Math.sign(width), posy + y * Math.sign(height)), settile);
            }
        }
    }
    static draw() {
        if (!(this.pos1.x ?? this.pos1.y ?? this.pos2.x ?? this.pos2.y)) return;
        ctx.save();

        let posx = Math.min(this.pos1.x, this.pos2.x);
        let posy = Math.min(this.pos1.y, this.pos2.y);
        let width = Math.abs(this.pos2.x - this.pos1.x)
        let height = Math.abs(this.pos2.y - this.pos1.y);
        if (width >= 0) width++;
        if (height >= 0) height++;

        ctx.fillStyle = "#dd00dd"
        ctx.globalAlpha = 0.5;
        ctx.fillRect(getDrawPos.x(posx * 16), getDrawPos.y(posy * 16), width * 16, height * 16);

        ctx.restore();
    }
}

class getDrawPos {
    static x(pos) {
        return pos - scroll.x;
    }
    static y(pos) {
        return pos - scroll.y;
    }
}

document.addEventListener("keydown", e => key.code[e.code] = true);
document.addEventListener("keyup", e => key.code[e.code] = false);

function main() {
    ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);
    ctx.clearRect(0, 0, 16, 16);

    scrollMove();
    //auto_zoom();

    drawTiles("layer1");
    drawTiles("layer2");
    drawTiles("enemy");
    drawTiles("hitbox");
    fill.draw();
    drawSelectTile();

    requestAnimationFrame(main);
}
requestAnimationFrame(main);

function drawTiles(maplayer) {

    ctx.save();

    ctx.globalAlpha = alpha[maplayer];

    let plx = Math.floor(scroll.x / 16);
    let ply = Math.floor(scroll.y / 16);

    for (let y = 0; y <= Math.ceil(ScreenHeight / 16); y++) {
        for (let x = 0; x <= Math.ceil(ScreenWidth / 16); x++) {
            let tileID = level.getTile(new pos(x + plx, y + ply))[maplayer];

            const drawOffsetFix = value => Math.sign(value) < 0 ? -16 : 0;
            const drawOffset = new Vec2(x * 16 - scroll.x % 16 + drawOffsetFix(scroll.x), y * 16 - scroll.y % 16 + drawOffsetFix(scroll.y));
            const drawSize = new Vec2(16, 16);

            switch (maplayer) {
                case "layer1":
                case "layer2":
                    ctx.drawImage(img.tiles, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), ...drawSize, ...drawOffset, ...drawSize);
                    break;
                case "enemy":
                    if (!!tileID) ctx.drawImage(img.enemy, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), ...drawSize, ...drawOffset, ...drawSize);
                    break;
                case "hitbox":
                    ctx.fillStyle = "#dd0000";
                    if (!!tileID) ctx.fillRect(...drawOffset, ...drawSize);
                    break;
                default:
                    throw new Error("undefined maplayer:" + maplayer);
                    break;
            }
        }
    }
    ctx.restore();
}

function drawSelectTile() {
    let tileID = select.tile;
    let image = select.layer === "enemy" ? img.enemy : img.tiles;
    ctxst.clearRect(0, 0, 16, 16);
    ctxst.drawImage(image, getTileAtlasXY(tileID, 0), getTileAtlasXY(tileID, 1), 16, 16, 0, 0, 16, 16);
}

function getTileAtlasXY(id, xy) {
    if (xy == 0) return id % 16 * 16
    if (xy == 1) return Math.floor(id / 16) * 16
}

function getTileID(maplayer, x, y) {
    return mapData?.[maplayer]?.[y]?.[x];
}

function limit(input, min, max) {
    return Math.min(Math.max(min, input), max);
}

function get_select_tile_pos(mousex, mousey) {
    return {
        x: Math.floor(mousex / 16 / zoomX + scroll.x / 16),
        y: Math.floor(mousey / 16 / zoomY + scroll.y / 16)
    }
}

function fileChanged(element) {
    const reader = new FileReader(); // FileReader オブジェクト
    reader.onload = () => { // 読みんこんだ後のコールバック
        mapData = JSON.parse(reader.result);
    };
    if (!element.files[0]) return;
    mapDataFileName = element.files[0].name;
    reader.readAsText(element.files[0]); // 読み込み開始
}

function scrollMove() {
    if (key.pressed("right")) scroll.xspd++;
    if (key.pressed("left")) scroll.xspd--;
    if (key.pressed("down")) scroll.yspd++;
    if (key.pressed("up")) scroll.yspd--;

    scroll.xspd *= 0.8;
    scroll.yspd *= 0.8;
    scroll.xspd = Math.min(3, scroll.xspd);
    scroll.yspd = Math.min(3, scroll.yspd);

    scroll.x += scroll.xspd;
    scroll.y += scroll.yspd;

    //scroll.x = limit(scroll.x, 0, (mapData?.map1?.[0]?.length ?? Infinity) * 16 - ScreenWidth);
    //scroll.y = limit(scroll.y, 0, (mapData?.map1?.length ?? Infinity) * 16 - ScreenHeight);
}


function replaceTile(ID, maplayer, x, y) {
    if (!mapData) return;
    switch (maplayer) {
        case "map1":
        case "map2":
            ID = Number(ID);
            break;
        case "enemy":
            if (ID !== null) ID = Number(ID);
            break;
        case "hitbox":
            ID = !!ID;
            break;
        default:
            throw new Error("undefined maplayer:" + maplayer);
            break;
    }
    mapData[maplayer][y][x] = ID;
}

function tile_pick(x, y) {
    select.tile = getTileID(select.layer, x, y);
}

function selectIdDialog() {
    return new Promise((resolve, reject) => {
        let dialogSize = 25;

        var dialog = new Object();
        dialog.root = document.createElement("span");
        dialog.root.style.width = dialogSize + "%";
        dialog.root.style.height = "0%";
        dialog.root.style.paddingTop = dialogSize + "%";
        dialog.root.style.zIndex = "10000";
        dialog.root.style.backgroundColor = "#eeeeee";
        dialog.root.style.border = "solid 10px #ffbf00"
        dialog.root.style.position = "fixed";
        dialog.root.style.top = 0 + "%";
        dialog.root.style.left = (100 - dialogSize) / 2 + "%";


        dialog.canvas = document.createElement("canvas");
        dialog.canvas.style.position = "absolute";
        dialog.canvas.style.top = "0px";
        dialog.canvas.style.left = "0px";
        dialog.canvas.id = "selectIdDialog";
        dialog.canvas.style.width = "100%";
        dialog.canvas.style.height = "100%";
        dialog.canvas.width = 256;
        dialog.canvas.height = 256;
        dialog.ctx = dialog.canvas.getContext('2d');
        dialog.ctx.mozImageSmoothingEnabled = false;
        dialog.ctx.webkitImageSmoothingEnabled = false;
        dialog.ctx.msImageSmoothingEnabled = false;
        dialog.ctx.imageSmoothingEnabled = false;
        dialog.canvas.addEventListener("click", e => tile_select(e.offsetX, e.offsetY, resolve, dialog));


        let image = select.layer === "enemy" ? img.enemy : img.tiles;
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                dialog.ctx.drawImage(image, x * 16, y * 16, 16, 16, x * 16, y * 16, 16, 16);
            }
        }

        document.body.appendChild(dialog.root);
        dialog.root.appendChild(dialog.canvas);
    })
}

function tile_select(mousex, mousey, resolve, dialog) {
    let element = document.getElementById("selectIdDialog");
    let selectX = Math.floor(mousex / element.clientWidth * 16);
    let selectY = Math.floor(mousey / element.clientHeight * 16);

    dialog.root.remove();
    resolve(selectX + selectY * 16)
    //select.tile=selectX+selectY*16;
    //console.log(select.tile)
}

async function selectIdDialogOpen() {
    select.tile = await selectIdDialog();
}

async function fileDownloadBlob(fileName = "Default", saveBlob) {
    const objUrl = window.URL.createObjectURL(saveBlob);
    const link = document.createElement("a");
    link.href = objUrl;
    link.download = fileName;
    link.click();
    // For Firefox it is necessary to delay revoking the ObjectURL.
    setTimeout(() => {
        window.URL.revokeObjectURL(objUrl);
    }, 250);
}

async function dataSave() {
    let savejson = JSON.stringify(mapData);
    await fileDownloadBlob(mapDataFileName, new Blob([savejson], { type: 'plain/text' }));
}

async function dataSave() {
    for (const chunk of Object.values(level.chunks)) {
        let savejson = chunk?.toString() ?? (console.error("cannot chunk to string"));
        await fileDownloadBlob(chunk.cpos.toString() + ".json", new Blob([savejson], { type: 'plain/text' }));
    }
}

function newMapLayer(width = 100, height = 100, value = 0) {
    return JSON.parse(JSON.stringify(new Array(height).fill(new Array(width).fill(value, 0, width), 0, height)));
}

function newMapDialog() {
    return new Promise((resolve, reject) => {
        let dialogSize = 25;

        var dialog = new Object();
        dialog.root = document.createElement("span");
        dialog.root.style.width = dialogSize + "%";
        dialog.root.style.height = "0%";
        dialog.root.style.paddingTop = dialogSize + "%";
        dialog.root.style.zIndex = "10000";
        dialog.root.style.backgroundColor = "#eeeeee";
        dialog.root.style.border = "solid 10px #ffbf00"
        dialog.root.style.position = "fixed";
        dialog.root.style.top = 0 + "%";
        dialog.root.style.left = (100 - dialogSize) / 2 + "%";


        dialog.inputX = document.createElement("input");
        dialog.inputX.type = "number";
        dialog.inputX.value = 100;
        dialog.inputX.style.position = "absolute";
        dialog.inputX.style.top = "0%";
        dialog.inputX.style.left = "10%";
        dialog.inputX.id = "inputX";
        dialog.inputX.style.width = "30%";
        dialog.inputX.style.height = "10%";

        dialog.inputY = document.createElement("input");
        dialog.inputY.type = "number";
        dialog.inputY.value = 100;
        dialog.inputY.style.position = "absolute";
        dialog.inputY.style.top = "0%";
        dialog.inputY.style.left = "50%";
        dialog.inputY.id = "inputY";
        dialog.inputY.style.width = "30%";
        dialog.inputY.style.height = "10%";

        dialog.textX = document.createElement("p");
        dialog.textX.innerText = "x";
        dialog.textX.style.position = "absolute";
        dialog.textX.style.top = "0%";
        dialog.textX.style.left = "0%";
        dialog.textX.id = "textX";
        dialog.textX.style.width = "30%";
        dialog.textX.style.height = "10%";

        dialog.textY = document.createElement("p");
        dialog.textY.innerText = "y";
        dialog.textY.style.position = "absolute";
        dialog.textY.style.top = "0%";
        dialog.textY.style.left = "40%";
        dialog.textY.id = "textY";
        dialog.textY.style.width = "30%";
        dialog.textY.style.height = "10%";

        dialog.confirm = document.createElement("button");
        dialog.confirm.innerText = "confirm";
        dialog.confirm.style.position = "absolute";
        dialog.confirm.style.top = "90%";
        dialog.confirm.style.left = "0%";
        dialog.confirm.id = "confirm";
        dialog.confirm.style.width = "30%";
        dialog.confirm.style.height = "10%";
        dialog.confirm.addEventListener("click", e => newMapDialogConfirm(resolve, dialog));

        dialog.cancel = document.createElement("button");
        dialog.cancel.innerText = "cancel";
        dialog.cancel.style.position = "absolute";
        dialog.cancel.style.top = "90%";
        dialog.cancel.style.left = "30%";
        dialog.cancel.id = "confirm";
        dialog.cancel.style.width = "30%";
        dialog.cancel.style.height = "10%";
        dialog.cancel.addEventListener("click", e => newMapDialogCancel(resolve, dialog));


        document.body.appendChild(dialog.root);
        dialog.root.appendChild(dialog.inputX);
        dialog.root.appendChild(dialog.inputY);
        dialog.root.appendChild(dialog.textX);
        dialog.root.appendChild(dialog.textY);
        dialog.root.appendChild(dialog.confirm);
        dialog.root.appendChild(dialog.cancel);
    })
}

function newMapDialogConfirm(resolve, dialog) {
    //console.log(dialog)
    let width = Number(dialog.inputX.value);
    let height = Number(dialog.inputY.value);

    mapData = newMap(width, height);

    dialog.root.remove();
    resolve(mapData);
    //select.tile=selectX+selectY*16;
    //console.log(select.tile)
}
function newMapDialogCancel(resolve, dialog) {
    dialog.root.remove();
    resolve(-1);
}

function newMap(width, height) {
    return {
        "map1": newMapLayer(width, height, 2),
        "map2": newMapLayer(width, height, 0),
        "hitbox": newMapLayer(width, height, false),
        "enemy": newMapLayer(width, height, null)
    }
}

function tile_click({ x, y }) {
    const tilePos = new pos(x, y);
    const layer = select.layer;
    const tileId = select.tile;
    const settile = new Object;

    if (level.getChunk(tilePos) === null) {
        if (confirm(`create/loadChunk at: ${tilePos.getChunkPos()}?`)) {
            level.chunkLoad(new pos(x, y).getChunkPos());
            return;
        } else {
            return;
        }
    }

    settile[layer] = tileId;
    level.setTile(tilePos, settile);
}

function tile_click_up({ x, y }) {
}

function tile_middleclick({ x, y }) {
    tile_pick(x, y);
}

function tile_middleclick_up({ x, y }) {
}

function tile_rightclick({ x, y }) {
    fill.pos1 = { x, y };
    fill.pos2 = { x, y };
}

function tile_rightclick_up({ x, y }) {
    fill.pos2 = { x, y };
    fill.do();
}

function tile_rightclick_move({ x, y }) {
    fill.pos2 = { x, y };
}

function auto_zoom() {
    let element = document.querySelector(".resizeable:has(canvas#main)");
    ScreenWidth = element.getBoundingClientRect().width / zoomX;
    ScreenHeight = element.getBoundingClientRect().height / zoomY;
    updateCanvasSize();
}

function updateCanvasSize(width, height) {
    ScreenWidth = width;
    ScreenHeight = height;
    canvas.width = ScreenWidth * zoomX;
    canvas.height = ScreenHeight * zoomY;
    ctx.scale(zoomX, zoomY);
}

async function loadJson(filename, name, useReviver) {
    try {
        //あざす　https://gxy-life.com/2PC/javascript/json_table20220514/
        let startTime = new Date().getTime();

        //取得ここから
        const response = await fetch(filename);
        const jsonObject = await response.json();
        //取得ここまで

        let endTime = new Date().getTime();



        return jsonObject;
    } catch {
        return null;
    }
}