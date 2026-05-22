import { Link, Route, Routes } from 'react-router';
import './App.css';
import { CharacterDetails } from './components/CharacterDetails';
import { ThemeSelector } from './components/ThemeSelector';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
        <ThemeSelector />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />}>
            <Route index element={<CharacterDetails />} />
          </Route>
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
