export interface ConfluenceFactor {
  id: string
  label: string
  description: string
}

export const DASHBOARD_MAX_SCORE = 1250

export const R_DIV_MAX_POINTS = 70
export const H_DIV_MAX_POINTS = 105
export const BOS_CHOCH_MAX_POINTS = 120
export const PULLBACK_FIB_MAX_POINTS = 60
export const EMA_MAX_POINTS = 30
export const MAJOR_ZONE_MAX_POINTS = 125
export const TREND_CHANNEL_MAX_POINTS = 100
export const BIAS_MAX_POINTS = 150
export const VOLUME_PROFILE_MAX_POINTS = 60
export const BREAKOUT_MAX_POINTS = 60
export const PREM_DISCOUNT_MAX_POINTS = 80
export const LIQUIDITY_SWEEP_MAX_POINTS = 120
export const FVG_MAX_POINTS = 70
export const ORDER_BLOCK_MAX_POINTS = 100

/** Per-period share of the 30 pt EMA confluence (21 + 50 + 200 = 271 → proportional). */
export const EMA_PERIOD_MAX_POINTS = {
  '21': 2,
  '50': 6,
  '200': 22,
} as const

export const EMA_PERIODS = ['21', '50', '200'] as const
export type EmaPeriod = (typeof EMA_PERIODS)[number]

/** Point allocation per factor (sums to dashboard max). */
export const FACTOR_MAX_POINTS: Record<string, number> = {
  'r-divergence': 70,
  'h-divergence': 105,
  'bos-choch': BOS_CHOCH_MAX_POINTS,
  'pullback-fibonacci': PULLBACK_FIB_MAX_POINTS,
  'ema-21-50-200': EMA_MAX_POINTS,
  'major-zone': MAJOR_ZONE_MAX_POINTS,
  'trend-channel': TREND_CHANNEL_MAX_POINTS,
  'bias': BIAS_MAX_POINTS,
  'volume-profile': VOLUME_PROFILE_MAX_POINTS,
  'breakout': BREAKOUT_MAX_POINTS,
  'premium-discount': PREM_DISCOUNT_MAX_POINTS,
  'liquidity-sweep': LIQUIDITY_SWEEP_MAX_POINTS,
  'fvg': FVG_MAX_POINTS,
  'order-block': ORDER_BLOCK_MAX_POINTS,
}

export function factorPointsCeiling(factorId: string): number | null {
  switch (factorId) {
    case 'r-divergence':
      return R_DIV_MAX_POINTS
    case 'h-divergence':
      return H_DIV_MAX_POINTS
    case 'bos-choch':
      return BOS_CHOCH_MAX_POINTS
    case 'pullback-fibonacci':
      return PULLBACK_FIB_MAX_POINTS
    case 'ema-21-50-200':
      return EMA_MAX_POINTS
    case 'major-zone':
      return MAJOR_ZONE_MAX_POINTS
    case 'trend-channel':
      return TREND_CHANNEL_MAX_POINTS
    case 'bias':
      return BIAS_MAX_POINTS
    case 'volume-profile':
      return VOLUME_PROFILE_MAX_POINTS
    case 'breakout':
      return BREAKOUT_MAX_POINTS
    case 'premium-discount':
      return PREM_DISCOUNT_MAX_POINTS
    case 'liquidity-sweep':
      return LIQUIDITY_SWEEP_MAX_POINTS
    case 'fvg':
      return FVG_MAX_POINTS
    case 'order-block':
      return ORDER_BLOCK_MAX_POINTS
    default:
      return null
  }
}

export const CONFLUENCE_FACTORS: ConfluenceFactor[] = [
  { id: 'r-divergence', label: 'R Divergence', description: '' },
  { id: 'h-divergence', label: 'H Divergence', description: '' },
  { id: 'bos-choch', label: 'BOS/CHOCH', description: '' },
  { id: 'pullback-fibonacci', label: 'Pull Back (FIB)', description: '' },
  { id: 'ema-21-50-200', label: 'EMA', description: '' },
  { id: 'major-zone', label: 'Major Zone', description: '' },
  { id: 'trend-channel', label: 'Trend channel', description: '' },
  { id: 'bias', label: 'BIAS', description: '' },
  { id: 'volume-profile', label: 'Volume Profile', description: '' },
  { id: 'breakout', label: 'Breakout', description: '' },
  { id: 'premium-discount', label: 'Prem/Discount', description: '' },
  { id: 'liquidity-sweep', label: 'Liquidity Sweep', description: '' },
  { id: 'fvg', label: 'FVG', description: '' },
  { id: 'order-block', label: 'Order Block', description: '' },
]

export const GRADE_THRESHOLDS = {
  aPlus: Math.round(DASHBOARD_MAX_SCORE * 0.96),
  a: Math.round(DASHBOARD_MAX_SCORE * 0.85),
  b: Math.round(DASHBOARD_MAX_SCORE * 0.7),
} as const

/** Score-ratio floors for the 9-grade ladder (C- begins at 500/1250 ≈ 40%). */
export const GRADE_SCORE_RATIOS = {
  aPlus: 0.88,
  a: 0.8,
  aMinus: 0.72,
  bPlus: 0.64,
  b: 0.58,
  bMinus: 0.52,
  cPlus: 0.48,
  c: 0.44,
  cMinus: 0.4,
} as const

export function gradePointThresholds(maxScore: number) {
  return {
    aPlus: Math.round(maxScore * GRADE_SCORE_RATIOS.aPlus),
    a: Math.round(maxScore * GRADE_SCORE_RATIOS.a),
    aMinus: Math.round(maxScore * GRADE_SCORE_RATIOS.aMinus),
    bPlus: Math.round(maxScore * GRADE_SCORE_RATIOS.bPlus),
    b: Math.round(maxScore * GRADE_SCORE_RATIOS.b),
    bMinus: Math.round(maxScore * GRADE_SCORE_RATIOS.bMinus),
    cPlus: Math.round(maxScore * GRADE_SCORE_RATIOS.cPlus),
    c: Math.round(maxScore * GRADE_SCORE_RATIOS.c),
    cMinus: Math.round(maxScore * GRADE_SCORE_RATIOS.cMinus),
  }
}

export type DetailedTradeGrade =
  | 'A+'
  | 'A'
  | 'A-'
  | 'B+'
  | 'B'
  | 'B-'
  | 'C+'
  | 'C'
  | 'C-'
  | 'Wait'

export type TradeGrade = DetailedTradeGrade

export interface TradeRating {
  grade: DetailedTradeGrade
  label: string
  color: string
  bgClass: string
  ringClass: string
  gradeInput: number
  confidencePct: number
}

const LIME = '#bcff2f'
const GREY = '#6b6b6b'

const GRADE_ORDER: DetailedTradeGrade[] = [
  'Wait',
  'C-',
  'C',
  'C+',
  'B-',
  'B',
  'B+',
  'A-',
  'A',
  'A+',
]

function gradeRank(grade: DetailedTradeGrade): number {
  return GRADE_ORDER.indexOf(grade)
}

function capGradeByConfidence(
  grade: DetailedTradeGrade,
  confidencePct: number
): DetailedTradeGrade {
  let maxGrade: DetailedTradeGrade = 'A+'
  if (confidencePct < 40) maxGrade = 'B-'
  else if (confidencePct < 60) maxGrade = 'A-'
  else if (confidencePct < 80) maxGrade = 'A'

  return gradeRank(grade) > gradeRank(maxGrade) ? maxGrade : grade
}

function rawGradeFromInput(gradeInput: number): DetailedTradeGrade {
  if (gradeInput >= 96) return 'A+'
  if (gradeInput >= 91) return 'A'
  if (gradeInput >= 85) return 'A-'
  if (gradeInput >= 81) return 'B+'
  if (gradeInput >= 75) return 'B'
  if (gradeInput >= 70) return 'B-'
  if (gradeInput >= 63) return 'C+'
  if (gradeInput >= 57) return 'C'
  if (gradeInput >= 50) return 'C-'
  return 'Wait'
}

function rawGradeFromScoreRatio(ratio: number): DetailedTradeGrade {
  if (ratio >= GRADE_SCORE_RATIOS.aPlus) return 'A+'
  if (ratio >= GRADE_SCORE_RATIOS.a) return 'A'
  if (ratio >= GRADE_SCORE_RATIOS.aMinus) return 'A-'
  if (ratio >= GRADE_SCORE_RATIOS.bPlus) return 'B+'
  if (ratio >= GRADE_SCORE_RATIOS.b) return 'B'
  if (ratio >= GRADE_SCORE_RATIOS.bMinus) return 'B-'
  if (ratio >= GRADE_SCORE_RATIOS.cPlus) return 'C+'
  if (ratio >= GRADE_SCORE_RATIOS.c) return 'C'
  if (ratio >= GRADE_SCORE_RATIOS.cMinus) return 'C-'
  return 'Wait'
}

/** Map aligned score ratio to 0–100 heat input (grading floor at C- ≈ 500 pts on 1250). */
export function scoreRatioToHeatInput(ratio: number): number {
  const floor = GRADE_SCORE_RATIOS.cMinus
  if (ratio < floor) return Math.round((ratio / floor) * 40)
  return Math.round(((ratio - floor) / (1 - floor)) * 100)
}

function gradeLabel(grade: DetailedTradeGrade): string {
  switch (grade) {
    case 'A+':
      return 'A+ Setup'
    case 'A':
      return 'A Trade'
    case 'A-':
      return 'A- Trade'
    case 'B+':
      return 'B+ Trade'
    case 'B':
      return 'B Trade'
    case 'B-':
      return 'B- Trade'
    case 'C+':
      return 'C+ Trade'
    case 'C':
      return 'C Trade'
    case 'C-':
      return 'C- Trade'
    default:
      return 'Wait'
  }
}

function gradeColor(grade: DetailedTradeGrade): string {
  if (grade === 'A+' || grade === 'A' || grade === 'A-') return LIME
  if (grade === 'B+' || grade === 'B' || grade === 'B-') return '#d4ff5c'
  if (grade === 'C+' || grade === 'C' || grade === 'C-') return '#e8b84a'
  return GREY
}

function gradeStyles(grade: DetailedTradeGrade): Pick<TradeRating, 'bgClass' | 'ringClass'> {
  if (grade.startsWith('A')) {
    return {
      bgClass: 'bg-okx-lime/10 border-okx-lime/30 text-okx-lime',
      ringClass: 'stroke-okx-lime',
    }
  }
  if (grade.startsWith('B')) {
    return {
      bgClass: 'bg-okx-lime/10 border-okx-lime/25 text-okx-lime',
      ringClass: 'stroke-okx-lime',
    }
  }
  if (grade.startsWith('C')) {
    return {
      bgClass: 'bg-okx-amber/10 border-okx-amber/30 text-okx-amber',
      ringClass: 'stroke-okx-amber',
    }
  }
  return {
    bgClass: 'bg-okx-elevated border-okx-border text-okx-muted',
    ringClass: 'stroke-okx-muted',
  }
}

/** Grade from aligned points vs active ceiling, with confidence caps. */
export function gradeFromAlignedPoints(
  score: number,
  maxScore: number,
  confidencePct: number
): TradeRating {
  const ratio = maxScore > 0 ? score / maxScore : 0
  const raw = rawGradeFromScoreRatio(ratio)
  const grade = capGradeByConfidence(raw, confidencePct)
  const color = gradeColor(grade)
  const styles = gradeStyles(grade)
  const gradeInput = scoreRatioToHeatInput(ratio)

  return {
    grade,
    label: gradeLabel(grade),
    color,
    bgClass: styles.bgClass,
    ringClass: styles.ringClass,
    gradeInput,
    confidencePct: Math.round(confidencePct),
  }
}

/** 9-grade ladder with confidence caps (composite Q×S×C input). */
export function scoreToDetailedGrade(
  gradeInput: number,
  confidencePct: number
): TradeRating {
  const raw = rawGradeFromInput(gradeInput)
  const grade = capGradeByConfidence(raw, confidencePct)
  const color = gradeColor(grade)
  const styles = gradeStyles(grade)

  return {
    grade,
    label: gradeLabel(grade),
    color,
    bgClass: styles.bgClass,
    ringClass: styles.ringClass,
    gradeInput: Math.round(gradeInput),
    confidencePct: Math.round(confidencePct),
  }
}

/** Legacy points-based rating. */
export function scoreToRating(points: number, maxPoints = DASHBOARD_MAX_SCORE): TradeRating {
  return gradeFromAlignedPoints(points, maxPoints, 100)
}
