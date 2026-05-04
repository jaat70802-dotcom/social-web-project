import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// YOUR API KEYS INTEGRATED HERE
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const saveBtn = document.getElementById('save-profile-btn');
const usernameInput = document.getElementById('unique-username');
const errorMsg = document.getElementById('username-error');

function showScreen(screenId) {
    ['login-screen', 'setup-screen', 'chat-screen'].forEach(id => {
        document.getElementById(id).style.display = (id === screenId) ? 'flex' : 'none';
        if(screenId !== 'chat-screen' && id === screenId) document.getElementById(id).style.display = 'block';
    });
}

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('preview-pic').src = user.photoURL;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            document.getElementById('user-name').innerText = userDoc.data().username;
            document.getElementById('user-pic').src = userDoc.data().photoURL;
            showScreen('chat-screen');
        } else {
            showScreen('setup-screen');
        }
    } else {
        showScreen('login-screen');
    }
});

saveBtn.onclick = async () => {
    const username = usernameInput.value.trim().toLowerCase();
    if (username.length < 3) return errorMsg.innerText = "Too short!";
    
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);

    if (!snap.empty) {
        errorMsg.innerText = "Username taken!";
    } else {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
            username: username,
            photoURL: auth.currentUser.photoURL,
            uid: auth.currentUser.uid
        });
        showScreen('chat-screen');
    }
};
