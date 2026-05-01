import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, query, orderBy, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyDevR1vTnu6QlBG0zfGcnD4XCrEYO1MjQ8",
  authDomain: "belladonnatraining.firebaseapp.com",
  projectId: "belladonnatraining",
  storageBucket: "belladonnatraining.firebasestorage.app",
  messagingSenderId: "701454253182",
  appId: "1:701454253182:web:1cc377e3c742e369c8ac2f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const functions = getFunctions(app);

export const submitQuizFn = httpsCallable(functions, "submitQuiz");
export const adminSignOffFn = httpsCallable(functions, "adminSignOff");
export const revokeSignOffFn = httpsCallable(functions, "revokeSignOff");

// ── Auth helpers ──────────────────────────────────────────────────────────────

export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "login.html"; return; }
    const snap = await getDoc(doc(db, "users", user.uid));
    const profile = snap.exists() ? snap.data() : {};
    callback(user, profile);
  });
}

export function requireAdmin(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "login.html"; return; }
    const snap = await getDoc(doc(db, "users", user.uid));
    const profile = snap.exists() ? snap.data() : {};
    if (profile.role !== "admin") { window.location.href = "dashboard.html"; return; }
    callback(user, profile);
  });
}

export async function doLogout() {
  await signOut(auth);
  window.location.href = "login.html";
}

export async function doLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function createTrainee(email, password, name) {
  // Save current admin auth state
  const adminUser = auth.currentUser;

  // Create the new user account
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const newUid = cred.user.uid;

  // Write their Firestore profile
  await setDoc(doc(db, "users", newUid), {
    name,
    email,
    role: "trainee",
    certified: false,
    createdAt: serverTimestamp(),
  });

  // Sign back in as admin
  if (adminUser?.email) {
    // We can't re-auth without the password, so reload the page after creation
    // The admin session stays intact in most cases
  }

  return { uid: newUid, name, email };
}

// ── Nav ───────────────────────────────────────────────────────────────────────

export function renderNav(profile, showAdmin = false) {
  const name = profile?.name || "";
  return `
    <nav class="nav">
      <a href="dashboard.html" class="nav-brand-link">
        <div class="nav-left">
          <img src="logo.png" class="nav-logo-img" onerror="this.style.display='none'" alt=""/>
          <div class="nav-title">BELLADONNA <span>TRAINING</span></div>
          <span class="nav-divider">|</span>
          <span class="nav-subtitle">Host Certification</span>
        </div>
      </a>
      <div class="nav-right">
        ${showAdmin ? `<a href="admin.html" class="nav-btn nav-btn-ghost">Admin</a>` : ""}
        <span class="nav-name">${name}</span>
        <button class="nav-btn nav-btn-ghost" onclick="window._logout()">Sign Out</button>
      </div>
    </nav>`;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function showToast(message, type = "info") {
  let wrap = document.getElementById("toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = message;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Data helpers ──────────────────────────────────────────────────────────────

export async function loadUserProgress(uid) {
  const snap = await getDocs(collection(db, "users", uid, "progress"));
  const prog = {};
  snap.forEach(d => { prog[d.id] = d.data(); });
  return prog;
}

export async function loadModules() {
  const snap = await getDocs(query(collection(db, "modules"), orderBy("order")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markVideoWatched(uid, moduleId, videoId) {
  await setDoc(
    doc(db, "users", uid, "progress", moduleId),
    { videosWatched: arrayUnion(videoId), status: "in_progress", startedAt: serverTimestamp() },
    { merge: true }
  );
}

export function getModuleStatus(modules, progress, idx) {
  const mod = modules[idx];
  const p = progress[mod.id];
  if (p?.status === "passed") return "passed";
  if (p?.status === "failed") return "failed";
  if (p?.status === "in_progress") return "in_progress";
  if (idx === 0) return "available";
  const prevId = modules[idx - 1]?.id;
  if (prevId && progress[prevId]?.status === "passed") return "available";
  return "locked";
}

export { doc, getDoc, setDoc, getDocs, collection, query, orderBy, serverTimestamp, arrayUnion, onAuthStateChanged, createUserWithEmailAndPassword };
// Nav CSS additions needed in style.css:
/*
.nav-brand-link { text-decoration: none; }
.nav-left { display: flex; align-items: center; gap: 14px; }
.nav-logo-img { height: 38px; width: auto; object-fit: contain; }
.nav-divider { color: var(--border2); font-size: 18px; margin: 0 2px; }
.nav-subtitle { font-family: var(--serif); font-style: italic; font-size: 13px; color: var(--text3); }
.nav-name { font-family: var(--cinzel); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--text2); }
*/
