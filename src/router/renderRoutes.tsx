import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';

const renderRoutes = (routes: RouteObject[]) => {
  return routes.map((route, index) => {
    const element = <Suspense fallback={<div>Loading...</div>}>{route.element}</Suspense>;
    if (route.children) {
      return (
        <Route key={index} path={route.path} element={element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    return <Route key={index} path={route.path} index={route.index} element={element} />;
  });
};

export default renderRoutes;
