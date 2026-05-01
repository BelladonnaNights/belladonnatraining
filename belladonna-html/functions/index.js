const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ─── submitQuiz ────────────────────────────────────────────────────────────────
// Called by trainee after answering all questions.
// Grades server-side so correct answers never reach the client.
exports.submitQuiz = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");

  const uid = request.auth.uid;
  const { moduleId, answers } = request.data;

  if (!moduleId || !Array.isArray(answers))
    throw new HttpsError("invalid-argument", "moduleId and answers[] required.");

  // Load questions (correctIndex never sent to client by Firestore rules)
  const qSnap = await db
    .collection("modules").doc(moduleId)
    .collection("questions")
    .orderBy("order")
    .get();

  if (qSnap.empty) throw new HttpsError("not-found", "No questions found.");

  const questions = qSnap.docs.map(d => d.data());

  if (answers.length !== questions.length)
    throw new HttpsError("invalid-argument", "Answer count mismatch.");

  // Grade
  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  // Get passing threshold from module doc
  const modSnap = await db.collection("modules").doc(moduleId).get();
  if (!modSnap.exists) throw new HttpsError("not-found", "Module not found.");
  const { passingScore, totalQuestions } = modSnap.data();
  const passed = score >= passingScore;

  // Write progress (merge preserves videosWatched)
  const progressRef = db.collection("users").doc(uid).collection("progress").doc(moduleId);
  const existing = await progressRef.get();
  const attempts = existing.exists ? (existing.data().attempts || 0) + 1 : 1;

  await progressRef.set({
    status: passed ? "passed" : "failed",
    quizScore: score,
    totalQuestions,
    attempts,
    completedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  // Update quizzesPassed flag on certifications doc
  if (passed) {
    const allProg = await db
      .collection("users").doc(uid)
      .collection("progress")
      .where("status", "==", "passed")
      .get();

    const totalModulesSnap = await db.collection("modules").get();
    const totalModules = totalModulesSnap.size;

    if (allProg.size >= totalModules) {
      await db.collection("certifications").doc(uid).set(
        { quizzesPassed: true }, { merge: true }
      );
      // Also update currentModule on user doc
      await db.collection("users").doc(uid).set(
        { currentModule: null }, { merge: true }
      );
    } else {
      // Update currentModule to next
      const nextOrder = (modSnap.data().order || 0) + 1;
      const nextSnap = await db.collection("modules").where("order", "==", nextOrder).limit(1).get();
      if (!nextSnap.empty) {
        await db.collection("users").doc(uid).set(
          { currentModule: nextSnap.docs[0].id }, { merge: true }
        );
      }
    }
  }

  // Return score only — never return correct answers
  return { score, totalQuestions, passed, attempts };
});


// ─── adminSignOff ──────────────────────────────────────────────────────────────
// Called by admin to sign off on dry run / shadow gig / solo launch.
// Validates that caller is an admin before writing.
exports.adminSignOff = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");

  // Check caller is admin
  const callerSnap = await db.collection("users").doc(request.auth.uid).get();
  if (!callerSnap.exists || callerSnap.data().role !== "admin")
    throw new HttpsError("permission-denied", "Admins only.");

  const { traineeUid, stepKey, dateKey } = request.data;
  const ALLOWED_STEPS = ["dryRunComplete", "shadowGigComplete", "soloLaunchComplete"];

  if (!traineeUid || !ALLOWED_STEPS.includes(stepKey))
    throw new HttpsError("invalid-argument", "Invalid step.");

  const certRef = db.collection("certifications").doc(traineeUid);

  await certRef.set({
    [stepKey]: true,
    [dateKey]: FieldValue.serverTimestamp(),
    approvedBy: request.auth.uid,
  }, { merge: true });

  // Check if fully certified (all steps + quizzes)
  const updated = await certRef.get();
  const certData = updated.data();
  const allStepsDone = ALLOWED_STEPS.every(s => certData[s]);
  const quizzesPassed = certData.quizzesPassed === true;

  if (allStepsDone && quizzesPassed) {
    await db.collection("users").doc(traineeUid).set({
      certified: true,
      certifiedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return { certified: true };
  }

  return { certified: false };
});


// ─── revokeSignOff ─────────────────────────────────────────────────────────────
// Allows admin to undo a sign-off.
exports.revokeSignOff = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in.");

  const callerSnap = await db.collection("users").doc(request.auth.uid).get();
  if (!callerSnap.exists || callerSnap.data().role !== "admin")
    throw new HttpsError("permission-denied", "Admins only.");

  const { traineeUid, stepKey, dateKey } = request.data;
  const ALLOWED_STEPS = ["dryRunComplete", "shadowGigComplete", "soloLaunchComplete"];
  if (!traineeUid || !ALLOWED_STEPS.includes(stepKey))
    throw new HttpsError("invalid-argument", "Invalid step.");

  await db.collection("certifications").doc(traineeUid).set({
    [stepKey]: false,
    [dateKey]: null,
  }, { merge: true });

  // If was certified, revoke that too
  await db.collection("users").doc(traineeUid).set({
    certified: false,
    certifiedAt: null,
  }, { merge: true });

  return { revoked: true };
});
