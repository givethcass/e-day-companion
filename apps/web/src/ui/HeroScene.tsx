// three.js is most of the site's weight, so the scene loads on its own after the page has painted.
// The canvas sits absolutely behind the content, so nothing moves when it arrives.
import { lazy, Suspense, type ComponentProps } from 'react';
import type { HeroScene as Impl } from './HeroSceneImpl';

const Scene = lazy(() => import('./HeroSceneImpl').then((m) => ({ default: m.HeroScene })));

export function HeroScene(props: ComponentProps<typeof Impl>) {
  return <Suspense fallback={null}><Scene {...props} /></Suspense>;
}
