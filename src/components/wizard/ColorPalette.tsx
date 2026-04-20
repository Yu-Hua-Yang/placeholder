import type { ColorPaletteEntry } from "@/lib/types";

interface ColorPaletteProps {
  palette: ColorPaletteEntry[];
  title?: string;
  compact?: boolean;
}

const GROUP_ORDER = [
  { key: "base", label: "Base" },
  { key: "neutral", label: "Neutrals" },
  { key: "accent", label: "Accents" },
  { key: "pop", label: "Pop" },
];

export default function ColorPalette({ palette, title = "Palette", compact }: ColorPaletteProps) {
  if (palette.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">{title}</span>
        <div className="flex gap-1">
          {palette.map((color) => (
            <div
              key={color.hex}
              className="h-4 w-4 border border-zinc-800"
              style={{ backgroundColor: color.hex }}
              title={`${color.name} (${color.usage})`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Group by usage
  const groups: Record<string, ColorPaletteEntry[]> = {};
  for (const c of palette) {
    if (!groups[c.usage]) groups[c.usage] = [];
    groups[c.usage].push(c);
  }

  return (
    <div className="border-t border-zinc-900 pt-4">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
        {title}
      </div>
      <div className="flex gap-6">
        {GROUP_ORDER.map(({ key, label }) => {
          const colors = groups[key] || [];
          if (colors.length === 0) return null;
          return (
            <div key={key}>
              <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                {label}
              </div>
              <div className="flex gap-1.5">
                {colors.map((color) => (
                  <div key={color.hex} className="flex flex-col items-center gap-1">
                    <div
                      className="h-8 w-8 border border-zinc-800"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[7px] font-bold text-zinc-500">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
