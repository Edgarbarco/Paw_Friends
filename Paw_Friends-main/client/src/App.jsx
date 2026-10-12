import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Register from './Auth/Register';
import Login from './Auth/Login';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UsersPage';
import NotificationManagement from './pages/NotificationManagement';
import TestPage from './pages/TestPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PetsPage from './pages/PetsPage';
import DashboardPage from './pages/DashboardPage';
import ContactsAdmin from './pages/ContactsAdmin';
import AgendaPage from './pages/AgendaPage';
import HospitalizationPage from './pages/HospitalizationPage'; // Nueva Importación
import VaccinationPage from './pages/VaccinationPage';
import GroomingPage from './pages/GroomingPage';             // Nueva Importación
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="contacts" element={<ContactsAdmin />} />
          <Route path="hospitalization" element={<HospitalizationPage />} /> {/* Nueva Ruta */}
          <Route path="grooming" element={<GroomingPage />} />               {/* Nueva Ruta */}
          <Route path="vaccination" element={<VaccinationPage />} />
          <Route path="test" element={<TestPage />} />
        </Route>

        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
