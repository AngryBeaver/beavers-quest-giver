import {
    _SettingConfigRecord,
    GetNamespaces
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/core/settings";

declare global {

    interface Game {
        "beavers-proximity-action":{
            BeaversProximityApp:BeaversProximityAppI,
            Settings: SettingsI,
        }
    }

    namespace ClientSettings {
        export type Namespace = GetNamespaces<keyof _SettingConfigRecord> | "beavers-system-interface"
        export type Key = string |"enableSelection"
    }
}