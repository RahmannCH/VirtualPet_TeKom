/**
 * Virtual Pet (DFA / Deterministic Finite Automaton)
 * Tema: keseharian mahasiswa di lingkungan kampus
 *
 * Q  = { HAPPY, HUNGRY, TIRED, BORED, SICK, DEAD }
 * Σ  = { FEED, PLAY, SLEEP, STUDY }
 * q₀ = acak dari Q \ {DEAD}
 * F  = { DEAD }   ← state penyerap (absorbing state)
 *
 * δ  = fungsi transisi (lengkap & deterministik), lihat objek `transitions`.
 *
 * Prinsip desain transisi:
 *  - Setiap pemulihan berjalan BERTAHAP (tidak ada lompatan langsung ke HAPPY
 *    kecuali dari kondisi yang memang sudah dekat happy, yaitu BORED).
 *  - Aksi yang tidak cocok dengan kondisi memberikan hasil yang lebih buruk
 *    atau paling tidak tidak membaik.
 *  - STUDY menggantikan CLEAN agar selaras tema kampus.
 */

const STATES  = ["HAPPY", "HUNGRY", "TIRED", "BORED", "SICK", "DEAD"];
const ACTIONS = ["FEED", "PLAY", "SLEEP", "STUDY"];

/** Hanya state yang boleh jadi kondisi awal */
const START_POOL = ["HAPPY", "HUNGRY", "TIRED", "BORED", "SICK"];

/** Nama bawaan jika input kosong */
const DEFAULT_PET_NAME = "Jono";

/**
 * Tabel δ — setiap (state, aksi) dipetakan ke tepat satu state berikutnya.
 *
 * Rasionalisasi per baris:
 *
 * HAPPY:
 *   FEED  → HAPPY  (makan saat kondisi oke, energi stabil)
 *   PLAY  → TIRED  (olahraga/main wajar bikin capek)
 *   SLEEP → HAPPY  (tidur cukup mempertahankan kondisi prima)
 *   STUDY → BORED  (belajar terus-menerus tanpa variasi bikin jenuh)
 *
 * HUNGRY:
 *   FEED  → TIRED  (perut kenyang, tapi badan tetap butuh istirahat,
 *                   belum cukup untuk langsung happy)
 *   PLAY  → SICK   (olahraga saat perut kosong → pusing & drop)
 *   SLEEP → HUNGRY (tidur lapar → bangun tetap lapar, perut protes)
 *   STUDY → SICK   (belajar keras saat lapar → konsentrasi buyar, badan makin drop)
 *
 * TIRED:
 *   FEED  → HUNGRY (glukosa sedikit naik, tapi sadar tubuh butuh makan beneran
 *                   → sinyal lapar muncul lebih jelas setelah sedikit pulih)
 *   PLAY  → SICK   (maksa aktivitas fisik saat capek → kondisi memburuk)
 *   SLEEP → HAPPY  (satu-satunya obat capek yang beneran: tidur cukup)
 *   STUDY → BORED  (nugas/belajar saat capek → jenuh karena susah masuk)
 *
 * BORED:
 *   FEED  → HUNGRY (ngemil dikit, tapi sadar yang kurang adalah aktivitas, bukan makanan
 *                   → malah jadi lapar beneran karena insting tubuh)
 *   PLAY  → HAPPY  (akhirnya gerak/ngobrol sama temen → semangat balik)
 *   SLEEP → TIRED  (tidur di jam bosennya → bangun badan berat & grogi)
 *   STUDY → HAPPY  (mulai mengerjakan tugas yang tertunda → produktif, bosennya reda)
 *
 * SICK:
 *   FEED  → TIRED  (makan sup/bubur → mulai pulih, tapi masih lemas)
 *   PLAY  → DEAD   (maksa aktivitas saat sakit → tubuh kolaps total, burnout)
 *   SLEEP → TIRED  (istirahat membantu pemulihan, tapi belum cukup satu ronde)
 *   STUDY → BORED  (maksa belajar saat sakit → materi nggak masuk, jenuh & frustasi)
 *
 * DEAD (absorbing state):
 *   semua aksi → DEAD
 */
const transitions = {
  HAPPY:  { FEED: "HAPPY",  PLAY: "TIRED",  SLEEP: "HAPPY",  STUDY: "BORED"  },
  HUNGRY: { FEED: "TIRED",  PLAY: "SICK",   SLEEP: "HUNGRY", STUDY: "SICK"   },
  TIRED:  { FEED: "HUNGRY", PLAY: "SICK",   SLEEP: "HAPPY",  STUDY: "BORED"  },
  BORED:  { FEED: "HUNGRY", PLAY: "HAPPY",  SLEEP: "TIRED",  STUDY: "HAPPY"  },
  SICK:   { FEED: "TIRED",  PLAY: "DEAD",   SLEEP: "TIRED",  STUDY: "BORED"  },
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
    HAPPY:  "Semangat kuliah, mood oke, siap nangkep materi dan kerjain tugas.",
    HUNGRY: "Laper abis kuliah, perut kosong, susah fokus dan kepikiran terus.",
    TIRED:  "Capek banget — badan minta istirahat, deadline numpuk di kepala.",
    BORED:  "Jenuh, jam kerasa lama, nggak ada yang menarik, gabut total.",
    SICK:   "Badan drop, meriang. Butuh istirahat beneran, jangan dipaksain.",
    DEAD:   "Burnout total — nggak ada respons. State penyerap, permanen."
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
    /* ── HAPPY ── */
    "HAPPY|FEED":
      "Makan siang di kantin sambil ngobrol sama temen, energi tetap stabil, " +
      "kondisi nggak berubah (HAPPY).",
    "HAPPY|PLAY":
      "Olahraga atau ikut lomba kampus — seru, tapi tenaga terkuras. " +
      "Butuh istirahat sekarang (TIRED).",
    "HAPPY|SLEEP":
      "Tidur cukup di jam malam, bangun segar dan siap jalani hari (HAPPY).",
    "HAPPY|STUDY":
      "Belajar non-stop tanpa jeda, materi makin banyak, pikiran mulai jenuh (BORED).",

    /* ── HUNGRY ── */
    "HUNGRY|FEED":
      "Akhirnya makan — perut kenyang. Tapi badan tetap butuh istirahat, " +
      "belum cukup buat balik semangat (TIRED).",
    "HUNGRY|PLAY":
      "Dipaksa olahraga pas perut kosong — pusing, mual, kondisi langsung drop (SICK).",
    "HUNGRY|SLEEP":
      "Tidur sambil lapar, bangunnya masih lapar. Perut protes dari tadi (HUNGRY).",
    "HUNGRY|STUDY":
      "Maksa belajar saat lapar — konsentrasi buyar, kepala pusing, " +
      "badan makin nggak karuan (SICK).",

    /* ── TIRED ── */
    "TIRED|FEED":
      "Ngemil atau makan ringan — glukosa sedikit naik, tapi badan baru sadar " +
      "butuh asupan lebih, sinyal lapar muncul jelas (HUNGRY).",
    "TIRED|PLAY":
      "Maksa gerak dan main padahal udah capek — tubuh kepayahan, kondisi memburuk (SICK).",
    "TIRED|SLEEP":
      "Tidur nyenyak semalam suntuk. Bangun pagi, badan segar, semangat balik (HAPPY).",
    "TIRED|STUDY":
      "Nugas sambil ngantuk-ngantukan — materi nggak nyangkut, pikiran melayang, " +
      "yang ada malah makin jenuh (BORED).",

    /* ── BORED ── */
    "BORED|FEED":
      "Ngemil iseng buat ngisi waktu — tapi yang kurang bukan makanan. " +
      "Malah jadi ngerasa lapar beneran (HUNGRY).",
    "BORED|PLAY":
      "Akhirnya gerak — main bareng temen, ketawa-ketawa, " +
      "jenuhnya langsung ilang (HAPPY).",
    "BORED|SLEEP":
      "Tidur siang pas jenuh — bangunnya justru badan terasa berat dan grogi (TIRED).",
    "BORED|STUDY":
      "Mulai ngerjain tugas yang tertunda, fokus perlahan datang, " +
      "produktif dan bosennya reda (HAPPY).",

    /* ── SICK ── */
    "SICK|FEED":
      "Minum sup anget dan makan bubur — mulai pulih sedikit, tapi masih lemas. " +
      "Perlu istirahat lagi (TIRED).",
    "SICK|PLAY":
      "Dipaksa ngelakuin aktivitas berat saat sakit — tubuh kolaps, " +
      "nggak ada tenaga tersisa sama sekali (DEAD).",
    "SICK|SLEEP":
      "Istirahat di kos — demam agak turun, tapi sepenuhnya belum pulih. " +
      "Masih butuh lebih banyak waktu (TIRED).",
    "SICK|STUDY":
      "Maksa buka buku saat badan nggak fit — materi nggak masuk, " +
      "makin frustrasi dan jenuh (BORED).",

    /* ── DEAD (absorbing) ── */
    "DEAD|FEED":  "Nggak ada respons — burnout total. State ini permanen (DEAD).",
    "DEAD|PLAY":  "Nggak ada respons — burnout total. State ini permanen (DEAD).",
    "DEAD|SLEEP": "Nggak ada respons — burnout total. State ini permanen (DEAD).",
    "DEAD|STUDY": "Nggak ada respons — burnout total. State ini permanen (DEAD)."
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
