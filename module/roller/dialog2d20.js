export class Dialog2d20 extends Dialog {


    constructor(rollName, diceNum, attribute, skill, focus, complication, actor, prefAttribute, dialogData = {}, options = {}) {
        super(dialogData, options);
        this.rollName = rollName;
        this.diceNum = diceNum;
        this.attribute = attribute;
        this.skill = skill;
        this.focus = focus;
        this.complication = complication;
        this.actor = actor;
        this.prefAttribute = prefAttribute;
        this.options.classes = ["dice-icon"];
    }

    //override
    activateListeners(html) {
        super.activateListeners(html);
        html.ready((e) => {
            this.markDiceNumber(html, this.diceNum);
        })
        html.on('click', '.dice-icon', (e, i, a) => {
            let index = e.currentTarget.dataset.index;
            this.diceNum = parseInt(index);
            this.markDiceNumber(html, this.diceNum);
        });
        html.on('click', '.roll', (event) => {
            let attr = html.find('[name="attribute"]').val();
            if (!attr) {
                let attrAbr = html.find('.select-attribute').val();
                attr = this.actor.attributes[attrAbr].value;
            }
            let skill = html.find('[name="skill"]').val();
            let complication = html.find('[name="complication"]').val();
            let isFocus = html.find('[name="focus"]').is(':checked');
            game.homeworld.Roller2D20.rollD20({ rollname: this.rollName, dicenum: this.diceNum, attribute: attr, skill: skill, focus: isFocus, complication: complication })
        });
    }

    markDiceNumber(html) {
        $(html).find('.dice-icon').removeClass('marked');
        $(html).find(`[data-index="${this.diceNum}"]`).addClass('marked');
    }

    static async createDialog({ rollName = "Roll D20", diceNum = 2, attribute = 0, skill = 0, focus = false, complication = 20, actor = null, prefAttribute = null } = {}) {
        let dialogData = {}
        dialogData.rollName = rollName;
        dialogData.diceNum = diceNum;
        dialogData.attribute = attribute;
        dialogData.skill = skill;
        dialogData.focus = focus;
        dialogData.complication = complication;
        dialogData.attributes = ['agi', 'bra', 'coo', 'ins', 'rea', 'wil'];
        dialogData.actor = actor;
        dialogData.prefAttribute = prefAttribute;
        const html = await renderTemplate("systems/homeworld/templates/dialogs/dialog2d20.html", dialogData);
        let d = new Dialog2d20(rollName, diceNum, attribute, skill, focus, complication, actor, prefAttribute, {
            title: rollName,
            content: html,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "ROLL"
                }
            }
        });
        d.render(true);
    }
}