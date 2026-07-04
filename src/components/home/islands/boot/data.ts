import type {
  NavItem,
  CareerItem,
  PatentChipData,
  MicroSelectSeed,
  ArrayChipData,
  SeqRowData,
  LogLine,
} from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'WORK DECRYPT', module: 'WORK_DECRYPT.MOD', err: '0x4031' },
  { label: 'PATENT REGISTRY', module: 'PATENT_REGISTRY.DB', err: '0x4407' },
  { label: 'FIELD NOTES', module: 'FIELD_NOTES.LOG', err: '0x4188' },
  { label: 'RESUME EXTRACT', module: 'RESUME_EXTRACT.BIN', err: '0x4260' },
];

export const CAREER_ITEMS: CareerItem[] = [
  { code: 'US_NAVY.SYS', year: '1997', pct: 30, delay: 0.8 },
  { code: 'US_ARMY.SYS', year: '2002', pct: 45, delay: 1.1 },
  { code: 'BOFA.DLL', year: '2008', pct: 65, delay: 1.4 },
  { code: 'CAPITAL_ONE.CORE', year: '2016', pct: 85, delay: 1.7 },
  { code: 'VDOT.GOV', year: '2024', pct: 100, delay: 2.0 },
];

export const PATENT_CHIPS: PatentChipData[] = [
  { number: '10,951,542', delay: 1.6 },
  { number: '11,157,269', delay: 1.8 },
  { number: '12,086,648', delay: 2.0 },
  { number: '12,141,004', delay: 2.2 },
];

export const ARRAY_CHIPS: ArrayChipData[] = [
  { tag: '71', code: '112' },
  { tag: '53', code: '3A2' },
  { tag: '97', code: 'JN1' },
  { tag: '22', code: '6YT' },
];

export const TRANSMISSION_LINES: string[] = [
  '0x4A2F  MOV  R3, [CAREER_PTR]',
  '0x4A31  CMP  R3, #0x1997',
  '0x4A35  JNE  0x4A5C',
  '0x4A39  LD   R4, PATENT_TBL[R1]',
  '0x4A3D  ADD  R4, #0x04',
  '0x4A41  STR  R4, [SYS_STATE]',
  '0x4A45  CALL DECRYPT_NODE',
  '0x4A49  RET',
];

export const LOG_LINES: (LogLine & { t: number })[] = [
  { t: 2100, text: '> SECURE TERMINAL :: FIELD-STATION' },
  { t: 2450, text: '> AUTHORIZATION CHECK ········· OK' },
  { t: 2800, text: '> mounting /career ······· 25 YRS' },
  { t: 3150, text: '> patents ········· [4/4] GRANTED', color: 'dim' },
  { t: 3600, text: '> WELCOME, OPERATOR', color: 'accent' },
];

export const BUTTON_LABEL = 'APPLICATION READY TO DEPLOY';
export const SUBTITLE = 'ENTERPRISE ARCHITECT · EST. 1997 · 0 FAILURES';

// First 2 are the header's stacked rows; remaining 4 are the left rail.
export const MICRO_SELECT_SEED: MicroSelectSeed[] = [
  { code: '09431', period: 2.7 },
  { code: '10287', period: 3.4 },
  { code: '88213', period: 4.1 },
  { code: '55902', period: 2.9 },
  { code: '31745', period: 3.8 },
  { code: '67120', period: 4.4 },
];

export const SEQ_ROWS: SeqRowData[] = [
  { label: 'SEQ', value: '88731', code: '3RZ' },
  { label: 'LBL', value: 'NAVIGATE', code: '9RA' },
  { label: 'SEQ', value: '88731', code: '2R4' },
];

export const CONNECTION_START = 887652;
