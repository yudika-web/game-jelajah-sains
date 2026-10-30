import {parseProgress} from './mission';
import {parseGarden} from './gardenMission';
import {parseRimba} from './rimbaMission';
import {parseRiver} from './riverMission';
import {parseBuoyancy} from './buoyancyMission';
import {parseIrrigation} from './irrigationMission';
import {parseWorkshop} from './workshopMission';
import {parseElectromagnet} from './electromagnetMission';
import {parseEnergy} from './energyMission';
import {parseCoastal} from './coastalMission';
import {parsePressure} from './pressureMission';
import {parseHydraulic} from './hydraulicMission';
import {parseSolid} from './solidMission';
import {parsePontoon} from './pontoonMission';
import {parseGeo} from './geoparkMission';
import {parseSpace} from './spaceMission';
import {parseMarket} from './marketMission';
import type {GameState} from './gameState';

/** Existing parsers remain the authority for evidence, including replayed XP proofs. */
export const missionRecords = {
 M01:{property:'M01',parse:parseProgress}, M14:{property:'M14',parse:parseGarden},
 'W03-LOG01':{property:'Rimba',parse:parseRimba}, S13:{property:'S13',parse:parseRiver},
 S14:{property:'S14',parse:parseBuoyancy}, S15:{property:'S15',parse:parseIrrigation},
 'M17-E1':{property:'M17E1',parse:parseWorkshop}, 'M17-E2':{property:'M17E2',parse:parseElectromagnet},
 'M17-E3':{property:'M17E3',parse:parseEnergy}, S16:{property:'S16',parse:parseCoastal},
 'M16-E1':{property:'M16E1',parse:parsePressure}, 'M16-E2':{property:'M16E2',parse:parseHydraulic},
 'M16-E3':{property:'M16E3',parse:parseSolid}, 'M16-E4':{property:'M16E4',parse:parsePontoon},
 M13:{property:'M13',parse:parseGeo}, M07:{property:'M07',parse:parseSpace}, M02:{property:'M02',parse:parseMarket},
} as const;
export type RecordId=keyof typeof missionRecords;
export function missionEntries(game:GameState):[RecordId,unknown][] {
 return (Object.entries(missionRecords) as [RecordId,typeof missionRecords[RecordId]][])
  .map(([id,record])=>[id,record.parse(game[record.property])]);
}
