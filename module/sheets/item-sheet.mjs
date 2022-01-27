import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class HWItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["homeworld", "sheet", "item"],
            width: 520,
            height: 560,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
        });
    }

    /** @override */
    get template() {
        const path = "systems/homeworld/templates/item";
        return `${path}/item-${this.item.data.type}-sheet.html`;
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        // Retrieve base data structure.
        const context = super.getData();

        // Use a safe clone of the item data for further operations.
        const itemData = context.item.data;

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Add the actor's data to context.data for easier access, as well as flags.
        context.data = itemData.data;
        context.flags = itemData.flags;

        context.effects = prepareActiveEffectCategories(this.item.effects);
        context.HOMEWORLD = CONFIG.HOMEWORLD;


        // Prepare Aditional Data
        // if (itemData.type == 'apaprel') {
        //context.apparelTypes = CONFIG.AC2D20.APPAREL_TYPE;
        //}

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // SKILL AND FOCUS
        html.find('.focus-add').click(async (ev) => {
            await this.item.addFocus();
        });

        html.find('.focus-delete').click(async (ev) => {
            await this.item.deleteFocus($(ev.currentTarget).data('index'));
        });

        html.find('.focus-title, .focus-cb').change(async (ev) => {
            let focuses = [];
            html.find(".focus-item").each(function (index) {
                focuses = [...focuses, {
                    title: $(this).find('.focus-title').val(),
                    isfocus: $(this).find('.focus-cb').is(':checked')
                }];
            });
            await this.item.updateFocuses(focuses)
        });

        // Effects.
        html.find(".effect-control").click(ev => {
            if (this.item.isOwned) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.")
            onManageActiveEffect(ev, this.item)
        });

        // Send to Chat
        html.find(".post-item").click((ev) => {
            this.item.sendToChat();
        })

        // DON't LET NUMBER FIELDS EMPTY
        const numInputs = document.querySelectorAll('input[type=number]');
        numInputs.forEach(function (input) {
            input.addEventListener('change', function (e) {
                if (e.target.value == '') {
                    e.target.value = 0
                }
            })
        });
    }
}
