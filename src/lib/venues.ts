// ---------- VENUE SEATMAP DATA ----------
// Zone geometry is generated (not hand-placed) from polar coordinates around a
// bowl center, mirroring the real Foro Sol / Estadio GNP Seguros chart (NA/VE
// sections + General A/B floor). To add another venue, add a new export here
// with its own zone list — components/SeatMap.tsx just renders whatever it's given.

export type SeatBand = "floor" | "A" | "B" | "C";

export type SeatZone = {
  id: string;
  name: string;
  price: number;
  z: number; // elevation in the 3D scene (px)
  band: SeatBand;
  desc: string;
  available: boolean;
  points: [number, number][]; // polygon corners, in the arena's local coordinate space
  previewImg: string | null; // hook for a real "vista desde tu zona" photo later
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  arenaSize: { width: number; height: number };
  stage: { left: number; top: number; width: number; height: number };
  zones: SeatZone[];
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function polarQuad(angleDeg: number, radius: number, cx: number, cy: number): [number, number][] {
  const halfAngle = 4.2; // degrees of arc half-width per section
  const bandHalf = 22; // radial half-width ("thickness" of each section)
  const a1 = ((angleDeg - halfAngle) * Math.PI) / 180;
  const a2 = ((angleDeg + halfAngle) * Math.PI) / 180;
  const rIn = radius - bandHalf;
  const rOut = radius + bandHalf;
  const pt = (a: number, r: number): [number, number] => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  return [pt(a1, rIn), pt(a2, rIn), pt(a2, rOut), pt(a1, rOut)];
}

function buildRing(
  codes: string[],
  angleFrom: number,
  angleTo: number,
  radius: number,
  z: number,
  price: number,
  band: SeatBand,
  desc: string,
  cx: number,
  cy: number,
): SeatZone[] {
  return codes.map((code, i) => ({
    id: code,
    name: code,
    price,
    z,
    band,
    desc,
    available: true,
    previewImg: null,
    points: polarQuad(codes.length > 1 ? lerp(angleFrom, angleTo, i / (codes.length - 1)) : (angleFrom + angleTo) / 2, radius, cx, cy),
  }));
}

const CX = 450;
const CY = 430;

const floorZones: SeatZone[] = [
  {
    id: "general-a",
    name: "GENERAL A",
    price: 3500,
    z: 0,
    band: "floor",
    desc: "Piso, de pie, la más cercana al escenario",
    available: true,
    previewImg: null,
    points: [
      [380, 520],
      [520, 520],
      [600, 640],
      [300, 640],
    ],
  },
  {
    id: "general-b",
    name: "GENERAL B",
    price: 2400,
    z: 0,
    band: "floor",
    desc: "Piso, de pie, detrás de General A",
    available: true,
    previewImg: null,
    points: [
      [300, 430],
      [600, 430],
      [680, 520],
      [220, 520],
    ],
  },
];

const ringZones: SeatZone[] = [
  // ---- Anillo A (closest ring, NA only) — $1,450 ----
  ...buildRing(["NA-8A", "NA-6A", "NA-4A", "NA-2A"], 145, 175, 200, 40, 1450, "A", "Anillo A — lado izquierdo", CX, CY),
  ...buildRing(["NA-1A", "NA-3A", "NA-5A", "NA-7A", "NA-9A"], 5, 35, 200, 40, 1450, "A", "Anillo A — lado derecho", CX, CY),

  // ---- Anillo B (NA outer + VE inner) — $950 ----
  ...buildRing(["NA-16B", "NA-14B", "NA-12B", "NA-10B"], 100, 140, 250, 90, 950, "B", "Anillo B (Naranja) — lado izquierdo", CX, CY),
  ...buildRing(["VE-16B", "VE-14B", "VE-12B"], 100, 135, 210, 90, 950, "B", "Anillo B (Verde) — lado izquierdo", CX, CY),
  ...buildRing(["NA-11B", "NA-13B", "NA-15B"], 40, 80, 250, 90, 950, "B", "Anillo B (Naranja) — lado derecho", CX, CY),
  ...buildRing(["VE-11B", "VE-13B", "VE-15B"], 45, 80, 210, 90, 950, "B", "Anillo B (Verde) — lado derecho", CX, CY),

  // ---- Anillo C (NA outer + VE inner, el más alto) — $580 ----
  ...buildRing(
    ["NA-18C", "NA-20C", "NA-22C", "NA-24C", "NA-26C", "NA-28C", "NA-30C"],
    175,
    95,
    300,
    170,
    580,
    "C",
    "Anillo C (Naranja) — lado izquierdo",
    CX,
    CY,
  ),
  ...buildRing(["VE-18C", "VE-20C", "VE-22C", "VE-24C"], 165, 100, 260, 170, 580, "C", "Anillo C (Verde) — lado izquierdo", CX, CY),
  ...buildRing(
    ["NA-17C", "NA-19C", "NA-21C", "NA-23C", "NA-25C", "NA-27C", "NA-29C"],
    5,
    85,
    300,
    170,
    580,
    "C",
    "Anillo C (Naranja) — lado derecho",
    CX,
    CY,
  ),
  ...buildRing(["VE-17C", "VE-19C", "VE-21C", "VE-23C"], 15, 80, 260, 170, 580, "C", "Anillo C (Verde) — lado derecho", CX, CY),
];

export const FORO_SOL: Venue = {
  id: "foro-sol",
  name: "Foro Sol (Estadio GNP Seguros)",
  city: "CDMX",
  arenaSize: { width: 900, height: 800 },
  stage: { left: 380, top: 640, width: 140, height: 60 },
  zones: [...floorZones, ...ringZones],
};
