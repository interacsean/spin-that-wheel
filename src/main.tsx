import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App/App.tsx';
import './index.css';
import { firestoreDb } from './services/db/firestore.ts';
import { setFirestoreDb as setSnapshotFSDB } from './services/db/dbHooks.ts';
import { AssetLoader } from './components/AssetLoader.tsx';

(function initialize() {
  setSnapshotFSDB(firestoreDb);
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AssetLoader>
      <App />
    </AssetLoader>
  </React.StrictMode>
);
