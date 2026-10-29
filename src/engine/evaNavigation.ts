import {evaBounds,exteriorObstacles,expeditionConfig} from '../data/spaceExpedition';
import {createVolumeNavigation} from './volumeNavigation';
export {distance3} from './volumeNavigation';
const navigation=createVolumeNavigation({bounds:evaBounds,body:expeditionConfig.body,obstacles:exteriorObstacles});
export const evaWalkable=navigation.walkable,evaSegmentClear=navigation.segmentClear,sweepEva=navigation.sweep,findEvaPath=navigation.findPath;
