const fixDigits = 5;

class NumXY {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    multi(e) {
        this.x *= e;
        this.y *= e;
        return this;
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
    static diffVert(one, two) {
        return this.addVert(one, two.toMultied(-1));
    }
}

class Result {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    [Symbol.iterator] = function* () {
        yield this.a;
        yield this.b;
    }
}

function linearFuncCalc(one, two) {
    if (!testNumInputed(one, two)) {
        alert("値を入力してください");
        return;
    }
    if (one.x === two.x) {
        // return new Result(Infinity, null);
    }
    if (one.y === two.y) {
        return new Result(0, one.y);
    }
    if (!testNumVaild(one, two)) {
        alert("入力された値が不正です");// たぶん。。。
        return;
    }

    let slope = null, intercept = null;
    {
        let resultVert = SimulEqua.diffVert(one, two);
        slope = resultVert.y / resultVert.x;

        intercept = one.y - slope * one.x;
    }
    // [slope, intercept] = resultToInt(slope, intercept);

    return new Result(+slope.toFixed(fixDigits), +intercept.toFixed(fixDigits));
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

function testNumVaild(one, two) {
    if (one.x === two.x) return false;
    return true;
}
function testNumInputed(one, two) {
    if (one.x === "" || one.y === "" || two.x === "" || two.y === "") return false;
    return true;
}
