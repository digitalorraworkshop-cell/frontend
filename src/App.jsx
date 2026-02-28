import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import AdminHome from './pages/AdminHome';
import EmployeeList from './pages/EmployeeList';
import EmployeeCredentials from './pages/EmployeeCredentials';
import EmployeeLayout from './components/layout/EmployeeLayout';
import EmployeeHome from './pages/EmployeeHome';
import EmployeeTasks from './pages/EmployeeTasks';
import EmployeeTodo from './pages/EmployeeTodo';
import EmployeeLeave from './pages/EmployeeLeave';
import EmployeeAttendance from './pages/EmployeeAttendance';
import EmployeeProfile from './pages/EmployeeProfile';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLeaves from './pages/AdminLeaves';
import AdminTasks from './pages/AdminTasks';
import AdminActivityMonitoring from './pages/AdminActivityMonitoring';
import AdminEmployeeProfile from './pages/AdminEmployeeProfile';
import AdminAttendance from './pages/AdminAttendance';
import AdminLearningReports from './pages/AdminLearningReports';
import Chat from './pages/Chat';
import WorkDiary from './pages/WorkDiary';
import DesktopChatWidget from './pages/DesktopChatWidget';
import EmployeeBirthdays from './pages/EmployeeBirthdays';
import AdminBirthdays from './pages/AdminBirthdays';
import toast from 'react-hot-toast';

function App() {
  useEffect(() => {
    if (window.electron && window.electron.on) {
      window.electron.on('inactivity-popup', () => {
        toast.error("You are inactive. Screenshot captured.", {
          duration: 5000,
          position: 'bottom-center',
          style: { background: '#1e293b', color: '#fff', fontWeight: 'bold' }
        });
      });

      window.electron.on('play-alert-sound', () => {
        // High-pitched alert beep (base64)
        const beep = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A";
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {
          // Fallback to system-like beep if remote fails or blocked
          const altAudio = new Audio(beep);
          altAudio.play().catch(e => console.error("Audio failed:", e));
        });
      });
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/desktop-chat" element={<DesktopChatWidget />} />

          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminHome />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="activity-monitoring" element={<AdminActivityMonitoring />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="learning-reports" element={<AdminLearningReports />} />
            <Route path="employee/:id" element={<AdminEmployeeProfile />} />
            <Route path="work-diary/:id" element={<WorkDiary />} />
            <Route path="employee-credentials/:id" element={<EmployeeCredentials />} />
            <Route path="chat" element={<Chat />} />
            <Route path="birthdays" element={<AdminBirthdays />} />
          </Route>

          <Route path="/employee" element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeHome />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="todo" element={<EmployeeTodo />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="apply-leave" element={<EmployeeLeave />} />
            <Route path="leaves" element={<EmployeeLeave />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="birthdays" element={<EmployeeBirthdays />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
