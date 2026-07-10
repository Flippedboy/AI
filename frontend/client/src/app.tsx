import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import ChatPage from './pages/chat/ChatPage';
import KnowledgePage from './pages/knowledge/KnowledgePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ReportPage from './pages/report/ReportPage';
import SettingsPage from './pages/settings/SettingsPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ChatPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
