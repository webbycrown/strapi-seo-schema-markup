import { Routes, Route } from 'react-router-dom';
import { ProtectedCollectionTypesListPage } from './CollectionTypesListPage';
import { ProtectedTemplateEditPage } from './TemplateEditPage';

const Router = () => (
  <Routes>
    <Route index element={<ProtectedCollectionTypesListPage />} />
    <Route path=":uid" element={<ProtectedTemplateEditPage />} />
  </Routes>
);

export { Router };
