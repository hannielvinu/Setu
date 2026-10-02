/**
 * Call and message scripts. In a real deployment every line below is written or
 * approved by the hospital's clinical team. The agent speaks only these lines.
 * Placeholders: {first} {due} {slot} {remaining} {hospital}
 */
export const HOSPITAL = { en: "Arogya Hospital", hi: "आरोग्य हॉस्पिटल" }; // fictional demo hospital

export const SCRIPTS = {
  headsup: {
    en: "{hospital} Care Desk: Namaste. We will call you in about 10 minutes from this number about an upcoming appointment for {first}. Reply STOP to opt out.",
    hi: "{hospital} केयर डेस्क: नमस्ते। {first} जी की आने वाली अपॉइंटमेंट के बारे में हम लगभग 10 मिनट में इसी नंबर से कॉल करेंगे। बंद करने के लिए STOP लिखें।",
  },
  greet: {
    en: "Namaste, this is the {hospital} care desk, calling for {first}-ji about an appointment. Am I speaking with {first}-ji, or a registered family member?",
    hi: "नमस्ते, मैं {hospital} केयर डेस्क से बोल रही हूँ। {first} जी की अपॉइंटमेंट के बारे में कॉल है। क्या मेरी बात {first} जी या उनके रजिस्टर्ड परिवार के सदस्य से हो रही है?",
  },
  wrongPerson: {
    en: "No problem. Please ask {first}-ji to call us back on this number. Thank you.",
    hi: "कोई बात नहीं। कृपया {first} जी से इसी नंबर पर हमें वापस कॉल करने को कहें। धन्यवाद।",
  },
  verify: {
    en: "Thank you. To protect privacy, please tell me {first}-ji's year of birth, or the last 4 digits of the hospital card.",
    hi: "धन्यवाद। गोपनीयता के लिए, कृपया {first} जी का जन्म वर्ष या हॉस्पिटल कार्ड के आखिरी 4 अंक बताइए।",
  },
  verifyRetry: {
    en: "Sorry, that doesn't match our records. Could you try once more?",
    hi: "माफ़ कीजिए, यह हमारे रिकॉर्ड से मेल नहीं खाया। क्या आप एक बार फिर बता सकते हैं?",
  },
  verifyFailed: {
    en: "I'm unable to confirm details on this call. Please ask {first}-ji to call us back on this number, or visit the help desk. Thank you.",
    hi: "मैं इस कॉल पर जानकारी की पुष्टि नहीं कर पा रही हूँ। कृपया {first} जी से इसी नंबर पर वापस कॉल करने या हेल्प डेस्क पर आने को कहें। धन्यवाद।",
  },
  ask: {
    en: "Thank you. {first}-ji's treatment visit was due on {due}. Is anything making it difficult to come?",
    hi: "धन्यवाद। {first} जी की ट्रीटमेंट विज़िट {due} को थी। क्या आने में कोई परेशानी हो रही है?",
  },
  emergency: {
    en: "Thank you for telling me. As per the hospital's emergency card: please go to the nearest emergency department now, or call the emergency number printed on your hospital card. I am alerting our on-call nurse right now.",
    hi: "बताने के लिए धन्यवाद। हॉस्पिटल के इमरजेंसी कार्ड के अनुसार: कृपया अभी नज़दीकी इमरजेंसी विभाग जाएँ, या अपने हॉस्पिटल कार्ड पर छपे इमरजेंसी नंबर पर कॉल करें। मैं अभी हमारी ऑन-कॉल नर्स को सूचित कर रही हूँ।",
  },
  symptom: {
    en: "I've noted this for our nurse, who will call you back. I can't give medical advice on this call.",
    hi: "मैंने यह हमारी नर्स के लिए नोट कर लिया है, वे आपको वापस कॉल करेंगी। इस कॉल पर मैं मेडिकल सलाह नहीं दे सकती।",
  },
  askMore: {
    en: "Apart from this, is anything else making it difficult to come for the visit?",
    hi: "इसके अलावा, क्या विज़िट पर आने में कोई और परेशानी है?",
  },
  unknown: {
    en: "Thank you for explaining. I'll ask our care coordinator to call you back to help with this.",
    hi: "बताने के लिए धन्यवाद। मैं हमारी केयर कोऑर्डिनेटर से कहूँगी कि वे आपकी मदद के लिए वापस कॉल करें।",
  },
  offerSlot: {
    en: "Here are the next available treatment slots. Which one suits you?",
    hi: "ये अगले उपलब्ध ट्रीटमेंट स्लॉट हैं। आपके लिए कौन-सा ठीक रहेगा?",
  },
  booked: {
    en: "Done. The visit is booked for {slot}. You will get a WhatsApp confirmation with the details.",
    hi: "हो गया। विज़िट {slot} के लिए बुक हो गई है। आपको WhatsApp पर पूरी जानकारी मिल जाएगी।",
  },
  close: {
    en: "Thank you, {first}-ji. Take care. If you need a person at any time, just say 'talk to a person'.",
    hi: "धन्यवाद, {first} जी। अपना ध्यान रखिए। किसी भी समय इंसान से बात करनी हो, तो बस 'किसी व्यक्ति से बात कराइए' कहिए।",
  },
  human: {
    en: "Of course. I'm connecting you to our care coordinator now.",
    hi: "ज़रूर। मैं अभी आपको हमारी केयर कोऑर्डिनेटर से जोड़ रही हूँ।",
  },
  barrier: {
    money: {
      en: "I understand cost is a worry. I'm sending the list of documents for the free-treatment scheme, and our scheme help desk will call you.",
      hi: "मैं समझती हूँ कि खर्च की चिंता है। मैं मुफ़्त इलाज योजना के ज़रूरी कागज़ों की सूची भेज रही हूँ, और हमारी योजना हेल्प डेस्क आपको कॉल करेगी।",
    },
    paperwork: {
      en: "I'm sending a WhatsApp checklist of the exact documents needed for the Ayushman Bharat / state scheme, and the help-desk timing.",
      hi: "मैं आयुष्मान भारत / राज्य योजना के लिए ज़रूरी कागज़ों की सूची और हेल्प डेस्क का समय WhatsApp पर भेज रही हूँ।",
    },
    travel: {
      en: "I understand the journey is long. I can book a slot that suits your travel, and share low-cost stay options near the hospital.",
      hi: "मैं समझती हूँ कि सफ़र लंबा है। मैं आपके सफ़र के हिसाब से स्लॉट बुक कर सकती हूँ, और हॉस्पिटल के पास कम खर्च में रुकने की जगहों की जानकारी भेज सकती हूँ।",
    },
    lodging: {
      en: "I'm sharing the hospital's list of dharamshalas and low-cost stays nearby.",
      hi: "मैं हॉस्पिटल के पास की धर्मशालाओं और कम खर्च में रुकने की जगहों की सूची भेज रही हूँ।",
    },
    family: {
      en: "I understand. I can book a weekend or early slot, and share the visit details with your registered caregiver.",
      hi: "मैं समझती हूँ। मैं वीकेंड या सुबह का स्लॉट बुक कर सकती हूँ, और विज़िट की जानकारी आपके रजिस्टर्ड परिवार के सदस्य को भेज सकती हूँ।",
    },
    felt_better: {
      en: "It's good to hear you're feeling better. Your doctor has planned {remaining} more visits as part of your treatment plan. Shall I book the next one?",
      hi: "यह सुनकर अच्छा लगा कि आप बेहतर महसूस कर रहे हैं। आपके डॉक्टर ने इलाज की योजना में {remaining} और विज़िट रखी हैं। क्या मैं अगली विज़िट बुक कर दूँ?",
    },
    fear: {
      en: "Thank you for sharing this. I'll ask our nurse to call you to talk through your concerns.",
      hi: "यह बताने के लिए धन्यवाद। मैं हमारी नर्स से कहूँगी कि वे आपकी चिंताओं के बारे में बात करने के लिए आपको कॉल करें।",
    },
    unaware: {
      en: "No problem. I'll book the visit now and send a reminder the day before.",
      hi: "कोई बात नहीं। मैं अभी विज़िट बुक कर देती हूँ और एक दिन पहले याद दिला दूँगी।",
    },
  },
};

export function say(line, lang, vars = {}) {
  const text = (line[lang] ?? line.en);
  const all = { hospital: HOSPITAL[lang] ?? HOSPITAL.en, ...vars };
  return text.replace(/\{(\w+)\}/g, (_, k) => (all[k] ?? `{${k}}`));
}

/** Quick replies the presenter can tap while role-playing the patient. */
export const QUICK_REPLIES = {
  en: [
    "My Ayushman card expired, and the bus fare is too much",
    "I feel fine now, so I didn't come",
    "My son has work, there is nobody to bring me",
    "I have had fever since yesterday",
    "I feel very weak and tired",
    "Talk to a person",
  ],
  hi: [
    "आयुष्मान कार्ड खत्म हो गया और बस का किराया बहुत ज़्यादा है",
    "अब मैं ठीक हूँ, इसलिए नहीं आई",
    "बेटे को काम है, मुझे लाने वाला कोई नहीं है",
    "कल से तेज़ बुखार है",
    "बहुत कमज़ोरी और थकान है",
    "किसी व्यक्ति से बात कराइए",
  ],
};

export const HUMAN_REQUEST = ["talk to a person", "person", "human", "insaan", "इंसान", "व्यक्ति", "vyakti"];

export const WHATSAPP_TEMPLATES = {
  paperwork: [
    "Ayushman Bharat (PM-JAY) / state scheme card, or e-card printout",
    "Aadhaar card of patient",
    "Ration card / family ID (for scheme eligibility)",
    "Previous treatment file and discharge papers",
    "Referral letter (if referred from another hospital)",
    "Help desk: Ground floor, Counter 4 · 9:00 am – 4:00 pm",
  ],
  lodging: [
    "Seva Dharamshala · 600 m from hospital · low-cost beds",
    "Patient Rest House (hospital-run) · ask at Counter 2",
    "Charitable trust lodging list available at help desk",
  ],
};
