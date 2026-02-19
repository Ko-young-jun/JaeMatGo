import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import type { FAQ } from '../types';
import { FAQItem } from './FAQItem';

interface FAQListProps {
    faqs: FAQ[];
    categories: string[];
}

export const FAQList = ({ faqs, categories }: FAQListProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openFAQId, setOpenFAQId] = useState<string | null>(null);

    const filteredFAQs = useMemo(() => {
        return faqs.filter(faq => {
            const matchesSearch = searchTerm === '' ||
                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.content.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'all' ||
                faq.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [faqs, searchTerm, selectedCategory]);

    const handleFAQToggle = (faqId: string) => {
        if (openFAQId === faqId) {
            // 이미 열려있으면 닫기
            setOpenFAQId(null);
        } else {
            // 다른 FAQ 열기 (기존 것은 자동으로 닫힘)
            setOpenFAQId(faqId);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="질문 또는 키워드를 입력하세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 pl-11 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(242,194,0,0.28)]"
                    />
                </div>

                {categories.length > 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3">
                        <Filter size={16} className="text-[var(--color-text-muted)]" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="cursor-pointer bg-transparent py-3 text-sm font-medium text-[var(--color-text)] outline-none"
                        >
                            <option value="all">카테고리: 전체</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-xs text-[var(--color-text-muted)] md:px-4">
                총 <strong className="text-[var(--color-text-strong)]">{filteredFAQs.length}</strong>개의 FAQ가 검색되었습니다.
            </div>

            <div className="flex flex-col gap-3">
                {filteredFAQs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center text-[var(--color-text-muted)]">
                        <p>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    filteredFAQs.map(faq => (
                        <FAQItem
                            key={faq.id}
                            faq={faq}
                            isOpen={openFAQId === faq.id}
                            onToggle={() => handleFAQToggle(faq.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
