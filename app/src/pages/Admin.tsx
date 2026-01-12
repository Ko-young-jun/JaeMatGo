import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, ArrowLeft, Eye, Settings, BookOpen } from 'lucide-react';
import { getFAQs, deleteFAQ } from '../services';
import { useAuth } from '../AuthContext';
import type { FAQ } from '../types';
import './Admin.css';

export const Admin = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadFAQs();
    }, [user, navigate]);

    const loadFAQs = async () => {
        try {
            const data = await getFAQs();
            setFaqs(data);
        } catch (error) {
            console.error('Failed to load FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, question: string) => {
        if (!confirm(`"${question}" FAQ를 삭제하시겠습니까?`)) return;

        try {
            await deleteFAQ(id);
            setFaqs(faqs.filter(f => f.id !== id));
        } catch (error) {
            console.error('Failed to delete FAQ:', error);
            alert('FAQ 삭제에 실패했습니다.');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-header-left">
                        <Link to="/" className="back-link">
                            <ArrowLeft size={20} />
                            홈으로
                        </Link>
                        <h1>FAQ 관리</h1>
                    </div>
                    <div className="admin-header-right">
                        <span className="user-email">{user?.email}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={18} />
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <main className="admin-main">
                <div className="admin-toolbar">
                    <Link to="/admin/new" className="add-btn">
                        <Plus size={20} />
                        새 FAQ 추가
                    </Link>
                    <Link to="/admin/settings" className="settings-btn">
                        <Settings size={20} />
                        사이트 설정
                    </Link>
                    <Link to="/admin/html-guide" className="guide-btn">
                        <BookOpen size={20} />
                        서식 안내서
                    </Link>
                </div>

                {loading ? (
                    <div className="loading">로딩 중...</div>
                ) : faqs.length === 0 ? (
                    <div className="empty-state">
                        <p>등록된 FAQ가 없습니다.</p>
                        <Link to="/admin/new" className="add-btn">첫 FAQ 추가하기</Link>
                    </div>
                ) : (
                    <div className="faq-table">
                        <div className="table-header">
                            <span className="col-order">순서</span>
                            <span className="col-question">질문</span>
                            <span className="col-category">카테고리</span>
                            <span className="col-views">조회수</span>
                            <span className="col-actions">관리</span>
                        </div>
                        {faqs.map(faq => (
                            <div key={faq.id} className="table-row">
                                <span className="col-order">{faq.order}</span>
                                <span
                                    className="col-question"
                                    dangerouslySetInnerHTML={{ __html: faq.question }}
                                />
                                <span className="col-category">{faq.category || '-'}</span>
                                <span className="col-views">
                                    <Eye size={14} />
                                    {faq.clickCount}
                                </span>
                                <span className="col-actions">
                                    <Link to={`/admin/edit/${faq.id}`} className="action-btn edit">
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(faq.id, faq.question)}
                                        className="action-btn delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
