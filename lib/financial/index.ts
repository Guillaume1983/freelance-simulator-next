export { runPipeline, buildContextFromInput } from './pipeline';
export type { PipelineInput, PipelineResult } from './pipeline';
export type { FinancialLine, StatusId, LineCategory } from './types';
export { ALL_STATUSES, sumCashImpact, appliesTo } from './types';
export { RATES_2026, PASS, computeIR, getIK, computeTNSCotisations, computeTNSDetail } from './rates';
export { getDetailTextFromLines } from './detailText';
