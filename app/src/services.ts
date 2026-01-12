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
    heroTitle: '재맞고 이용 안내',
    heroDescription: '재맞고와 함께라면 복잡한 절차 없이도 간편하게 서비스를 이용할 수 있습니다. 필요한 모든 안내와 자주 묻는 질문을 한 곳에서 빠르게 찾아보세요.',
    faqSectionTitle: '자주 묻는 질문',
    faqSectionDescription: '아래 질문을 선택하면 자세한 답변과 함께 추가 자료를 확인할 수 있습니다.',
    phoneNumber: '063-850-7571',
    links: [
        { label: '고용24', url: 'https://www.work24.go.kr/cm/main.do' },
        { label: '잡케어', url: 'https://www.work24.go.kr/wk/jc/a/c/1000/jobCareIntroExp.do' },
        { label: '대플홈피', url: 'https://w-job.wku.ac.kr/' }
    ]
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as SiteSettings;
    }
    return DEFAULT_SETTINGS;
};

export const updateSiteSettings = async (settings: SiteSettings): Promise<void> => {
    const { setDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'settings', 'site');
    await setDoc(docRef, settings);
};
