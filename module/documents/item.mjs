/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
 export class HWItem extends Item {
    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
        // As with the actor class, items are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).
        super.prepareData();
    }

    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
        let ico = `systems/homeworld/assets/doc-icons/${data.type}.svg`;
        this.data.update({ 'img': ico });
    }

    /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        if (!this.actor) return null;
        const rollData = this.actor.getRollData();
        rollData.item = foundry.utils.deepClone(this.data.data);
        return rollData;
    }

    // FOCUS
    async addFocus() {
        let focuses = this.data.data.focuses;
        const focus = { title: '', isfocus: false, description: '' }
        focuses = [...focuses, focus];
        let updatedItem = { _id: this.id, data: { focuses: focuses } };
        await this.update(updatedItem);
    }
    async deleteFocus(_index) {
        console.log(_index)
        let focuses = this.data.data.focuses;
        focuses.splice(_index, 1);
        let updatedItem = { _id: this.id, data: { focuses: focuses } };
        await this.update(updatedItem);
    }
    async updateFocuses(_focuses) {
        let updatedItem = { _id: this.id, data: { focuses: _focuses } };
        await this.update(updatedItem);
    }
    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    async roll() {
        const item = this.data;

        // Initialize chat data.
        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
        const rollMode = game.settings.get('core', 'rollMode');
        const label = `[${item.type}] ${item.name}`;

        // If there's no roll data, send a chat message.
        if (!this.data.data.formula) {
            ChatMessage.create({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
                content: item.data.description ?? ''
            });
        }
        // Otherwise, create a roll and send a chat message from it.
        else {
            // Retrieve roll data.
            const rollData = this.getRollData();

            // Invoke the roll and submit it to chat.
            const roll = new Roll(rollData.item.formula, rollData).roll();
            roll.toMessage({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
            });
            return roll;
        }
    }

    async sendToChat() {
        const itemData = duplicate(this.data);
        //console.warn(itemData)
        itemData.isPhysical = itemData.data.hasOwnProperty('weight')
        itemData.isWeapon = itemData.type === "weapon";
        itemData.isArmor = itemData.type === "armor";
        itemData.isTalent = itemData.type === "talent";
        itemData.isSpell = itemData.type === "spell";
        itemData.isSkillkit = itemData.type === "skillkit";
        itemData.isSkillkit = itemData.type === "skillkit";
        itemData.isEquipment = itemData.type === "equipment";
        itemData.isSpecial_rule = itemData.type === "special_rule";
        itemData.isSkill = itemData.type === "skill";
        const html = await renderTemplate("systems/homeworld/templates/chat/item.html", itemData);
        const chatData = {
            user: game.user.id,
            rollMode: game.settings.get("core", "rollMode"),
            content: html,
        };
        if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperIDs("GM");
        } else if (chatData.rollMode === "selfroll") {
            chatData.whisper = [game.user];
        }
        ChatMessage.create(chatData);
    }
}
