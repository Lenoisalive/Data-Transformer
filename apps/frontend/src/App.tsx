import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/login/LoginPage'
import Dashboard from './pages/dashboard/Dashboard.tsx'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/MainLayout'
import { authService } from './services/auth.service'
import ProjectManagement from './pages/projects/ProjectManagement'
import { DataImport } from './pages/import/DataImport'
import { DataExport } from './pages/export/DataExport'
import { TransformationWorkbench } from './pages/workbench/TransformationWorkbench'
import { RuleManagement } from './pages/rules/RuleManagement'
import { UserManagement } from './pages/users/UserManagement'
import './App.css'
import { ProjectProvider } from './contexts/ProjectContext'

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ProjectProvider>
                <MainLayout />
              </ProjectProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="import" element={<DataImport />} />
          <Route path="export" element={<DataExport />} />
          <Route path="workbench" element={<TransformationWorkbench />} />
          <Route path="rules" element={<RuleManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
