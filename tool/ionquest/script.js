class IonType {
    constructor(str, name) {
        this.str = str;
        this.name = name;
    }
}
class Ion {
    jpName = null;
    formula = null;
    ionType = null;
    constructor(formula, ionType, jpName) {
        this.jpName = jpName;
        this.formula = formula;
        this.ionType = ionType;
    }
    register() {
        this.constructor.type.push(this);
        return this;
    }
    static type = new Array;
    static oneCation = new IonType("+");
    static twoCation = new IonType("2+");
    static oneAnion = new IonType("-");
    static twoAnion = new IonType("2-");
    static {
        new this("H", this.oneCation, "水素イオン").register();
        new this("Li", this.oneCation, "リチウムイオン").register();
        new this("Na", this.oneCation, "ナトリウムイオン").register();
        new this("K", this.oneCation, "カリウムイオン").register();
        new this("Nh4", this.oneCation, "アンモニウムイオン").register();
        new this("Ag", this.oneCation, "銀イオン").register();

        new this("Cu", this.twoCation, "銅イオン").register();
        new this("Mg", this.twoCation, "マグネシウムイオン").register();
        new this("Zu", this.twoCation, "亜鉛イオン").register();
        new this("Fe", this.twoCation, "鉄イオン").register();
        new this("Ca", this.twoCation, "カルシウムイオン").register();
        new this("Ba", this.twoCation, "バリウムイオン").register();

        new this("Cl", this.oneAnion, "塩化物イオン").register();
        new this("OH", this.oneAnion, "水酸化物イオン").register();
        new this("NO3", this.oneAnion, "硝酸イオン").register();

        new this("S", this.twoAnion, "硫化物イオン").register();
        new this("SO4", this.twoAnion, "硫酸イオン").register();
        new this("CO3", this.twoAnion, "炭酸イオン").register();
    }
}

class Question {
    ion = null;
    isAnswered = false;
    constructor() {// random
        const tonType = Ion.type;
        this.ion = tonType[this.randInt(0, tonType.length - 1)];
    }
    answer(ionType) {
        return this.ion.ionType === ionType;
    }
    rand(min, max) {
        return Math.random() * (max - min) + min;
    }
    randInt(min, max) {
        return Math.max(min, Math.min(max, Math.floor(this.rand(min, max) + 1)));
    }
}

class QuestUtil {
    static quest() {
        const quest = new Question();
        this.questionWrite(quest);
        this.answerClear();
        this.nextOrSkipBtnUpdate(quest.isAnswered, quest);
        this.answerBtnLockUpdate(quest.isAnswered, quest);

        oneCatAnsBtn.onclick = e => this.answer(quest, Ion.oneCation);
        twoCatAnsBtn.onclick = e => this.answer(quest, Ion.twoCation);
        oneAniAnsBtn.onclick = e => this.answer(quest, Ion.oneAnion);
        twoAniAnsBtn.onclick = e => this.answer(quest, Ion.twoAnion);

        console.log(quest);
    }
    static questionWrite(quest) {
        questNameStr.innerText = quest.ion.jpName;
        questFormulaStr.innerText = quest.ion.formula;
    }
    static answer(quest, ionType, skipped) {
        const result = quest.answer(ionType);
        quest.isAnswered = true;

        this.answerWrite(quest, result);
        this.nextOrSkipBtnUpdate(quest.isAnswered, quest);
        this.answerBtnLockUpdate(quest.isAnswered, quest);
        Player.answerResult(result);
        Player.oddsUpdate();
    }
    static answerSkip(quest) {
        const result = confirm("スキップしますか？");
        if (!result) return;
        this.answer(quest)
    }
    static answerWrite(quest, result) {
        answerBeforeStr.style.visibility = "visible";
        answerElemStr.innerText = quest.ion.formula;
        answerIonStr.innerText = quest.ion.ionType.str;
        {
            let text = result ? "正解！" : "不正解";
            answerResult.innerText = text;
        }
    }
    static answerClear() {
        answerBeforeStr.style.visibility = "hidden";
        answerElemStr.innerText = "";
        answerIonStr.innerText = "";
        answerResult.innerText = "";
    }
    static nextOrSkipBtnUpdate(isAnswered, quest) {
        let text = isAnswered ? "次へ" : "スキップ";
        let event = isAnswered ? e => this.quest() : e => this.answerSkip(quest);
        nextOrSkipBtn.innerText = text;
        nextOrSkipBtn.onclick = event;
    }
    static answerBtnLockUpdate(isAnswered, quest) {
        oneCatAnsBtn.disabled = isAnswered;
        twoCatAnsBtn.disabled = isAnswered;
        oneAniAnsBtn.disabled = isAnswered;
        twoAniAnsBtn.disabled = isAnswered;
    }
    static {
        this.quest();
    }
}

class Player {
    static corrCount = 0;
    static incorrCount = 0;
    static getCorrectPerct() {
        if (this.getAnsweredCount() === 0) return 0;
        return this.corrCount / this.getAnsweredCount() * 100;
    }
    static getAnsweredCount() {
        return this.incorrCount + this.corrCount;
    }
    static oddsUpdate() {
        oddsCorr.innerText = this.corrCount;
        oddsIncorr.innerText = this.incorrCount;
        oddsPerct.innerText = this.getCorrectPerct().toFixed(0);
    }
    static answerResult(result) {
        if (result)
            this.corrCount++;
        else
            this.incorrCount++;
    }
    static {
        this.oddsUpdate();
    }
}