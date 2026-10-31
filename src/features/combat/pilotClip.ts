import type { PilotFrame, PilotPhase, PilotPose } from './pilotModel.ts';
import type { PoseAnchors } from './pilotGeometry.ts';

export interface PilotDrawing {
  src: string;
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  column: number;
  row: number;
  anchors: PoseAnchors;
}
const drawing = (src:string, index:number, columns:number, rows:number, anchors:PoseAnchors):PilotDrawing => ({
  src:`/combat-pilot/${src}.png`, width:columns*512, height:rows*512,
  cellWidth:512, cellHeight:512, column:index%columns, row:Math.floor(index/columns), anchors,
});
// Calibrated in packed cell-local pixels. One .84 source calibration for both supplemental
// sheets, .48 for both repair cutouts; no per-frame bounds normalization at render time.
const nyra:PoseAnchors[] = [
  {support:[255,500],contact:[249,279],hand:[258,222],bounds:[86,112,422,502]},
  {support:[260,500],contact:[267,278],hand:[202,239],bounds:[60,113,423,502]},
  {support:[263,500],contact:[272,271],hand:[436,181],bounds:[52,112,443,502]},
  {support:[257,490],contact:[258,277],hand:[426,197],bounds:[72,104,439,493]},
  {support:[264,490],contact:[265,278],hand:[244,248],bounds:[78,97,445,493]},
  {support:[260,490],contact:[259,267],hand:[201,302],bounds:[120,84,404,493]},
];
const grim:PoseAnchors[] = [
  {support:[254,496],contact:[247,274],hand:[146,322],bounds:[102,108,405,498]},
  {support:[252,496],contact:[249,276],hand:[134,283],bounds:[76,108,395,498]},
  {support:[253,495],contact:[261,274],hand:[140,258],bounds:[69,114,416,497]},
  {support:[268,480],contact:[260,294],hand:[137,334],bounds:[102,124,447,482]},
  {support:[269,478],contact:[255,280],hand:[169,264],bounds:[101,98,435,480]},
  {support:[255,478],contact:[249,264],hand:[150,318],bounds:[100,84,405,479]},
];
export const NYRA_DRAWINGS=nyra.map((anchors,i)=>drawing('nyra-sequence',i,3,2,anchors));
export const GRIM_DRAWINGS=grim.map((anchors,i)=>drawing('grim-sequence',i,3,2,anchors));
export const GRIM_REPAIRS = {
  dodge:drawing('grim-repaired',0,2,1,{support:[246,455],contact:[254,292],hand:[157,178],bounds:[88,94,426,457]}),
  ko:drawing('grim-repaired',1,2,1,{support:[261,470],contact:[255,414],hand:[111,451],bounds:[78,339,428,472]}),
};
export const CLIP_ID='nyra-grim-power-hit-v04';
/** Eligibility only from the validated recorded attempt, identity and surviving result. */
export function eligibleClip(frame:PilotFrame):boolean {
  return frame.supported && frame.action?.actorId==='h4' && frame.action.targetId==='e3'
    && frame.action.kind==='power' && frame.action.outcome==='power'
    && ['h4','e3'].every(id=>frame.actors.some(a=>a.id===id&&!a.knockedOut));
}
export const CLIP_DURATION=2100;
export const CLIP_STARTS=[0,150,320,480,620,760,900,1080,1260,1440,1640,1840,2050] as const;
const nyraOrder=[-1,0,1,1,2,3,3,4,4,5,5,5,-1];
const grimOrder=[-1,-1,0,0,0,1,2,2,3,4,5,5,-1];
export function clipDrawing(id:'h4'|'e3',step:number):PilotDrawing|undefined {
  const index=(id==='h4'?nyraOrder:grimOrder)[step];
  return index>=0?(id==='h4'?NYRA_DRAWINGS:GRIM_DRAWINGS)[index]:undefined;
}
export function clipStep(phase:PilotPhase):number {
  return phase==='anticipation'?2:phase==='action'?4:phase==='contact'?5:phase==='reaction'||phase==='event'?6:phase==='recovery'?9:12;
}
export function clipPose(id:'h4'|'e3',step:number):PilotPose {
  return step===0||step===12?'idle':id==='h4'?(step<4?'anticipation':step<7?'power':'idle'):step<5?'idle':step<9?'hit':'idle';
}
