import * as React from 'react';
import { KeptApp } from './kept/KeptApp.tsx';

// The component lab only exists in `pnpm dev`. Production builds drop it (and every demo)
// entirely, so the deployed site is Kept alone.
const LabApp = import.meta.env.DEV ? React.lazy(() => import('./LabApp.tsx')) : null;

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '');
  const [route, setRoute] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export default function App() {
  const route = useHashRoute();
  const [section, ...rest] = route.split('/');

  if (section === 'kept') return <KeptApp route={rest.join('/')} />;
  // Deployed: every other address is a Kept address too, so `/` is the Kept landing.
  if (!LabApp) return <KeptApp route={route} />;

  return (
    <React.Suspense fallback={null}>
      <LabApp route={route} />
    </React.Suspense>
  );
}
