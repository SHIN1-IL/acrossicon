import { useEffect, useRef, useState } from 'react';

interface FlipDigitProps {
  digit: string;
}

/** Single flip-clock digit tile. */
export function FlipDigit({ digit }: FlipDigitProps) {
  const prevRef = useRef(digit);
  const [from, setFrom] = useState(digit);
  const [to, setTo] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit === prevRef.current) return;
    setFrom(prevRef.current);
    setTo(digit);
    setFlipping(true);
    prevRef.current = digit;
    const id = window.setTimeout(() => setFlipping(false), 520);
    return () => window.clearTimeout(id);
  }, [digit]);

  return (
    <span
      className={`flip-unit${flipping ? ' is-flipping' : ''}`}
      aria-hidden
    >
      <span className="flip-face flip-top">
        <span className="flip-num">{to}</span>
      </span>
      <span className="flip-face flip-bottom">
        <span className="flip-num">{flipping ? from : to}</span>
      </span>
      {flipping && (
        <>
          <span className="flip-card flip-card-top">
            <span className="flip-num">{from}</span>
          </span>
          <span className="flip-card flip-card-bottom">
            <span className="flip-num">{to}</span>
          </span>
        </>
      )}
    </span>
  );
}

interface FlipNumberProps {
  value: number;
  /** Minimum digit width (zero-padded). */
  digits?: number;
}

export function FlipNumber({ value, digits }: FlipNumberProps) {
  const width = digits ?? Math.max(2, String(value).length);
  const text = String(Math.max(0, value)).padStart(width, '0');

  return (
    <span className="inline-flex items-center gap-[2px]" aria-label={String(value)}>
      {text.split('').map((d, i) => (
        <FlipDigit key={`${width}-${i}`} digit={d} />
      ))}
    </span>
  );
}
