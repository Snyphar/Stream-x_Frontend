import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ScreenShare from './ScreenRecording';
import Viewer from './Viewer';
import UploadForm from './UploadForm';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/upload" element={<UploadForm />} />
      <Route path="/share" element={<ScreenShare />} />
      <Route path="/viewer" element={<Viewer />} />
    </Routes>
  </Router>
);

reportWebVitals();

