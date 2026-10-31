import { POSE_FRAMES, type PilotPose } from './pilotModel.ts';

export type Point = readonly [number, number];
export interface PoseAnchors {
  /** Centre of the planted support interval; underside of the body for K.O. Cell-local pixels. */
  support: Point;
  contact: Point;
  hand?: Point;
  bounds: readonly [number, number, number, number];
  sourceClipped?: 'right' | 'left';
}
/** Manual calibration of the existing art. No per-pose size normalization or new pixels. */
export const POSE_ANCHORS: Record<'h4' | 'e3', Record<PilotPose, PoseAnchors>> = {
  h4: {
    idle: { support:[195,494], contact:[206,229], hand:[130,299], bounds:[66,100,312,494] },
    anticipation: { support:[207,494], contact:[218,250], hand:[151,239], bounds:[46,135,335,494] },
    basic: { support:[199,494], contact:[205,248], hand:[349,211], bounds:[19,133,358,494] },
    power: { support:[200,495], contact:[209,249], hand:[333,209], bounds:[44,131,346,495] },
    hit: { support:[211,438], contact:[166,192], bounds:[41,80,367,438] },
    block: { support:[210,438], contact:[213,179], bounds:[52,91,347,438] },
    dodge: { support:[227,438], contact:[204,211], bounds:[80,102,373,438] },
    ko: { support:[190,438], contact:[253,380], bounds:[29,313,352,438] },
  },
  e3: {
    idle: { support:[180,508], contact:[177,261], hand:[75,322], bounds:[36,123,321,508] },
    anticipation: { support:[181,507], contact:[176,264], hand:[65,255], bounds:[15,136,349,507] },
    basic: { support:[208,507], contact:[208,264], hand:[40,218], bounds:[18,141,367,507] },
    power: { support:[209,506], contact:[217,265], hand:[73,217], bounds:[37,141,359,506] },
    hit: { support:[172,432], contact:[177,203], bounds:[30,66,351,432] },
    block: { support:[181,432], contact:[157,197], bounds:[20,81,350,432] },
    dodge: { support:[159,432], contact:[215,224], bounds:[9,112,383,432], sourceClipped:'right' },
    ko: { support:[175,437], contact:[167,372], bounds:[0,286,352,437], sourceClipped:'left' },
  },
};
export type PilotFraming = 'expanded' | 'compact';
export function pilotLayout(framing: PilotFraming) {
  // Shared coordinate system for art, support and effects. Uniform SVG scaling also on mobile.
  return framing === 'expanded' ? { width:720, height:300, ground:270, scale:.60, feet:{h4:210,e3:510}, symbols:[36,684] as const }
    : { width:340, height:180, ground:150, scale:.31, feet:{h4:90,e3:250}, symbols:[20,320] as const };
}
export function projectPose(id: 'h4' | 'e3', pose: PilotPose, framing: PilotFraming) {
  const layout=pilotLayout(framing), anchors=POSE_ANCHORS[id][pose];
  const project=(point:Point):Point=>[layout.feet[id]+(point[0]-anchors.support[0])*layout.scale,layout.ground+(point[1]-anchors.support[1])*layout.scale];
  const frame=POSE_FRAMES[pose];
  return { x:project([0,0])[0], y:project([0,0])[1], scale:layout.scale,
    support:project(anchors.support), contact:project(anchors.contact), hand:anchors.hand ? project(anchors.hand) : undefined,
    bounds:[project([anchors.bounds[0],anchors.bounds[1]]),project([anchors.bounds[2],anchors.bounds[3]])],
    frameX:-(frame%4)*384, frameY:-Math.floor(frame/4)*512 };
}
