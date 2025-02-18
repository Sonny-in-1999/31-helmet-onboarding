// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, query, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";


// Firebase 구성 정보 설정
const firebaseConfig = {
    apiKey: "AIzaSyA5EuVLjMcY3IWMo7o_meR7_my34oQUb54",
    authDomain: "sparta-study-cac49.firebaseapp.com",
    projectId: "sparta-study-cac49",
    storageBucket: "sparta-study-cac49.firebasestorage.app",
    messagingSenderId: "25693633721",
    appId: "1:25693633721:web:836a552b6b59c302a6ef68"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Firebase 스토리지 인스턴스 초기화
const storage = getStorage(app);

// 필요한 객체들을 export
export { app, db, query, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy };
// Firebase 스토리지 객체 export
export { storage, ref, uploadBytes, getDownloadURL };