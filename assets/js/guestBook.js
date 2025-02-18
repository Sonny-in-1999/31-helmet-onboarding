import { db, collection, addDoc, getDocs, query, orderBy, ref, storage, uploadBytes, getDownloadURL } from "./firebase-config.js";

// 기본 프로필 이미지 URL
const DEFAULT_PROFILE_IMAGE = "../assets/images/default_profile.jpg";

document.addEventListener("DOMContentLoaded", async function () {
    const guestBookList = document.getElementById("guestbook-messages");
    const submitButton = document.getElementById("guestbook-submit");

    // 방명록 작성
    async function addGuestbook() {
        const nickname = document.getElementById("nickname").value.trim();
        const message = document.getElementById("guestbook-message").value.trim();
        const fileInput = document.getElementById("profileImage");
        const file = fileInput.files[0];

        let profileImageUrl = DEFAULT_PROFILE_IMAGE; // 기본 이미지

        if (file) {
            const storageRef = ref(storage, `profileImages/${file.name}`);
            await uploadBytes(storageRef, file);
            profileImageUrl = await getDownloadURL(storageRef);
        }

        if (!nickname || !message) {
            alert("닉네임과 방명록 내용을 입력해주세요.");
            return;
        }

        try {
            await addDoc(collection(db, "guestbook"), {
                nickname: nickname,
                message: message,
                profileImageUrl,
                createdAt: new Date()
            });

            alert("방명록이 작성되었습니다!");

            document.getElementById("nickname").value = "";
            document.getElementById("guestbook-message").value = "";
            document.getElementById("profileImage").value = "";
            loadGuestbook(); // 작성 후 목록 갱신
        } catch (error) {
            alert("방명록 작성 실패.");
        }
    }

    // 방명록 목록 불러오기
    async function loadGuestbook() {
        guestBookList.innerHTML = "";
        const guestbookQuery = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(guestbookQuery);

        if (querySnapshot.empty) {
            const emptyMessage = document.createElement("li");
            emptyMessage.textContent = "방명록이 없습니다🥲";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.color = "#888"; // 회색
            guestBookList.appendChild(emptyMessage);
        } else {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const listItem = document.createElement("li");
                listItem.classList.add("guestbook-item");
                listItem.innerHTML = `
                    <img src="${data.profileImageUrl}" class="profile-image">
                    <div class="guestbook-content">
                        <strong>${data.nickname}</strong> - ${new Date(data.createdAt?.toDate()).toLocaleString()}
                        <p>${data.message}</p>
                    </div>
                `;
                guestBookList.appendChild(listItem);
            });
        }
    }

    submitButton.addEventListener("click", addGuestbook);

    loadGuestbook();
})