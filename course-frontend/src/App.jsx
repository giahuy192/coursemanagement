import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Payment from './pages/Payment';
import LearnCourse from './pages/LearnCourse';
import AdminCurriculum from './pages/AdminCurriculum';
import StudentProfile from './pages/StudentProfile';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/course/:id/curriculum" element={<AdminCurriculum />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/course/:id/learn" element={<LearnCourse />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;