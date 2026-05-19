import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Brain, 
  BarChart3, 
  Award, 
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';
import './Landing.css';

const features = [
  {
    icon: Brain,
    key: 'adaptive',
    color: '#3b82f6'
  },
  {
    icon: Users,
    key: 'collaborative', 
    color: '#10b981'
  },
  {
    icon: Award,
    key: 'gamification',
    color: '#f59e0b'
  },
  {
    icon: BarChart3,
    key: 'analytics',
    color: '#8b5cf6'
  }
];

const roles = [
  { key: 'admin', icon: Star },
  { key: 'professor', icon: BookOpen },
  { key: 'student', icon: GraduationCap },
  { key: 'parent', icon: Users }
];

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳', dir: 'rtl' }
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [activeLang, setActiveLang] = useState(i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setActiveLang(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="landing" dir={activeLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <GraduationCap size={32} />
          <span>Don Bosco<span>Connect</span></span>
        </div>
        <div className="nav-links">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-btn ${activeLang === lang.code ? 'active' : ''}`}
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
          <Link to="/login" className="nav-cta">
            {t('auth.login')}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }} />
            ))}
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI-Powered Learning</span>
          </div>
          <h1>{t('landing.hero.title')}</h1>
          <p className="hero-subtitle">{t('landing.hero.subtitle')}</p>
          <p className="hero-description">{t('landing.hero.description')}</p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary">
              {t('landing.hero.cta')}
              <ArrowRight size={20} />
            </Link>
            <a href="#features" className="btn-secondary">
              {t('landing.hero.ctaSecondary')}
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">10K+</span>
              <span className="stat-label">{t('dashboard.totalStudents')}</span>
            </div>
            <div className="stat">
              <span className="stat-value">500+</span>
              <span className="stat-label">{t('dashboard.totalProfessors')}</span>
            </div>
            <div className="stat">
              <span className="stat-value">50+</span>
              <span className="stat-label">{t('dashboard.totalClasses')}</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="app-header">
                <Users size={20} />
                <span>Dashboard</span>
              </div>
              <div className="app-cards">
                <div className="app-card">
                  <Brain size={24} />
                  <span>AI Mentor</span>
                </div>
                <div className="app-card">
                  <BookOpen size={24} />
                  <span>Courses</span>
                </div>
                <div className="app-card">
                  <Award size={24} />
                  <span>Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>{t('landing.features.title')}</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon" style={{ background: feature.color }}>
                <feature.icon size={28} />
              </div>
              <h3>{t(`landing.features.${feature.key}.title`)}</h3>
              <p>{t(`landing.features.${feature.key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles">
        <div className="section-header">
          <h2>{t('landing.roles.title')}</h2>
        </div>
        <div className="roles-grid">
          {roles.map((role, index) => (
            <div key={index} className="role-card">
              <div className="role-icon">
                <role.icon size={32} />
              </div>
              <h3>{t(`landing.roles.${role.key}`)}</h3>
              <p>{t(`landing.roles.${role.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="tech">
        <h2>{t('landing.tech.title')}</h2>
        <p>{t('landing.tech.subtitle')}</p>
        <div className="tech-logos">
          <div className="tech-item">
            <span className="tech-name">Django</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">React</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">React Native</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">PostgreSQL</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">Ollama</span>
          </div>
          <div className="tech-item">
            <span className="tech-name">Electron</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>{t('landing.cta.title')}</h2>
          <p>{t('landing.cta.description')}</p>
          <Link to="/login" className="btn-primary btn-large">
            {t('landing.cta.button')}
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <GraduationCap size={28} />
          <span>Don Bosco<span>Connect</span></span>
          <p>{t('landing.footer.tagline')}</p>
        </div>
        <div className="footer-links">
          <a href="#">{t('landing.footer.privacy')}</a>
          <a href="#">{t('landing.footer.terms')}</a>
          <a href="#">{t('landing.footer.contact')}</a>
        </div>
        <div className="footer-copyright">
          © 2024 Don Bosco Connect. {t('landing.footer.copyright')}
        </div>
      </footer>
    </div>
  );
}