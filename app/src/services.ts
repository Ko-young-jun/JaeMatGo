import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import type { FAQ, FAQFormData, Category, LogEntry, SiteSettings } from './types';

// FAQ CRUD Operations
export const getFAQs = async (): Promise<FAQ[]> => {
    const q = query(collection(db, 'faqs'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FAQ));
};

export const getFAQ = async (id: string): Promise<FAQ | null> => {
    const docRef = doc(db, 'faqs', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FAQ;
    }
    return null;
};

export const createFAQ = async (data: FAQFormData): Promise<string> => {
    const docRef = await addDoc(collection(db, 'faqs'), {
        ...data,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
};

export const updateFAQ = async (id: string, data: Partial<FAQFormData>): Promise<void> => {
    const docRef = doc(db, 'faqs', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteFAQ = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'faqs', id));
};

export const incrementFAQClick = async (id: string): Promise<void> => {
    const docRef = doc(db, 'faqs', id);
    await updateDoc(docRef, {
        clickCount: increment(1)
    });
};

// Category Operations
export const getCategories = async (): Promise<Category[]> => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Category));
};

export const createCategory = async (name: string, order: number): Promise<string> => {
    const docRef = await addDoc(collection(db, 'categories'), { name, order });
    return docRef.id;
};

// Storage Operations
export const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};

export const deleteImage = async (url: string): Promise<void> => {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.warn('Failed to delete image:', error);
    }
};

// Log Operations
export const logFAQClick = async (faqId: string): Promise<void> => {
    const userId = localStorage.getItem('userId') || `user_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('userId', userId);

    await addDoc(collection(db, 'logs'), {
        userId,
        faqId,
        action: 'click',
        timestamp: serverTimestamp()
    } as Omit<LogEntry, 'id'>);
};

// Site Settings Operations
const DEFAULT_SETTINGS: SiteSettings = {
    brandTitle: '원광대학교 재학생맞춤형고용서비스',
    brandSubtitle: '학생 안내 FAQ 플랫폼',
    heroEyebrow: 'REJEMATGO FAQ GUIDE',
    heroTitle: '긴 글, 이미지, 영상도 빠르게 찾고 편하게 읽으세요.',
    heroDescription: '학생 사용자를 위해 탐색 속도와 가독성을 높였습니다. 키워드 검색, 카테고리 필터, 단일 아코디언으로 필요한 답변을 빠르게 찾을 수 있습니다.',
    heroPanelTitle: '학생용 읽기 최적화 포인트',
    heroPanelItems: [
        '검색 + 카테고리 필터로 질문 접근 시간 단축',
        '한 번에 하나만 열리는 아코디언으로 집중도 유지',
        '긴 본문, 이미지, 영상 콘텐츠를 저피로 구조로 배치'
    ],
    faqSectionTitle: '자주 묻는 질문',
    faqSectionDescription: '아래 질문을 선택하면 자세한 답변과 함께 추가 자료를 확인할 수 있습니다.',
    phoneNumber: '063-850-7571',
    links: [
        { label: '고용24', url: 'https://www.work24.go.kr/cm/main.do' },
        { label: '잡케어', url: 'https://www.work24.go.kr/wk/jc/a/c/1000/jobCareIntroExp.do' },
        { label: '대플홈피', url: 'https://w-job.wku.ac.kr/' }
    ]
};

const normalizeLinks = (links: unknown): SiteSettings['links'] => {
    if (!Array.isArray(links)) return DEFAULT_SETTINGS.links;

    const normalized = links
        .map((link) => {
            if (!link || typeof link !== 'object') return null;
            const candidate = link as { label?: unknown; url?: unknown };
            return {
                label: typeof candidate.label === 'string' ? candidate.label : '',
                url: typeof candidate.url === 'string' ? candidate.url : ''
            };
        })
        .filter((link): link is { label: string; url: string } => Boolean(link));

    return normalized.length > 0 ? normalized : DEFAULT_SETTINGS.links;
};

const normalizePanelItems = (items: unknown): string[] => {
    if (!Array.isArray(items)) return DEFAULT_SETTINGS.heroPanelItems;

    const normalized = items
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean);

    return normalized.length > 0 ? normalized : DEFAULT_SETTINGS.heroPanelItems;
};

const normalizeSiteSettings = (raw: unknown): SiteSettings => {
    if (!raw || typeof raw !== 'object') {
        return DEFAULT_SETTINGS;
    }

    const candidate = raw as Partial<SiteSettings> & Record<string, unknown>;

    return {
        brandTitle: typeof candidate.brandTitle === 'string' ? candidate.brandTitle : DEFAULT_SETTINGS.brandTitle,
        brandSubtitle: typeof candidate.brandSubtitle === 'string' ? candidate.brandSubtitle : DEFAULT_SETTINGS.brandSubtitle,
        heroEyebrow: typeof candidate.heroEyebrow === 'string' ? candidate.heroEyebrow : DEFAULT_SETTINGS.heroEyebrow,
        heroTitle: typeof candidate.heroTitle === 'string' ? candidate.heroTitle : DEFAULT_SETTINGS.heroTitle,
        heroDescription: typeof candidate.heroDescription === 'string' ? candidate.heroDescription : DEFAULT_SETTINGS.heroDescription,
        heroPanelTitle: typeof candidate.heroPanelTitle === 'string' ? candidate.heroPanelTitle : DEFAULT_SETTINGS.heroPanelTitle,
        heroPanelItems: normalizePanelItems(candidate.heroPanelItems),
        faqSectionTitle: typeof candidate.faqSectionTitle === 'string' ? candidate.faqSectionTitle : DEFAULT_SETTINGS.faqSectionTitle,
        faqSectionDescription: typeof candidate.faqSectionDescription === 'string' ? candidate.faqSectionDescription : DEFAULT_SETTINGS.faqSectionDescription,
        phoneNumber: typeof candidate.phoneNumber === 'string' ? candidate.phoneNumber : DEFAULT_SETTINGS.phoneNumber,
        links: normalizeLinks(candidate.links)
    };
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return normalizeSiteSettings(docSnap.data());
    }
    return DEFAULT_SETTINGS;
};

export const updateSiteSettings = async (settings: SiteSettings): Promise<void> => {
    const { setDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'settings', 'site');
    await setDoc(docRef, normalizeSiteSettings(settings));
};
