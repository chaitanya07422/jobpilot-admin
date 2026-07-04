import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminLayout } from '@/components/AdminLayout'
import { isAdminAuthenticated } from '@/lib/adminKey'
import LoginPage from '@/pages/Login'
import JobsListPage from '@/pages/JobsList'
import JobFormPage from '@/pages/JobForm'
import SourcesListPage from '@/pages/SourcesList'
import SourceFormPage from '@/pages/SourceForm'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              isAdminAuthenticated() ? (
                <Navigate to="/jobs" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route element={<AdminLayout />}>
            <Route path="/jobs" element={<JobsListPage />} />
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id" element={<JobFormPage />} />
            <Route path="/sources" element={<SourcesListPage />} />
            <Route path="/sources/new" element={<SourceFormPage />} />
            <Route path="/sources/:id" element={<SourceFormPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
