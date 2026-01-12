import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import './Login.css';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            console.error('Login failed:', err);
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Link to="/" className="back-home">
                    <ArrowLeft size={18} />
                    홈으로 돌아가기
                </Link>

                <div className="login-card">
                    <div className="login-header">
                        <h1>관리자 로그인</h1>
                        <p>FAQ를 관리하려면 로그인하세요</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="email">이메일</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">비밀번호</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-btn"
                        >
                            <LogIn size={18} />
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
