
type EntityType = "wall" | "tile" | "region";
type ProximityType = "close" | "cone"
type Point = Canvas.Point

/**
 * ActivityConfigs is the configuration for individual Entities.
 * holds information on which activities are active on Entity and individual data stored to those activities.
 */
interface EntityConfigs {
    activities:{
        [uid:string]:EntityConfig
    }
}

/**
 * ActivityConfig is the configuration for one activity on individual Entities.
 * holds information on which activities are active on Entity and individual data stored to those activities.
 */
interface EntityConfig {
   activityId:string, data: {
       [property:string]:any
   } & Partial<Test<any>>
}

/**
 * ActivityData is the configuration setting for Activities.
 * can be configured globally or comes with as default from Activity declaration
 * holds information on which entity it is enabled per default.
 * holds information on how the Test needs to look like for this Activity.
 */
interface ActivityData {
    enabled: { attribute: string, value: any }[],
    test: Test<any>
}
/**
 * ActivityTemplate describes an Activity
 * it holds configuration fields unique to this Activity that can then be set on the Action.
 * it describes how it should be used programatically.
 * e.g. has a global fallback, Actions can be configured to have subOptions etc.
 */
interface ActivityTemplate {
    id: string,
    name: string,
    desc: string,
    config: {
        [configId: string]: InputField,
    },
    allowSubOptions?: boolean,
    fallback?: (initiator: InitiatorData) => void,//fallback when no tile is successfull.
}

/**
 * An Activity is the class Action the instance of this class.
 * in your ActivityDeclaration you should overwrite template and defaultData.
 */
interface Activity {
    new(entityId: string, initiatorData: InitiatorData): ActivityInstance
    template: ActivityTemplate,
    data: ActivityData,
    defaultData: ActivityData,
    id: string,
}

/**
 * the request that starts a proximityScan
 */
interface ProximityRequest {
    initiator: InitiatorData,
    distance: number,
    type: ProximityType,
}
/**
 * the response of a proximityScan
 */
interface ProximityResponse {
    origin: Point
    initiator: InitiatorData,
    activities:
        ActivityHit[],
}
/**
 * an ActivityReqeust followed by a proxmityScan
 * will lead to a test
 */
interface ActivityRequest {
    activityHit: ActivityHit,
    initiatorData: InitiatorData,
}
/**
 * an Activity found by a proximityScan including the entities hitted
 */
interface ActivityHit {
    activityId: string,
    name: string,
    type: EntityType,
    entityIds: string[]
}

interface HitAreaData {
    tileIds: string[],
    wallIds: string[],
    polygon: number[]
}

interface BeaversProximityAppI {
    addActivity:(activity: Activity) => void,
    getActivities: (type: EntityType) => Activity[],
    getActivity: (actionId: string) => Activity,
}

/**
 * An ActivityInstance
 * configured with the entity it is activated on the initiator that activates it and all global and individual configurations.
 * it has one Run method that is executed with the TestResult given.
 */
interface ActivityInstance {
    entity: any;
    configs: EntityConfig[];
    initiator: InitiatorData;
    run:(testResult:TestResult)=>Promise<void>;
}
interface ActivityLayerI {
    drawActivity:(points: number[], id:string, color?:string)=>void
}
interface SettingsI {
    addActivity:(activity: Activity)=>void,
    getActivityData:(activityId: string)=>ActivityData,
    set:(key:string, value:any)=>void
    //getActivitySettingData:(activity:Activity)=>any,
}







type MsgType = "info" | "warn" | "error";


interface TestResult {
    type: InputType,
    fails?: number,
    value?: string | number | boolean,
}

interface DisplayModule {
    msg: (msg: string, type: MsgType,initiatorData:InitiatorData ) => Promise<void>
    prompt: (inputField:InputField,initiatorData:InitiatorData)=>Promise<boolean|null>
    input: (inputField: InputField,initiatorData:InitiatorData)=>Promise<any>
}


interface Edge {
    p1: Point,
    p2: Point
}
interface Polygon {
    edges: Edge[],
    bounds: Bounds,
}
interface Bounds {
    x:number,
    y:number,
    width: number,
    height: number
}


interface TabData {
    id: string,
    name: string,
    icon: string,
    group: string,
    content: string,
    onClick: ()=>void
}