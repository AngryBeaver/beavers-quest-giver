import {ActivityStore} from "./ActivityStore.js";
import {ProximitySquareGrid} from "../ProximitySquareGrid.js";
import {Activity} from "./Activity.js";
import {bpa} from "../types.js";

export class BPAEngine {
    public readonly activityStore: ActivityStore;
    public readonly grid: bpa.Grid;
    private _activities: Activity[];

    constructor(scene: Scene) {
        this.activityStore = new ActivityStore(scene);
        if (scene["grid"].type === 1) {
            this.grid = new ProximitySquareGrid()
        }
    }

    /**
     * bpa can enable activities
     * settings can enable activities
     * scene config can enable activities
     */
    public enableActivity(activity: Activity) {
        //TODO activate configurations
        this._activities.push(activity);
    }

    /**
     * users can get Activities around a token
     * tokens have a center and a rotation
     */
    public getProximityActivities(request: bpa.ProximityRequest): bpa.ProximityResult {
        const grids: Point[] = this.grid.getProximityGrids(request);
        const hitArea: bpa.HitArea = this._filterGridsBehindWalls(request.token.center, grids);
        const result: bpa.ProximityResult = {
            origin: request.token.center,
            actorId: request.actorId,
            activities: [],
            hitArea: hitArea
        }
        for (const activity of this._activities) {
            if (activity.isAvailable(request.actorId, hitArea)) {
                result.activities.push({
                    id: activity.id,
                    name: activity.name,
                })
            }
        }
        return result;
    }

    /**
     * users can execute an activity within proximity range.
     */
    public async executeActivity(request: bpa.ActivityRequest) {
        const activity: Activity = this._activities[request.activityId];
        await activity.execute(request.actorId, request.hitArea);
    }

    /**
     * add wallIds and remove grids behind walls
     */
    private _filterGridsBehindWalls(origin: Point, grids: Point[]): bpa.HitArea {
        const hitArea: bpa.HitArea = {
            gridIds: [],
            wallIds: []
        }
        if (canvas?.grid?.grid) {
            for (const point of grids) {
                const pixel = canvas.grid.grid.getCenter(point.x, point.y);
                const wall = this._getCollisionWall(origin, pixel);
                if (!wall) {
                    hitArea.gridIds.push(this.grid.getGridId(point));
                } else {
                    if (!hitArea.wallIds.includes(wall.id)) {
                        hitArea.wallIds.push(wall.id);
                    }
                }
            }

        }
        return hitArea;
    }

    private _getCollisionWall(origin: Point, destination: PointArray): Wall | undefined {
        const result = CONFIG.Canvas["losBackend"].testCollision(origin, {x:destination[0],y:destination[1]}, {type: "move", mode: "closest"});
        return result?.edges?.values()?.next()?.value?.wall;
    }


}