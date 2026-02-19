import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { getSiteSettings, updateSiteSettings } from '../services';
import { useAuth } from '../AuthContext';
import type { SiteSettings } from '../types';
import './SiteSettingsEditor.css';

export const SiteSettingsEditor = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SiteSettings>({
        brandTitle: '',
        brandSubtitle: '',
        heroEyebrow: '',
        heroTitle: '',
        heroDescription: '',
        heroPanelTitle: '',
        heroPanelItems: [],
        faqSectionTitle: '',
        faqSectionDescription: '',
        phoneNumber: '',
        links: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadSettings();
    }, [user, navigate]);

    const loadSettings = async () => {
        try {
            const data = await getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSiteSettings(settings);
            alert('설정이 저장되었습니다!');
            navigate('/admin');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('설정 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const addLink = () => {
        setSettings({
            ...settings,
            links: [...settings.links, { label: '', url: '' }]
        });
    };

    const removeLink = (index: number) => {
        setSettings({
            ...settings,
            links: settings.links.filter((_, i) => i !== index)
        });
    };

    const updateLink = (index: number, field: 'label' | 'url', value: string) => {
        const newLinks = [...settings.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSettings({ ...settings, links: newLinks });
    };

    const addPanelItem = () => {
        setSettings({
            ...settings,
            heroPanelItems: [...settings.heroPanelItems, '']
        });
    };

    const removePanelItem = (index: number) => {
        setSettings({
            ...settings,
            heroPanelItems: settings.heroPanelItems.filter((_, i) => i !== index)
        });
    };

    const updatePanelItem = (index: number, value: string) => {
        const next = [...settings.heroPanelItems];
        next[index] = value;
        setSettings({ ...settings, heroPanelItems: next });
    };

    if (loading) {
        return <div className="settings-loading">로딩 중...</div>;
    }

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div className="settings-header-content">
                    <Link to="/admin" className="back-link">
                        <ArrowLeft size={20} />
                        관리자로 돌아가기
                    </Link>
                    <h1>사이트 설정</h1>
                </div>
            </header>

            <main className="settings-main">
                <div className="settings-form">
                    <section className="settings-section">
                        <h2>상단 브랜딩</h2>

                        <div className="form-group">
                            <label htmlFor="brandTitle">브랜드 제목</label>
                            <input
                                id="brandTitle"
                                type="text"
                                value={settings.brandTitle}
                                onChange={(e) => setSettings({ ...settings, brandTitle: e.target.value })}
                                placeholder="원광대학교 재학생맞춤형고용서비스"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="brandSubtitle">브랜드 부제</label>
                            <input
                                id="brandSubtitle"
                                type="text"
                                value={settings.brandSubtitle}
                                onChange={(e) => setSettings({ ...settings, brandSubtitle: e.target.value })}
                                placeholder="학생 안내 FAQ 플랫폼"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="heroEyebrow">히어로 배지 문구</label>
                            <input
                                id="heroEyebrow"
                                type="text"
                                value={settings.heroEyebrow}
                                onChange={(e) => setSettings({ ...settings, heroEyebrow: e.target.value })}
                                placeholder="REJEMATGO FAQ GUIDE"
                                className="form-input"
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h2>Hero 섹션</h2>

                        <div className="form-group">
                            <label htmlFor="heroTitle">제목</label>
                            <input
                                id="heroTitle"
                                type="text"
                                value={settings.heroTitle}
                                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                                placeholder="재맞고 이용 안내"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="heroDescription">설명</label>
                            <textarea
                                id="heroDescription"
                                value={settings.heroDescription}
                                onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                                placeholder="재맞고와 함께라면..."
                                className="form-textarea"
                                rows={3}
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <div className="section-header-row">
                            <h2>오른쪽 포인트 카드</h2>
                            <button type="button" onClick={addPanelItem} className="add-link-btn">
                                <Plus size={18} />
                                항목 추가
                            </button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="heroPanelTitle">카드 제목</label>
                            <input
                                id="heroPanelTitle"
                                type="text"
                                value={settings.heroPanelTitle}
                                onChange={(e) => setSettings({ ...settings, heroPanelTitle: e.target.value })}
                                placeholder="학생용 읽기 최적화 포인트"
                                className="form-input"
                            />
                        </div>

                        {settings.heroPanelItems.map((item, index) => (
                            <div key={index} className="link-row">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updatePanelItem(index, e.target.value)}
                                    placeholder="카드 항목 문구"
                                    className="form-input link-url"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePanelItem(index)}
                                    className="remove-link-btn"
                                    aria-label={`카드 항목 ${index + 1} 삭제`}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </section>

                    <section className="settings-section">
                        <h2>FAQ 섹션</h2>

                        <div className="form-group">
                            <label htmlFor="faqSectionTitle">섹션 제목</label>
                            <input
                                id="faqSectionTitle"
                                type="text"
                                value={settings.faqSectionTitle}
                                onChange={(e) => setSettings({ ...settings, faqSectionTitle: e.target.value })}
                                placeholder="자주 묻는 질문"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="faqSectionDescription">섹션 설명</label>
                            <textarea
                                id="faqSectionDescription"
                                value={settings.faqSectionDescription}
                                onChange={(e) => setSettings({ ...settings, faqSectionDescription: e.target.value })}
                                placeholder="아래 질문을 선택하면..."
                                className="form-textarea"
                                rows={2}
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h2>연락처</h2>

                        <div className="form-group">
                            <label htmlFor="phoneNumber">전화번호</label>
                            <input
                                id="phoneNumber"
                                type="text"
                                value={settings.phoneNumber}
                                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                                placeholder="063-850-7571"
                                className="form-input"
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <div className="section-header-row">
                            <h2>외부 링크</h2>
                            <button type="button" onClick={addLink} className="add-link-btn">
                                <Plus size={18} />
                                링크 추가
                            </button>
                        </div>

                        {settings.links.map((link, index) => (
                            <div key={index} className="link-row">
                                <input
                                    type="text"
                                    value={link.label}
                                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                                    placeholder="링크 이름"
                                    className="form-input link-label"
                                />
                                <input
                                    type="url"
                                    value={link.url}
                                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                                    placeholder="https://..."
                                    className="form-input link-url"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="remove-link-btn"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </section>

                    <div className="form-actions">
                        <Link to="/admin" className="cancel-btn">취소</Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="save-btn"
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '설정 저장'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
