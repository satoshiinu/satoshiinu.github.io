let ctx = canvas.getContext("2d");
let tree = null;

class Tree {
    parent = null;
    childs = new Array();
    #events = null;
    event = null;
    ways = 0;
    flag = false;
    constructor(events, ways, { parent, layer = 0, event } = {}) {
        this.parent = parent;
        this.ways = ways;
        this.#events = events;
        this.layer = layer;
        this.event = event;

        this.#createChild();
    }
    #createChild() {
        if (this.isLeaf()) return;
        let filterFn = null;
        switch (Config.eventType) {
            case "all":
                filterFn = () => true;
                break;
            case "select":
                filterFn = value => !this.getAncestorIndexes().includes(value.index);
                break;
            case "pattern":
                break;

            default:
                break;
        }
        for (let event of this.#events.filter(filterFn))
            this.childs.push(new Tree(this.#events, this.ways, { parent: this, layer: this.layer + 1, event: event }));
    }
    draw(offset = Config.drawOffset, parentPos = null) {
        const space = Config.drawSpace;
        if (this.isRoot()) {
            canvas.height = Math.min(this.childs[0].getChildCount() * space.y + offset.y, 65535);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        let drawPos = null;
        let drawPosFixed = null;
        if (this.isSubRoot())
            drawPos = new Vec2(offset.x + this.parent.childs.indexOf(this) * this.ways * space.x + 10, offset.y);
        else
            drawPos = new Vec2(offset.x + space.x, offset.y + (this.getAboveCount()) * space.y);
        drawPosFixed = new Vec2(drawPos.x, drawPos.y + this.getChildCount() * space.y / 2);

        if (parentPos !== null && !this.isSubRoot())
            drawLine(parentPos.toMoved(8, -4), drawPosFixed.toMoved(0, -4));
        if (!this.isRoot()) {
            ctx.save();
            ctx.fillStyle = this.flag ? "#ff0000" : "#000000";
            ctx.fillText(this.event?.item, drawPosFixed.x, drawPosFixed.y);
            ctx.restore();
        }

        for (let child of this.childs)
            child.draw(drawPos, drawPosFixed);
    }
    getChilds() {
        if (this.isLeaf()) return [this];
        let childs = new Array();
        for (let child of this.childs) {
            childs = childs.concat(child.getChilds());
        }
        return childs;
    }
    getChildCount() {
        if (this.isLeaf()) return 1;
        let count = 0;
        for (let child of this.childs) {
            count += child.getChildCount();
        }
        return count;
    }
    getAboveCount(indexOffset = 0) {
        if (this.isRoot()) return null;
        let count = 0;
        for (let child of this.parent.childs.filter((element, index, array) => index < this.parent.childs.indexOf(this) + indexOffset))
            count += child.getChildCount();
        return count;
    }
    getAncestor(indexes = new Array()) {
        if (this.isRoot()) return new Array();
        indexes.push(this);
        this.parent.getAncestor(indexes)
        return indexes;
    }
    getAncestorIndexes(indexes = new Array()) {
        if (this.isRoot()) return new Array();
        indexes.push(this.event.index);
        this.parent.getAncestorIndexes(indexes)
        return indexes;
    }
    isRoot() {
        return this.layer <= 0;
    }
    isSubRoot() {
        return this.layer <= 1 && !this.isRoot();
    }
    isLeaf() {
        return this.ways - this.layer <= 0;
    }
}

/**
 * usage: Condition.auto(Condition.sum,tree,{range:new Range(0,5)})
 */
class Condition {
    static auto(conditional, tree, ...param) {
        tree.getChilds().forEach(v => v.flag = false);//reset
        let result = conditional(tree, ...param);//flag
        result.forEach(v => v.flag = true);
        tree.draw();
        return result;
    }
    static sumItems(tree, range) {
        return tree.getChilds().filter(child => child.getAncestor().reduce((sum, element) => sum + +element.event.item, 0).between(...range));
    }
    static isItem(tree, item) {
        return tree.getChilds().filter(child => Array.toArray(item).includes(child.event.item));
    }
    static rangeItem(tree, range) {
        return tree.getChilds().filter(child => (+child.event.item).between(...range));
    }
}

class Probability {
    static test(eventNum, totalNum) {
        return eventNum / totalNum;
    }
}

class Enent {
    constructor(item, index) {
        this.item = item;
        this.index = index;
    }
    valueOf() {
        return this.item;
    }
}

class Events {
    constructor(items) {
        this.length = items.length;
        for (let i = 0; i < items.length; i++) {
            this[i] = new Enent(items[i], i);
        }
    }

    [Symbol.iterator] = function* () {
        for (let i = 0; i < this.length; i++) {
            yield this[i];
        }
    }
    filter = filterFunc => Array.prototype.filter.call(this, filterFunc);
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    [Symbol.iterator] = function* () {
        yield this.x;
        yield this.y;
    }
    move(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    toMoved(x, y) {
        return new Vec2(this.x + x, this.y + y);
    }
}

class Range {
    constructor(min, max = min) {
        this.min = min;
        this.max = max;
    }
    [Symbol.iterator] = function* () {
        yield this.min;
        yield this.max;
    }
}

class Config {
    static drawOffset = new Vec2(0, 8);
    static drawSpace = new Vec2(20, 10);
    static eventType = "all";
}

function drawLine(posby, posto) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(posby.x, posby.y);
    ctx.lineTo(posto.x, posto.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
function drawText(text, pos) {
    ctx.save();
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(pos.x, pos.y - 8, 8, 8);
    ctx.fillStyle = "#000000"
    ctx.fillText(text, pos.x, pos.y);
    ctx.restore();
}

function makeTreeByGui() {
    Config.eventType = eventTypeSel.value;
    tree = new Tree(new Events(treeParamInput.value.split(",")), waysSel.value)
    tree.draw();
}

function testProbabilityByGui() {
    if (tree === null) {
        alert("まず樹形図を作って下さい");
        return;
    }


    let value = null;
    switch (probTypeSel.value) {
        case "sumItems":
        case "rangeItem":
            value = new Range(...probValueInput.value.split(","));
            break;
        case "isItem":
            value = probValueInput.value.split(",");
            break;
    }
    let result = Probability.test(Condition.auto(Condition[probTypeSel.value], tree, value).length, tree.getChildCount());
    probValueOutput.value = result;
    return result;
}

function getProbValueText(value) {
    switch (value) {
        case "sumItems":
        case "rangeItem":
            return "内なら";
        case "isItem":
            return "なら";
    }
}

Number.prototype.between = function (min, max) {
    return this >= min && this <= max;
};

Array.toArray = some => new Array().concat(some);

probValueText.innerText = getProbValueText(probTypeSel.value);