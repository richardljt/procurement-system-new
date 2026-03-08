import React from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { renderRoutes, routes } from './router';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>{renderRoutes(routes)}</Routes>
    </BrowserRouter>
  );
};

export default App;
