import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import type { FAQ } from '../types';
import { FAQItem } from './FAQItem';
import './FAQList.css';

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
        <div className="faq-list-container">
            <div className="faq-filters">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="질문 또는 키워드를 입력하세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {categories.length > 0 && (
                    <div className="category-filter">
                        <Filter size={18} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-select"
                        >
                            <option value="all">카테고리: 전체</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="faq-list">
                {filteredFAQs.length === 0 ? (
                    <div className="empty-state">
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
