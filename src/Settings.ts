import {createActivitySettings} from "./ActivitySetting.js";

export const NAMESPACE = "beavers-proximity-action"

export class Settings implements SettingsI {

    constructor() {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        /*game.keybindings?.register(NAMESPACE, 'current Token', {
            name: 'beaversProximityAction.keybinding.name',
            editable: [{key: 'KeyH', modifiers: ['Shift']}],
            onDown: () => {
                game[NAMESPACE].UserInteraction.request();
            }
        });*/
    }

    //registerGlobalSettings for an Action
    public addActivity(activity: Activity) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        var configLabel = game.i18n?.localize("beaversProximityAction.activitySettings.configuration");


        game.settings.register(NAMESPACE, "activity-"+activity.id, {
            name: activity.template.name,
            scope: "world",
            config: false,
            default: activity.defaultData,
            // @ts-ignore
            type: Object
        });


        game.settings.registerMenu(NAMESPACE, "activity-"+activity.id + "-button", {
            name: activity.template.name,
            label: configLabel,
            // @ts-ignore
            type: createActivitySettings(activity),
            restricted: true
        });
    }

    public getActivityData(activityId:string):ActivityData {
        const activityData = (this.get("activity-"+activityId) as ActivityData);
        return foundry.utils.deepClone(activityData);
    }

    public get(key:string) {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        return game.settings.get(NAMESPACE, key);

    };

    public set(key:string, value): Promise<any> {
        if (!(game instanceof Game)) {
            throw new Error("Settings called before game has been initialized");
        }
        return game.settings.set(NAMESPACE, key, value);
    }


}
