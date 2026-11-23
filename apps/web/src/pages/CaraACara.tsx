// Cara a cara on desktop: your friends along the top with how each comparison ends, then the chosen one side by
// side, the score, the verdict, and every row as a tug-of-war bar that leans toward whoever leads it.
import type { CompareRow, CompareSide } from '@eday/api-types';
import { api } from '../lib/api';
import { useData } from '../lib/app';
import { rankLabel, ROLE } from '../lib/format';
import { Arrow } from '../ui/bits';
import { Reveal } from '../ui/fx';
import { PageHero } from '../ui/PageHero';

const GROUPS: [CompareRow['group'], string][] = [['general', 'General'], ['versus', 'Versus'], ['horde', 'Horde'], ['campaign', 'Campaña']];
const MAIN: Record<string, string> = { versus: 'Versus', horde: 'Horde', campaign: 'Campaña' };
const THEM = '#3FA7A0';
const fmt = (r: CompareRow, x: number) =>
  r.unit === 'percent' ? `${Math.round(x * 100)}%` : r.unit === 'ratio' ? x.toFixed(2) : r.unit === 'hours' ? `${Math.round(x)} h` : x.toLocaleString('en-US');

function Side({ s, tint, right }: { s: CompareSide; tint: string; right?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 ${right ? 'items-end text-right' : ''}`}>
      <span className="h-1 w-12 mb-3" style={{ background: tint }} />
      <span className="eyebrow text-white/60 text-[12px]">{s.title}{s.clanTag ? ` · [${s.clanTag}]` : ''}</span>
      <span className="display text-[clamp(40px,4.5vw,72px)] leading-none">{s.gamertag}</span>
      <span className="text-white/75">Nivel {s.level} · {rankLabel(s.rank)}</span>
      <span className="text-sm text-white/60">{[s.mainMode && MAIN[s.mainMode], s.mainRole && ROLE[s.mainRole], s.favoriteWeapon?.name].filter(Boolean).join(' · ')}</span>
    </div>
  );
}

function Line({ r, i }: { r: CompareRow; i: number }) {
  const total = r.me + r.them || 1;
  return (
    <div className="grid grid-cols-[120px_1fr_120px] items-center gap-5 py-3.5 border-t border-line animate-rise" style={{ animationDelay: `${i * 30}ms` }}>
      <span className={`display text-2xl tabular-nums ${r.winner === 'me' ? 'text-primary' : 'text-subtle'}`}>{fmt(r, r.me)}</span>
      <div>
        <div className="text-center text-sm text-muted mb-2">{r.label}</div>
        <div className="flex h-2 gap-0.5">
          <span className="block transition-[flex] duration-700" style={{ flex: r.me / total, background: r.winner === 'me' ? 'var(--color-primary)' : '#5a1a16' }} />
          <span className="block transition-[flex] duration-700" style={{ flex: r.them / total, background: r.winner === 'them' ? THEM : '#16403d' }} />
        </div>
      </div>
      <span className="display text-2xl tabular-nums text-right" style={{ color: r.winner === 'them' ? THEM : 'var(--color-subtle)' }}>{fmt(r, r.them)}</span>
    </div>
  );
}

export function CaraACara({ tag }: { tag?: string }) {
  const friends = useData((n) => api.friends(n));
  // Opens on the closest friend: the one who wins the most rows against you.
  const pick = tag ?? [...friends].sort((a, b) => b.score.them - a.score.them)[0]?.gamertag;
  const c = useData((n) => (pick ? api.compare(pick, n) : null), [pick]);
  return (
    <>
      <PageHero over="Comunidad · Cara a cara" title={c ? <>Tú contra <span className="text-primary">{c.them.gamertag}</span></> : 'Cara a cara'} tint="#3FA7A0">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Amigos">
          {friends.map((f) => (
            <a key={f.gamertag} href={`#/comunidad/cara-a-cara/${encodeURIComponent(f.gamertag)}`} aria-current={f.gamertag === pick ? 'page' : undefined}
              className={`eyebrow text-[12px] px-3 py-2 border transition-colors ${f.gamertag === pick ? 'bg-white text-black border-white' : 'border-white/30 text-white/80 hover:border-white'}`}>
              {f.gamertag} <span className={f.gamertag === pick ? 'text-black/60' : 'text-white/50'}>{f.score.me}–{f.score.them}</span>
            </a>
          ))}
        </div>
      </PageHero>
      {c && (
        <div className="max-w-[1440px] mx-auto px-10 pt-12 flex flex-col gap-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-10 border border-line bg-surface p-10">
            <Side s={c.me} tint="var(--color-primary)" />
            <div className="text-center pb-2">
              <div className="display text-[96px] leading-none"><span className="text-primary">{c.score.me}</span><span className="text-subtle text-6xl"> – </span><span style={{ color: THEM }}>{c.score.them}</span></div>
              <div className="eyebrow text-subtle mt-2">filas ganadas{c.score.ties ? ` · ${c.score.ties} ${c.score.ties === 1 ? 'empate' : 'empates'}` : ''}</div>
            </div>
            <Side s={c.them} tint={THEM} right />
          </div>
          <div className="border border-line border-l-4 border-l-primary p-7 text-lg">{c.verdict}</div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
            {GROUPS.map(([g, label], gi) => (
              <Reveal key={g} delay={(gi % 2) * 80}>
                <div className="eyebrow text-muted mb-2">{label}</div>
                {c.rows.filter((r) => r.group === g).map((r, i) => <Line key={`${c.them.gamertag}-${r.id}`} r={r} i={i} />)}
              </Reveal>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-subtle">
            <span>{c.friends ? 'Números de Mi servicio de cada uno hasta este momento de la demo.' : `${c.them.gamertag} no está en tu lista de amigos; su perfil es público en la clasificación.`}</span>
            <a href="#/servicio/clasificacion" className="group eyebrow text-muted hover:text-ink inline-flex items-center gap-2">Buscar en las clasificaciones<Arrow className="transition-transform group-hover:translate-x-1" /></a>
          </div>
        </div>
      )}
    </>
  );
}
