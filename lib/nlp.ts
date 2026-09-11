export type Intent = "current" | "forecast" | "alerts" | "climate" | "air" | "agro" | "aviation" | "nwp" | "marine" | "urban" | "disaster" | "greeting" | "unknown"

export interface ParsedQuery {
  intent: Intent
  location: string | null
}

/* ── Comprehensive Indian States & UTs (with Hindi, typos, abbreviations) ── */
const INDIAN_STATES_AND_UTS: Record<string, string> = {
  // Regional Script States
  "ગુજરાત": "Gujarat", "પંજાબ": "Punjab", "મહારાષ્ટ્ર": "Maharashtra",
  "পশ্চিমবঙ্গ": "West Bengal", "தமிழ்நாடு": "Tamil Nadu", "తెలంగాణ": "Telangana",
  // Abbreviations & Hindi
  "up": "Uttar Pradesh",
  "u.p.": "Uttar Pradesh",
  "uttar pradesh": "Uttar Pradesh",
  "उत्तर प्रदेश": "Uttar Pradesh",
  "mp": "Madhya Pradesh",
  "m.p.": "Madhya Pradesh",
  "madhya pradesh": "Madhya Pradesh",
  "मध्य प्रदेश": "Madhya Pradesh",
  "bihar": "Bihar",
  "बिहार": "Bihar",
  "delhi": "Delhi",
  "dehli": "Delhi",
  "dilli": "Delhi",
  "नई दिल्ली": "New Delhi",
  "दिल्ली": "Delhi",
  "maharashtra": "Maharashtra",
  "maharastra": "Maharashtra",
  "महाराष्ट्र": "Maharashtra",
  "rajasthan": "Rajasthan",
  "rajsthan": "Rajasthan",
  "राजस्थान": "Rajasthan",
  "gujarat": "Gujarat",
  "gujrat": "Gujarat",
  "गुजरात": "Gujarat",
  "karnataka": "Karnataka",
  "karnatka": "Karnataka",
  "कर्नाटक": "Karnataka",
  "tamil nadu": "Tamil Nadu",
  "tamilnadu": "Tamil Nadu",
  "तमिलनाडु": "Tamil Nadu",
  "kerala": "Kerala",
  "केरला": "Kerala",
  "केरल": "Kerala",
  "punjab": "Punjab",
  "पंजाब": "Punjab",
  "haryana": "Haryana",
  "हरियाणा": "Haryana",
  "west bengal": "West Bengal",
  "bengal": "West Bengal",
  "wb": "West Bengal",
  "पश्चिम बंगाल": "West Bengal",
  "odisha": "Odisha",
  "orissa": "Odisha",
  "ओडिशा": "Odisha",
  "उड़ीसा": "Odisha",
  "telangana": "Telangana",
  "telengana": "Telangana",
  "तेलंगाना": "Telangana",
  "andhra pradesh": "Andhra Pradesh",
  "andhra": "Andhra Pradesh",
  "ap": "Andhra Pradesh",
  "आंध्र प्रदेश": "Andhra Pradesh",
  "jharkhand": "Jharkhand",
  "झारखंड": "Jharkhand",
  "chhattisgarh": "Chhattisgarh",
  "chhatisgarh": "Chhattisgarh",
  "छत्तीसगढ़": "Chhattisgarh",
  "uttarakhand": "Uttarakhand",
  "uttrakhand": "Uttarakhand",
  "उत्तराखंड": "Uttarakhand",
  "himachal pradesh": "Himachal Pradesh",
  "himachal": "Himachal Pradesh",
  "हिमाचल": "Himachal Pradesh",
  "हिमाचल प्रदेश": "Himachal Pradesh",
  "assam": "Assam",
  "असम": "Assam",
  "goa": "Goa",
  "गोवा": "Goa",
  "jammu and kashmir": "Jammu and Kashmir",
  "jammu": "Jammu",
  "kashmir": "Kashmir",
  "जम्मू": "Jammu",
  "कश्मीर": "Kashmir",
  "ladakh": "Ladakh",
  "लद्दाख": "Ladakh",
  "tripura": "Tripura",
  "त्रिपुरा": "Tripura",
  "meghalaya": "Meghalaya",
  "मेघालय": "Meghalaya",
  "manipur": "Manipur",
  "मणिपुर": "Manipur",
  "nagaland": "Nagaland",
  "नागालैंड": "Nagaland",
  "mizoram": "Mizoram",
  "मिजोरम": "Mizoram",
  "sikkim": "Sikkim",
  "सिक्किम": "Sikkim",
  "arunachal pradesh": "Arunachal Pradesh",
  "arunachal": "Arunachal Pradesh",
  "अरुणाचल": "Arunachal Pradesh",
}

/* ── Major Indian Districts, Cities, and Common Spelling Mistakes ── */
const CITY_TYPO_MAP: Record<string, string> = {
  // Marathi / Devanagari regional forms
  "मुंबईचे": "Mumbai", "पुण्याचे": "Pune", "नागपूरचे": "Nagpur",
  "नाशिक": "Nashik", "नाशिकचे": "Nashik", "छत्रपती संभाजीनगर": "Aurangabad", "सोलापूर": "Solapur",
  "कोल्हापूर": "Kolhapur", "ठाणे": "Thane",

  // Gujarati Script Cities
  "અમદાવાદ": "Ahmedabad", "અમદાવાદનું": "Ahmedabad", "સુરત": "Surat", "સૂરત": "Surat",
  "વડોદરા": "Vadodara", "રાજકોટ": "Rajkot", "ગાંધીનગર": "Gandhinagar", "ભાવનગર": "Bhavnagar",
  "જામનગર": "Jamnagar", "જુનાગઢ": "Junagadh", "જૂનાગઢ": "Junagadh", "કચ્છ": "Kutch", "ભુજ": "Bhuj",
  "આણંદ": "Anand", "નવસારી": "Navsari", "મોરબી": "Morbi", "પોરબંદર": "Porbandar",

  // Punjabi Gurmukhi Script Cities
  "ਅੰਮ੍ਰਿਤਸਰ": "Amritsar", "ਅੰਮ੍ਰਿਤਸਰ ਦਾ": "Amritsar", "ਲੁਧਿਆਣਾ": "Ludhiana", "ਜਲੰਧਰ": "Jalandhar",
  "ਪਟਿਆਲਾ": "Patiala", "ਬਠਿੰਡਾ": "Bathinda", "ਮੋਹਾਲੀ": "Mohali", "ਚੰਡੀਗੜ੍ਹ": "Chandigarh",
  "ਹੁਸ਼ਿਆਰਪੁਰ": "Hoshiarpur", "ਪਠਾਨਕੋਟ": "Pathankot", "ਬਟਾਲਾ": "Batala",

  // Bengali, Tamil, Telugu Cities
  "কলকাতা": "Kolkata", "হাওড়া": "Kolkata", "শিলিগুড়ি": "Siliguri", "দীঘা": "Digha",
  "சென்னை": "Chennai", "கோயம்புத்தூர்": "Coimbatore", "மதுரை": "Madurai",
  "హైదరాబాద్": "Hyderabad", "విశాఖపట్నం": "Visakhapatnam", "విజయవాడ": "Vijayawada", "తిరుపతి": "Tirupati",
  // Bihar Districts
  "samastipur": "Samastipur", "samstipur": "Samastipur", "samastipoor": "Samastipur", "समस्तीपुर": "Samastipur",
  "patna": "Patna", "पटना": "Patna",
  "muzaffarpur": "Muzaffarpur", "muzafarpur": "Muzaffarpur", "mujaffarpur": "Muzaffarpur", "मुजफ्फरपुर": "Muzaffarpur",
  "darbhanga": "Darbhanga", "dharbhanga": "Darbhanga", "darbhnga": "Darbhanga", "दरभंगा": "Darbhanga",
  "gaya": "Gaya", "गया": "Gaya",
  "bhagalpur": "Bhagalpur", "भागलपुर": "Bhagalpur",
  "hajipur": "Hajipur", "hajeepur": "Hajipur", "हाजीपुर": "Hajipur",
  "begusarai": "Begusarai", "begusari": "Begusarai", "बेगूसराय": "Begusarai",
  "purnia": "Purnia", "purnea": "Purnia", "पूर्णिया": "Purnia",
  "katihar": "Katihar", "कटिहार": "Katihar",
  "siwan": "Siwan", "सीवान": "Siwan",
  "chhapra": "Chhapra", "chapra": "Chhapra", "छपरा": "Chhapra",
  "motihari": "Motihari", "मोतिहारी": "Motihari",
  "bettiah": "Bettiah", "बेतिया": "Bettiah",
  "sitamarhi": "Sitamarhi", "सीतामढ़ी": "Sitamarhi",
  "madhubani": "Madhubani", "मधुबनी": "Madhubani",
  "saharsa": "Saharsa", "सहरसा": "Saharsa",
  "munger": "Munger", "मुंगेर": "Munger",
  "arrah": "Arrah", "ara": "Arrah", "आरा": "Arrah",
  "buxar": "Buxar", "बक्सर": "Buxar",
  "sasaram": "Sasaram", "सासाराम": "Sasaram",
  "gopalganj": "Gopalganj", "गोपालगंज": "Gopalganj",
  "vaishali": "Vaishali", "वैशाली": "Vaishali",
  "nalanda": "Nalanda", "नालंदा": "Nalanda",
  "biharsharif": "Bihar Sharif", "bihar sharif": "Bihar Sharif", "बिहार शरीफ": "Bihar Sharif",
  "nawada": "Nawada", "नवादा": "Nawada",
  "aurangabad": "Aurangabad", "औरंगाबाद": "Aurangabad",
  "jehanabad": "Jehanabad", "जहानाबाद": "Jehanabad",
  "araria": "Araria", "अररिया": "Araria",
  "kishanganj": "Kishanganj", "किशनगंज": "Kishanganj",
  "supaul": "Supaul", "सुपौल": "Supaul",
  "khagaria": "Khagaria", "खगड़िया": "Khagaria",
  "banka": "Banka", "बांका": "Banka",
  "jamui": "Jamui", "जमुई": "Jamui",
  "lakhisarai": "Lakhisarai", "लखीसराय": "Lakhisarai",
  "sheikhpura": "Sheikhpura", "शेखपुरा": "Sheikhpura",
  "sheohar": "Sheohar", "शिवहर": "Sheohar",

  // Famous Indian Landmarks, Monuments, and Colloquial Places to Indian Cities
  "lal qila": "Delhi", "lal kila": "Delhi", "red fort": "Delhi", "लाल किला": "Delhi", "लालकिला": "Delhi",
  "qila": "Delhi", "kila": "Delhi",
  "india gate": "Delhi", "इण्डिया गेट": "Delhi", "इंडिया गेट": "Delhi",
  "qutub minar": "Delhi", "qutab minar": "Delhi", "कुतुब मीनार": "Delhi",
  "chandni chowk": "Delhi", "चांदनी चौक": "Delhi",
  "connaught place": "Delhi", "कनॉट प्लेस": "Delhi", "cp": "Delhi",
  "taj mahal": "Agra", "tajmahal": "Agra", "ताज महल": "Agra", "ताजमहल": "Agra",
  "gateway of india": "Mumbai", "गेटवे ऑफ इंडिया": "Mumbai",
  "marine drive": "Mumbai", "मरीन ड्राइव": "Mumbai",
  "juhu": "Mumbai", "जुहू": "Mumbai", "bandra": "Mumbai", "बांद्रा": "Mumbai",
  "golden temple": "Amritsar", "स्वर्ण मंदिर": "Amritsar", "harmandir sahib": "Amritsar",
  "wagah border": "Amritsar", "वाघा बॉर्डर": "Amritsar",
  "howrah bridge": "Kolkata", "हावड़ा ब्रिज": "Kolkata", "हावड़ा": "Kolkata",
  "victoria memorial": "Kolkata", "विक्टोरिया मेमोरियल": "Kolkata",
  "eden gardens": "Kolkata", "ईडन गार्डन्स": "Kolkata",
  "charminar": "Hyderabad", "चारमीनार": "Hyderabad",
  "hawa mahal": "Jaipur", "हवा महल": "Jaipur",
  "amer fort": "Jaipur", "आमेर किला": "Jaipur",
  "kashi vishwanath": "Varanasi", "काशी विश्वनाथ": "Varanasi", "kashi": "Varanasi", "काशी": "Varanasi",
  "ram mandir": "Ayodhya", "राम मंदिर": "Ayodhya", "ram janmabhoomi": "Ayodhya",
  "kedarnath": "Kedarnath", "केदारनाथ": "Kedarnath",
  "badrinath": "Badrinath", "बद्रीनाथ": "Badrinath",
  "vaishno devi": "Katra", "वैष्णो देवी": "Katra",
  "dal lake": "Srinagar", "डल झील": "Srinagar",
  "gulmarg": "Gulmarg", "गुलमर्ग": "Gulmarg",
  "manali": "Manali", "मनाली": "Manali", "rohtang": "Manali", "रोहतांग": "Manali",
  "tirupati": "Tirupati", "तिरुपति": "Tirupati", "balaji": "Tirupati",
  "meenakshi temple": "Madurai", "मीनाक्षी मंदिर": "Madurai",
  "jagannath temple": "Puri", "jagannath puri": "Puri", "जगन्नाथ मंदिर": "Puri", "जगन्नाथ पुरी": "Puri",
  "konark": "Konark", "कोणार्क": "Konark",
  "bodh gaya": "Gaya", "बोध गया": "Gaya",
  "somnath": "Somnath", "सोमनाथ": "Somnath",

  // UP Districts & Cities
  "lucknow": "Lucknow", "lakhnau": "Lucknow", "लखनऊ": "Lucknow",
  "kanpur": "Kanpur", "kanpoor": "Kanpur", "कानपुर": "Kanpur",
  "varanasi": "Varanasi", "banaras": "Varanasi", "वाराणसी": "Varanasi", "बनारस": "Varanasi",
  "prayagraj": "Prayagraj", "allahabad": "Prayagraj", "ilahabad": "Prayagraj", "प्रयागराज": "Prayagraj", "इलाहाबाद": "Prayagraj",
  "agra": "Agra", "आगरा": "Agra",
  "meerut": "Meerut", "मेरठ": "Meerut",
  "gorakhpur": "Gorakhpur", "gorakhpr": "Gorakhpur", "गोरखपुर": "Gorakhpur",
  "noida": "Noida", "नोएडा": "Noida",
  "ghaziabad": "Ghaziabad", "गाजियाबाद": "Ghaziabad",
  "aligarh": "Aligarh", "अलीगढ़": "Aligarh",
  "moradabad": "Moradabad", "मुरादाबाद": "Moradabad",
  "bareilly": "Bareilly", "बरेली": "Bareilly",
  "ayodhya": "Ayodhya", "faizabad": "Ayodhya", "अयोध्या": "Ayodhya",
  "jhansi": "Jhansi", "झांसी": "Jhansi",
  "mathura": "Mathura", "मथुरा": "Mathura",
  "basti": "Basti", "बस्ती": "Basti",
  "azamgarh": "Azamgarh", "आजमगढ़": "Azamgarh",
  "jaunpur": "Jaunpur", "जौनपुर": "Jaunpur",
  "mirzapur": "Mirzapur", "मिर्जापुर": "Mirzapur",
  "ballia": "Ballia", "बलिया": "Ballia",
  "deoria": "Deoria", "देवरिया": "Deoria",
  "sultanpur": "Sultanpur", "सुल्तानपुर": "Sultanpur",
  "rae bareli": "Rae Bareli", "raebareli": "Rae Bareli", "रायबरेली": "Rae Bareli",

  // Major Indian Metros & Cities (and typos)
  "mumbai": "Mumbai", "mumbay": "Mumbai", "bombay": "Mumbai", "मुंबई": "Mumbai",
  "delhi": "Delhi", "dehli": "Delhi", "dilli": "Delhi", "new delhi": "New Delhi", "दिल्ली": "Delhi",
  "kolkata": "Kolkata", "calcutta": "Kolkata", "kolkatta": "Kolkata", "कोलकाता": "Kolkata",
  "bengaluru": "Bengaluru", "bangalore": "Bengaluru", "banglore": "Bengaluru", "bengloor": "Bengaluru", "बेंगलुरु": "Bengaluru",
  "chennai": "Chennai", "madras": "Chennai", "चेन्नई": "Chennai",
  "hyderabad": "Hyderabad", "hydrabad": "Hyderabad", "हैदराबाद": "Hyderabad",
  "pune": "Pune", "poona": "Pune", "पुणे": "Pune",
  "ahmedabad": "Ahmedabad", "ahemadabad": "Ahmedabad", "amdavad": "Ahmedabad", "अहमदाबाद": "Ahmedabad",
  "jaipur": "Jaipur", "jaipoor": "Jaipur", "jaiput": "Jaipur", "जयपुर": "Jaipur",
  "surat": "Surat", "सूरत": "Surat",
  "indore": "Indore", "इन्दौर": "Indore", "इंदौर": "Indore",
  "bhopal": "Bhopal", "भोपाल": "Bhopal",
  "nagpur": "Nagpur", "नागपुर": "Nagpur",
  "vadodara": "Vadodara", "baroda": "Vadodara", "वडोदरा": "Vadodara",
  "chandigarh": "Chandigarh", "chandigadh": "Chandigarh", "चंडीगढ़": "Chandigarh",
  "ranchi": "Ranchi", "रांची": "Ranchi",
  "jamshedpur": "Jamshedpur", "जमशेदपुर": "Jamshedpur",
  "dhanbad": "Dhanbad", "धनबाद": "Dhanbad",
  "bhubaneswar": "Bhubaneswar", "bhubaneshwar": "Bhubaneswar", "भुवनेश्वर": "Bhubaneswar",
  "cuttack": "Cuttack", "कटक": "Cuttack",
  "puri": "Puri", "पुरी": "Puri",
  "guwahati": "Guwahati", "gauhati": "Guwahati", "गुवाहाटी": "Guwahati",
  "visakhapatnam": "Visakhapatnam", "vizag": "Visakhapatnam", "विशाखापट्टनम": "Visakhapatnam",
  "vijayawada": "Vijayawada", "विजयवाड़ा": "Vijayawada",
  "guntur": "Guntur", "गुंटूर": "Guntur",
  "kochi": "Kochi", "cochin": "Kochi", "कोच्चि": "Kochi",
  "thiruvananthapuram": "Thiruvananthapuram", "trivandrum": "Thiruvananthapuram", "तिरुवनंतपुरम": "Thiruvananthapuram",
  "kozhikode": "Kozhikode", "calicut": "Kozhikode", "कोझिकोड": "Kozhikode",
  "coimbatore": "Coimbatore", "कोयंबटूर": "Coimbatore",
  "madurai": "Madurai", "मदुरै": "Madurai",
  "amritsar": "Amritsar", "अमृतसर": "Amritsar",
  "ludhiana": "Ludhiana", "लुधियाना": "Ludhiana",
  "jalandhar": "Jalandhar", "जालंधर": "Jalandhar",
  "shimla": "Shimla", "शिमला": "Shimla",
  "dehradun": "Dehradun", "देहरादून": "Dehradun",
  "haridwar": "Haridwar", "हरिद्वार": "Haridwar",
  "rishikesh": "Rishikesh", "ऋषिकेश": "Rishikesh",
  "srinagar": "Srinagar", "श्रीनगर": "Srinagar",
  "gurugram": "Gurugram", "gurgaon": "Gurugram", "गुरुग्राम": "Gurugram", "गुड़गांव": "Gurugram",
  "faridabad": "Faridabad", "फरीदाबाद": "Faridabad",
  "panipat": "Panipat", "पानीपत": "Panipat",
  "rohtak": "Rohtak", "रोहतक": "Rohtak",
  "jodhpur": "Jodhpur", "जोधपुर": "Jodhpur",
  "udaipur": "Udaipur", "उदयपुर": "Udaipur",
  "kota": "Kota", "कोटा": "Kota",
  "bikaner": "Bikaner", "बीकानेर": "Bikaner",
  "ajmer": "Ajmer", "अजमेर": "Ajmer",
  "gwalior": "Gwalior", "ग्वालियर": "Gwalior",
  "jabalpur": "Jabalpur", "जबलपुर": "Jabalpur",
  "ujjain": "Ujjain", "उज्जैन": "Ujjain",
  "raipur": "Raipur", "रायपुर": "Raipur",
  "bilaspur": "Bilaspur", "बिलासपुर": "Bilaspur",
}

/* ── Fuzzy Levenshtein Distance for Typo Correction ── */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const d: number[][] = []

  for (let i = 0; i <= m; i++) d[i] = [i]
  for (let j = 0; j <= n; j++) d[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      )
    }
  }
  return d[m][n]
}

function findFuzzyMatch(word: string): string | null {
  const clean = word.toLowerCase().trim()
  if (clean.length < 2) return null

  // Direct lookup
  if (CITY_TYPO_MAP[clean]) return CITY_TYPO_MAP[clean]
  if (INDIAN_STATES_AND_UTS[clean]) return INDIAN_STATES_AND_UTS[clean]

  if (clean.length < 3) return null

  // Levenshtein fuzzy match against dictionary
  let bestMatch: string | null = null
  let minDistance = 999

  const candidates = Object.entries({ ...CITY_TYPO_MAP, ...INDIAN_STATES_AND_UTS })
  for (const [key, canonical] of candidates) {
    if (Math.abs(key.length - clean.length) > 2) continue
    const dist = levenshtein(clean, key)
    
    // Allow max 1 edit for len 3-4, max 2 edits for len 5+
    const maxAllowed = clean.length <= 4 ? 1 : 2
    if (dist <= maxAllowed && dist < minDistance) {
      minDistance = dist
      bestMatch = canonical
    }
  }

  return bestMatch
}

/* ── Intent Keywords ── */
const INTENT_KEYWORDS: Record<Exclude<Intent, "unknown" | "greeting" | "agro" | "aviation" | "nwp" | "marine" | "urban" | "disaster">, string[]> = {
  alerts: [
    "alert", "alerts", "warning", "warnings", "cyclone", "flood", "storm", "heatwave", "heat wave",
    "danger", "advisory", "चेतावनी", "चेतावनी?", "इशारा", "खतरा", "ચેતવણી", "ਚੇਤਾਵਨੀ",
    "khatra", "aandhi", "toofan", "बाढ़", "आंधी", "तूफान",
  ],
  climate: [
    "climate", "trend", "trends", "history", "historical", "normal", "normals", "average",
    "annual", "monsoon pattern", "जलवायु", "दीर्घकालीन हवामान", "हवामान बदल", "આબોહવા", "ਜਲਵਾਯੂ", "jalvayu",
  ],
  air: [
    "air quality", "air", "aqi", "pollution", "pm2.5", "pm10", "smog", "वायु", "गुणवत्ता",
    "hawa ki quality", "pradushan", "प्रदूषण", "धुंध", "hawa",
  ],
  forecast: [
    "forecast", "tomorrow", "next", "week", "days", "later",
    "will it rain", "kal", "पूर्वानुमान", "कल", "आने वाले", "agle", "agla", "agli",
    "kal baarish", "next week", "parso", "परसों",
  ],
  current: [
    "weather", "temperature", "temp", "now", "current", "hot", "cold",
    "humid", "rain", "aaj", "आज",
    "mausam", "musam", "mosam", "mausham", "mewsam", "मौसम",
    "tapman", "taapmaan", "taapman", "तापमान",
    "baarish", "barish", "varsha", "बारिश", "वर्षा", "barsat",
    "garmi", "sardi", "ठंड", "गर्मी", "abhi", "अभी",
    "हवामान", "पाऊस", "હવામાન", "વરસાદ", "તાપમાન", "મੌਸਮ", "ਮੀਂਹ", "ਤਾਪਮਾਨ",
  ],
}

const AGRO_KEYWORDS = [
  "soil", "crop", "farm", "farmer", "agriculture", "kisan", "kheti",
  "fasal", "mitti", "irrigation", "sinchai", "fertilizer", "sowing",
  "बुआई", "किसान", "खेती", "फसल", "मिट्टी", "सिंचाई",
  "शेती", "पीक", "खत", "ખેતી", "પાક", "ખાતર", "ਖੇਤੀ", "ਫਸਲ", "ਖਾਦ",
  "krishi", "agro", "farming", "ndvi", "satellite", "field",
]

const AVIATION_KEYWORDS = [
  "aviation", "pilot", "flight", "airport", "metar", "taf", "ceiling",
  "visibility", "vfr", "ifr", "mvfr", "lifr", "qnh", "wind shear",
  "turbulence", "icing", "takeoff", "landing", "runway", "atc",
  "विमान", "पायलट", "उड़ान", "हवाई अड्डा", "vimaanseva",
]

const NWP_KEYWORDS = [
  "nwp", "gfs", "wrf", "model", "numerical", "prediction",
  "wis2", "mqtt", "cape", "lifted index", "geopotential",
  "500 hpa", "precipitable water", "upper air", "pressure level",
  "ensemble", "reanalysis", "ecmwf", "grib", "netcdf",
  "मॉडल", "संख्यात्मक", "पूर्वानुमान मॉडल", "weather model",
  "forecast model", "atmospheric model",
]

const MARINE_KEYWORDS = [
  "marine", "sea", "ocean", "wave", "waves", "swell", "tide", "tides", "fisherman", "fishermen",
  "coastal", "port", "harbour", "harbor", "samundar", "samudra", "lahar", "lahare", "machhuare",
  "machli", "dock", "offshore", "sea state", "tide table", "हाई टाइड", "समुद्री", "लहर", "मछुआरे", "सागरी", "दरિયાઇ", "દરિયાઈ", "ਸਮੁੰਦਰੀ",
]

const URBAN_KEYWORDS = [
  "smart city", "urban", "heat island", "uhi", "waterlogging", "waterlog", "drainage", "drain",
  "sewage", "construction", "jalbharia", "jal jamav", "jalbharav", "thermal comfort", "utci",
  "city planning", "underpass", "flash flood urban", "स्मार्ट सिटी", "जलभराव", "शहरी",
]

const DISASTER_KEYWORDS = [
  "disaster", "cyclone", "flood", "tsunami", "storm surge", "inundation",
  "evacuation", "ndma", "relief", "toofan", "tufan", "baadh", "badh",
  "चक्रवात", "बाढ़", "तूफान", "आपदा", "जलमग्न", "निकासी", "राहत",
]

const GREETINGS = [
  "hi", "hii", "hlo", "hello", "helo", "hey", "namaste", "namaskar",
  "नमस्ते", "नमस्कार", "help", "start", "kya hal", "kya haal", "નમસ્તે", "સતਿ ਸ੍ਰੀ ਅਕਾਲ", "ਸਤਿਸ੍ਰੀਅਕਾਲ", "ਸ਼ੁਰੂ ਕਰੋ", "સુરુ કરો", "सुरू करा", "શરૂ કરો",
]

/* ── Stop words and Intent Words to strip from location candidates ── */
const ALL_NON_LOCATION_WORDS = new Set([
  // Marathi non-location intent & grammar words
  "हवामान", "पाऊस", "चे", "चा", "ची", "मध्ये", "कसे", "कसा", "कशी", "आहे", "सांगा", "शेती", "सल्ला", "सागरी", "वारा", "आर्द्रता", "कमाल", "किमान", "इशारा", "आढावा", "थंड", "उष्णता",
  // Gujarati non-location intent & grammar words
  "હવામાન", "વરસાદ", "ખેતી", "સલાહ", "દરિયાઇ", "દરિયાઈ", "પવન", "ભેજ", "ગરમી", "ઠંડી", "કેવું", "કેવી", "કેવો", "છે", "માં", "માટે", "નું", "નો", "ની", "ના", "આગાહી", "ચેતવણી", "તાપમાન", "બતાવો", "પૂછો",
  // Punjabi non-location intent & grammar words
  "ਮੌਸਮ", "ਮੀਂਹ", "ਖੇਤੀ", "ਸਲਾਹ", "ਹਵਾ", "ਨਮੀ", "ਗੁਣਵੱਤਾ", "ਕਿਵੇਂ", "ਹੈ", "ਵਿੱਚ", "ਲਈ", "ਦਾ", "ਦੀ", "ਦੇ", "ਤਾਪਮਾਨ", "ਅਨੁਮਾਨ", "ਚੇਤਾਵਨੀ", "ਦੱਸੋ", "ਠੰਢ", "ਗਰਮੀ",
  // Grammar & question words (English)
  "what", "when", "how", "will", "is", "are", "does", "do", "the", "a", "an",
  "tell", "show", "give", "me", "for", "in", "at", "to", "from", "with", "near", "around", "of",
  "i", "my", "can", "you", "please", "pls", "plz", "help", "get", "check", "find", "about", "and", "or",
  // Time & day words (English) ← THE KEY FIX
  "today", "tomorrow", "tonight", "yesterday", "now", "later", "soon", "currently", "current",
  "next", "this", "last", "week", "weeks", "month", "months", "year", "years",
  "day", "days", "hour", "hours", "morning", "evening", "afternoon", "night", "midnight",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  // Hindi grammar & question words
  "kya", "kaisa", "kaisi", "kaise", "kab", "kyun", "kyunki", "kyuki", "kitna", "kitni", "kitne",
  "kal", "aaj", "abhi", "parso", "agle", "agla", "agli", "pichle",
  "hoga", "hogi", "hoge", "hai", "hain", "tha", "the", "thi", "rahega", "rahegi", "raha", "rahi", "rahe",
  // Weather intent words (English)
  "weather", "rain", "raining", "rainfall", "forecast", "predict", "prediction",
  "alert", "alerts", "warning", "warnings", "cyclone", "flood", "storm",
  "air", "quality", "aqi", "pollution", "smog", "haze", "fog",
  "climate", "temp", "temperature", "humidity", "wind", "pressure", "uv",
  "trends", "normals", "history", "historical", "average", "annual",
  "hot", "cold", "warm", "cool", "humid", "dry", "wet", "sunny", "cloudy",
  // Weather intent words (Hinglish / transliteration)
  "mausam", "musam", "mosam", "mewsam", "mausham",
  "tapman", "taapmaan", "taapman",
  "baarish", "barish", "barsat", "varsha", "hawa",
  "garmi", "sardi", "thand", "umash",
  // Polite & action words
  "batao", "bataiye", "bata", "bataye", "chahiye", "chahiye",
  // Hindi prepositions
  "ka", "ki", "ke", "mein", "me", "ko", "par", "se", "tak", "liye", "k",
  // Administrative / generic place designations (not actual names)
  "district", "jila", "zila", "gaon", "gao", "village", "gram",
  "taluka", "tehsil", "block", "state", "rajya", "pradesh",
  // Agriculture & crop terms (not location names)
  "fasal", "kisan", "kheti", "khet", "keeda", "kida", "pani", "paani", "dawa", "dawai", "beej", "khad", "upaj",
  "crop", "crops", "farm", "farmer", "farming", "agriculture", "soil", "seed", "seeds", "pest", "pests", "fertilizer",
  // Common pronouns, adverbs & verbs (Hinglish/Hindi)
  "mera", "meri", "mere", "hamara", "humara", "tera", "teri", "uska", "uski", "apna", "apni", "apne",
  "yaha", "yahan", "waha", "wahan", "jaha", "jahan", "kaha", "kahan", "idhar", "udhar",
  "kare", "karein", "karna", "karega", "lag", "laga", "gaya", "gayi", "huye", "hua",
  "h", "bhi", "to", "toh", "aur", "ya", "sirf", "bas",
  // Hindi Devanagari stop words
  "का", "की", "के", "में", "को", "पर", "से", "तक", "लिए",
  "है", "हैं", "हो", "था", "थी", "थे", "बताओ", "बताइए",
  "मौसम", "तापमान", "बारिश", "फसल", "खेती", "किसान", "खेत", "कीड़ा", "खाद", "बीज", "पानी",
  "मेरा", "मेरी", "मेरे", "हमारा", "यहाँ", "वहाँ", "जहाँ", "कहाँ",
  "कैसा", "कैसी", "कैसे",
  "कल", "आज", "अभी", "परसों",
  "जिला", "गांव", "राज्य",
  "कब", "होगी", "होगा", "रहेगा", "रहेगी",
  "कितनी", "कितना",
  "हवा", "गुणवत्ता", "जलवायु", "चेतावनी", "खतरा", "प्रदूषण",
  "नगर", "शहर", "प्रखंड", "तहसील",
])

function titleCase(s: string): string {
  return s.trim().split(/\s+/).filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

/* ── Strip filler words & punctuation from query ── */
function cleanQueryString(raw: string): string {
  return raw
    .replace(/[?!.,;:"'(){}[\]<>।]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Universal Location Extractor
 * Identifies village, district, city, state in any script (Devanagari, regional, Latin),
 * strips grammar & intent words, and resolves spelling mistakes.
 */
export function extractLocation(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null
  const cleaned = cleanQueryString(raw)
  const lower = cleaned.toLowerCase()

  /* 1. Direct match in dictionary */
  if (CITY_TYPO_MAP[lower]) return CITY_TYPO_MAP[lower]
  if (INDIAN_STATES_AND_UTS[lower]) return INDIAN_STATES_AND_UTS[lower]

  /* 1b. Substring landmark / city match (e.g. "lal qila jaha waha k batao") */
  for (const [key, val] of Object.entries(CITY_TYPO_MAP)) {
    if (key.length >= 4 && lower.includes(key)) {
      return val
    }
  }
  for (const [key, val] of Object.entries(INDIAN_STATES_AND_UTS)) {
    if (key.length >= 4 && lower.includes(key)) {
      return val
    }
  }

  /* 2. Check for abbreviation or fuzzy match entire string if short */
  if (!ALL_NON_LOCATION_WORDS.has(lower)) {
    const singleFuzzy = findFuzzyMatch(lower)
    if (singleFuzzy) return singleFuzzy
  }

  /* 3. Token extraction: split into words, remove non-location tokens */
  const tokens = cleaned.split(/\s+/).filter(Boolean)
  const locationTokens: string[] = []

  for (const token of tokens) {
    const low = token.toLowerCase()
    if (!ALL_NON_LOCATION_WORDS.has(low)) {
      // Check if this token matches a typo / canonical name
      const tokenFuzzy = findFuzzyMatch(low)
      locationTokens.push(tokenFuzzy ?? token)
    }
  }

  if (locationTokens.length > 0) {
    // Join up to 3 location words (e.g. "Kalyanpur Samastipur", "Uttar Pradesh", "Bishanpur")
    const combined = locationTokens.slice(0, 3).join(" ")
    const finalFuzzy = findFuzzyMatch(combined)
    return finalFuzzy ?? titleCase(combined)
  }

  return null
}

export function parseQuery(raw: string): ParsedQuery {
  const text = raw.toLowerCase().trim()
  const location = extractLocation(raw)

  /* Greeting */
  const isGreeting = GREETINGS.some(g =>
    text === g || text.startsWith(g + " ") || text.startsWith(g + "!") || text.startsWith(g + ",")
  )
  if (isGreeting && !location) return { intent: "greeting", location: null }

  /* Agro / farming intent */
  if (AGRO_KEYWORDS.some(kw => text.includes(kw))) return { intent: "agro", location }

  /* Aviation intent */
  if (AVIATION_KEYWORDS.some(kw => text.includes(kw))) return { intent: "aviation", location }

  /* NWP model intent */
  if (NWP_KEYWORDS.some(kw => text.includes(kw))) return { intent: "nwp", location }

  /* Marine & coastal fisheries intent */
  if (MARINE_KEYWORDS.some(kw => text.includes(kw))) return { intent: "marine", location }

  /* Smart city & urban planning intent */
  if (URBAN_KEYWORDS.some(kw => text.includes(kw))) return { intent: "urban", location }

  /* Flood / cyclone / disaster early warning intent */
  if (DISASTER_KEYWORDS.some(kw => text.includes(kw))) return { intent: "disaster", location }

  /* Weather intents (priority order) */
  const order: Array<keyof typeof INTENT_KEYWORDS> = ["alerts", "climate", "air", "forecast", "current"]
  for (const intent of order) {
    if (INTENT_KEYWORDS[intent].some(kw => text.includes(kw))) {
      return { intent, location }
    }
  }

  /* If we extracted a location but no keyword matched → assume "current" */
  if (location) return { intent: "current", location }

  return { intent: "unknown", location: null }
}
