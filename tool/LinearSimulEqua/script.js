class NumXY {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    multi(e) {
        this.x *= e;
        this.y *= e;
    }
    toMultied(e) {
        return this.clone().multi(e);
    }
    clone() {
        return new NumXY(this.x, this.y);
    }
    [Symbol.iterator] = function* () {
        yield this.x;
        yield this.y;
    }
}

class SimulEqua {
    static addVert(one, two) {// 加減法の縦に足すやつ
        return new NumXY(one.x + two.x, one.y + two.y);
    }
}

class Result {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    [Symbol.iterator] = function* () {
        yield this.x;
        yield this.y;
    }
}

function linearFuncCalc(one, two) {
    if (!testNumVaild(one, two)) {
        alert("入力された値が不正です");
        return;
    }

    let result = null;
    let result_a = null, result_b = null;

    result = SimulEqua.addVert(one, two.toMultied(-1));
    result.multi(-1);
    result_a = result.y / result.x;

    result_b = -(result_a * one.x - one.y);
    //resultToInt(result_a, result_b);

    return new Result(result_a, result_b);
}

function getNumByElem(xID, yID) {
    let NumX = document.getElementById(xID).value * 1;
    let NumY = document.getElementById(yID).value * 1;

    return new NumXY(NumX, NumY);
}

function setNumByElem(xID, yID, xValue, yValue) {
    document.getElementById(xID).value = xValue;
    document.getElementById(yID).value = yValue;

    return 0;
}

function reset() {
    setNumByElem('input_x1', 'input_y1');
    setNumByElem('input_x2', 'input_y2');
    setNumByElem('result_a', 'result_b');
}

function resultToInt(result_a, result_b) {
    let multi = 1 / Math.min(result_a, result_b);
    result_a *= multi;
    result_b *= multi;
}

function testNumVaild(one, two) {
    if (one.x === two.x) return false;
    return true;
}
