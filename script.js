/**
 * Virtual Pet (DFA / Deterministic Finite Automaton)
 * Tema: keseharian mahasiswa di lingkungan kampus
 *
 * Q  = { NORMAL, HAPPY, HUNGRY, TIRED, BORED, SICK, DEAD }
 * Σ  = { FEED, PLAY, SLEEP, STUDY }
 * q₀ = acak dari Q \ {DEAD}
 * F  = { DEAD }   ← state penyerap (absorbing state)
 *
 * δ  = fungsi transisi (lengkap & deterministik), lihat objek `transitions`.
 *
 * Prinsip desain transisi:
 *  - Setiap pemulihan berjalan BERTAHAP dan masuk akal.
 *  - Aksi yang tidak sesuai dengan kebutuhan tubuh akan memperburuk kondisi.
 *  - STUDY menggantikan CLEAN agar selaras tema kampus.
 */

const STATES  = ["NORMAL", "HAPPY", "HUNGRY", "TIRED", "BORED", "SICK", "DEAD"];
const ACTIONS = ["FEED", "PLAY", "SLEEP", "STUDY"];

/** Hanya state yang boleh jadi kondisi awal */
const START_POOL = ["NORMAL", "HAPPY", "HUNGRY", "TIRED", "BORED", "SICK"];

/** Nama bawaan jika input kosong */
const DEFAULT_PET_NAME = "Jono";

/**
 * Tabel δ — setiap (state, aksi) dipetakan ke tepat satu state berikutnya.
 *
 * Rasionalisasi:
 *
 * NORMAL:
 *   FEED  → HAPPY  (Makan enak di kantin bikin mood naik)
 *   PLAY  → HUNGRY (Keasikan main/nongkrong bikin perut keroncongan)
 *   SLEEP → HAPPY  (Tidur siang sebentar bikin segar dan semangat)
 *   STUDY → BORED  (Baru mulai belajar, tapi materi yang monoton bikin pikiran mulai jenuh)
 *
 * HAPPY:
 *   FEED  → HAPPY  (Kenyang dan senang)
 *   PLAY  → HUNGRY (Main seru-seruan bikin energi terkuras dan laper)
 *   SLEEP → HAPPY  (Istirahat dalam kondisi tenang)
 *   STUDY → NORMAL (Kembali ke mode serius setelah senang)
 *
 * HUNGRY:
 *   FEED  → NORMAL (Perut terisi, kondisi kembali stabil)
 *   PLAY  → TIRED  (Main pas lapar bikin gampang capek)
 *   SLEEP → HUNGRY (Tidur perut kosong, bangun makin keroncongan)
 *   STUDY → SICK   (Maksa belajar pas lapar bikin drop/sakit)
 *
 * TIRED:
 *   FEED  → NORMAL (Asupan energi mengembalikan tenaga)
 *   PLAY  → SICK   (Maksa aktivitas fisik pas capek bikin ambruk)
 *   SLEEP → NORMAL (Satu-satunya cara pulih dari capek: tidur)
 *   STUDY → SICK   (Udah capek tapi maksa nugas terus, badan beneran drop dan meriang)
 *
 * BORED:
 *   FEED  → NORMAL (Makan lumayan lah buat ngisi waktu dan energi)
 *   PLAY  → HAPPY  (Main game/nongkrong bikin mood balik)
 *   SLEEP → NORMAL (Tidur ngilangin rasa gabut)
 *   STUDY → TIRED  (Udah bosen tapi dipaksa belajar lagi, badan jadi terasa capek banget)
 *
 * SICK:
 *   FEED  → TIRED  (Makan sup anget bikin badan mendingan tapi masih lemas)
 *   PLAY  → DEAD   (Lagi sakit dipake lari-lari, kolaps total)
 *   SLEEP → NORMAL (Istirahat total obat paling manjur)
 *   STUDY → DEAD   (Lagi sakit maksa nugas non-stop, tubuh akhirnya kolaps total)
 *
 * DEAD (absorbing state):
 *   semua aksi → DEAD
 */
const transitions = {
  NORMAL: { FEED: "HAPPY",  PLAY: "HUNGRY", SLEEP: "HAPPY",  STUDY: "BORED"  },
  HAPPY:  { FEED: "HAPPY",  PLAY: "HUNGRY", SLEEP: "HAPPY",  STUDY: "NORMAL" },
  HUNGRY: { FEED: "NORMAL", PLAY: "TIRED",  SLEEP: "HUNGRY", STUDY: "SICK"   },
  TIRED:  { FEED: "NORMAL", PLAY: "SICK",   SLEEP: "NORMAL", STUDY: "SICK"   },
  BORED:  { FEED: "NORMAL", PLAY: "HAPPY",  SLEEP: "NORMAL", STUDY: "TIRED"  },
  SICK:   { FEED: "TIRED",  PLAY: "DEAD",   SLEEP: "NORMAL", STUDY: "DEAD"   },
  DEAD:   { FEED: "DEAD",   PLAY: "DEAD",   SLEEP: "DEAD",   STUDY: "DEAD"   }
};

let currentState = "HAPPY";
let petName      = DEFAULT_PET_NAME;
let actionsBound = false;

/** Validasi: setiap (state, aksi) harus terdefinisi dan target harus state yang valid. */
function validateDfa() {
  for (let i = 0; i < STATES.length; i++) {
    const s   = STATES[i];
    const row = transitions[s];
    if (!row) { console.error("DFA: missing row for state", s); return false; }
    for (let j = 0; j < ACTIONS.length; j++) {
      const a    = ACTIONS[j];
      const next = row[a];
      if (next === undefined || STATES.indexOf(next) === -1) {
        console.error("DFA: invalid transition", s, a, next);
        return false;
      }
    }
  }
  return true;
}

if (!validateDfa()) {
  throw new Error("DFA transition table is incomplete or invalid.");
}

function pickRandomStartState() {
  return START_POOL[Math.floor(Math.random() * START_POOL.length)];
}

/** Deskripsi kondisi per state — konteks kampus. */
function getStateDescription(state) {
  const map = {
    NORMAL: "Kondisi stabil, siap menjalani hari di kampus dengan santai.",
    HAPPY:  "Mood sangat bagus! Semangat kuliah dan produktivitas lagi tinggi.",
    HUNGRY: "Perut mulai keroncongan, butuh asupan biar bisa fokus lagi.",
    TIRED:  "Tenaga terkuras habis, badan terasa berat, butuh istirahat.",
    BORED:  "Gabut banget, jam kuliah kerasa lama, butuh hiburan.",
    SICK:   "Badan nggak fit, meriang. Harus istirahat kalau nggak mau makin parah.",
    DEAD:   "Burnout total — kolaps karena terlalu dipaksakan. Game over."
  };
  return map[state] || "";
}

/**
 * Narasi singkat per (state lama, aksi) — harus konsisten dengan δ.
 * Format: cerita konteks kampus → hasil state berikutnya di akhir kurung.
 */
function getTransitionNarration(prev, action, next) {
  const key   = prev + "|" + action;
  const lines = {
    /* ── NORMAL ── */
    "NORMAL|FEED":
      "Makan siang enak di kantin, mood langsung naik drastis (HAPPY).",
    "NORMAL|PLAY":
      "Keasikan nongkrong bareng temen di koridor, tenaga terkuras dan perut jadi laper (HUNGRY).",
    "NORMAL|SLEEP":
      "Tidur siang sebentar, bangun-bangun badan terasa segar dan bersemangat (HAPPY).",
    "NORMAL|STUDY":
      "Baru mulai belajar, tapi materi yang monoton bikin pikiran mulai jenuh (BORED).",

    /* ── HAPPY ── */
    "HAPPY|FEED":
      "Makan camilan favorit sambil senyum-senyum sendiri, mood makin mantap (HAPPY).",
    "HAPPY|PLAY":
      "Main seru-seruan bareng temen, saking semangatnya energi terkuras dan perut jadi keroncongan (HUNGRY).",
    "HAPPY|SLEEP":
      "Tidur dalam kondisi hati senang, bangun tetap dalam kondisi prima (HAPPY).",
    "HAPPY|STUDY":
      "Belajar dengan efektif, sekarang kembali ke mode produktif biasa (NORMAL).",

    /* ── HUNGRY ── */
    "HUNGRY|FEED":
      "Akhirnya makan — perut kenyang, kondisi badan kembali stabil (NORMAL).",
    "HUNGRY|PLAY":
      "Maksa main pas perut kosong, badan jadi makin lemas dan capek (TIRED).",
    "HUNGRY|SLEEP":
      "Tidur sambil nahan lapar, pas bangun perut makin keroncongan (HUNGRY).",
    "HUNGRY|STUDY":
      "Maksa mikir keras pas lapar, kepala pusing dan badan mulai drop (SICK).",

    /* ── TIRED ── */
    "TIRED|FEED":
      "Makan berat pas lagi capek, asupan energi bikin badan mendingan (NORMAL).",
    "TIRED|PLAY":
      "Udah capek tapi maksa olahraga, badan nggak kuat dan akhirnya meriang (SICK).",
    "TIRED|SLEEP":
      "Tidur nyenyak semalaman, bangun pagi badan sudah segar kembali (NORMAL).",
    "TIRED|STUDY":
      "Udah capek tapi maksa nugas terus, badan beneran drop dan meriang (SICK).",

    /* ── BORED ── */
    "BORED|FEED":
      "Makan karena gabut, lumayan lah buat ngisi waktu dan energi (NORMAL).",
    "BORED|PLAY":
      "Main bareng temen, ketawa-ketawa, semangat langsung balik lagi (HAPPY).",
    "BORED|SLEEP":
      "Daripada gabut mending tidur, bangun-bangun pikiran jadi jernih lagi (NORMAL).",
    "BORED|STUDY":
      "Udah bosen tapi dipaksa belajar lagi, badan jadi terasa capek banget (TIRED).",

    /* ── SICK ── */
    "SICK|FEED":
      "Minum sup anget dan makan bubur, badan mendingan tapi masih lemas (TIRED).",
    "SICK|PLAY":
      "Lagi sakit malah maksa lari-lari, tubuh kolaps total (DEAD).",
    "SICK|SLEEP":
      "Istirahat total seharian di kos, akhirnya badan kembali bugar (NORMAL).",
    "SICK|STUDY":
      "Lagi sakit maksa nugas non-stop, tubuh akhirnya kolaps total (DEAD).",

    /* ── DEAD (absorbing) ── */
    "DEAD|FEED":  "Sudah tidak ada respons — burnout total (DEAD).",
    "DEAD|PLAY":  "Sudah tidak ada respons — burnout total (DEAD).",
    "DEAD|SLEEP": "Sudah tidak ada respons — burnout total (DEAD).",
    "DEAD|STUDY": "Sudah tidak ada respons — burnout total (DEAD)."
  };
  return lines[key] || prev + " + " + action + " → " + next;
}

function transition(current, action) {
  const row = transitions[current];
  if (!row) return current;
  const next = row[action];
  return next !== undefined ? next : current;
}

/** Bold nama state dalam narasi. */
function formatNarrationHtml(text) {
  return text.replace(
    /\((HAPPY|HUNGRY|TIRED|BORED|SICK|DEAD)\)/g,
    function (_, s) {
      return "(<strong>" + s + "</strong>)";
    }
  );
}

/** Animasi bump setelah transisi (tidak jalan di DEAD). */
function animatePet() {
  const el = document.getElementById("petCharacter");
  if (!el) return;
  el.classList.remove("pet-character--bump");
  void el.offsetWidth;
  el.classList.add("pet-character--bump");
  window.setTimeout(function () {
    el.classList.remove("pet-character--bump");
  }, 320);
}

function addLog(message, isSystem) {
  const box = document.getElementById("logChat");
  if (!box) return;

  const line = document.createElement("div");
  line.className = "log-line" + (isSystem ? " system" : "");

  const meta = document.createElement("span");
  meta.className = "log-meta";
  const t = new Date();
  meta.textContent =
    t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const body = document.createElement("span");
  body.textContent = message;

  line.appendChild(meta);
  line.appendChild(body);
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function updateUI() {
  const pill        = document.getElementById("statePill");
  const desc        = document.getElementById("stateDescription");
  const card        = document.getElementById("petCard");
  const gameOver    = document.getElementById("gameOver");
  const nameEl      = document.getElementById("petDisplayName");
  const petCharacter = document.getElementById("petCharacter");

  const displayName = petName || DEFAULT_PET_NAME;
  if (nameEl) nameEl.textContent = displayName;
  if (pill)   pill.textContent   = currentState;
  if (desc)   desc.textContent   = getStateDescription(currentState);

  if (petCharacter) {
    petCharacter.setAttribute(
      "aria-label",
      displayName + ", Pet Hiu kampus, kondisi DFA: " + currentState
    );
  }

  if (card) {
    card.setAttribute("data-state", currentState);
    card.classList.remove("state-pulse");
    void card.offsetWidth;
    card.classList.add("state-pulse");
  }

  document.body.setAttribute("data-pet-state", currentState);

  const dead = currentState === "DEAD";
  if (gameOver) gameOver.hidden = !dead;

  document.querySelectorAll(".action-btn").forEach(function (btn) {
    btn.disabled = dead;
  });
}

function handleAction(action) {
  if (currentState === "DEAD") return;
  if (ACTIONS.indexOf(action) === -1) return;

  const prev  = currentState;
  const next  = transition(prev, action);
  const raw   = getTransitionNarration(prev, action, next);
  currentState = next;

  const narrationEl = document.getElementById("narration");
  if (narrationEl) narrationEl.innerHTML = formatNarrationHtml(raw);

  const who = petName || DEFAULT_PET_NAME;
  addLog(
    who + ": " + prev + " + " + action + " → " + next + ". " + raw
  );

  updateUI();
  animatePet();
}

function loadPetNameFromInput() {
  const input = document.getElementById("petNameInput");
  if (!input) return;
  const v = (input.value || "").trim();
  petName = v.length ? v.slice(0, 32) : DEFAULT_PET_NAME;
  if (!v.length) input.value = DEFAULT_PET_NAME;
  addLog("Nama pet disimpan: " + petName + ".", true);
  updateUI();
}

/** Reset kondisi awal secara acak + bersihkan log. */
function randomizeStartAndResetLog() {
  currentState = pickRandomStartState();
  const logBox = document.getElementById("logChat");
  if (logBox) logBox.innerHTML = "";

  const narrationEl = document.getElementById("narration");
  if (narrationEl) {
    narrationEl.innerHTML =
      "Kondisi awal baru: <strong>" +
      currentState +
      "</strong>. Aturan pindah state (δ) tetap sama dan deterministik.";
  }

  addLog(
    "[ACAK AWAL] Sekarang " + currentState + ". " + getStateDescription(currentState),
    true
  );
  updateUI();
}

function bindActionButtonsOnce() {
  if (actionsBound) return;
  document.querySelectorAll(".action-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      handleAction(btn.getAttribute("data-action"));
    });
  });
  actionsBound = true;
}

function init() {
  const input = document.getElementById("petNameInput");
  if (input) {
    const v = (input.value || "").trim();
    petName = v.length ? v.slice(0, 32) : DEFAULT_PET_NAME;
    if (!v.length) input.value = DEFAULT_PET_NAME;
  }

  currentState = pickRandomStartState();

  const logBox = document.getElementById("logChat");
  if (logBox) logBox.innerHTML = "";

  const narrationEl = document.getElementById("narration");
  if (narrationEl) {
    narrationEl.innerHTML =
      "Hari di kampus mulai dengan kondisi <strong>" +
      currentState +
      "</strong>. Pilih aksi (anggota Σ) — satu klik, satu perpindahan state via δ, tanpa ambigu.";
  }

  bindActionButtonsOnce();
  updateUI();
  document.body.classList.add("pet-ready");

  addLog(
    "[MULAI] Kondisi awal acak: " + currentState + ". " + getStateDescription(currentState),
    true
  );

  const saveBtn = document.getElementById("btnSaveName");
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.addEventListener("click", loadPetNameFromInput);
    saveBtn.dataset.bound = "1";
  }
  const randomBtn = document.getElementById("btnRandomStart");
  if (randomBtn && !randomBtn.dataset.bound) {
    randomBtn.addEventListener("click", randomizeStartAndResetLog);
    randomBtn.dataset.bound = "1";
  }
  if (input && !input.dataset.bound) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") loadPetNameFromInput();
    });
    input.dataset.bound = "1";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
