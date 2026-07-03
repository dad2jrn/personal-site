import { useEffect, useRef, useState } from 'react';
import { LOG_LINES, BUTTON_LABEL, CONNECTION_START } from './data';
import { scrambleDecode } from './scramble';
import type { Phase, LogLine } from './types';

const SESSION_KEY = 'rm-boot-seen';
const BUTTON_AT = 4200;
const SUBTITLE_AT = 5300;
const FOOTER_SUFFIX_AT = 5800;

function formatClock(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export interface BootTimelineState {
  phase: Phase;
  reduced: boolean;
  logLines: LogLine[];
  buttonVisible: boolean;
  buttonLabel: string;
  subtitleVisible: boolean;
  footerSuffix: boolean;
  clock: string;
  connection: number;
  dismissed: boolean;
  dismiss: () => void;
}

export function useBootTimeline(): BootTimelineState {
  const [reduced] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [repeat] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const skipAhead = reduced || repeat;

  const [phase, setPhase] = useState<Phase>(skipAhead ? 'ready' : 'assembling');
  const [logLines, setLogLines] = useState<LogLine[]>(
    skipAhead ? LOG_LINES.map(({ text, color }) => ({ text, color })) : [],
  );
  const [buttonVisible, setButtonVisible] = useState(skipAhead);
  const [buttonLabel, setButtonLabel] = useState(skipAhead ? BUTTON_LABEL : '');
  const [subtitleVisible, setSubtitleVisible] = useState(skipAhead);
  const [footerSuffix, setFooterSuffix] = useState(skipAhead);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [connection, setConnection] = useState(CONNECTION_START);
  const [dismissed, setDismissed] = useState(false);

  const timeouts = useRef<number[]>([]);
  const scrambleStop = useRef<(() => void) | null>(null);

  const clearAllTimeouts = () => {
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
  };

  const jumpToReady = () => {
    clearAllTimeouts();
    scrambleStop.current?.();
    setPhase('ready');
    setLogLines(LOG_LINES.map(({ text, color }) => ({ text, color })));
    setButtonVisible(true);
    setButtonLabel(BUTTON_LABEL);
    setSubtitleVisible(true);
    setFooterSuffix(true);
  };

  // Boot choreography — skipped entirely for reduced motion / repeat views.
  useEffect(() => {
    if (skipAhead) return;
    LOG_LINES.forEach((line) => {
      const id = window.setTimeout(() => {
        setPhase('log');
        setLogLines((prev) => [...prev, { text: line.text, color: line.color }]);
      }, line.t);
      timeouts.current.push(id);
    });
    const buttonId = window.setTimeout(() => {
      setPhase('ready');
      setButtonVisible(true);
      scrambleStop.current = scrambleDecode(BUTTON_LABEL, setButtonLabel);
    }, BUTTON_AT);
    timeouts.current.push(buttonId);
    timeouts.current.push(window.setTimeout(() => setSubtitleVisible(true), SUBTITLE_AT));
    timeouts.current.push(window.setTimeout(() => setFooterSuffix(true), FOOTER_SUFFIX_AT));

    return () => {
      clearAllTimeouts();
      scrambleStop.current?.();
    };
    // Intentionally runs once: skipAhead is stable for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipAhead]);

  // "PRESS ANY KEY TO SKIP" — any keypress or click before ready jumps straight there.
  useEffect(() => {
    if (phase === 'ready') return;
    window.addEventListener('keydown', jumpToReady);
    window.addEventListener('click', jumpToReady);
    return () => {
      window.removeEventListener('keydown', jumpToReady);
      window.removeEventListener('click', jumpToReady);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Live clock + connection counter, paused while the tab is hidden.
  useEffect(() => {
    if (reduced) return;
    let interval: number | null = null;
    const start = () => {
      interval = window.setInterval(() => {
        setClock(formatClock(new Date()));
        setConnection((c) => c + Math.floor(Math.random() * 41));
      }, 1000);
    };
    const stop = () => {
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode */
    }
    setDismissed(true);
  };

  return {
    phase,
    reduced,
    logLines,
    buttonVisible,
    buttonLabel,
    subtitleVisible,
    footerSuffix,
    clock,
    connection,
    dismissed,
    dismiss,
  };
}
