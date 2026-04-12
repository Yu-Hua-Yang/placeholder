"use client";

import { useState, useCallback } from "react";
import type { ArchetypeProduct, OutfitFit, ColorPaletteEntry } from "@/lib/types";

const CARD_W = 1080;
const CARD_PAD = 80;
const GOLD = "#7dd3fc";
const WHITE = "#ffffff";
const MUTED = "#a1a1aa";
const DIM = "#52525b";
const LINE = "#1a1a1a";

function createCanvas(height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, CARD_W, height);
  return [canvas, ctx];
}

function drawHeader(ctx: CanvasRenderingContext2D, y: number): number {
  ctx.font = "900 64px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.fillText("AURAFITS", CARD_PAD, y);
  const nameW = ctx.measureText("AURAFITS").width;
  ctx.fillStyle = GOLD;
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillText(".CA", CARD_PAD + nameW + 4, y);
  return y + 40;
}

function drawLine(ctx: CanvasRenderingContext2D, y: number): number {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CARD_PAD, y);
  ctx.lineTo(CARD_W - CARD_PAD, y);
  ctx.stroke();
  return y + 24;
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
    setTimeout(() => resolve(null), 3000);
  });
}

async function buildTenPicksCard(
  category: string,
  products: ArchetypeProduct[],
  personalPalette: ColorPaletteEntry[],
): Promise<Blob | null> {
  const top = products.slice(0, 5);

  // Preload images
  const images = await Promise.all(
    top.map((p) => (p.imageUrl ? loadImage(p.imageUrl) : Promise.resolve(null)))
  );

  // Calculate height
  const hasImages = images.some(Boolean);
  const rowH = hasImages ? 100 : 60;
  let h = CARD_PAD + 120 + 50 + top.length * (rowH + 24) + 40;
  if (products.length > 5) h += 40;
  if (personalPalette.length > 0) h += 80;
  h += 40; // bottom padding

  const [canvas, ctx] = createCanvas(h);
  let y = CARD_PAD;

  y = drawHeader(ctx, y);
  y += 20;

  // Category
  ctx.fillStyle = MUTED;
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText(`${category.toUpperCase()} — ${products.length} PICKS`, CARD_PAD, y);
  ctx.letterSpacing = "0px";
  y += 48;

  // Products
  for (let i = 0; i < top.length; i++) {
    const p = top[i];
    const img = images[i];
    const rowStart = y;

    // Number
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.font = "900 40px system-ui, -apple-system, sans-serif";
    ctx.fillText(String(i + 1).padStart(2, "0"), CARD_PAD, rowStart + 36);

    let textX = CARD_PAD + 60;

    // Product image
    if (img) {
      const imgSize = 80;
      ctx.save();
      ctx.beginPath();
      ctx.rect(textX, rowStart - 4, imgSize, imgSize);
      ctx.clip();
      ctx.drawImage(img, textX, rowStart - 4, imgSize, imgSize);
      ctx.restore();
      textX += imgSize + 16;
    }

    // Name
    ctx.fillStyle = WHITE;
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    const maxNameW = CARD_W - textX - CARD_PAD - 120;
    let name = p.name;
    while (ctx.measureText(name).width > maxNameW && name.length > 3) {
      name = name.slice(0, -1);
    }
    if (name !== p.name) name += "…";
    ctx.fillText(name, textX, rowStart + 24);

    // Archetype
    ctx.fillStyle = DIM;
    ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(p.archetype.toUpperCase(), textX, rowStart + 48);
    ctx.letterSpacing = "0px";

    // Price
    ctx.fillStyle = WHITE;
    ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
    const priceText = `$${p.price}`;
    const priceW = ctx.measureText(priceText).width;
    ctx.fillText(priceText, CARD_W - CARD_PAD - priceW, rowStart + 30);

    y += rowH;
    y = drawLine(ctx, y);
  }

  if (products.length > 5) {
    ctx.fillStyle = DIM;
    ctx.font = "18px system-ui, -apple-system, sans-serif";
    ctx.fillText(`+ ${products.length - 5} more picks`, CARD_PAD, y + 6);
    y += 40;
  }

  // Palette
  if (personalPalette.length > 0) {
    y += 8;
    ctx.fillStyle = DIM;
    ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("YOUR PALETTE", CARD_PAD, y);
    ctx.letterSpacing = "0px";
    y += 20;
    const swatchSize = 40;
    personalPalette.slice(0, 12).forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(CARD_PAD + i * (swatchSize + 8), y, swatchSize, swatchSize);
    });
    y += swatchSize + 24;
  }

  // no footer

  // Resize canvas to actual content
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = CARD_W;
  finalCanvas.height = y + CARD_PAD / 2;
  const fctx = finalCanvas.getContext("2d")!;
  fctx.drawImage(canvas, 0, 0);

  return new Promise((resolve) => finalCanvas.toBlob(resolve, "image/png"));
}

async function buildTwoFitsCard(fit: OutfitFit): Promise<Blob | null> {
  const hasGenImage = !!fit.generatedImageBase64;

  // Load generated image
  let outfitImg: HTMLImageElement | null = null;
  if (hasGenImage) {
    outfitImg = await loadImage(`data:image/png;base64,${fit.generatedImageBase64}`);
  }

  // Only load item images if there's no generated outfit image
  let itemImages: (HTMLImageElement | null)[] = [];
  if (!hasGenImage) {
    itemImages = await Promise.all(
      fit.items.map((item) => (item.imageUrl ? loadImage(item.imageUrl) : Promise.resolve(null)))
    );
  }

  const hasItemImages = !hasGenImage && itemImages.some(Boolean);
  const rowH = hasItemImages ? 80 : 52;

  // Calculate height — generated image gets much more space
  let h = CARD_PAD + 120 + 20;
  if (outfitImg) h += 900 + 64; // big hero image + gap
  h += 60 + 40; // fit name + vibe
  h += fit.items.length * (rowH + 24) + 60; // items + total
  if (fit.colorPalette?.length) h += 40;
  h += 40; // bottom padding

  const [canvas, ctx] = createCanvas(h);
  let y = CARD_PAD;

  y = drawHeader(ctx, y);
  y += 20;

  // Generated outfit image — full-width hero
  if (outfitImg) {
    const imgW = CARD_W - CARD_PAD * 2;
    const imgH = 860;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(CARD_PAD, y, imgW, imgH);
    const scale = Math.min(imgW / outfitImg.width, imgH / outfitImg.height);
    const dw = outfitImg.width * scale;
    const dh = outfitImg.height * scale;
    ctx.drawImage(outfitImg, CARD_PAD + (imgW - dw) / 2, y + (imgH - dh) / 2, dw, dh);
    y += imgH + 64;
  }

  // Fit name
  ctx.fillStyle = WHITE;
  ctx.font = "900 36px system-ui, -apple-system, sans-serif";
  ctx.fillText(fit.name.toUpperCase(), CARD_PAD, y);
  y += 28;

  // Vibe
  ctx.fillStyle = MUTED;
  ctx.font = "20px system-ui, -apple-system, sans-serif";
  ctx.fillText(fit.vibe, CARD_PAD, y);
  y += 40;

  // Items — text only when generated image exists, with thumbnails otherwise
  for (let i = 0; i < fit.items.length; i++) {
    const item = fit.items[i];
    const img = hasGenImage ? null : itemImages[i];
    const rowStart = y;
    let textX = CARD_PAD;

    if (img) {
      const imgSize = 64;
      ctx.save();
      ctx.beginPath();
      ctx.rect(textX, rowStart - 4, imgSize, imgSize);
      ctx.clip();
      ctx.drawImage(img, textX, rowStart - 4, imgSize, imgSize);
      ctx.restore();
      textX += imgSize + 16;
    }

    // Slot
    ctx.fillStyle = DIM;
    ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(item.slot.toUpperCase(), textX, rowStart + 16);
    ctx.letterSpacing = "0px";

    // Name
    ctx.fillStyle = WHITE;
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    const maxW = CARD_W - textX - CARD_PAD - 100;
    let name = item.name;
    while (ctx.measureText(name).width > maxW && name.length > 3) {
      name = name.slice(0, -1);
    }
    if (name !== item.name) name += "…";
    ctx.fillText(name, textX, rowStart + 42);

    // Price
    ctx.fillStyle = WHITE;
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    const priceText = `$${item.price}`;
    const priceW = ctx.measureText(priceText).width;
    ctx.fillText(priceText, CARD_W - CARD_PAD - priceW, rowStart + 30);

    y += rowH;
    y = drawLine(ctx, y);
  }

  // Color palette text
  if (fit.colorPalette && fit.colorPalette.length > 0) {
    ctx.fillStyle = DIM;
    ctx.font = "18px system-ui, -apple-system, sans-serif";
    ctx.fillText(fit.colorPalette.join(" · "), CARD_PAD, y + 4);
    y += 36;
  }

  // Total
  y += 4;
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CARD_PAD, y);
  ctx.lineTo(CARD_W - CARD_PAD, y);
  ctx.stroke();
  y += 32;
  ctx.fillStyle = DIM;
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("TOTAL", CARD_PAD, y);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = WHITE;
  ctx.font = "900 32px system-ui, -apple-system, sans-serif";
  const total = `$${fit.items.reduce((sum, item) => sum + item.price, 0).toFixed(0)}`;
  const totalW = ctx.measureText(total).width;
  ctx.fillText(total, CARD_W - CARD_PAD - totalW, y + 4);
  y += 40;

  // no footer

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = CARD_W;
  finalCanvas.height = y + CARD_PAD / 2;
  const fctx = finalCanvas.getContext("2d")!;
  fctx.drawImage(canvas, 0, 0);

  return new Promise((resolve) => finalCanvas.toBlob(resolve, "image/png"));
}

async function shareBlob(blob: Blob) {
  const file = new File([blob], "aurafits-results.png", { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "My AuraFits Results",
      text: "Check out my personalized style picks from AuraFits",
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aurafits-results.png";
    a.click();
    URL.revokeObjectURL(url);
  }
}

interface ShareCardProps {
  mode: "ten-picks" | "two-fits";
  category?: string;
  products?: ArchetypeProduct[];
  personalPalette?: ColorPaletteEntry[];
  fit?: OutfitFit;
}

export default function ShareButton({ mode, category, products, personalPalette, fit }: ShareCardProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    try {
      let blob: Blob | null = null;
      if (mode === "ten-picks" && category && products && personalPalette) {
        blob = await buildTenPicksCard(category, products, personalPalette);
      } else if (mode === "two-fits" && fit) {
        blob = await buildTwoFitsCard(fit);
      }
      if (blob) await shareBlob(blob);
    } catch {
      // Share cancelled or failed
    } finally {
      setSharing(false);
    }
  }, [sharing, mode, category, products, personalPalette, fit]);

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={sharing}
      className="flex items-center justify-center gap-2 border border-zinc-800 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
    >
      {sharing ? (
        <>
          <div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
          Generating
        </>
      ) : (
        <>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          Share My {mode === "ten-picks" ? "Picks" : "Fit"}
        </>
      )}
    </button>
  );
}
