/**
 * Extend the base Actor.
 * @extends {Actor}
 */
export class HWActor extends Actor{
    /** @override */
    prepareData() {
        super.prepareData();
    }

    /**
    * @override
    * Augment the basic actor data with additional dynamic data. Typically,
    * you'll want to handle most of your calculated/derived data in this step.
    * Data calculated in this step should generally not exist in template.json
    */
     prepareDerivedData() {
        const actorData = this.data;
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
    }

    /**
    * Prepare Character type specific data
    */
    _prepareCharacterData(actorData) {
        if (actorData.type !== 'character') return;
        const data = actorData.data;
    }

     /**
    * Prepare NPC type specific data.
    */
      _prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;
        const data = actorData.data;
        data.xp = (data.cr * data.cr) * 100;
    }

    /**
    * Override getRollData() that's supplied to rolls.
    */
     getRollData() {
        const data = super.getRollData();
        this._getActorRollData(data);        
        return data;
    }

    /**
    * Prepare character roll data.
    */
     _getActorRollData(data) {
        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@bra.value + 4`.
        if (data.attributes) {
            for (let [k, v] of Object.entries(data.attributes)) {
                data[k] = foundry.utils.deepClone(v);
            }
        }
    }

    /**
    * Setup Icon and Token on creation
    */
    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
        let ico = `systems/homeworld/assets/doc-icons/${data.type}.svg`;
        this.data.update({ 'img': ico });
        // Setup Tokens
        if (this.type === 'character') {
            this.data.token.update({ vision: true, actorLink: true, disposition: 1 });
        }
        if (this.type === 'npc') {
            this.data.token.update({ vision: true, disposition: -1 });
        }
        if (this.type === 'vehicle') {
            this.data.token.update({ vision: true, disposition: 0 });
        }        
    }

    /**
    * Create Attributes shortcuts
    */
    getRollShortcuts() {
        let out = {};
        for (const name of ["agility", "brawn", "coordination", "insight", "reason", "will"]) {
            out[name.substring(0, 3)] = this.data.data.attributes[name].value;
        }
        return out;
    }
}