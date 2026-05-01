/**
 * seed.js — Run once to populate Firestore with Belladonna Training content.
 *
 * Usage:
 *   npm install firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node seed.js
 *
 * Download your service account key from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp({ credential: cert(require("./serviceAccount.json")) });
const db = getFirestore();

const MODULES = [
  {
    id: "module_1",
    order: 1,
    title: "Module 1 — Brand & ethics",
    description: "Identity, dress code, interaction ethics",
    passingScore: 4,
    totalQuestions: 5,
    videos: [
      { id: "video_1", order: 1, title: "The Belladonna welcome", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_2", order: 2, title: "Do's and don'ts of host presence", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
    ],
    questions: [
      { id: "q1", order: 1, question: "What does the Belladonna lanyard primarily represent?", options: ["Brand visibility and professionalism", "A security badge", "An optional accessory", "A personal style choice"], correctIndex: 0 },
      { id: "q2", order: 2, question: "What is the main goal of the 'Life of the Party' standard?", options: ["To be the loudest person in the room", "To be energetic and engaging without crossing professional lines", "To lead all group activities", "To avoid talking to guests"], correctIndex: 1 },
      { id: "q3", order: 3, question: "Which of these is a violation of host interaction ethics?", options: ["Introducing yourself to new guests", "Sharing personal opinions about venue staff with guests", "Keeping the energy high between games", "Wearing the correct uniform"], correctIndex: 1 },
      { id: "q4", order: 4, question: "Why does consistent dress code matter for the Belladonna brand?", options: ["It's required by law", "It creates instant recognition and trust with venue partners", "It makes hosts easier to photograph", "It is only required at large events"], correctIndex: 1 },
      { id: "q5", order: 5, question: "A guest asks your personal opinion about another host. You should:", options: ["Share honestly", "Redirect positively and stay neutral", "Ignore the question", "Agree with the guest"], correctIndex: 1 },
    ],
  },
  {
    id: "module_2",
    order: 2,
    title: "Module 2 — Hardware & laptop",
    description: "Inventory, setup, software, troubleshooting",
    passingScore: 4,
    totalQuestions: 5,
    videos: [
      { id: "video_1", order: 1, title: "Inventory checklist walkthrough", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_2", order: 2, title: "20-minute setup & teardown", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_3", order: 3, title: "Karaoke, Bingo & Trivia app tour", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_4", order: 4, title: "Cable management: over-under wrap", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
    ],
    questions: [
      { id: "q1", order: 1, question: "What is the first thing you should check when picking up a Belladonna laptop?", options: ["That the screen is clean", "The numbered inventory tag matches your assignment", "That the charger is the right wattage", "Whether there are software updates"], correctIndex: 1 },
      { id: "q2", order: 2, question: "The target setup time for a Belladonna rig is:", options: ["10 minutes", "20 minutes", "45 minutes", "As long as it takes"], correctIndex: 1 },
      { id: "q3", order: 3, question: "The Wi-Fi drops mid-event. Your first troubleshooting step is:", options: ["Restart the laptop", "Check that the hotspot is active and the device is connected", "Call tech support", "Apologize to the venue"], correctIndex: 1 },
      { id: "q4", order: 4, question: "Why do we use the over-under cable wrap technique?", options: ["It looks cool on social media", "It prevents cable damage and speeds up setup/teardown", "The venue requires it", "It is faster than any other method"], correctIndex: 1 },
      { id: "q5", order: 5, question: "Audio is clipping during karaoke. You should first:", options: ["Turn the main volume down", "Reduce the gain at the source before adjusting volume", "Ask the singer to move back", "Restart the karaoke app"], correctIndex: 1 },
    ],
  },
  {
    id: "module_3",
    order: 3,
    title: "Module 3 — Karaoke mastery",
    description: "Rotation, hype intros, crowd management",
    passingScore: 4,
    totalQuestions: 5,
    videos: [
      { id: "video_1", order: 1, title: "Singer rotation management", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_2", order: 2, title: "Belladonna rotation app walkthrough", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_3", order: 3, title: "The Belladonna style stage banter", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
    ],
    questions: [
      { id: "q1", order: 1, question: "What keeps energy high between karaoke singers?", options: ["Playing filler music at full volume", "Quick hype intros and transitions under 30 seconds", "Skipping anyone who isn't ready", "Letting the crowd pick the order"], correctIndex: 1 },
      { id: "q2", order: 2, question: "A guest has been waiting 45 minutes to sing and is getting frustrated. You should:", options: ["Ignore them — the rotation is the rotation", "Acknowledge them publicly and confirm their upcoming spot", "Skip them to the front immediately", "Offer them a drink instead"], correctIndex: 1 },
      { id: "q3", order: 3, question: "The 'hype intro' technique is meant to:", options: ["Fill dead air", "Make every singer feel like a rockstar regardless of their talent", "Show off the host's own performance skills", "Remind guests of the next game"], correctIndex: 1 },
      { id: "q4", order: 4, question: "A rowdy drunk guest grabs the mic between songs. Your first move is:", options: ["Cut the audio", "Approach calmly, acknowledge the energy, and physically redirect them off-stage", "Ask the venue staff to remove them", "Ignore it and let the crowd handle it"], correctIndex: 1 },
      { id: "q5", order: 5, question: "Rotation management software helps you:", options: ["Auto-DJ the songs", "Track queue order, wait times, and song selections accurately", "Control the audio board remotely", "Record the performances"], correctIndex: 1 },
    ],
  },
  {
    id: "module_4",
    order: 4,
    title: "Module 4 — Bingo & trivia",
    description: "Filing, pacing, answer protocols",
    passingScore: 4,
    totalQuestions: 5,
    videos: [
      { id: "video_1", order: 1, title: "The paper trail: on-site filing system", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
      { id: "video_2", order: 2, title: "Category spotlight: keeping trivia engaging", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
    ],
    questions: [
      { id: "q1", order: 1, question: "What is the risk of calling bingo numbers too fast?", options: ["The game ends sooner, which is fine", "Players miss numbers and feel cheated, causing disputes", "The venue gets bored", "The software can't keep up"], correctIndex: 1 },
      { id: "q2", order: 2, question: "When a guest shouts 'BINGO!', your immediate action is:", options: ["Announce them as the winner immediately", "Pause the game and verify the card before announcing", "Ask them to come up to the stage", "Continue calling until two people win"], correctIndex: 1 },
      { id: "q3", order: 3, question: "The Belladonna filing system for answer sheets helps you:", options: ["Save paper", "Resolve disputes, prevent cheating, and track winners accurately", "Grade faster", "Look organized for photos"], correctIndex: 1 },
      { id: "q4", order: 4, question: "What is the ideal pacing strategy for trivia?", options: ["Fast rounds keep people engaged at all costs", "Consistent, moderate pacing that allows reading, thinking, and writing", "Let the crowd vote on time per question", "Match the slowest table's reading speed"], correctIndex: 1 },
      { id: "q5", order: 5, question: "A team disputes a trivia answer. You should:", options: ["Rule in their favor to avoid conflict", "Stick to the official answer sheet and explain calmly", "Let the crowd vote", "Skip the question and move on"], correctIndex: 1 },
    ],
  },
  {
    id: "module_5",
    order: 5,
    title: "Module 5 — Basic sound",
    description: "Signal flow, mixing, vocal processing",
    passingScore: 4,
    totalQuestions: 5,
    videos: [
      { id: "video_1", order: 1, title: "Knobs and sliders: the audio board deep dive", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
    ],
    questions: [
      { id: "q1", order: 1, question: "The correct signal chain order is:", options: ["Volume → EQ → Gain", "Gain → EQ → Volume", "EQ → Gain → Volume", "Volume → Gain → EQ"], correctIndex: 1 },
      { id: "q2", order: 2, question: "You're in a room with a strong echo. You should:", options: ["Turn everything up to overpower the reverb", "Cut the low-mids and reduce reverb send", "Add more treble to cut through", "Use more compression"], correctIndex: 1 },
      { id: "q3", order: 3, question: "A singer sounds thin and nasally through the PA. Your first EQ move is:", options: ["Boost the highs", "Boost 200-400Hz slightly to add body", "Cut all bass", "Add reverb to fill it out"], correctIndex: 1 },
      { id: "q4", order: 4, question: "What causes feedback (the loud squeal)?", options: ["Too much bass", "The mic picking up its own amplified signal from the speakers", "A broken cable", "The singer being too quiet"], correctIndex: 1 },
      { id: "q5", order: 5, question: "A 'dead spot' in the room means:", options: ["The dance floor is empty", "An area where sound volume drops significantly due to acoustics", "A broken speaker", "A zone with no Wi-Fi"], correctIndex: 1 },
    ],
  },
  {
    id: "module_6",
    order: 6,
    title: "Module 6 — Marketing & the hustle",
    description: "QR strategy, content capture, closing",
    passingScore: 4,
    totalQuestions: 5,
    videos: [
      { id: "video_1", order: 1, title: "The art of the social media snap", youtubeId: "REPLACE_WITH_YOUTUBE_ID" },
    ],
    questions: [
      { id: "q1", order: 1, question: "When is the best moment to hand out 'Follow Us' QR cards?", options: ["At the very start before the event begins", "During a natural energy peak — after a bingo win or trivia reveal", "Only when guests ask", "At the end when everyone is leaving"], correctIndex: 1 },
      { id: "q2", order: 2, question: "What does 'closing the loop' mean in the Belladonna context?", options: ["Ending the event early if energy drops", "Handing out winner coupons and hyping the next event before guests leave", "Collecting all physical materials from the venue", "Sending a recap email to the venue manager"], correctIndex: 1 },
      { id: "q3", order: 3, question: "When capturing content for social media, you should:", options: ["Stop the game to get a clean shot", "Capture candid moments between actions without disrupting the show", "Always use flash for better quality", "Only post after getting written permission from every person"], correctIndex: 1 },
      { id: "q4", order: 4, question: "The 'Testimonial' QR card should be offered to:", options: ["Everyone equally", "Guests who are visibly having a great time", "Only the winners", "Venue management only"], correctIndex: 1 },
      { id: "q5", order: 5, question: "Good Belladonna-style event photography prioritizes:", options: ["High-resolution studio quality", "Natural light, candid energy, and the Belladonna brand in frame", "Posed group shots only", "Videos over photos"], correctIndex: 1 },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding Belladonna Training modules...\n");

  for (const mod of MODULES) {
    const { videos, questions, ...modData } = mod;
    const modRef = db.collection("modules").doc(mod.id);

    await modRef.set(modData);
    console.log(`✓ Module ${mod.order}: ${mod.title}`);

    for (const video of videos) {
      await modRef.collection("videos").doc(video.id).set(video);
    }
    console.log(`  └ ${videos.length} videos`);

    for (const q of questions) {
      await modRef.collection("questions").doc(q.id).set(q);
    }
    console.log(`  └ ${questions.length} questions (correctIndex server-only)`);
  }

  console.log("\n✅ Done! Remember to:");
  console.log("  1. Replace all REPLACE_WITH_YOUTUBE_ID values with real unlisted YouTube video IDs.");
  console.log("  2. Create admin user in Firebase Auth, then set role: 'admin' in their users/{uid} doc.");
  console.log("  3. Deploy Firestore rules: firebase deploy --only firestore:rules");
  console.log("  4. Deploy Cloud Functions: cd functions && firebase deploy --only functions");
}

seed().catch(console.error);
