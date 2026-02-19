import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import type { FAQ } from '../types';
import { incrementFAQClick, logFAQClick } from '../services';

interface FAQItemProps {
    faq: FAQ;
    isOpen: boolean;
    onToggle: () => void;
}

export const FAQItem = ({ faq, isOpen, onToggle }: FAQItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const answerRef = useRef<HTMLDivElement>(null);
    const [answerMaxHeight, setAnswerMaxHeight] = useState('0px');

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

    useEffect(() => {
        if (!answerRef.current) return;

        if (isOpen) {
            setAnswerMaxHeight(`${answerRef.current.scrollHeight}px`);
            return;
        }

        setAnswerMaxHeight('0px');
    }, [isOpen, faq.content]);

    return (
        <div
            ref={itemRef}
            className={`overflow-hidden rounded-xl border bg-[var(--color-surface)] transition-all duration-300 ${
                isOpen
                    ? 'border-[var(--color-primary)] shadow-[0_10px_30px_rgba(242,194,0,0.18)]'
                    : 'border-[var(--color-border)] hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]'
            }`}
        >
            <button
                className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left md:px-5 ${
                    isOpen ? 'bg-[color:rgba(242,194,0,0.12)]' : 'bg-transparent'
                }`}
                onClick={handleClick}
            >
                <span
                    className="flex-1 text-sm font-semibold leading-6 text-[var(--color-text)] md:text-base"
                    dangerouslySetInnerHTML={{ __html: faq.question }}
                />
                <div className="flex items-center gap-2 pl-2 text-[var(--color-text-muted)]">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-background)] px-2 py-1 text-xs font-medium">
                        <Eye size={14} />
                        {faq.clickCount}
                    </span>
                    <ChevronDown
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-text-strong)]' : ''}`}
                        size={18}
                    />
                </div>
            </button>

            <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{ maxHeight: answerMaxHeight }}
            >
                <div
                    ref={answerRef}
                    className="faq-rich-content border-t border-[var(--color-border)] px-4 py-4 md:px-5"
                    dangerouslySetInnerHTML={{ __html: faq.content }}
                />
            </div>
        </div>
    );
};
