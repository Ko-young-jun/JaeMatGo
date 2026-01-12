import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ExternalLink, Settings, Moon, Sun } from 'lucide-react';
import { FAQList } from '../components/FAQList';
import { getFAQs, getSiteSettings } from '../services';
import { useAuth } from '../AuthContext';
import type { FAQ, SiteSettings } from '../types';
import './Home.css';

export const Home = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [faqData, settingsData] = await Promise.all([
                    getFAQs(),
                    getSiteSettings()
                ]);
                setFaqs(faqData);
                setSettings(settingsData);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];

    return (
        <div className="page">
            <header className="site-header">
                <nav className="site-nav">
                    <div className="brand">
                        <span className="brand-mark">WKU</span>
                        <span className="brand-text">원광대학교 재학생맞춤형고용서비스</span>
                    </div>
                    <div className="nav-actions">
                        <button
                            className="theme-toggle"
                            onClick={() => setDarkMode(!darkMode)}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <span className="nav-contact">
                            <Phone size={16} />
                            <strong>{settings?.phoneNumber || '063-850-7571'}</strong>
                        </span>
                        {user?.isAdmin ? (
                            <Link to="/admin" className="admin-link">
                                <Settings size={18} />
                                관리자
                            </Link>
                        ) : (
                            <Link to="/login" className="admin-link">
                                <Settings size={18} />
                                관리자 로그인
                            </Link>
                        )}
                    </div>
                </nav>

                <section className="hero">
                    <div className="hero-content">
                        <h1
                            className="hero-title"
                            dangerouslySetInnerHTML={{ __html: settings?.heroTitle || '재맞고 이용 안내' }}
                        />
                        <p
                            className="hero-description"
                            dangerouslySetInnerHTML={{ __html: settings?.heroDescription || '재맞고와 함께라면 복잡한 절차 없이도 간편하게 서비스를 이용할 수 있습니다. 필요한 모든 안내와 자주 묻는 질문을 한 곳에서 빠르게 찾아보세요.' }}
                        />
                        <div className="hero-links">
                            {(settings?.links || [
                                { label: '고용24', url: 'https://www.work24.go.kr/cm/main.do' },
                                { label: '잡케어', url: 'https://www.work24.go.kr/wk/jc/a/c/1000/jobCareIntroExp.do' },
                                { label: '대플홈피', url: 'https://w-job.wku.ac.kr/' }
                            ]).map((link, index) => (
                                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="hero-link">
                                    <ExternalLink size={16} />
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            </header>

            <main className="site-main">
                <section className="faq-section">
                    <div className="section-header">
                        <span className="section-eyebrow">FAQ</span>
                        <h2
                            className="section-title"
                            dangerouslySetInnerHTML={{ __html: settings?.faqSectionTitle || '자주 묻는 질문' }}
                        />
                        <p
                            className="section-description"
                            dangerouslySetInnerHTML={{ __html: settings?.faqSectionDescription || '아래 질문을 선택하면 자세한 답변과 함께 추가 자료를 확인할 수 있습니다.' }}
                        />
                    </div>

                    {loading ? (
                        <div className="loader-wrapper">
                            <div className="loader"></div>
                            <p>FAQ 데이터를 불러오는 중입니다...</p>
                        </div>
                    ) : (
                        <FAQList faqs={faqs} categories={categories} />
                    )}
                </section>
            </main>

            <footer className="site-footer">
                <p>원광대학교 대학일자리플러스센터</p>
            </footer>
        </div>
    );
};
