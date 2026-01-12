import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, BookOpen } from 'lucide-react';
import './HtmlGuide.css';

interface CodeSnippet {
    title: string;
    description: string;
    code: string;
    preview?: string;
}

const snippets: CodeSnippet[] = [
    {
        title: '📦 정보 박스',
        description: '중요한 정보를 강조할 때 사용',
        code: `<div class="info-box">
  <strong>💡 알아두세요!</strong><br>
  여기에 중요한 내용을 작성하세요.
</div>`,
    },
    {
        title: '⚠️ 경고 박스',
        description: '주의가 필요한 내용을 강조할 때 사용',
        code: `<div class="warning-box">
  <strong>⚠️ 주의!</strong><br>
  여기에 주의사항을 작성하세요.
</div>`,
    },
    {
        title: '✨ 그라데이션 텍스트',
        description: '눈에 띄는 제목이나 강조 텍스트에 사용',
        code: `<span class="gradient-text" style="font-size: 20px; font-weight: bold;">강조할 텍스트</span>`,
    },
    {
        title: '💫 페이드인 효과',
        description: '텍스트가 서서히 나타나는 효과',
        code: `<p class="fade-in">이 문장은 서서히 나타납니다.</p>`,
    },
    {
        title: '📤 슬라이드업 효과',
        description: '아래에서 위로 올라오며 나타나는 효과',
        code: `<p class="slide-up">이 문장은 아래에서 위로 올라옵니다.</p>`,
    },
    {
        title: '💓 펄스 효과',
        description: '주목을 끌기 위해 커졌다 작아지는 효과',
        code: `<span class="pulse" style="color: #a67c52; font-weight: bold;">중요!</span>`,
    },
    {
        title: '🌟 하이라이트 깜빡임',
        description: '배경색이 깜빡이며 강조하는 효과',
        code: `<span class="highlight-flash">핵심 키워드</span>`,
    },
    {
        title: '👆 호버 확대 효과',
        description: '마우스를 올리면 커지는 효과',
        code: `<span class="hover-grow">마우스를 올려보세요</span>`,
    },
    {
        title: '🎨 글자색 변경',
        description: '원하는 색상으로 텍스트 강조',
        code: `<span style="color: #a67c52;">갈색 텍스트</span>
<span style="color: #dc2626;">빨간색 텍스트</span>
<span style="color: #2563eb;">파란색 텍스트</span>`,
    },
    {
        title: '📏 글자 크기 변경',
        description: '텍스트 크기 조절',
        code: `<span style="font-size: 24px;">큰 글씨</span>
<span style="font-size: 14px;">작은 글씨</span>`,
    },
    {
        title: '💪 굵은 글씨 & 기울임',
        description: '기본 텍스트 강조',
        code: `<strong>굵은 글씨</strong>
<em>기울임 글씨</em>
<u>밑줄</u>`,
    },
    {
        title: '🔗 링크 삽입',
        description: '클릭 가능한 링크 추가',
        code: `<a href="https://example.com" target="_blank">클릭하세요</a>`,
    },
    {
        title: '📝 순서 없는 목록',
        description: '글머리 기호가 있는 목록',
        code: `<ul>
  <li>첫 번째 항목</li>
  <li>두 번째 항목</li>
  <li>세 번째 항목</li>
</ul>`,
    },
    {
        title: '🔢 순서 있는 목록',
        description: '번호가 붙는 목록',
        code: `<ol>
  <li>1단계: 신청서 작성</li>
  <li>2단계: 서류 제출</li>
  <li>3단계: 승인 대기</li>
</ol>`,
    },
];

export const HtmlGuide = () => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = async (code: string, index: number) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="guide-page">
            <header className="guide-header">
                <div className="guide-header-content">
                    <Link to="/admin" className="back-link">
                        <ArrowLeft size={20} />
                        관리자로 돌아가기
                    </Link>
                    <h1>
                        <BookOpen size={28} />
                        HTML 서식 안내서
                    </h1>
                </div>
            </header>

            <main className="guide-main">
                <div className="guide-intro">
                    <h2>📘 사용 방법</h2>
                    <ol>
                        <li>FAQ 에디터에서 <strong>"HTML 모드"</strong> 버튼을 클릭하세요.</li>
                        <li>아래 서식 중 원하는 것을 찾아 <strong>"복사"</strong> 버튼을 클릭하세요.</li>
                        <li>에디터에 붙여넣기 (<kbd>Ctrl+V</kbd>) 하세요.</li>
                        <li>텍스트 내용을 원하는 대로 수정하세요.</li>
                        <li><strong>"저장"</strong>을 클릭하면 끝!</li>
                    </ol>
                </div>

                <div className="snippets-grid">
                    {snippets.map((snippet, index) => (
                        <div key={index} className="snippet-card">
                            <div className="snippet-header">
                                <h3>{snippet.title}</h3>
                                <button
                                    onClick={() => handleCopy(snippet.code, index)}
                                    className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <Check size={16} />
                                            복사됨!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            복사
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="snippet-description">{snippet.description}</p>
                            <div className="snippet-preview">
                                <span className="preview-label">미리보기</span>
                                <div
                                    className="preview-content"
                                    dangerouslySetInnerHTML={{ __html: snippet.code }}
                                />
                            </div>
                            <div className="snippet-code">
                                <span className="code-label">HTML 코드</span>
                                <pre><code>{snippet.code}</code></pre>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="guide-tips">
                    <h2>💡 추가 팁</h2>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <h4>여러 효과 함께 사용하기</h4>
                            <p>클래스를 여러 개 넣으면 효과가 합쳐집니다:</p>
                            <code>class="fade-in pulse"</code>
                        </div>
                        <div className="tip-card">
                            <h4>색상 코드</h4>
                            <p>자주 쓰는 색상:</p>
                            <ul>
                                <li><span style={{ color: '#a67c52' }}>■</span> #a67c52 (메인 갈색)</li>
                                <li><span style={{ color: '#dc2626' }}>■</span> #dc2626 (빨강)</li>
                                <li><span style={{ color: '#2563eb' }}>■</span> #2563eb (파랑)</li>
                                <li><span style={{ color: '#16a34a' }}>■</span> #16a34a (초록)</li>
                            </ul>
                        </div>
                        <div className="tip-card">
                            <h4>줄바꿈</h4>
                            <p>줄을 바꾸려면 <code>&lt;br&gt;</code> 사용</p>
                        </div>
                        <div className="tip-card">
                            <h4>문단 구분</h4>
                            <p>문단을 나누려면 <code>&lt;p&gt;...&lt;/p&gt;</code> 사용</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
