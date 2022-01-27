export function registerSettings() {
    game.settings.register('homeworld', 'partyMomentum', {
        name: 'Party Momentum',
        scope: 'world',
        config: false,
        default: 0,
        type: Number,
    });
    game.settings.register('homeworld', 'gmMomentum', {
        name: 'GM Momentum',
        scope: 'world',
        config: false,
        default: 0,
        type: Number,
    });
    game.settings.register('homeworld', 'maxMomentum', {
        name: 'Max Momentum',
        scope: 'world',
        config: false,
        default: 6,
        type: Number,
    });
    game.settings.register('homeworld', 'compendium-skills', {
        name: 'Skills Compendium',
        scope: 'world',
        config: true,
        default: "ac2d20.skills",
        type: String,
    });
}