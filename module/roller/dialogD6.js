export class DialogD6 extends Dialog {

    constructor(rollName, diceNum, dialogData = {}, options = {}) {
        super(dialogData, options);
        this.rollName = rollName;
        this.diceNum = diceNum;
        this.options.classes = ["dice-icon"];
    }

    static async createDialog({ rollName = "Challenge Roll", diceNum = 2, roll2d20 = null, itemId = null, actorId = null } = {}) {
        let dialogData = {}
        dialogData.rollName = rollName;
        dialogData.diceNum = diceNum;
        dialogData.roll2d20 = roll2d20;
        dialogData.itemId = itemId;
        dialogData.actorId = actorId;
        const html = `<div class="flexrow homeworld-dialog">
        <div class="flexrow resource" style="padding:5px">
        <label class="title-label">Number of Dice:</label><input type="number" class="d-number" value="${diceNum}">
        </div>
        </div>`
        let d = new DialogD6(rollName, diceNum, {
            title: rollName,
            content: html,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "ROLL",
                    callback: (html) => {
                        let diceNum = html.find('.d-number')[0].value;
                        if (!roll2d20)
                            game.homeworld.Roller2D20.rollD6({ rollname: rollName, dicenum: parseInt(diceNum), itemId: itemId, actorId: actorId });
                        else
                            game.homeworld.Roller2D20.addD6({ rollname: rollName, dicenum: parseInt(diceNum), roll2d20: roll2d20, itemId: itemId, actorId: actorId });
                    }
                }
            },
            default: "roll",
            close: () => { },
        });
        d.render(true);
    }
}