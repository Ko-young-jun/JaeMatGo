import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone,
    ExternalLink,
    Settings,
    Moon,
    Sun,
    Search,
    Eye,
    LayoutGrid,
    GraduationCap
} from 'lucide-react';
import { FAQList } from '../components/FAQList';
import { getFAQs, getSiteSettings } from '../services';
import { useAuth } from '../AuthContext';
import type { FAQ, SiteSettings } from '../types';

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

    const stats = useMemo(() => {
        const totalViews = faqs.reduce((acc, faq) => acc + (faq.clickCount || 0), 0);
        const avgViews = faqs.length > 0 ? Math.round(totalViews / faqs.length) : 0;

        return [
            { label: 'FAQ 문항', value: `${faqs.length}개`, icon: LayoutGrid },
            { label: '카테고리', value: `${categories.length}개`, icon: Search },
            { label: '평균 조회수', value: `${avgViews}회`, icon: Eye }
        ];
    }, [faqs, categories.length]);

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
            <header className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-header-bg)]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[color:rgba(242,194,0,0.16)] blur-3xl" />
                    <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-[color:rgba(242,194,0,0.12)] blur-3xl" />
                </div>

                <div className="relative mx-auto w-full max-w-[1080px] px-5 pb-12 pt-7 md:px-8 md:pb-16 md:pt-9">
                    <nav className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-text-strong)] text-xs font-bold tracking-[0.08em] text-[var(--color-primary)]">
                                WKU
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-[var(--color-text-strong)] md:text-base">
                                    원광대학교 재학생맞춤형고용서비스
                                </span>
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    학생 안내 FAQ 플랫폼
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <button
                                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]"
                                onClick={() => setDarkMode(!darkMode)}
                                aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                            >
                                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                {darkMode ? '라이트' : '다크'}
                            </button>

                            <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                                <Phone size={16} />
                                <strong className="font-semibold text-[var(--color-text-strong)]">
                                    {settings?.phoneNumber || '063-850-7571'}
                                </strong>
                            </span>

                            {user?.isAdmin ? (
                                <Link
                                    to="/admin"
                                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text-strong)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(242,194,0,0.25)]"
                                >
                                    <Settings size={16} />
                                    관리자
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-text-strong)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(242,194,0,0.25)]"
                                >
                                    <Settings size={16} />
                                    관리자 로그인
                                </Link>
                            )}
                        </div>
                    </nav>

                    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                        <div>
                            <div className="mb-3 inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[var(--color-text-muted)]">
                                REJEMATGO FAQ GUIDE
                            </div>

                            <h1
                                className="max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.15] text-[var(--color-text-strong)]"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        settings?.heroTitle ||
                                        '긴 글, 이미지, 영상도 빠르게 찾고 편하게 읽으세요.'
                                }}
                            />

                            <p
                                className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-muted)] md:text-lg"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        settings?.heroDescription ||
                                        '학생 사용자를 위해 탐색 속도와 가독성을 높였습니다. 키워드 검색, 카테고리 필터, 단일 아코디언으로 필요한 답변을 빠르게 찾을 수 있습니다.'
                                }}
                            />

                            <div className="mt-6 flex flex-wrap gap-2">
                                {(settings?.links || [
                                    { label: '고용24', url: 'https://www.work24.go.kr/cm/main.do' },
                                    { label: '잡케어', url: 'https://www.work24.go.kr/wk/jc/a/c/1000/jobCareIntroExp.do' },
                                    { label: '대플홈피', url: 'https://w-job.wku.ac.kr/' }
                                ]).map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[#111111] hover:bg-[#111111] hover:text-[var(--color-primary)]"
                                    >
                                        <ExternalLink size={15} />
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-strong)]">
                                <GraduationCap size={18} className="text-[var(--color-primary)]" />
                                학생용 읽기 최적화 포인트
                            </div>
                            <ul className="space-y-3 text-sm leading-6 text-[var(--color-text-muted)]">
                                <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2">
                                    검색 + 카테고리 필터로 질문 접근 시간 단축
                                </li>
                                <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2">
                                    한 번에 하나만 열리는 아코디언으로 집중도 유지
                                </li>
                                <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2">
                                    긴 본문, 이미지, 영상 콘텐츠를 저피로 구조로 배치
                                </li>
                            </ul>
                        </aside>
                    </section>
                </div>
            </header>

            <main className="mx-auto w-full max-w-[1080px] px-5 py-10 md:px-8 md:py-14">
                <section className="mb-6 grid gap-3 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                        >
                            <div className="mb-2 inline-flex rounded-md bg-[color:rgba(242,194,0,0.18)] p-2 text-[var(--color-text-strong)]">
                                <stat.icon size={16} />
                            </div>
                            <p className="text-xs font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                            <p className="mt-1 text-xl font-bold text-[var(--color-text-strong)]">{stat.value}</p>
                        </div>
                    ))}
                </section>

                <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-7">
                    <div className="mb-6">
                        <span className="mb-2 block text-xs font-bold tracking-[0.14em] text-[var(--color-primary)]">
                            FAQ
                        </span>
                        <h2
                            className="text-[clamp(1.6rem,3vw,2.35rem)] font-black leading-tight text-[var(--color-text-strong)]"
                            dangerouslySetInnerHTML={{ __html: settings?.faqSectionTitle || '자주 묻는 질문' }}
                        />
                        <p
                            className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)] md:text-base"
                            dangerouslySetInnerHTML={{
                                __html:
                                    settings?.faqSectionDescription ||
                                    '질문을 선택하면 상세 답변이 열립니다. 긴 본문, 이미지, 영상까지 읽기 쉽게 구성했습니다.'
                            }}
                        />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-12 text-[var(--color-text-muted)]">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                            <p className="text-sm font-medium">FAQ 데이터를 불러오는 중입니다...</p>
                        </div>
                    ) : (
                        <FAQList faqs={faqs} categories={categories} />
                    )}
                </section>
            </main>

            <footer className="bg-[#111111] py-7 text-center text-sm font-semibold text-[var(--color-primary)]">
                원광대학교 대학일자리플러스센터
            </footer>
        </div>
    );
};
