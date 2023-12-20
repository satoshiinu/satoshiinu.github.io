class Num {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    multi(e) {
        this.x *= e;
        this.y *= e;
    }
    get_multi(e) {
        return new Num(this.x * e, this.y * e);
    }
    getArray() {
        return [this.x, this.y];
    }
}

class SimulEquaClass {
    add(one, two) {
        return new Num(one.x + two.x, one.y + two.y);
    }
}
SimulEqua = new SimulEquaClass();

class Result {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    getArray() {
        return [this.a, this.b];
    }
}

function linearFuncCalc(one, two) {
    if(!testNumVaild(one,two)){
        alert("入力された値が不正です");
        return;
    }

    let result = new Object();
    let result_a = new Number();
    let result_b = new Number();

    result = SimulEqua.add(one, two.get_multi(-1));
    result.multi(-1);
    result_a = result.y / result.x;

    result_b = -(result_a * one.x - one.y);
    //resultToInt(result_a, result_b);

    return new Result(result_a, result_b);
}

function getNumByElem(xID, yID) {
    let NumX = document.getElementById(xID).value * 1;
    let NumY = document.getElementById(yID).value * 1;

    return new Num(NumX, NumY);
}

function setNumByElem(xID, yID, xValue, yValue) {
    document.getElementById(xID).value = xValue;
    document.getElementById(yID).value = yValue;

    return 0;
}

function reset() {
    setNumByElem('input_x1', 'input_y1', undefined, undefined);
    setNumByElem('input_x2', 'input_y2', undefined, undefined);
    setNumByElem('result_a', 'result_b', undefined, undefined);
}

function resultToInt(result_a, result_b) {
    let multi = 1 / Math.min(result_a, result_b);
    result_a *= multi;
    result_b *= multi;
}

function testNumVaild(one,two){
    if(one.x===two.x) return false;
    //if(one.y===two.y) return false;
    return true;
}