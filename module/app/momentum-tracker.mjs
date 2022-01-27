export class MomentumTracker extends Application {
    constructor(options = {}) {
        if (MomentumTracker._instance) {
            throw new Error("MomentumTracker already has an instance!!!");
        }
        super(options);
        MomentumTracker._instance = this;
        MomentumTracker.closed = true;
        this.data = {};
    }
    // override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "AP Tracker",
            template: "systems/homeworld/templates/ap/momentum-tracker.html",
            classes: ["homeworld", "momentum-tracker"],
            id: "momentum-tracker-app",
            popOut: false,
            resizable: false,
            width: "auto",
            height: "200"
        });
    }
    // override
    getData() {
        super.getData();
        this.data["isGM"] = game.user.isGM;
        this.data["partyMomentum"] = game.settings.get('homeworld', 'partyMomentum');
        this.data["gmMomentum"] = game.settings.get('homeworld', 'gmMomentum');
        this.data["maxMomentum"] = game.settings.get('homeworld', 'maxMomentum');
        return this.data;
    }

    static renderApTracker() {
        if (MomentumTracker._instance)
            MomentumTracker._instance.render(true);
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (MomentumTracker.closed) {
            html.find('.ap-resource.maxMomentum-box').css("display", "none");
        }

        html.find('.ap-input').change(ev => {
            const type = $(ev.currentTarget).parents('.ap-resource').attr('data-type');
            const value = ev.target.value;
            MomentumTracker.setAP(type, value);
        });

        html.find('.ap-add, .ap-sub').click(ev => {
            const type = $(ev.currentTarget).parents('.ap-resource').attr('data-type');
            const change = $(ev.currentTarget).hasClass('ap-add') ? 1 : -1;
            let currentValue = game.settings.get('homeworld', type);
            let maxMomentum = game.settings.get('homeworld', 'maxMomentum');
            if (parseInt(currentValue) < maxMomentum || parseInt(currentValue) > 0) {
                let newValue = parseInt(currentValue) + change;
                MomentumTracker.setAP(type, newValue);
            }

        });

        html.find('.toggle-maxAp').click(ev => {
            html.find('.ap-resource.maxMomentum-box').slideToggle("fast", function () { MomentumTracker.closed = !MomentumTracker.closed });
        })
    }

    static async setAP(type, value) {
        value = Math.round(value);
        if (!game.user.isGM) {
            game.socket.emit('system.homeworld', {
                operation: 'setAP',
                data: { 'value': value, 'type': type },
            });
            return;
        }

        let maxMomentum = game.settings.get('homeworld', 'maxMomentum');
        let partyMomentum = game.settings.get('homeworld', 'partyMomentum');
        if (partyMomentum > value && type === 'maxMomentum') {
            await game.settings.set('homeworld', 'maxMomentum', value);
            await game.settings.set('homeworld', 'partyMomentum', value);
            MomentumTracker.renderApTracker();
            game.socket.emit('system.homeworld', { operation: 'updateAP' });
            return;
        }

        if (value > maxMomentum && type === 'partyMomentum') {
            await game.settings.set('homeworld', type, maxMomentum);
            MomentumTracker.renderApTracker();
        } else if (value < 0) {
            await game.settings.set('homeworld', type, 0);
            MomentumTracker.renderApTracker();
        } else {
            await game.settings.set('homeworld', type, value);
            MomentumTracker.renderApTracker();
        }

        // emit socket event for the players to update
        game.socket.emit('system.homeworld', { operation: 'updateAP' });
    }

    static updateAP() {
        MomentumTracker.renderApTracker();
    }
}

Hooks.once("ready", () => {
    if (MomentumTracker._instance) return;
    let ap = new MomentumTracker();
    MomentumTracker.renderApTracker();
    game.socket.on("system.homeworld", (ev) => {
        if (ev.operation === "setAP") {
            if (game.user.isGM)
                MomentumTracker.setAP(ev.data.type, ev.data.value);
        }
        if (ev.operation === "updateAP") MomentumTracker.updateAP();
    });
});