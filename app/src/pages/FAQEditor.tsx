import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeft, Save, Image as ImageIcon, Video, Code } from 'lucide-react';
import { getFAQ, createFAQ, updateFAQ, uploadImage } from '../services';
import { useAuth } from '../AuthContext';
import './FAQEditor.css';

// 커스텀 Divider(hr) 블롯 등록
const BlockEmbed = Quill.import('blots/block/embed') as typeof Quill.import;
class DividerBlot extends (BlockEmbed as any) {
    static blotName = 'divider';
    static tagName = 'hr';
}
Quill.register(DividerBlot);

// 커스텀 InfoBox 블롯 등록
const Block = Quill.import('blots/block') as any;
class InfoBoxBlot extends Block {
    static blotName = 'info-box';
    static tagName = 'div';
    static className = 'info-box';

    static create(value: any) {
        const node = super.create(value);
        node.setAttribute('class', 'info-box');
        return node;
    }
}
Quill.register(InfoBoxBlot);

// 커스텀 WarningBox 블롯 등록
class WarningBoxBlot extends Block {
    static blotName = 'warning-box';
    static tagName = 'div';
    static className = 'warning-box';

    static create(value: any) {
        const node = super.create(value);
        node.setAttribute('class', 'warning-box');
        return node;
    }
}
Quill.register(WarningBoxBlot);

export const FAQEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const quillRef = useRef<ReactQuill>(null);
    const isEdit = Boolean(id);

    const [question, setQuestion] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [order, setOrder] = useState(0);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [htmlMode, setHtmlMode] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isEdit && id) {
            loadFAQ(id);
        }
    }, [user, id, isEdit, navigate]);

    const loadFAQ = async (faqId: string) => {
        try {
            const faq = await getFAQ(faqId);
            if (faq) {
                setQuestion(faq.question);
                setContent(faq.content);
                setCategory(faq.category || '');
                setOrder(faq.order);
            }
        } catch (error) {
            console.error('Failed to load FAQ:', error);
            alert('FAQ를 불러오는데 실패했습니다.');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const url = await uploadImage(file, 'faq');
                if (htmlMode) {
                    setContent(prev => prev + `\n<img src="${url}" alt="이미지" style="max-width: 100%;" />\n`);
                } else {
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection();
                        quill.insertEmbed(range?.index || 0, 'image', url);
                    }
                }
            } catch (error) {
                console.error('Image upload failed:', error);
                alert('이미지 업로드에 실패했습니다.');
            }
        };
    }, [htmlMode]);

    const handleVideoInsert = useCallback(() => {
        const url = prompt('영상 URL을 입력하세요 (YouTube, Vimeo 등):');
        if (!url) return;

        let embedUrl = url;
        if (url.includes('youtube.com/watch')) {
            const videoId = new URL(url).searchParams.get('v');
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        const videoHtml = `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;

        if (htmlMode) {
            setContent(prev => prev + '\n' + videoHtml + '\n');
        } else {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection();
                quill.clipboard.dangerouslyPasteHTML(range?.index || 0, videoHtml);
            }
        }
    }, [htmlMode]);

    // 구분선 삽입
    const handleHrInsert = useCallback(() => {
        if (htmlMode) {
            // HTML 모드: 현재 커서 위치에 삽입 (textarea 참조 필요)
            const textarea = document.querySelector('.html-textarea') as HTMLTextAreaElement;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const scrollTop = textarea.scrollTop; // 스크롤 위치 저장
                const newContent = content.substring(0, start) + '\n<hr>\n' + content.substring(end);
                setContent(newContent);
                setTimeout(() => {
                    textarea.focus();
                    textarea.selectionStart = textarea.selectionEnd = start + 6;
                    textarea.scrollTop = scrollTop; // 스크롤 위치 복원
                }, 0);
            } else {
                setContent(prev => prev + '\n<hr>\n');
            }
        } else {
            // WYSIWYG 모드 - 커스텀 divider 블롯 사용
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection();
                const index = range?.index || quill.getLength();
                quill.insertEmbed(index, 'divider', true);
                quill.setSelection(index + 1, 0);
            }
        }
    }, [htmlMode, content]);

    // 정보 박스 삽입
    const handleInfoBoxInsert = useCallback(() => {
        const title = prompt('박스 제목을 입력하세요:', '💡 알아두세요!');
        if (!title) return;

        const boxHtml = `<div class="info-box"><strong>${title}</strong><br>여기에 내용을 작성하세요.</div>`;

        if (htmlMode) {
            const textarea = document.querySelector('.html-textarea') as HTMLTextAreaElement;
            if (textarea) {
                const start = textarea.selectionStart;
                const scrollTop = textarea.scrollTop;
                const newContent = content.substring(0, start) + '\n' + boxHtml + '\n' + content.substring(start);
                setContent(newContent);
                setTimeout(() => {
                    textarea.focus();
                    textarea.scrollTop = scrollTop;
                }, 0);
            } else {
                setContent(prev => prev + '\n' + boxHtml + '\n');
            }
        } else {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection();
                quill.clipboard.dangerouslyPasteHTML(range?.index || 0, boxHtml);
            }
        }
    }, [htmlMode, content]);

    // 경고 박스 삽입
    const handleWarningBoxInsert = useCallback(() => {
        const title = prompt('박스 제목을 입력하세요:', '⚠️ 주의!');
        if (!title) return;

        const boxHtml = `<div class="warning-box"><strong>${title}</strong><br>여기에 내용을 작성하세요.</div>`;

        if (htmlMode) {
            const textarea = document.querySelector('.html-textarea') as HTMLTextAreaElement;
            if (textarea) {
                const start = textarea.selectionStart;
                const scrollTop = textarea.scrollTop;
                const newContent = content.substring(0, start) + '\n' + boxHtml + '\n' + content.substring(start);
                setContent(newContent);
                setTimeout(() => {
                    textarea.focus();
                    textarea.scrollTop = scrollTop;
                }, 0);
            } else {
                setContent(prev => prev + '\n' + boxHtml + '\n');
            }
        } else {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection();
                quill.clipboard.dangerouslyPasteHTML(range?.index || 0, boxHtml);
            }
        }
    }, [htmlMode, content]);

    // HTML 정리 함수 (문자열 반환)
    const formatHtmlString = (html: string): string => {
        return html
            // 태그 사이의 공백과 줄바꿈 정리
            .replace(/>\s+</g, '><')
            // 블록 태그 앞에 줄바꿈 추가
            .replace(/<(p|div|br|hr|ul|ol|li|h[1-6]|table|tr|thead|tbody)/gi, '\n<$1')
            // 닫는 블록 태그 뒤에 줄바꿈
            .replace(/<\/(p|div|ul|ol|li|h[1-6]|table|tr|thead|tbody)>/gi, '</$1>\n')
            // 여러 줄바꿈을 하나로
            .replace(/\n{3,}/g, '\n\n')
            // 시작 줄바꿈 제거
            .trim();
    };

    // HTML 정리 버튼용
    const formatHtml = useCallback(() => {
        setContent(formatHtmlString(content));
    }, [content]);

    const handleSave = async () => {
        if (!question.trim()) {
            alert('질문을 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            if (isEdit && id) {
                await updateFAQ(id, { question, content, category, order });
            } else {
                await createFAQ({ question, content, category, order });
            }
            navigate('/admin');
        } catch (error) {
            console.error('Failed to save FAQ:', error);
            alert('FAQ 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    if (loading) {
        return <div className="editor-loading">로딩 중...</div>;
    }

    return (
        <div className="editor-page">
            <header className="editor-header">
                <div className="editor-header-content">
                    <Link to="/admin" className="back-link">
                        <ArrowLeft size={20} />
                        목록으로
                    </Link>
                    <h1>{isEdit ? 'FAQ 수정' : '새 FAQ 작성'}</h1>
                </div>
            </header>

            <main className="editor-main">
                <div className="editor-form">
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label htmlFor="question">질문</label>
                            <input
                                id="question"
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="FAQ 질문을 입력하세요"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">카테고리</label>
                            <input
                                id="category"
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="예: 신청방법, 자격조건"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="order">정렬 순서</label>
                            <input
                                id="order"
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="label-row">
                            <label>답변 내용</label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!htmlMode) {
                                        // WYSIWYG → HTML 전환 시 자동 정리
                                        setContent(formatHtmlString(content));
                                    }
                                    setHtmlMode(!htmlMode);
                                }}
                                className={`html-toggle ${htmlMode ? 'active' : ''}`}
                            >
                                <Code size={16} />
                                {htmlMode ? 'WYSIWYG 모드' : 'HTML 모드'}
                            </button>
                        </div>

                        <div className="media-buttons">
                            <button type="button" onClick={handleImageUpload} className="media-btn">
                                <ImageIcon size={18} />
                                이미지 삽입
                            </button>
                            <button type="button" onClick={handleVideoInsert} className="media-btn">
                                <Video size={18} />
                                영상 삽입
                            </button>
                            <button type="button" onClick={handleHrInsert} className="media-btn">
                                ➖ 구분선
                            </button>
                            <button type="button" onClick={handleInfoBoxInsert} className="media-btn info-box-btn">
                                📦 정보 박스
                            </button>
                            <button type="button" onClick={handleWarningBoxInsert} className="media-btn warning-box-btn">
                                ⚠️ 경고 박스
                            </button>
                        </div>

                        {htmlMode ? (
                            <div className="html-editor-container">
                                <div className="html-editor-main">
                                    <div className="html-editor-wrapper">
                                        <div className="html-hint">
                                            ✏️ HTML 편집
                                            <div className="html-hint-buttons">
                                                <button
                                                    type="button"
                                                    className="format-btn"
                                                    onClick={formatHtml}
                                                    title="HTML 코드를 보기 좋게 정리합니다"
                                                >
                                                    🧹 정리
                                                </button>
                                                <button
                                                    type="button"
                                                    className="guide-toggle-btn"
                                                    onClick={() => {
                                                        const panel = document.querySelector('.html-guide-panel');
                                                        panel?.classList.toggle('open');
                                                    }}
                                                >
                                                    📖 서식안내서
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                // Enter = <br> 삽입, Shift+Enter = 일반 줄바꿈
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    const textarea = e.target as HTMLTextAreaElement;
                                                    const start = textarea.selectionStart;
                                                    const end = textarea.selectionEnd;
                                                    const newContent = content.substring(0, start) + '<br>\n' + content.substring(end);
                                                    setContent(newContent);
                                                    setTimeout(() => {
                                                        textarea.selectionStart = textarea.selectionEnd = start + 5;
                                                    }, 0);
                                                }
                                            }}
                                            placeholder="HTML로 답변을 작성하세요... (Enter = <br>, Shift+Enter = 줄바꿈)"
                                            className="html-textarea"
                                        />
                                    </div>

                                    {/* 실시간 미리보기 */}
                                    <div className="html-preview-wrapper">
                                        <div className="html-hint preview-hint">
                                            👁️ 미리보기
                                        </div>
                                        <div
                                            className="html-preview"
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />
                                    </div>
                                </div>

                                {/* 서식안내서 사이드패널 */}
                                <div className="html-guide-panel">
                                    <div className="guide-header">
                                        <h3>📖 HTML 서식안내서</h3>
                                        <button
                                            type="button"
                                            className="guide-close-btn"
                                            onClick={() => {
                                                const panel = document.querySelector('.html-guide-panel');
                                                panel?.classList.remove('open');
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="guide-content">
                                        <div className="guide-section">
                                            <h4>📝 기본 서식</h4>
                                            <code>&lt;strong&gt;굵게&lt;/strong&gt;</code>
                                            <code>&lt;em&gt;기울임&lt;/em&gt;</code>
                                            <code>&lt;u&gt;밑줄&lt;/u&gt;</code>
                                            <code>&lt;br&gt; (줄바꿈)</code>
                                        </div>
                                        <div className="guide-section">
                                            <h4>🎨 색상</h4>
                                            <code>&lt;span style="color: #a67c52;"&gt;텍스트&lt;/span&gt;</code>
                                        </div>
                                        <div className="guide-section">
                                            <h4>📦 정보 박스</h4>
                                            <code>&lt;div class="info-box"&gt;<br />
                                                &nbsp;&nbsp;&lt;strong&gt;💡 제목&lt;/strong&gt;&lt;br&gt;<br />
                                                &nbsp;&nbsp;내용<br />
                                                &lt;/div&gt;</code>
                                        </div>
                                        <div className="guide-section">
                                            <h4>⚠️ 경고 박스</h4>
                                            <code>&lt;div class="warning-box"&gt;<br />
                                                &nbsp;&nbsp;&lt;strong&gt;⚠️ 주의&lt;/strong&gt;&lt;br&gt;<br />
                                                &nbsp;&nbsp;내용<br />
                                                &lt;/div&gt;</code>
                                        </div>
                                        <div className="guide-section">
                                            <h4>🔗 링크</h4>
                                            <code>&lt;a href="URL"&gt;텍스트&lt;/a&gt;</code>
                                        </div>
                                        <div className="guide-section">
                                            <h4>📋 목록</h4>
                                            <code>&lt;ul&gt;<br />
                                                &nbsp;&nbsp;&lt;li&gt;항목1&lt;/li&gt;<br />
                                                &nbsp;&nbsp;&lt;li&gt;항목2&lt;/li&gt;<br />
                                                &lt;/ul&gt;</code>
                                        </div>
                                        <div className="guide-section">
                                            <h4>➖ 구분선</h4>
                                            <code>&lt;hr&gt;</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                placeholder="답변 내용을 작성하세요."
                                className="content-editor"
                            />
                        )}
                    </div>

                    <div className="form-actions">
                        <Link to="/admin" className="cancel-btn">취소</Link>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="save-btn"
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
