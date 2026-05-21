import { useEffect, useState } from 'react';
import type { ShippingConfig } from './types';
import { loadConfig, saveConfig } from './lib/storage';
import { BrandHeader } from './components/BrandHeader';
import { BottomNav, type TabId } from './components/BottomNav';
import { Calculator } from './views/Calculator';
import { Settings } from './views/Settings';

export default function App() {
  const [config, setConfig] = useState<ShippingConfig>(() => loadConfig());
  const [tab, setTab] = useState<TabId>('calc');

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  return (
    <div className="app">
      <BrandHeader />
      <main className="app__scroll">
        <div className="app__inner">
          {tab === 'calc' ? (
            <Calculator config={config} />
          ) : (
            <Settings config={config} onChange={setConfig} />
          )}
        </div>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
