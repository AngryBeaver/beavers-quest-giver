import {NAMESPACE, Settings} from "./Settings.js";
import {ProximityRegionApp} from "./app/region/ProximityRegionApp.js";
import { BeaversProximityApp } from "./app/BeaversProximityApp.js";

export const HOOK_READY = NAMESPACE + ".ready";
export const SOCKET_EXECUTE_ACTIVITY = "executeActivity";
export const SOCKET_TEST_PROMPT = "testPrompt";

Hooks.on("beavers-system-interface.init", async function () {
    beaversSystemInterface.addModule(NAMESPACE);
});

Hooks.once('init', () => {
    game[NAMESPACE] = game[NAMESPACE] || {};

})

Hooks.once("beavers-system-interface.ready", async function () {
    game[NAMESPACE] = game[NAMESPACE] || {};
    game[NAMESPACE].Settings = new Settings();
    game[NAMESPACE].BeaversProximityApp = new BeaversProximityApp();
    //game[NAMESPACE].socket.register(SOCKET_EXECUTE_ACTIVITY, game[NAMESPACE].BeaversProximityAction.executeAction.bind(game[NAMESPACE].BeaversProximityAction));
    //game[NAMESPACE].socket.register(SOCKET_TEST_PROMPT, game[NAMESPACE].DisplayProxy.prompt.bind(game[NAMESPACE].DisplayProxy));
    Hooks.call(HOOK_READY, game[NAMESPACE].BeaversProximityApp);
    initHandlebars();
    initializeCustomElements();
    Hooks.on("renderRegionConfig", (app, html, options) => {
        new ProximityRegionApp(app, html, options);
    });
    //game[NAMESPACE].BeaversProximityAction.addActivity(InvestigateActivity);
    //game[NAMESPACE].BeaversProximityAction.addActivity(SecretDoorActivity);

})

Hooks.once("beavers-gamepad.ready", () => {
    //const paUI = new ProximityActionUI();
    //game["beavers-gamepad"].TinyUIModuleManager.addModule(paUI.name, paUI);
});

Hooks.once("socketlib.ready", () => {
    game[NAMESPACE] = game[NAMESPACE] || {};
    game[NAMESPACE].socket = socketlib.registerModule(NAMESPACE);
});



function initializeCustomElements(){
    //customElements.define('beavers-button',BeaversButton);
    //customElements.define('beavers-activity-test-config',BeaversActivityTestConfig)
}


function initHandlebars(){
    Handlebars.registerHelper("beavers-objectLen", function (json) {
        return Object.keys(json).length;
    });
    void getTemplate('modules/beavers-proximity-action/templates/activity-setting.hbs');
    void getTemplate('modules/beavers-proximity-action/templates/activity-configuration.hbs');
    void getTemplate('modules/beavers-proximity-action/templates/activity-test-config.hbs');
    getTemplate('modules/beavers-proximity-action/templates/beavers-input-field.hbs').then(t=>{
        Handlebars.registerPartial('beavers-input-field', t);
    });


}