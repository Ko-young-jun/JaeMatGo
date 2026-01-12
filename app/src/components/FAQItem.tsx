import { useRef, useEffect } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import type { FAQ } from '../types';
import { incrementFAQClick, logFAQClick } from '../services';
import './FAQItem.css';

interface FAQItemProps {
    faq: FAQ;
    isOpen: boolean;
    onToggle: () => void;
}

export const FAQItem = ({ faq, isOpen, onToggle }: FAQItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);

    const handleClick = async () => {
        if (!isOpen) {
            // Only increment when opening
            await Promise.all([
                incrementFAQClick(faq.id),
                logFAQClick(faq.id)
            ]);
        }
        onToggle();
    };

    // 열릴 때 해당 항목으로 스크롤
    useEffect(() => {
        if (isOpen && itemRef.current) {
            // 약간의 딜레이 후 스크롤 (애니메이션 시작 후)
            setTimeout(() => {
                itemRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }, [isOpen]);

    return (
        <div
            ref={itemRef}
            className={`faq-item ${isOpen ? 'active' : ''}`}
        >
            <button className="faq-question" onClick={handleClick}>
                <span
                    className="question-text"
                    dangerouslySetInnerHTML={{ __html: faq.question }}
                />
                <div className="question-meta">
                    <span className="view-count">
                        <Eye size={14} />
                        {faq.clickCount}
                    </span>
                    <ChevronDown className={`chevron ${isOpen ? 'open' : ''}`} size={20} />
                </div>
            </button>
            <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                <div
                    className="answer-content"
                    dangerouslySetInnerHTML={{ __html: faq.content }}
                />
            </div>
        </div>
    );
};
