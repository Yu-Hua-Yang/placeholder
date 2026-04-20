export default function BodySilhouetteSvg({ className, strokeWidth = 1 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 200 400"
      className={className}
      fill="none"
      stroke="white"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head */}
      <ellipse cx="100" cy="42" rx="22" ry="28" />
      {/* Neck */}
      <line x1="92" y1="70" x2="92" y2="88" />
      <line x1="108" y1="70" x2="108" y2="88" />
      {/* Shoulders */}
      <line x1="92" y1="88" x2="46" y2="100" />
      <line x1="108" y1="88" x2="154" y2="100" />
      {/* Torso */}
      <line x1="46" y1="100" x2="56" y2="220" />
      <line x1="154" y1="100" x2="144" y2="220" />
      {/* Hips */}
      <line x1="56" y1="220" x2="64" y2="240" />
      <line x1="144" y1="220" x2="136" y2="240" />
      {/* Legs */}
      <line x1="64" y1="240" x2="70" y2="370" />
      <line x1="136" y1="240" x2="130" y2="370" />
      {/* Feet */}
      <line x1="70" y1="370" x2="58" y2="380" />
      <line x1="130" y1="370" x2="142" y2="380" />
      {/* Arms */}
      <line x1="46" y1="100" x2="28" y2="210" />
      <line x1="154" y1="100" x2="172" y2="210" />
      {/* Hands */}
      <line x1="28" y1="210" x2="24" y2="224" />
      <line x1="172" y1="210" x2="176" y2="224" />
    </svg>
  );
}
