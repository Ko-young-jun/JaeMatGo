import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { FAQEditor } from './pages/FAQEditor';
import { SiteSettingsEditor } from './pages/SiteSettingsEditor';
import { HtmlGuide } from './pages/HtmlGuide';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/new" element={<FAQEditor />} />
          <Route path="/admin/edit/:id" element={<FAQEditor />} />
          <Route path="/admin/settings" element={<SiteSettingsEditor />} />
          <Route path="/admin/html-guide" element={<HtmlGuide />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
