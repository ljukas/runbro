export type Vision = 'normal' | 'protan' | 'deutan' | 'tritan';
export const VISIONS: readonly Vision[] = ['normal', 'protan', 'deutan', 'tritan'];

export type Lab = readonly [number, number, number];

type Vec3 = readonly [number, number, number];
type Matrix = readonly [Vec3, Vec3, Vec3];

// Machado 2009, severity 1.0, applied in linear RGB.
const MACHADO: Record<Exclude<Vision, 'normal'>, Matrix> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

const SRGB_TO_XYZ: Matrix = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];
const D65: Vec3 = [0.95047, 1, 1.08883];
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

function multiply(m: Matrix, v: Vec3): Vec3 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

function linearRgb(hex: string): Vec3 {
  const n = parseInt(hex.slice(1, 7), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [channel((n >> 16) & 255), channel((n >> 8) & 255), channel(n & 255)];
}

const clamp01 = (c: number) => Math.min(1, Math.max(0, c));

/** WCAG 2.x contrast ratio between two `#RRGGBB` colours, in [1, 21]. */
export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = linearRgb(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function toLab(hex: string, vision: Vision = 'normal'): Lab {
  let rgb = linearRgb(hex);
  if (vision !== 'normal') {
    const [r, g, b] = multiply(MACHADO[vision], rgb);
    rgb = [clamp01(r), clamp01(g), clamp01(b)];
  }
  const xyz = multiply(SRGB_TO_XYZ, rgb);
  const f = (t: number) => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116);
  const fx = f(xyz[0] / D65[0]);
  const fy = f(xyz[1] / D65[1]);
  const fz = f(xyz[2] / D65[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const deg = (radians: number) => (radians * 180) / Math.PI;

/** CIEDE2000 with kL = kC = kH = 1. */
export function deltaE00(a: Lab, b: Lab): number {
  const [L1, a1, b1] = a;
  const [L2, a2, b2] = b;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar7 = ((C1 + C2) / 2) ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const hue = (y: number, x: number) =>
    x === 0 && y === 0 ? 0 : (deg(Math.atan2(y, x)) + 360) % 360;
  const h1p = hue(b1, a1p);
  const h2p = hue(b2, a2p);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp / 2));

  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbp /= 2;
    else hbp = (hbp + (h1p + h2p < 360 ? 360 : -360)) / 2;
  }
  const T =
    1 -
    0.17 * Math.cos(rad(hbp - 30)) +
    0.24 * Math.cos(rad(2 * hbp)) +
    0.32 * Math.cos(rad(3 * hbp + 6)) -
    0.2 * Math.cos(rad(4 * hbp - 63));
  const dTheta = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(rad(2 * dTheta)) * Rc;

  const l = dLp / Sl;
  const c = dCp / Sc;
  const h = dHp / Sh;
  return Math.sqrt(l * l + c * c + h * h + Rt * c * h);
}

/** Smallest CIEDE2000 distance between two colours over all `VISIONS`, with the vision that gives it. */
export function minDeltaE00(a: string, b: string): { deltaE: number; vision: Vision } {
  let worst = { deltaE: Infinity, vision: 'normal' as Vision };
  for (const vision of VISIONS) {
    const deltaE = deltaE00(toLab(a, vision), toLab(b, vision));
    if (deltaE < worst.deltaE) worst = { deltaE, vision };
  }
  return worst;
}
