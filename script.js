import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. Aapka Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyDkz7u_g1HlXapS4VJjslldG1PIIJhPJ7A",
  authDomain: "my-first-chat-app-9ed4c.firebaseapp.com",
  databaseURL: "https://my-first-chat-app-9ed4c-default-rtdb.firebaseio.com",
  projectId: "my-first-chat-app-9ed4c",
  storageBucket: "my-first-chat-app-9ed4c.firebasestorage.app",
  messagingSenderId: "368029311717",
  appId: "1:368029311717:web:3c8284bce7e6081c1eea0c",
  measurementId: "G-C7TVC0KQ70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- 2. Page Redirection Logic (The Brain) ---
onAuthStateChanged(auth, async (user) => {
    const path = window.location.pathname;
    
    if (user) {
        // Check if user has a profile in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // Profile exists -> If on Login or Profile page, send to Dashboard
            if (path.includes('index.html') || path.includes('profile.html') || path.endsWith('/')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // No profile -> If not already on Profile page, send there
            if (!path.includes('profile.html')) {
                window.location.href = 'profile.html';
            }
        }
    } else {
        // Not logged in -> If not on Login page, send to Login
        if (!path.includes('index.html') && path !== '/') {
            window.location.href = 'index.html';
        }
    }
});

// --- 3. Login Function (index.html) ---
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.onclick = () => {
        signInWithPopup(auth, provider).catch(err => alert("Login Error: " + err.message));
    };
}

// --- 4. Profile Save Function (profile.html) ---
const saveBtn = document.getElementById('save-profile-btn');
if (saveBtn) {
    // Show user's Google photo and email on the setup page
    onAuthStateChanged(auth, (user) => {
        if(user) {
            if(document.getElementById('setup-pic')) document.getElementById('setup-pic').src = user.photoURL;
            if(document.getElementById('user-email')) document.getElementById('user-email').innerText = user.email;
        }
    });

    saveBtn.onclick = async () => {
        const username = document.getElementById('unique-username').value.trim().toLowerCase();
        const bio = document.getElementById('user-bio').value.trim();
        const errorMsg = document.getElementById('error-msg');

        if (username.length < 3) {
            errorMsg.innerText = "Username kam se kam 3 letters ka hona chahiye!";
            return;
        }

        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                username: username,
                bio: bio,
                displayName: auth.currentUser.displayName,
                photoURL: auth.currentUser.photoURL,
                email: auth.currentUser.email,
                uid: auth.currentUser.uid,
                createdAt: new Date()
            });
            window.location.href = 'dashboard.html';
        } catch (e) {
            alert("Error saving profile: " + e.message);
        }
    };
}

// --- 5. Logout Function (dashboard.html) ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        });
    };
}
