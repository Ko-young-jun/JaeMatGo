import { Timestamp } from 'firebase/firestore';

export interface FAQ {
    id: string;
    question: string;
    content: string;  // HTML content from WYSIWYG editor
    category: string;
    order: number;
    clickCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface FAQFormData {
    question: string;
    content: string;
    category: string;
    order: number;
}

export interface Category {
    id: string;
    name: string;
    order: number;
}

export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    isAdmin: boolean;
}

export interface LogEntry {
    id?: string;
    userId: string;
    faqId: string;
    action: 'view' | 'click';
    timestamp: Timestamp;
}

export interface SiteSettings {
    heroTitle: string;
    heroDescription: string;
    faqSectionTitle: string;
    faqSectionDescription: string;
    phoneNumber: string;
    links: {
        label: string;
        url: string;
    }[];
}
