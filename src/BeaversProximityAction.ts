import {Activity} from "./activities/Activity.js";
import {BPAEngine} from "./activities/BPAEngine.js";
import {bpa} from "./types.js";
import {NAMESPACE} from "./Settings.js";

export class BeaversProximityAction {

    private _data:{
        [sceneId:string]:BPAEngine
    }={};
    _actionClasses:{
        [activityId:string]:{
            [actionClassId:string]:any
        }
    }={};
    _activityClasses:{
        [activityId:string]:bpa.ActivityClass
    }={};
    _activities:{
        [activityId:string]:Activity
    }={};

    /**
     * Modules can add activityClasses
     * They are not stored and needs to be registered each time with a ready hook.
     */
    public addActivityClass(activityClass:bpa.ActivityClass){
        this._activityClasses[activityClass.defaultData.id] = activityClass;
        const currentSceneId = this.defaultSceneId();
        game[NAMESPACE].Settings.addActivity(activityClass);
        if(this._data[currentSceneId]){
            this._activateActivity(activityClass.defaultData.id, currentSceneId);
        }
    }

    /**
     * Modules can extend existing Activities by register additional ActionClasses.
     * They are not stored and needs to be registered each time when with a ready hook.
     */
    public addActionClass(activityId:string, actionClassId:string,actionClass){
        this._actionClasses[activityId] = this.getActionClasses(activityId);
        this._actionClasses[activityId][actionClassId] = actionClass;
    }

    /**
     * Activities can lookUp actionClasses that had been registered from other modules
     */
    public getActionClasses(activityId:string){
        return this._actionClasses[activityId] || {};
    }

    /**
     * instanciate BPAEngine for scene if not exists
     * @param sceneId
     */
    public async activateScene(sceneId:string=this.defaultSceneId()){
        if(!this._data[sceneId]) {
            const scene = await fromUuid(sceneId) as Scene;
            this._data[sceneId] = new BPAEngine(scene);
        }
        for(const activityId of Object.keys(this._activityClasses)){
            this._activateActivity(activityId, sceneId);
        }
    }

    private _activateActivity(activityId:string,sceneId:string){
        if(this._activities[activityId]){
            this._activities[activityId].destruct();
        }
        this._activities[activityId] = new this._activityClasses[activityId](this._data[sceneId],sceneId);
    }


    private defaultSceneId(){
        return canvas?.scene?.uuid || "";
    }

}