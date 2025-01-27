import {NAMESPACE} from "../Settings.js";

export class BeaversProximityApp implements BeaversProximityAppI {

    game: Game;

    //dual store for better access
    private activities:{
        byId:{
            [id: string]: Activity
        }
        byType: {
            [type in  EntityType] : Activity[]
        }
    } = {byId:{},byType:{wall:[],tile:[],region:[]}}

    constructor(){
        if(game instanceof Game) {
            this.game = game;
        }else{
            throw Error("game not initialized");
        }
    }

    /**
     * Modules can add Activities
     * They are not stored and needs to be registered each time with a ready hook.
     * Each registered Activity will create a Setting to allow configuration of default values.
     */
    public addActivity(activity: Activity){
        this.activities.byId[activity.id] = activity;
        this.game[NAMESPACE].Settings.addActivity(activity);
    }

    public getActivities(type: EntityType):Activity[] {
        return this.activities.byType[type];
    }

    public getActivity(activityId: string):Activity{
        return this.activities.byId[activityId];
    }

    /**
     * users can test an activity
     * TODO ask for SubOptions

    public async testActivity(request: ActivityRequest) {
        const initiator = new Initiator(request.initiatorData);
        const activity: Activity = this.getActivity(request.activityHit.activityId);
        const testResult = await game[NAMESPACE].DisplayProxy.test(activity.data.test,initiator)
        if(testResult!= null){
            await game[NAMESPACE].socket.executeAsGM(SOCKET_EXECUTE_ACTIVITY,request,testResult);
        }
    }*/

    /**
     * socket gm can execute Actions

    public async executeAction(request: ActivityRequest,testResult:TestResult){
        const initiator = new Initiator(request.initiatorData);
        const activity: Activity = this.getActivity(request.activityHit.activityId);
        const promises:Promise<any>[] = []
        for(const entityId of request.activityHit.entityIds) {
            const action = new activity(entityId, initiator);
            promises.push(action.run(testResult));
        }
        await Promise.all(promises);
    }*/

}