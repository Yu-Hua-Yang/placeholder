"use client";

export default function CTAButton({ onClick, children, className }: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
