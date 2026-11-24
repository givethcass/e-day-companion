// Tu temporada on desktop: one big card at a time (arrows, the keyboard or a click on either half), the whole run
// in a strip underneath, and a share image drawn on a canvas that can be saved as a PNG or copied as text.
import type { RecapCard, SeasonRecap } from '@eday/api-types';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { Arrow } from '../ui/bits';
import { SERIES } from '../ui/charts';
import { useToast } from '../ui/fx';
import { t } from '@eday/i18n';

const ACCENT: Record<RecapCard['kind'], string> = {
  intro: '#E50F11', time: SERIES[1], mode: SERIES[2], weapon: SERIES[0], map: SERIES[3], match: SERIES[4], rank: '#9AA3AD', medals: SERIES[2], outro: '#E50F11',
};
const href = (link: string) => `#${link.replace(/^\/servicio\/medallas\/.*/, '/servicio/medallas')}`;

function Card({ c, size = 'big' }: { c: RecapCard; size?: 'big' | 'small' }) {
  const big = size === 'big';
  return (
    <div className={`relative overflow-hidden border border-line flex flex-col ${big ? 'p-12 min-h-[480px]' : 'p-6 min-h-[220px]'}`}
      style={{ background: `linear-gradient(160deg, ${ACCENT[c.kind]}99 0%, #0b0b0b 62%)` }}>
      <div className="absolute -right-24 -top-24 size-72 rotate-45 border-[14px] opacity-20" style={{ borderColor: ACCENT[c.kind] }} />
      <div className={`eyebrow text-white/80 ${big ? '' : 'text-[11px]'}`}>{c.overline}</div>
      <div className="mt-auto relative">
        <div className={`display leading-[0.9] ${big ? (c.value.length > 10 ? 'text-[88px]' : 'text-[128px]') : 'text-5xl'}`}>{c.value}</div>
        <div className={`display mt-3 ${big ? 'text-4xl' : 'text-xl'}`}>{c.title}</div>
        {c.detail && <p className={`text-white/75 mt-3 ${big ? 'text-lg max-w-[620px]' : 'text-sm line-clamp-3'}`}>{c.detail}</p>}
      </div>
    </div>
  );
}

// A canvas is not part of the page, so its words are translated here rather than by the page translator.
/** Draws the share image: 1080 x 1350, the portrait size social feeds show whole. */
function drawShare(canvas: HTMLCanvasElement, r: SeasonRecap) {
  const ctx = canvas.getContext('2d')!;
  const W = 1080, H = 1350;
  canvas.width = W; canvas.height = H;
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  g.addColorStop(0, '#800000'); g.addColorStop(1, '#000000');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.6);
  ctx.save(); ctx.translate(W - 120, 150); ctx.rotate(Math.PI / 4); ctx.strokeStyle = 'rgba(240,71,58,0.45)'; ctx.lineWidth = 18; ctx.strokeRect(-150, -150, 300, 300); ctx.restore();
  const font = (weight: number, size: number) => `${weight} ${size}px "Barlow Condensed", "Arial Narrow", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = font(600, 34);
  ctx.fillText(t(`TEMPORADA ${r.season.number} · ${r.season.name.toUpperCase()}`), 80, 120);
  ctx.fillStyle = '#fff'; ctx.font = font(700, 132);
  ctx.fillText(r.gamertag.toUpperCase(), 80, 260);
  ctx.fillStyle = '#F0473A'; ctx.font = font(700, 52);
  ctx.fillText(r.title.toUpperCase(), 80, 330);
  const pick = (kind: RecapCard['kind']) => r.cards.find((c) => c.kind === kind);
  const cells: [string, string][] = [
    ['Horas', `${Math.round(r.stats.hours)}`], ['Partidas', r.stats.matches.toLocaleString('en-US')], ['K/D Versus', r.stats.kd.toFixed(2)],
    ['Rango', pick('rank')?.value ?? '–'], ['Arma', pick('weapon')?.value ?? '–'], ['Mapa', pick('map')?.value ?? '–'],
  ];
  cells.forEach(([label, value], i) => {
    const x = 80 + (i % 2) * 470, y = 470 + Math.floor(i / 2) * 230;
    ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(x, y - 70, 430, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = font(600, 30); ctx.fillText(t(label).toUpperCase(), x, y - 20);
    ctx.fillStyle = '#fff'; ctx.font = font(700, value.length > 10 ? 64 : 96); ctx.fillText(value.toUpperCase(), x, y + 80);
  });
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = font(500, 28);
  ctx.fillText(t('E-DAY COMPANION · CONCEPTO NO OFICIAL CON DATOS SIMULADOS'), 80, H - 80);
}

export function Temporada() {
  const r = useData((n) => api.recap(n));
  const toast = useToast();
  const [i, setI] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const at = Math.min(i, r.cards.length - 1);
  const go = (k: number) => setI(Math.max(0, Math.min(r.cards.length - 1, k)));
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(at + 1);
      if (e.key === 'ArrowLeft') go(at - 1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  useEffect(() => {
    let live = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => { if (live && canvas.current) drawShare(canvas.current, r); });
    return () => { live = false; };
  }, [r]);
  const c = r.cards[at];
  const save = () => {
    const a = document.createElement('a');
    a.href = canvas.current!.toDataURL('image/png');
    a.download = `temporada-${r.season.number}-${r.gamertag}.png`;
    a.click();
    toast('Imagen guardada');
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(r.shareText); toast('Texto copiado'); } catch { toast(r.shareText); }
  };
  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-[1fr_420px] gap-10 items-start">
        <div className="flex flex-col gap-4">
          <div className="flex gap-1.5" aria-label={`Tarjeta ${at + 1} de ${r.cards.length}`}>
            {r.cards.map((x, k) => (
              <button key={x.id} onClick={() => go(k)} aria-label={`Ir a ${x.overline}`} className="flex-1 h-1.5 bg-white/15 overflow-hidden">
                <span className="block h-full bg-ink transition-transform duration-500 origin-left" style={{ transform: `scaleX(${k <= at ? 1 : 0})` }} />
              </button>
            ))}
          </div>
          <div className="relative">
            <div key={c.id} className="animate-rise"><Card c={c} /></div>
            <button aria-label="Tarjeta anterior" disabled={at === 0} onClick={() => go(at - 1)} className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize disabled:cursor-default" />
            <button aria-label="Tarjeta siguiente" disabled={at === r.cards.length - 1} onClick={() => go(at + 1)} className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize disabled:cursor-default" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => go(at - 1)} disabled={at === 0} className="eyebrow border border-white/30 px-5 py-3 inline-flex items-center gap-2 hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"><Arrow className="rotate-180" />Anterior</button>
            <button onClick={() => (at === r.cards.length - 1 ? go(0) : go(at + 1))} className="eyebrow bg-action px-5 py-3 inline-flex items-center gap-2 hover:bg-ember transition-colors">{at === r.cards.length - 1 ? 'Ver de nuevo' : 'Siguiente'}<Arrow /></button>
            <span className="ml-auto flex items-center gap-6">
              {c.link && <a href={href(c.link)} className="group eyebrow text-muted hover:text-ink inline-flex items-center gap-2">Ver detalle<Arrow className="transition-transform group-hover:translate-x-1" /></a>}
              <span className="text-sm text-subtle">Usa ← y → para avanzar</span>
            </span>
          </div>
        </div>
        <aside className="sticky top-24 border border-line bg-surface p-6 flex flex-col gap-4">
          <div className="eyebrow text-subtle">Tu temporada en una imagen</div>
          <canvas ref={canvas} className="w-full aspect-[4/5] border border-line" aria-label={`Imagen para compartir: ${r.shareText}`} />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={save} className="eyebrow bg-action py-3 hover:bg-ember transition-colors">Guardar imagen</button>
            <button onClick={copy} className="eyebrow border border-white/30 py-3 hover:bg-white hover:text-black transition-colors">Copiar texto</button>
          </div>
          <p className="text-sm text-subtle">{r.shareText}</p>
        </aside>
      </div>
      <div>
        <div className="eyebrow text-muted mb-4">Todo tu resumen</div>
        <div className="grid grid-cols-3 gap-5">
          {r.cards.map((x, k) => (
            <button key={x.id} onClick={() => { go(k); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`text-left transition-transform hover:-translate-y-1 ${k === at ? 'outline outline-2 outline-white/70' : ''}`}>
              <Card c={x} size="small" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
