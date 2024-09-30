function calcBtnClick() {
    const about = calc(getInputValue());
    setAboutValue(about.join("\n"));
}
function calc(input) {
    function calcOne(right) {
        const about = new Array;
        if (input % right != 0) return null;
        const left = input / right;
        const sqrtLeft = Math.sqrt(left);
        if (!Number.isInteger(sqrtLeft)) return null;
        about.push(`=√${left}x√${right}`);
        about.push(`=${sqrtLeft}x√${right}`);
        about.push(`=${sqrtLeft}√${right}`);

        return about;
    }
    for (let num = 1; num < 100; num++) {
        const result = calcOne(num);
        if (result == null) continue;
        return result;
    }
    return ["error"];
}

function getInputValue() {
    return document.getElementById("input").value;
}
function setOutputValue(value) {
    return document.getElementById("output").value = value;
}
function setAboutValue(value) {
    return document.getElementById("about").value = value;
}

document.addEventListener("keydown", e => {
    if (e.key != "Enter") return;
    document.getElementById("calcBtn").click();
})