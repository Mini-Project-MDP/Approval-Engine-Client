import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import LoginPage from '../pages/LoginPage'
import InboxPage from '../pages/InboxPage'
import RequestDetailPage from '../pages/RequestDetailPage'
import WorkflowListPage from '../pages/WorkflowListPage'
import WorkflowFormPage from '../pages/WorkflowFormPage'
import ApplicationsPage from '../pages/ApplicationsPage'
import RequireAuth from './RequireAuth'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/inbox"
            element={
              <RequireAuth>
                <InboxPage />
              </RequireAuth>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <RequireAuth>
                <RequestDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/workflows"
            element={
              <RequireAuth>
                <WorkflowListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/workflows/new"
            element={
              <RequireAuth>
                <WorkflowFormPage />
              </RequireAuth>
            }
          />
          <Route
            path="/applications"
            element={
              <RequireAuth>
                <ApplicationsPage />
              </RequireAuth>
            }
          />
          <Route path="/" element={<Navigate to="/inbox" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
