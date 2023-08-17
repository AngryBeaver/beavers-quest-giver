import {TestHandler} from "./TestHandler.js";
import {SquareGrid} from "./SquareGrid.js";
import {NAMESPACE} from "./main";

export const PriorityTypeOrder: PriorityType[] = ["normal", "fallback"];

export class ActionGridClass implements ActionGrid {

    private _grid: Grid;
    private _activityResultStore:ActivityResultStore;
    private activities: {
        [activityId: string]: Activity;
    } = {};
    private actions: {
        [actionId: string]: Action;
    } = {};
    private activityActions: {
        [activityId: string]: string[],
    }
    private wallActions: {
        fallback: string[],
        normal: string[],
    } = {fallback: [], normal: []};
    private gridActions: {
        fallback: string[],
        normal: string[],
    } = {fallback: [], normal: []};

    constructor(){
        this._activityResultStore = game[NAMESPACE].ActivityResultStore;
        this._grid = new SquareGrid();
    }


    public async executeActivity(request: ActivityRequest) {
        //getActions for each grid;
        //getGridActions for those grids with the specified activityId.
        //getWallActions for those walls
        //checkAvailability of all Actions
        //throw Exception if no action is found.
        //execute ActivityCheck
        //trigger all Action with this activityCheck.
        //store activityResult for all grids,walls and act
        const actions:{
            [actionId:string]:{
                gridIds:string[],
                wallIds:string[]
            }
        }={};

        //getAvailableActions
        for (const gridId of request.gridIds) {
            //detect wall on grids based on origin
            const wall = this._getCollisionWall(request.origin, gridId);
            //getAvailableAction on each grid
            const availAbleActions = this._getAvailableActionsFor(gridId, request.actorId, wall);
            //filter actions for the given activity
            if(availAbleActions[request.activityId]){
                for(const actionId of availAbleActions[request.activityId]){
                    //store all available actions and their grids/walls.
                    actions[actionId] = actions[actionId] || {gridIds:[],wallIds:[]};
                    if(wall){
                        actions[actionId].wallIds.push(wall.id)
                    }else{
                        actions[actionId].gridIds.push(gridId)
                    }
                }
            }
        }
        //throw if no action has been found.
        if(Object.values(actions).length==0){
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noAvailableActionsFound"));
        }
        const activity = this.activities[request.activityId];
        const actor = await fromUuid(request.actorId) as Actor;
        if(actor) {
            //test activity
            //TODO better send this request back to the caller here we are gm !
           const testResult = await new TestHandler(activity.testOptions, actor).test();
           //check if test has been aborted
           if(testResult != null) {
               //trigger all actions with that testResult
               for (const [actionId, locations] of Object.entries(actions)) {
                   const action = this.actions[actionId];
                   const activityResultData:ActivityResultData = {...testResult,...locations,actorId:request.actorId};
                   activityResultData.actionResult = await action.activate(activityResultData);
                   //store the activityResult
                   this._activityResultStore.add(actionId,activityResultData);
               }
           }
        }
    }

    getProximity(request: ProximityRequest): VisualActivity[] {
        const result: {
            [activityId: string]: string[]
        } = {};
        const actorId = request.token?.actor?.id;
        const origin = request.token.center;
        if (!actorId) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.noActorOnToken"));
        }
        //get all grid fields.
        const proximityGrids = this._grid.getProximityGrids(request);
        //filter grids that hit walls
        const resultGrids: [gridId: string, wall?: Wall | undefined][] = this._filterGridsThatHitWalls(origin, proximityGrids);
        for (const [gridId, wall] of resultGrids) {
            const actions = this._getAvailableActionsFor(gridId, actorId, wall);
            for(const [activityId,actionIds] of Object.entries(actions)){
                result[activityId] = result[activityId] || [];
                result[activityId].push(gridId);
            }
        }
        return Object.entries(result).map(([id, gridIds]) => {
            return {...this.activities[id], gridIds: gridIds, origin: origin}
        })
    }

    registerAction(action: Action): string {
        return "";
    }

    registerActivity(register: RegisterActivity): string {
        return "";
    }

    unregisterAction(id: number): void {
        delete this.activities[id];
    }

    unregisterActivity(activityId: string): void {
    }

    private _getAvailableActionsFor(gridId:string, actorId:string, wall?:Wall): { [activityId: string]:string[] }{
        const result: {
            [activityId: string]: string[]
        } = {};
        const activityPriority: {
            [activityId: string]: PriorityType
        } = {};
        for (const priority of PriorityTypeOrder) {
            for (const actionId of this.wallActions[priority]) {
                const action = this.actions[actionId];
                const activityId = action.activityId;
                if ((!activityPriority[activityId] || activityPriority[activityId] === priority)
                    && ((wall && action.isMatchingWall(wall))||(!wall && action.isMatchingGrid(gridId)))
                    && action.isAvailable(gridId, actorId, wall)) {
                    activityPriority[activityId] = priority;
                    result[activityId] = result[activityId] || []
                    result[activityId].push(action.id)
                }
            }
        }
        return result;
    }


    private _addAvailableActivityGridToResult(gridId: string, activityId: string, result: { [activityId: string]: string[] }) {
        if (!result[activityId]) {
            result[activityId] = []
        }

    }

    //add wallgrids and remove grids behind wallgrids.
    private _filterGridsThatHitWalls(origin: Point, proximityGrids: ProximityGrids): [gridId: string, wall?: Wall][] {
        const result: [gridId: string, wall?: Wall][] = [];
        const previousWalls: string[] = [];
        for (const [distance, grids] of proximityGrids) {
            const currentWalls: string[] = [];
            for (const gridId of grids) {
                const wall = this._getCollisionWall(origin, gridId);
                if (!wall) {
                    result.push([gridId]);
                } else {
                    //remove wallGrids that had been detected in a closer distance
                    if (wall.id in previousWalls) {
                        currentWalls.push(wall.id);
                        result.push([gridId, wall]);
                    }
                }
            }
            previousWalls.push(...currentWalls);
        }
        return result;
    }

    private _getCollisionWall(origin: Point, gridId: string): Wall | undefined {
        const destination = this._grid.centerOfGridId(gridId);
        const result = CONFIG.Canvas["losBackend"].testCollision(origin, destination, {type: "move", mode: "closest"});
        return result?.edges?.values()?.next()?.value?.wall;
    }

}