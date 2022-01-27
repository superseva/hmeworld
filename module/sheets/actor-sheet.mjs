import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";
import {HOMEWORLD} from "../helpers/config.mjs"

export class HWActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["homeworld", "sheet", "actor"],
            template: "systems/homeworld/templates/actor/actor-sheet.html",
            width: 720,
            height: 780,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities" }]
        });
    }

    /** @override */
    get template() {
        return `systems/homeworld/templates/actor/actor-${this.actor.data.type}-sheet.html`;
    }

    /** @override */
    getData() {
        const context = super.getData();
        const actorData = context.actor.data;
        context.data = actorData.data;
        context.flags = actorData.flags;

        // Prepare Character data and items.
        if (actorData.type == 'character') {
            this._prepareItems(context);
            this._prepareCharacterData(context);
        }
        // Prepare NPC data and items.
        if (actorData.type == 'npc') {
            this._prepareItems(context)
        }

        // Prepare Creature data and items.
        if (actorData.type == 'vehicle') {
            this._prepareItems(context)

        }

        // Add roll data for TinyMCE editors.
        //context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.actor.effects);
        context.HOMEWORLD = HOMEWORLD;

        return context;
    }

    _prepareCharacterData(context) {
        // prepare chracter data
    }

    // PREPARE INVENTORY
    _prepareItems(context) {

    }

     /** @override */
     activateListeners(html) {
        super.activateListeners(html);
    }

    _editOwnedItemById(_itemId) {
        const item = this.actor.items.get(_itemId);
        item.sheet.render(true);
    }
    async _deleteOwnedItemById(_itemId) {
        const item = this.actor.items.get(_itemId);
        await item.delete();
    }
    _onPostItem(_itemId) {
        const item = this.actor.items.get(_itemId);
        item.sendToChat();
    }

    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.   
        const itemData = {
            name: name,
            type: type,
            data: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.data["type"];
        // Finally, create the item!
        return await Item.create(itemData, { parent: this.actor });
    }

     // Toggle Equipment
     _toggleEquipped(id, item) {
        return {
            _id: id,
            data: {
                equipped: !item.data.data.equipped,
            },
        };
    }
}