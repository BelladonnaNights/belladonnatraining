// firebase-init.js — shared across all pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, query, orderBy, serverTimestamp, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// ── Nav helper ────────────────────────────────────────────────────────────────

export function renderNav(profile, showAdmin = false) {
  const initials = profile?.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : "?";
  return `
    <nav class="nav">
      <a href="dashboard.html" class="nav-brand">
        <span class="nav-dot"></span>
        Belladonna
        <span class="nav-sub">Training</span>
      </a>
      <div class="nav-right">
        ${showAdmin ? `<a href="admin.html" class="btn btn-ghost btn-sm">Admin</a>` : ""}
        <div class="nav-user">
          <div class="avatar">${initials}</div>
          <span>${profile?.name || ""}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="window._logout()">Sign out</button>
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

// ── Progress helpers ──────────────────────────────────────────────────────────

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

// Re-export Firestore helpers so pages don't need to import firebase directly
export { doc, getDoc, setDoc, getDocs, collection, query, orderBy, serverTimestamp, arrayUnion, onAuthStateChanged };
