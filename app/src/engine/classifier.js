/**
 * Setu reply classifier (demo build).
 *
 * The AI's only job in Setu is to sort what a patient or caregiver says into a
 * FIXED list of non-clinical barrier labels, and to spot words that must be
 * routed to people. It never judges severity and never advises.
 *
 * Demo build: transparent keyword rules (English, Hindi, Hinglish).
 * Production: Sarvam LLM constrained to the same label set; the emergency card
 * check below always runs as well (either one alone triggers the emergency path).
 *
 * Keyword syntax: latin keywords match at the start of a word ("vomit" matches
 * "vomiting"); a trailing "$" means whole word only ("dar$" ≠ "dard").
 * Devanagari keywords match as substrings.
 */

export const BARRIERS = {
  money: { label: "Money", keywords: ["money", "afford", "cost", "expens", "rupee", "paisa", "paise", "पैसे", "पैसा", "kharch", "खर्च", "loan", "karz", "कर्ज", "wage", "mazdoori", "fare", "किराया", "kiraya"] },
  paperwork: { label: "Scheme paperwork", keywords: ["card", "ayushman", "आयुष्मान", "pmjay", "pm-jay", "scheme", "yojana", "योजना", "document", "kagaz", "कागज", "paper", "certificate", "ration", "aadhaar", "आधार", "approval", "insurance", "renew", "कार्ड"] },
  travel: { label: "Travel / distance", keywords: ["travel", "bus", "train", "far$", "distance", "door$", "दूर", "safar", "सफर", "kiraya", "किराया", "ticket", "transport", "gaon", "गांव", "village", "journey"] },
  lodging: { label: "Lodging", keywords: ["stay", "lodging", "rukne", "रुकने", "rehne", "रहने", "dharamshala", "धर्मशाला", "hotel", "room"] },
  family: { label: "Family / caregiver", keywords: ["son$", "daughter", "husband", "wife", "beta$", "बेटा", "beti", "बेटी", "family", "parivar", "परिवार", "nobody", "koi nahi", "कोई नहीं", "kaam", "काम", "work", "job", "children", "bachche", "बच्चे", "harvest", "fasal", "फसल", "wedding", "shaadi", "शादी", "alone", "akeli", "अकेली"] },
  felt_better: { label: "Felt better", keywords: ["better", "theek", "ठीक", "fine now", "accha", "अच्छा", "normal", "cured"] },
  fear: { label: "Worried about treatment", keywords: ["scared", "afraid", "fear", "dar$", "डर", "worried", "worry", "chinta", "चिंता", "ghabra", "घबरा"] },
  unaware: { label: "Unaware / forgot", keywords: ["didn't know", "did not know", "forgot", "bhool", "भूल", "pata nahi", "पता नहीं", "not told", "kab hai"] },
};

/**
 * The hospital's own "when to come to emergency" card. Clinicians own this list;
 * Setu only repeats the hospital's printed instruction when a phrase matches.
 * Ambiguous matches are treated as emergencies (fail-safe over-triage).
 */
export const DEFAULT_EMERGENCY_CARD = [
  { id: "fever", label: "Fever or chills", keywords: ["fever", "temperature", "chills", "bukhar", "बुखार", "kapkapi", "कंपकंपी"] },
  { id: "bleeding", label: "Bleeding, or blood in vomit, urine or stool", keywords: ["bleed", "blood", "khoon", "खून"] },
  { id: "breath", label: "Breathlessness or chest pain", keywords: ["breath", "saans", "सांस", "साँस", "chest pain", "seene", "सीने"] },
  { id: "neuro", label: "Fainting, confusion or fits", keywords: ["faint", "unconscious", "behosh", "बेहोश", "fits", "seizure", "daura", "दौरा", "confus"] },
  { id: "fluids", label: "Cannot keep fluids down", keywords: ["nonstop vomit", "continuous vomit", "keep vomiting", "lagatar ulti", "लगातार उल्टी", "can't drink", "cannot drink", "pani nahi"] },
];

/** Phrases the clinical team marked as non-emergency context (reviewed list). */
export const EMERGENCY_EXCLUSIONS = ["blood test", "blood report", "blood sugar", "khoon ki jaanch", "खून की जांच"];

/** Non-emergency symptom words: logged verbatim and routed to the nurse queue, never answered. */
export const SYMPTOM_WORDS = ["nausea", "vomit", "ulti", "उल्टी", "weak", "kamzori", "कमजोरी", "कमज़ोरी", "tired", "thakan", "थकान", "pain", "dard", "दर्द", "rash", "hair", "baal", "diarrh", "dast", "दस्त", "side effect", "mouth sore", "chhale", "appetite", "bhookh", "भूख", "swelling", "sujan", "सूजन", "cough", "khansi", "खांसी", "sick", "bimar", "बीमार", "tabiyat", "तबीयत"];

const LATIN = /^[\x00-\x7F]+$/;

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matches(text, keyword) {
  const t = text.toLowerCase();
  if (!LATIN.test(keyword)) return t.includes(keyword);
  const whole = keyword.endsWith("$");
  const kw = escape(whole ? keyword.slice(0, -1) : keyword);
  const re = new RegExp(`(^|[^a-z])${kw}${whole ? "(?![a-z])" : ""}`, "i");
  return re.test(t);
}

export function classify(text, emergencyCard = DEFAULT_EMERGENCY_CARD) {
  let scrubbed = text.toLowerCase();
  for (const ex of EMERGENCY_EXCLUSIONS) scrubbed = scrubbed.split(ex).join(" ");

  const emergency = emergencyCard.filter((item) => item.keywords.some((k) => matches(scrubbed, k)));
  const symptoms = SYMPTOM_WORDS.filter((k) => matches(text, k));
  const barriers = Object.entries(BARRIERS)
    .filter(([, b]) => b.keywords.some((k) => matches(text, k)))
    .map(([id]) => id);

  return { emergency, symptoms, barriers };
}
