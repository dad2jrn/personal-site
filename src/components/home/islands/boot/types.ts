export type Phase = 'assembling' | 'log' | 'ready';

export interface LogLine {
  text: string;
  color?: 'accent' | 'dim';
}

export interface NavItem {
  label: string;
  href: string;
}

export interface CareerItem {
  code: string;
  year: string;
  pct: number; // 0-100
  delay: number; // seconds, entrance stagger
}

export interface PatentChipData {
  number: string;
  delay: number; // seconds, entrance stagger
}

export interface MicroSelectSeed {
  code: string;
  period: number; // seconds, thumb sweep duration
}

export interface ArrayChipData {
  tag: string; // number badge, e.g. "71"
  code: string; // e.g. "112"
}

export interface SeqRowData {
  label: string;
  value: string;
  code: string;
}
