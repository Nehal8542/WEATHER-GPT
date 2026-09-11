"use client"

import { useState, useEffect, useRef } from "react"
import { AlertOctagon, ChevronRight, PhoneCall, ShieldAlert, Volume2, VolumeX, X, Pause, Play, MapPin, Send } from "lucide-react"
import type { LiveAlertEvent } from "@/app/api/alerts/stream/route"
import { DirectAreaAlertModal } from "./direct-area-alert-modal"

export type AlertLang = "hi" | "en" | "mr" | "gu" | "pa" | "bn" | "te" | "ta"

export const ALERT_LANGUAGES: { code: AlertLang; label: string; native: string; speechLocale: string }[] = [
  { code: "hi", label: "Hindi",     native: "हिन्दी",    speechLocale: "hi-IN" },
  { code: "en", label: "English",   native: "English",   speechLocale: "en-IN" },
  { code: "mr", label: "Marathi",   native: "मराठी",     speechLocale: "mr-IN" },
  { code: "gu", label: "Gujarati",  native: "ગુજરાતી",  speechLocale: "gu-IN" },
  { code: "pa", label: "Punjabi",   native: "ਪੰਜਾਬੀ",    speechLocale: "pa-IN" },
  { code: "bn", label: "Bengali",   native: "বাংলা",     speechLocale: "bn-IN" },
  { code: "te", label: "Telugu",    native: "తెలుగు",    speechLocale: "te-IN" },
  { code: "ta", label: "Tamil",     native: "தமிழ்",     speechLocale: "ta-IN" },
]

interface LocalizedAlert {
  headline: string
  action: string
  regions: string[]
  hazard: string
  metrics: { label: string; val: string }[]
  dos: string[]
  donts: string[]
}

const MULTILINGUAL_ALERTS: Record<string, Record<AlertLang, LocalizedAlert>> = {
  "IMD-AL-2024-09-01": {
    hi: {
      headline: "रेड अलर्ट: ओडिशा और बंगाल तट पर 135 किमी/घंटे का तीव्र चक्रवाती तूफान",
      action: "मछुआरों की सभी गतिविधियों पर पूर्ण रोक। तटीय निवासी तुरंत नजदीकी पक्के चक्रवात राहत शिविर में जाएं।",
      regions: ["पुरी", "बालेश्वर", "केंद्रपाड़ा", "दीघा"],
      hazard: "भीषण चक्रवात",
      metrics: [{ label: "हवा की गति", val: "135 किमी/घंटा" }, { label: "अलर्ट स्तर", val: "तुरंत कार्रवाई करें" }],
      dos: ["मजबूत पक्के मकान या चक्रवात शेल्टर में रहें", "टॉर्च, पीने का पानी और जरूरी दवाइयां पास रखें", "आधिकारिक रेडियो/मौसम बुलेटिन सुनते रहें"],
      donts: ["समुद्र तट या खुले मैदान में न जाएं", "टूटे हुए बिजली के तारों को न छुएं", "अफवाहों पर ध्यान न दें"],
    },
    en: {
      headline: "Red Alert: Very Severe Cyclonic Storm with wind gusts up to 135 km/h along Odisha-Bengal coast",
      action: "Complete suspension of all marine and fishing activities. Coastal residents must move to cyclone shelters immediately.",
      regions: ["Puri", "Balasore", "Kendrapara", "Digha"],
      hazard: "Severe Cyclone",
      metrics: [{ label: "Wind Speed", val: "135 km/h" }, { label: "Severity", val: "Take Action Now" }],
      dos: ["Stay inside pucca shelters or cyclone centers", "Keep emergency kit: torch, bottled water & medicines", "Listen to official IMD/AIR updates"],
      donts: ["Do not venture into the sea or coastal beach", "Avoid downed electrical poles and dangling wires", "Do not spread unverified rumors"],
    },
    mr: {
      headline: "रेड अलर्ट: ओडिशा व बंगाल किनारपट्टीवर १३५ किमी/तास वेगाने तीव्र चक्रीवादळ",
      action: "मासेमारीवर पूर्ण बंदी. किनारपट्टी भागातील नागरिकांनी तात्काळ सुरक्षित पक्क्या निवारा केंद्रात जावे.",
      regions: ["पुरी", "बालेश्वर", "केंद्रपाडा", "दीघा"],
      hazard: "तीव्र चक्रीवादळ",
      metrics: [{ label: "वाऱ्याचा वेग", val: "१३५ किमी/तास" }, { label: "इशारा", val: "तातडीने कृती करा" }],
      dos: ["पक्क्या निवारा केंद्रात सुरक्षित राहा", "पिण्याचे पाणी, टॉर्च आणि औषधे सोबत ठेवा", "अधिकृत हवामान माहितीवर विश्वास ठेवा"],
      donts: ["समुद्रकिनारी फिरू नका", "विजेच्या खांबांजवळ जाऊ नका", "अफवा पसरवू नका"],
    },
    gu: {
      headline: "રેડ એલર્ટ: ઓડિશા અને બંગાળના દરિયાકાંઠે ૧૩૫ કિમી/કલાકની ઝડપે તીવ્ર વાવાઝોડું",
      action: "માછીમારી પ્રવૃત્તિઓ પર સંપૂર્ણ પ્રતિબંધ. દરિયાકાંઠાના લોકોએ તાત્કાલિક સલામત આશ્રયસ્થાનોમાં જવું.",
      regions: ["પુરી", "બાલેશ્વર", "કેન્દ્રપારા", "દીઘા"],
      hazard: "ભીષણ વાવાઝોડું",
      metrics: [{ label: "પવનની ગતિ", val: "૧૩૫ કિમી/કલાક" }, { label: "ચેતવણી", val: "તાત્કાલિક પગલાં લો" }],
      dos: ["પાકા મકાન અથવા વાવાઝોડા આશ્રય કેન્દ્રમાં રહો", "ટોર્ચ, પીવાનું પાણી અને જરૂરી દવાઓ સાથે રાખો", "સત્તાવાર રેડિયો/હવામાન સૂચનાઓ સાંભળો"],
      donts: ["દરિયાકાંઠે જશો નહીં", "તૂટેલા વીજળીના વાયરોને અડશો નહીં", "અફવાઓ પર ધ્યાન ન આપો"],
    },
    pa: {
      headline: "ਰੈੱਡ ਅਲਰਟ: ਓਡੀਸ਼ਾ ਅਤੇ ਬੰਗਾਲ ਤੱਟ ਉੱਤੇ 135 ਕਿਮੀ/ਘੰਟਾ ਦੀ ਰਫ਼ਤਾਰ ਨਾਲ ਭਿਆਨਕ ਤੂਫ਼ਾਨ",
      action: "ਮੱਛੀ ਫੜਨ 'ਤੇ ਪੂਰੀ ਪਾਬੰਦੀ। ਤੱਟਵਰਤੀ ਲੋਕ ਤੁਰੰਤ ਪੱਕੇ ਤੂਫ਼ਾਨ ਰਾਹਤ ਕੇਂਦਰਾਂ ਵਿੱਚ ਪਹੁੰਚਣ।",
      regions: ["ਪੁਰੀ", "ਬਾਲਾਸੋਰ", "ਕੇਂਦਰਪਾੜਾ", "ਦੀਘਾ"],
      hazard: "ਭਿਆਨਕ ਤੂਫ਼ਾਨ",
      metrics: [{ label: "ਹਵਾ ਰਫ਼ਤਾਰ", val: "135 ਕਿਮੀ/ਘੰਟਾ" }, { label: "ਕਾਰਵਾਈ", val: "ਤੁਰੰਤ ਕਾਰਵਾਈ ਕਰੋ" }],
      dos: ["ਪੱਕੀਆਂ ਇਮਾਰਤਾਂ ਜਾਂ ਰਾਹਤ ਕੈਂਪਾਂ ਵਿੱਚ ਰਹੋ", "ਟਾਰਚ, ਪੀਣ ਵਾਲਾ ਪਾਣੀ ਅਤੇ ਦਵਾਈਆਂ ਕੋਲ ਰੱਖੋ", "ਸਰਕਾਰੀ ਮੌਸਮ ਬੁਲੇਟਿਨ ਸੁਣੋ"],
      donts: ["ਸਮੁੰਦਰ ਕੰਢੇ ਨਾ ਜਾਓ", "ਟੁੱਟੀਆਂ ਬਿਜਲੀ ਦੀਆਂ ਤਾਰਾਂ ਨੂੰ ਨਾ ਛੂਹੋ", "ਅਫਵਾਹਾਂ ਨਾ ਫੈਲਾਓ"],
    },
    bn: {
      headline: "লাল সতর্কতা: ওড়িশা ও বাংলা উপকূলে ১৩৫ কিমি/ঘণ্টা বেগে তীব্র ঘূর্ণিঝড়",
      action: "সকল মৎস্য শিকার সম্পূর্ণ বন্ধ। উপকূলীয় বাসিন্দাদের অবিলম্বে ঘূর্ণিঝড় আশ্রয়কেন্দ্রে যাওয়ার নির্দেশ।",
      regions: ["পুরী", "বালাসোর", "কেন্দ্রাপাড়া", "দীঘা"],
      hazard: "তীব্র ঘূর্ণিঝড়",
      metrics: [{ label: "বাতাসের গতি", val: "১৩৫ কিমি/ঘণ্টা" }, { label: "সতর্কতা", val: "অবিলম্বে ব্যবস্থা নিন" }],
      dos: ["পাকা বাড়ি বা আশ্রয়কেন্দ্রে অবস্থান করুন", "টর্চ, পানীয় জল ও ওষুধ সাথে রাখুন", "সরকারি বুলেটিন শুনুন"],
      donts: ["সমুদ্র উপকূলে যাবেন না", "ছেঁড়া বিদ্যুতের তার স্পর্শ করবেন না", "গুজবে কান দেবেন না"],
    },
    te: {
      headline: "రెడ్ అలర్ట్: ఒడిశా-బెంగాల్ తీరంలో 135 కిమీ/గం తీవ్ర తుఫాను హెచ్చరిక",
      action: "మత్స్యకారుల వేటకు పూర్తి నిషేధం. తీరప్రాంత ప్రజలు వెంటనే తుఫాను పునరావాస కేంద్రాలకు వెళ్లాలి.",
      regions: ["పూరీ", "బాలాసోర్", "కేంద్రపారా", "దిఘా"],
      hazard: "తీవ్ర తుఫాను",
      metrics: [{ label: "గాలి వేగం", val: "135 కిమీ/గం" }, { label: "చర్య", val: "వెంటనే రక్షణ పొందండి" }],
      dos: ["తుఫాను షెల్టర్లలో సురక్షితంగా ఉండండి", "టార్చ్, తాగునీరు సిద్ధంగా ఉంచుకోండి", "అధికారిక హెచ్చరికలు పాటించండి"],
      donts: ["సముద్ర తీరానికి వెళ్లవద్దు", "తెగిపడిన విద్యుత్ తీగలను తాకవద్దు", "వదంతులను నమ్మవద్దు"],
    },
    ta: {
      headline: "சிவப்பு எச்சரிக்கை: ஒடிசா-வங்காள கடற்கரையில் 135 கிமீ/மணி வேகத்தில் தீவிர புயல்",
      action: "மீன்பிடிக்க முழு தடை. கடலோர மக்கள் உடனடியாக புயல் பாதுகாப்பு முகாம்களுக்கு செல்லவும்.",
      regions: ["பூரி", "பாலசோர்", "கேந்திரபாரா", "திகா"],
      hazard: "தீவிர புயல்",
      metrics: [{ label: "காற்றின் வேகம்", val: "135 கிமீ/மணி" }, { label: "செயல்", val: "உடனடி நடவடிக்கை" }],
      dos: ["பாதுகாப்பு முகாம்களில் தங்கவும்", "டார்ச் மற்றும் குடிநீர் கைவசம் வைக்கவும்", "அரசு வானிலை செய்திகளை கேட்கவும்"],
      donts: ["கடற்கரைக்கு செல்ல வேண்டாம்", "மின்கம்பிகளை தொட வேண்டாம்", "வதந்திகளை நம்பாதீர்கள்"],
    },
  },
  "IMD-AL-2024-09-02": {
    hi: {
      headline: "ऑरेंज अलर्ट: मुंबई और कोंकण में 115+ मिमी भारी बारिश से अचानक बाढ़ व जलभराव",
      action: "जलभराव वाले अंडरपास और रेलवे ट्रैक से दूर रहें। बहुत जरूरी न हो तो घर से बाहर न निकलें।",
      regions: ["मुंबई", "ठाणे", "रायगढ़", "रत्नागिरी"],
      hazard: "अचानक बाढ़ / भारी बारिश",
      metrics: [{ label: "वर्षा", val: "115+ मिमी" }, { label: "जोखिम", val: "तैयार रहें (Be Prepared)" }],
      dos: ["घर के अंदर सुरक्षित रहें", "मोबाइल फोन व पावर बैंक चार्ज रखें", "गाड़ी पानी भरे रास्तों पर न चलाएं"],
      donts: ["बाढ़ के पानी में पैदल न चलें", "बिजली के ट्रांसफार्मर के पास न खड़े हों", "नालों के पास न जाएं"],
    },
    en: {
      headline: "Orange Alert: Heavy rainfall (>115mm) triggering flash floods in Mumbai & Konkan belt",
      action: "Avoid waterlogged subways and low-lying railway tracks. Follow local ward advisories.",
      regions: ["Mumbai", "Thane", "Raigad", "Ratnagiri"],
      hazard: "Flash Flood / Heavy Rain",
      metrics: [{ label: "Rainfall", val: ">115 mm" }, { label: "Risk Level", val: "Be Prepared" }],
      dos: ["Stay indoors on higher floors", "Keep phone and emergency power bank charged", "Follow BMC ward guidelines"],
      donts: ["Do not drive through flooded underpasses", "Do not walk in flowing floodwater", "Stay clear of open storm drains"],
    },
    mr: {
      headline: "ऑरेंज अलर्ट: मुंबई आणि कोकण पट्ट्यात ११५+ मिमी मुसळधार पाऊस व पूरस्थिती",
      action: "पाणी साचलेल्या सबवे व रेल्वे रुळांजवळ जाणे टाळा. महापालिका व आपत्कालीन सूचनांचे पालन करा.",
      regions: ["मुंबई", "ठाणे", "रायगड", "रत्नागिरी"],
      hazard: "मुसळधार पाऊस व पूर",
      metrics: [{ label: "पाऊस", val: "११५+ मिमी" }, { label: "इशारा", val: "सज्ज राहा (Be Prepared)" }],
      dos: ["घरात सुरक्षित राहा", "मोबाईल व बॅटरी चार्ज ठेवा", "स्थानिक प्रशासनाचे निर्देश पाळा"],
      donts: ["पाणी साचलेल्या रस्त्यांवर वाहने चालवू नका", "विद्युत खांबांजवळ उभे राहू नका", "उघड्या गटारांजवळ जाऊ नका"],
    },
    gu: {
      headline: "ઓરેન્જ એલર્ટ: મુંબઈ અને કોંકણ પટ્ટામાં ૧૧૫+ મીમી ભારે વરસાદથી પૂરની ચેતવણી",
      action: "પાણી ભરાયેલા અંડરપાસ અને નીચાણવાળા રેલવે ટ્રેકથી દૂર રહો. જરૂરી હોય તો જ બહાર નીકળવું.",
      regions: ["મુંબઈ", "થાણે", "રાયગઢ", "રત્નાગિરી"],
      hazard: "ભારે વરસાદ અને પૂર",
      metrics: [{ label: "વરસાદ", val: "૧૧૫+ મીમી" }, { label: "તકેદારી", val: "તૈયાર રહો" }],
      dos: ["ઘરમાં સુરક્ષિત રહો", "મોબાઈલ ચાર્જ રાખો", "સ્થાનિક પ્રશાસનની સલાહ અનુસરો"],
      donts: ["પાણી ભરાયેલા રસ્તાઓ પર વાહન ન ચલાવો", "વીજળીના થાંભલાઓથી દૂર રહો", "ખુલ્લી ગટરો પાસે ન જવું"],
    },
    pa: {
      headline: "ਓਰੇਂਜ ਅਲਰਟ: ਮੁੰਬਈ ਅਤੇ ਕੋਂਕਣ ਵਿੱਚ 115+ ਮਿਮੀ ਭਾਰੀ ਬਾਰਿਸ਼ ਕਾਰਨ ਅਚਾਨਕ ਹੜ੍ਹ ਦਾ ਖ਼ਤਰਾ",
      action: "ਪਾਣੀ ਭਰੇ ਅੰਡਰਪਾਸਾਂ ਅਤੇ ਨੀਵੇਂ ਰੇਲਵੇ ਟਰੈਕਾਂ ਤੋਂ ਦੂਰ ਰਹੋ। ਸਥਾਨਕ ਪ੍ਰਸ਼ਾਸਨ ਦੀਆਂ ਹਦਾਇਤਾਂ ਮੰਨੋ।",
      regions: ["ਮੁੰਬਈ", "ਠਾਣੇ", "ਰਾਇਗੜ੍ਹ", "ਰਤਨਾਗਿਰੀ"],
      hazard: "ਭਾਰੀ ਬਾਰਿਸ਼ ਤੇ ਹੜ੍ਹ",
      metrics: [{ label: "ਮੀਂਹ", val: "115+ ਮਿਮੀ" }, { label: "ਸਾਵਧਾਨੀ", val: "ਤਿਆਰ ਰਹੋ" }],
      dos: ["ਘਰ ਦੇ ਅੰਦਰ ਸੁਰੱਖਿਅਤ ਰਹੋ", "ਫ਼ੋਨ ਚਾਰਜ ਰੱਖੋ", "ਪ੍ਰਸ਼ਾਸਨ ਦੀਆਂ ਹਦਾਇਤਾਂ ਮੰਨੋ"],
      donts: ["ਪਾਣੀ ਭਰੀਆਂ ਸੜਕਾਂ 'ਤੇ ਗੱਡੀ ਨਾ ਚਲਾਓ", "ਬਿਜਲੀ ਦੇ ਖੰਭਿਆਂ ਨੇੜੇ ਨਾ ਖੜ੍ਹੋ", "ਖੁੱਲ੍ਹੇ ਨਾਲਿਆਂ ਤੋਂ ਦੂਰ ਰਹੋ"],
    },
    bn: {
      headline: "কমলা সতর্কতা: মুম্বাই ও কোঙ্কন উপকূলে ১১৫+ মিমি প্রবল বৃষ্টি ও আকস্মিক বন্যা",
      action: "জলমগ্ন আন্ডারপাস এবং নিচু রেললাইন এড়িয়ে চলুন। জরুরি প্রয়োজন ছাড়া বাইরে বের হবেন না।",
      regions: ["মুম্বাই", "থানে", "রায়গড়", "রত্নগিরি"],
      hazard: "আকস্মিক বন্যা",
      metrics: [{ label: "বৃষ্টিপাত", val: "১১৫+ মিমি" }, { label: "সতর্কতা", val: "প্রস্তুত থাকুন" }],
      dos: ["বাড়ির ভেতরে নিরাপদে থাকুন", "মোবাইল ও চার্জার প্রস্তুত রাখুন", "পৌরসভার নির্দেশ মানুন"],
      donts: ["জলমগ্ন রাস্তায় গাড়ি চালাবেন না", "বিদ্যুতের খুঁটির পাশে দাঁড়াবেন না", "খোলা নর্দমা এড়িয়ে চলুন"],
    },
    te: {
      headline: "ఆరెంజ్ అలర్ట్: ముంబై, కొంకణ్ ప్రాంతంలో 115+ మిమీ భారీ వర్షం మరియు ఆకస్మిక వరదలు",
      action: "నీరు నిలిచిన అండర్‌పాస్‌లు, లోతట్టు రైల్వే ట్రాక్‌ల వద్దకు వెళ్లకండి. ఇంట్లోనే సురక్షితంగా ఉండండి.",
      regions: ["ముంబై", "థాణే", "రాయ్‌గఢ్", "రత్నగిరి"],
      hazard: "భారీ వర్షం / వరదలు",
      metrics: [{ label: "వర్షపాతం", val: "115+ మిమీ" }, { label: "అప్రమత్తత", val: "సిద్ధంగా ఉండండి" }],
      dos: ["ఇళ్లలోనే సురక్షితంగా ఉండండి", "ఫోన్ ఛార్జ్ చేసి ఉంచండి", "మునిసిపల్ సూచనలు పాటించండి"],
      donts: ["వరద నీటిలో వాహనాలు నడపవద్దు", "విద్యుత్ స్తంభాల దగ్గర నిలబడవద్దు", "తెరిచిన డ్రైనేజీలకు దూరంగా ఉండండి"],
    },
    ta: {
      headline: "ஆரஞ்சு எச்சரிக்கை: மும்பை மற்றும் கொங்கண் பகுதியில் 115+ மிமீ கனமழை மற்றும் திடீர் வெள்ளம்",
      action: "தண்ணீர் தேங்கிய சுரங்கப்பாதைகள் மற்றும் தாழ்வான ரயில் பாதைகளைத் தவிர்க்கவும். எச்சரிக்கையாக இருங்கள்.",
      regions: ["மும்பை", "தானே", "ராய்கட்", "ரத்னகிரி"],
      hazard: "கனமழை / வெள்ளம்",
      metrics: [{ label: "மழை அளவு", val: "115+ மிமீ" }, { label: "நிலை", val: "தயாராக இருங்கள்" }],
      dos: ["வீட்டிலேயே பாதுகாப்பாக இருக்கவும்", "மொபைலை சார்ஜ் செய்து வைக்கவும்", "அரசு அறிவுரைகளைப் பின்பற்றவும்"],
      donts: ["வெள்ள நீரில் வாகனங்களை ஓட்டாதீர்கள்", "மின் கம்பங்கள் அருகே நிற்காதீர்கள்", "திறந்த சாக்கடைகளை தவிர்க்கவும்"],
    },
  },
  "IMD-AL-2024-09-03": {
    hi: {
      headline: "हीटवेव चेतावनी: पश्चिमी राजस्थान में भीषण लू, तापमान 44°C के पार",
      action: "दोपहर 12 से 3:30 बजे तक सीधी धूप से बचें। ओआरएस, नींबू पानी या छाछ पीकर शरीर में पानी बनाए रखें।",
      regions: ["जैसलमेर", "बीकानेर", "बाड़मेर", "जोधपुर"],
      hazard: "भीषण लू (Heatwave)",
      metrics: [{ label: "तापमान", val: "44°C+" }, { label: "लू खतरा", val: "सतर्क रहें" }],
      dos: ["हल्के, ढीले और सूती कपड़े पहनें", "सिर को टोपी, कपड़े या छाते से ढकें", "खूब पानी और तरल पदार्थ पिएं"],
      donts: ["दोपहर 12 से 3:30 तक कड़ी धूप में न निकलें", "चाय, कॉफी या शराब का अधिक सेवन न करें", "बच्चों को बंद गाड़ी में अकेला न छोड़ें"],
    },
    en: {
      headline: "Heatwave Warning: Severe temperatures exceeding 44°C across Western Rajasthan",
      action: "Avoid direct sun exposure between 12:00 PM and 3:30 PM. Drink plenty of water, ORS, and fluids.",
      regions: ["Jaisalmer", "Bikaner", "Barmer", "Jodhpur"],
      hazard: "Severe Heatwave",
      metrics: [{ label: "Max Temp", val: "44°C+" }, { label: "Safety", val: "Stay Hydrated" }],
      dos: ["Wear light-colored, loose cotton clothes", "Cover head with a cap, cloth or umbrella", "Drink water and ORS frequently"],
      donts: ["Avoid intense outdoor labor between 12-3:30 PM", "Do not consume excessive tea or coffee", "Never leave kids or pets in parked cars"],
    },
    mr: {
      headline: "उष्णतेची लाट इशारा: पश्चिम राजस्थानमध्ये तापमान ४४°C पार, तीव्र उन्हाची झळ",
      action: "दुपारी १२ ते ३:३० दरम्यान कडक उन्हात जाणे टाळा. भरपूर पाणी, लिंबू सरबत किंवा ताक प्या.",
      regions: ["जैसलमेर", "बिकानेर", "बाडमेर", "जोधपूर"],
      hazard: "उष्णतेची लाट",
      metrics: [{ label: "तापमान", val: "४४°C+" }, { label: "सल्ला", val: "हायड्रेटेड राहा" }],
      dos: ["हलके सुती कपडे वापरा", "डोक्यावर टोपी किंवा रुमाल बांधा", "दिवसभरात भरपूर पाणी प्या"],
      donts: ["दुपारी १२ ते ३:३० उन्हात फिरू नका", "गरम चहा, कॉफी टाळा", "लहान मुलांना बंद गाडीत ठेवू नका"],
    },
    gu: {
      headline: "હીટવેવ ચેતવણી: પશ્ચિમ રાજસ્થાનમાં તાપમાન ૪૪°C ને પાર, ભારે લૂનો પ્રકોપ",
      action: "બપોરે ૧૨ થી ૩:૩૦ વાગ્યા સુધી સીધા તડકામાં જવાનું ટાળો. પૂરતું પાણી, છાશ અને લીંબુ પાણી પીવો.",
      regions: ["જેસલમેર", "બિકાનેર", "બાડમેર", "જોધપુર"],
      hazard: "ભારે લૂ (હીટવેવ)",
      metrics: [{ label: "તાપમાન", val: "૪૪°C+" }, { label: "સાવચેતી", val: "હાઇડ્રેટેડ રહો" }],
      dos: ["હળવા સુતરાઉ કપડાં પહેરો", "માથું રૂમાલ કે ટોપીથી ઢાંકો", "વારંવાર પાણી અને છાશ પીવો"],
      donts: ["બપોરે તડકામાં ભારે મહેનત ન કરો", "વધુ પડતી ચા કે કોફી ટાળો", "બાળકોને બંધ કારમાં ન છોડો"],
    },
    pa: {
      headline: "ਗਰਮੀ ਦੀ ਲਹਿਰ ਚੇਤਾਵਨੀ: ਪੱਛਮੀ ਰਾਜਸਥਾਨ ਵਿੱਚ ਤਾਪਮਾਨ 44°C ਤੋਂ ਪਾਰ, ਲੂ ਦਾ ਪ੍ਰਕੋਪ",
      action: "ਦੁਪਹਿਰ 12 ਤੋਂ 3:30 ਵਜੇ ਤੱਕ ਸਿੱਧੀ ਧੁੱਪ ਤੋਂ ਬਚੋ। ਵੱਧ ਤੋਂ ਵੱਧ ਪਾਣੀ, ਲੱਸੀ ਅਤੇ ਨਿੰਬੂ ਪਾਣੀ ਪੀਓ।",
      regions: ["ਜੈਸਲਮੇਰ", "ਬੀਕਾਨੇਰ", "ਬਾੜਮੇਰ", "ਜੋਧਪੁਰ"],
      hazard: "ਭਿਆਨਕ ਗਰਮੀ",
      metrics: [{ label: "ਤਾਪਮਾਨ", val: "44°C+" }, { label: "ਸਲਾਹ", val: "ਪਾਣੀ ਪੀਂਦੇ ਰਹੋ" }],
      dos: ["ਹਲਕੇ ਸੂਤੀ ਕੱਪੜੇ ਪਹਿਨੋ", "ਸਿਰ ਨੂੰ ਕੱਪੜੇ ਜਾਂ ਟੋਪੀ ਨਾਲ ਢੱਕੋ", "ਪਾਣੀ ਅਤੇ ਤਰਲ ਪਦਾਰਥ ਵੱਧ ਪੀਓ"],
      donts: ["ਦੁਪਹਿਰ ਨੂੰ ਸਿੱਧੀ ਧੁੱਪ ਵਿੱਚ ਨਾ ਨਿਕਲੋ", "ਬਹੁਤੀ ਚਾਹ ਜਾਂ ਕੌਫੀ ਨਾ ਪੀਓ", "ਬੱਚਿਆਂ ਨੂੰ ਬੰਦ ਗੱਡੀ ਵਿੱਚ ਨਾ ਛੱਡੋ"],
    },
    bn: {
      headline: "তীব্র তাপপ্রবাহ সতর্কতা: পশ্চিম রাজস্থানে তাপমাত্রা ৪৪°C অতিক্রম করেছে",
      action: "দুপুর ১২টা থেকে ৩:৩০টা পর্যন্ত সরাসরি রোদে বের হবেন না। প্রচুর জল ও স্যালাইন পান করুন।",
      regions: ["জয়সলমীর", "বিকানের", "বারমের", "যোধপুর"],
      hazard: "তীব্র তাপপ্রবাহ",
      metrics: [{ label: "তাপমাত্রা", val: "৪৪°C+" }, { label: "পরামর্শ", val: "হাইড্রেটেড থাকুন" }],
      dos: ["হালকা সুতির পোশাক পরুন", "মাথা টুপি বা ছাতা দিয়ে ঢাকুন", "প্রচুর জল ও ডাবের জল খান"],
      donts: ["দুপুরে ভারী পরিশ্রমের কাজ করবেন না", "অতিরিক্ত চা-কফি এড়িয়ে চলুন", "গাড়িতে শিশুদের একা রাখবেন না"],
    },
    te: {
      headline: "తీవ్ర వడగాల్పుల హెచ్చరిక: పశ్చిమ రాజస్థాన్‌లో 44°C దాటిన ఉష్ణోగ్రతలు",
      action: "మధ్యాహ్నం 12 నుండి 3:30 వరకు ఎండలో తిరగవద్దు. పుష్కలంగా నీరు, నిమ్మరసం తాగండి.",
      regions: ["జైసల్మేర్", "బికనీర్", "బార్మర్", "జోధ్‌పూర్"],
      hazard: "వడగాల్పులు",
      metrics: [{ label: "ఉష్ణోగ్రత", val: "44°C+" }, { label: "జాగ్రత్త", val: "నీరు ఎక్కువగా తాగండి" }],
      dos: ["లేత రంగు కాటన్ దుస్తులు ధరించండి", "తలకి గొడుగు లేదా టోపీ వాడండి", "నీరు, ఓఆర్ఎస్ ఎక్కువగా తాగండి"],
      donts: ["మధ్యాహ్నం తీవ్ర ఎండలో శ్రమించవద్దు", "టీ, కాఫీలు ఎక్కువగా తాగవద్దు", "పిల్లలను కార్లలో ఒంటరిగా ఉంచవద్దు"],
    },
    ta: {
      headline: "கடும் வெப்ப அலை எச்சரிக்கை: மேற்கு ராஜஸ்தானில் வெப்பநிலை 44°C தாண்டியது",
      action: "நண்பகல் 12 மணி முதல் பிற்பகல் 3:30 மணி வரை வெயிலில் செல்வதைத் தவிர்க்கவும். அதிக நீர் அருந்தவும்.",
      regions: ["ஜெய்சல்மேர்", "பிகானேர்", "பார்மர்", "ஜோத்பூர்"],
      hazard: "வெப்ப அலை",
      metrics: [{ label: "வெப்பநிலை", val: "44°C+" }, { label: "ஆலோசனை", val: "நீர்ச்சத்து பேணுங்கள்" }],
      dos: ["மெல்லிய பருத்தி ஆடைகளை அணியுங்கள்", "குடை அல்லது தொப்பி அணியுங்கள்", "நீர், மோர் அதிகமாக குடியுங்கள்"],
      donts: ["நண்பகலில் கடும் வெயிலில் வேலை செய்வதை தவிர்க்கவும்", "தேநீர், காபி அதிகம் குடிக்க வேண்டாம்", "குழந்தைகளை பூட்டிய காரில் விடாதீர்கள்"],
    },
  },
  "IMD-AL-2024-09-04": {
    hi: {
      headline: "तटीय चेतावनी: तमिलनाडु तट (रामेश्वरम, कन्याकुमारी) पर 55 किमी/घंटे की तूफानी हवाएं",
      action: "मछुआरों को समुद्र में 25 नॉटिकल मील से आगे न जाने की सख्त सलाह दी जाती है। नावें सुरक्षित किनारे बांधें।",
      regions: ["रामेश्वरम", "थूथुकुडी", "कन्याकुमारी"],
      hazard: "तटीय तूफानी हवाएं (Squall)",
      metrics: [{ label: "हवा गति", val: "55 किमी/घंटा" }, { label: "दूरी सीमा", val: "25 नॉटिकल मील" }],
      dos: ["नावों को सुरक्षित किनारे पर मजबूत रस्सियों से बांधें", "रेडियो और तटीय वायरलेस पर संपर्क बनाए रखें", "स्थानीय बंदरगाह चेतावनी झंडे देखें"],
      donts: ["25 नॉटिकल मील से आगे समुद्र में न जाएं", "अकेले नाव लेकर न निकलें", "खराब मौसम में तैरने न उतरें"],
    },
    en: {
      headline: "Coastal Warning: Strong squall winds up to 55 km/h along Tamil Nadu Coast",
      action: "Fishermen strictly advised not to venture beyond 25 nautical miles offshore. Moor boats securely.",
      regions: ["Rameswaram", "Thoothukudi", "Kanyakumari"],
      hazard: "Coastal Squall",
      metrics: [{ label: "Wind Speed", val: "55 km/h" }, { label: "Offshore Limit", val: "25 NM" }],
      dos: ["Moor fishing boats securely to jetty", "Keep marine VHF radios tuned to Channel 16", "Check port weather warning signals"],
      donts: ["Do not venture into deep sea (>25 NM)", "Do not ignore squall alerts", "Avoid small non-motorized catamarans"],
    },
    mr: {
      headline: "सागरी इशारा: तमिळनाडू किनारपट्टीवर (रामेश्वरम, कन्याकुमारी) ५५ किमी/तास वेगाने वादळी वारे",
      action: "मच्छीमारांनी समुद्रात २५ नॉटिकल मैलांपेक्षा पुढे जाऊ नये. नौका सुरक्षित स्थळी बांधून ठेवाव्यात.",
      regions: ["रामेश्वरम", "थूथुकुडी", "कन्याकुमारी"],
      hazard: "वादळी वारे (Squall)",
      metrics: [{ label: "वाऱ्याचा वेग", val: "५५ किमी/तास" }, { label: "मर्यादा", val: "२५ नॉटिकल मैल" }],
      dos: ["नौका बंदरात घट्ट बांधून ठेवा", "सागरी वायरलेस संपर्कात राहा", "स्थानिक बंदराचे इशारे तपासा"],
      donts: ["खोल समुद्रात जाऊ नका", "वादळी वाऱ्यांकडे दुर्लक्ष करू नका", "समुद्रात पोहण्यास जाऊ नका"],
    },
    gu: {
      headline: "દરિયાકાંઠા ચેતવણી: તમિલનાડુ તટે (રામેશ્વરમ, કન્યાકુમારી) ૫૫ કિમી/કલાકના તોફાની પવનો",
      action: "માછીમારોને દરિયામાં ૨૫ નોટિકલ માઈલથી આગળ ન જવાની સખત સલાહ. બોટ સુરક્ષિત રીતે બાંધવી.",
      regions: ["રામેશ્વરમ", "થૂથુકુડી", "કન્યાકુમારી"],
      hazard: "તોફાની પવન (Squall)",
      metrics: [{ label: "પવનની ગતિ", val: "૫૫ કિમી/કલાક" }, { label: "અંતર મર્યાદા", val: "૨૫ નોટિકલ માઇલ" }],
      dos: ["બોટને જેટી પર મજબૂત રીતે બાંધો", "વાયરલેસ અને રેડિયો ચાલુ રાખો", "બંદરના ચેતવણી સિગ્નલ તપાસો"],
      donts: ["ઊંડા દરિયામાં ન જશો", "તોફાનની ચેતવણીને અવગણશો નહીં", "દરિયામાં નહાવા ન જવું"],
    },
    pa: {
      headline: "ਤੱਟਵਰਤੀ ਚੇਤਾਵਨੀ: ਤਾਮਿਲਨਾਡੂ ਤੱਟ (ਰਾਮੇਸ਼ਵਰਮ, ਕੰਨਿਆਕੁਮਾਰੀ) 'ਤੇ 55 ਕਿਮੀ/ਘੰਟਾ ਦੀ ਰਫ਼ਤਾਰ ਨਾਲ ਤੇਜ਼ ਹਵਾਵਾਂ",
      action: "ਮਛੇਰਿਆਂ ਨੂੰ ਤੱਟ ਤੋਂ 25 ਨੌਟੀਕਲ ਮੀਲ ਤੋਂ ਅੱਗੇ ਨਾ ਜਾਣ ਦੀ ਸਖ਼ਤ ਹਦਾਇਤ। ਕਿਸ਼ਤੀਆਂ ਸੁਰੱਖਿਅਤ ਬੰਨ੍ਹੋ।",
      regions: ["ਰਾਮੇਸ਼ਵਰਮ", "ਥੂਥੁਕੁਡੀ", "ਕੰਨਿਆਕੁਮਾਰੀ"],
      hazard: "ਤੇਜ਼ ਤੱਟਵਰਤੀ ਹਵਾਵਾਂ",
      metrics: [{ label: "ਹਵਾ ਰਫ਼ਤਾਰ", val: "55 ਕਿਮੀ/ਘੰਟਾ" }, { label: "ਸੀਮਾ", val: "25 ਨੌਟੀਕਲ ਮੀਲ" }],
      dos: ["ਕਿਸ਼ਤੀਆਂ ਨੂੰ ਕਿਨਾਰੇ 'ਤੇ ਮਜ਼ਬੂਤੀ ਨਾਲ ਬੰਨ੍ਹੋ", "ਵਾਇਰਲੈੱਸ ਅਤੇ ਰੇਡੀਓ ਸੁਣਦੇ ਰਹੋ", "ਬੰਦਰਗਾਹ ਦੇ ਸੰਕੇਤ ਚੈੱਕ ਕਰੋ"],
      donts: ["ਡੂੰਘੇ ਸਮੁੰਦਰ ਵਿੱਚ ਨਾ ਜਾਓ", "ਮੌਸਮੀ ਚੇਤਾਵਨੀ ਨੂੰ ਅਣਡਿੱਠ ਨਾ ਕਰੋ", "ਖ਼ਰਾਬ ਮੌਸਮ ਵਿੱਚ ਤੈਰਨ ਨਾ ਉਤਰੋ"],
    },
    bn: {
      headline: "উপকূলীয় সতর্কতা: তামিলনাড়ু উপকূলে (রামেশ্বরম, কন্যাকুমারী) ৫৫ কিমি/ঘণ্টা বেগে ঝোড়ো হাওয়া",
      action: "মৎস্যজীবীদের সমুদ্রতট থেকে ২৫ নটিক্যাল মাইলের বেশি দূরে না যাওয়ার কড়া নির্দেশ। ট্রলার নিরাপদে রাখুন।",
      regions: ["রামেশ্বরম", "তুতিকোরিন", "কন্যাকুমারী"],
      hazard: "উপকূলীয় স্কোয়াল",
      metrics: [{ label: "বাতাসের গতি", val: "৫৫ কিমি/ঘণ্টা" }, { label: "দূরত্ব সীমা", val: "২৫ নটিক্যাল মাইল" }],
      dos: ["নৌকা ও ট্রলার শক্ত করে বেঁধে রাখুন", "মেরিন রেডিওতে সংযোগ রাখুন", "বন্দরের সংকেত লক্ষ্য করুন"],
      donts: ["গভীর সমুদ্রে যাবেন না", "ঝোড়ো হাওয়ার সতর্কতা অবহেলা করবেন না", "সমুদ্রে নামবেন না"],
    },
    te: {
      headline: "తీరప్రాంత హెచ్చరిక: తమిళనాడు తీరంలో (రామేశ్వరం, కన్యాకుమారి) 55 కిమీ/గం ఈదురుగాలులు",
      action: "మత్స్యకారులు తీరం నుండి 25 నాటికల్ మైళ్ళకు మించి సముద్రంలోకి వెళ్లవద్దు. పడవలను సురక్షితంగా ఉంచండి.",
      regions: ["రామేశ్వరం", "తూత్తుకుడి", "కన్యాకుమారి"],
      hazard: "ఈదురు గాలులు (Squall)",
      metrics: [{ label: "గాలి వేగం", val: "55 కిమీ/గం" }, { label: "పరిమితి", val: "25 నాటికల్ మైళ్ళు" }],
      dos: ["పడవలను తీరంలో సురక్షితంగా కట్టివేయండి", "వైర్‌లెస్ రేడియోను గమనించండి", "ఓడరేవు సిగ్నల్స్ పాటించండి"],
      donts: ["లోతైన సముద్రంలోకి వెళ్లవద్దు", "తుఫాను హెచ్చరికను తేలికగా తీసుకోవద్దు", "ఈత కొట్టవద్దు"],
    },
    ta: {
      headline: "கடலோர எச்சரிக்கை: மன்னார் வளைகுடா & பாக் ஜலசந்தியில் 55 கிமீ/மணி வேகத்தில் பலத்த காற்று",
      action: "மீனவர்கள் 25 கடல் மைல்களுக்கு அப்பால் செல்ல வேண்டாம் என எச்சரிக்கப்படுகிறார்கள். படகுகளைப் பாதுகாக்கவும்.",
      regions: ["ராமேஸ்வரம்", "தூத்துக்குடி", "கன்னியாகுமரி"],
      hazard: "கடலோர பலத்த காற்று (Squall)",
      metrics: [{ label: "காற்றின் வேகம்", val: "55 கிமீ/மணி" }, { label: "எல்லை", val: "25 கடல் மைல்" }],
      dos: ["படகுகளை கரையில் பாதுகாப்பாகக் கட்டுங்கள்", "வானொலிச் செய்திகளைத் தொடர்ந்து கேளுங்கள்", "துறைமுக எச்சரிக்கை கொடிகளைக் கவனியுங்கள்"],
      donts: ["ஆழ்கடலுக்குச் செல்ல வேண்டாம்", "எச்சரிக்கையை புறக்கணிக்காதீர்கள்", "கடலில் நீந்த இறங்காதீர்கள்"],
    },
  },
}

const UI_TEXT: Record<AlertLang, {
  source: string
  affected: string
  action: string
  helpline: string
  protocols: string
  listen: string
  stop: string
  alertLabel: { Red: string; Orange: string; Yellow: string }
  modalTitle: string
  closeModal: string
  dos: string
  donts: string
}> = {
  hi: {
    source: "स्रोत: मौसम विभाग (IMD) / तटीय चेतावनी",
    affected: "प्रभावित जिले व क्षेत्र:",
    action: "तुरंत सुरक्षा निर्देश (Action Plan):",
    helpline: "1070 / 112 (आपदा हेल्पलाइन)",
    protocols: "सुरक्षा नियम देखें",
    listen: "बोलकर सुनें",
    stop: "आवाज़ रोकें",
    alertLabel: {
      Red: "🔴 रेड अलर्ट · तुरंत कार्रवाई (Take Action)",
      Orange: "🟠 ऑरेंज अलर्ट · तैयार रहें (Be Prepared)",
      Yellow: "🟡 येलो अलर्ट · सतर्क रहें (Be Updated)",
    },
    modalTitle: "आपदा सुरक्षा नियम (NDMA Guidelines)",
    closeModal: "समझ गया, बंद करें",
    dos: "क्या करें (Safety Dos):",
    donts: "क्या न करें (Safety Don'ts):",
  },
  en: {
    source: "Source: IMD / Disaster Early Warning",
    affected: "Affected Districts & Zones:",
    action: "Immediate Action Plan:",
    helpline: "1070 / 112 (Disaster Helpline)",
    protocols: "View Protocols",
    listen: "Listen Voice",
    stop: "Stop Voice",
    alertLabel: {
      Red: "🔴 RED ALERT · Take Action",
      Orange: "🟠 ORANGE ALERT · Be Prepared",
      Yellow: "🟡 YELLOW ALERT · Be Updated",
    },
    modalTitle: "Disaster Safety Protocols (NDMA Guidelines)",
    closeModal: "Acknowledge & Close",
    dos: "Safety Dos:",
    donts: "Safety Don'ts:",
  },
  mr: {
    source: "स्रोत: हवामान विभाग (IMD) आपत्ती पूर्वसूचना",
    affected: "प्रभावित जिल्हे व क्षेत्रे:",
    action: "तातडीची सुरक्षा कृती (Action Plan):",
    helpline: "1070 / 112 (आपत्ती मदत कक्ष)",
    protocols: "सुरक्षा नियम पहा",
    listen: "ऐका (Voice)",
    stop: "थांबवा",
    alertLabel: {
      Red: "🔴 रेड अलर्ट · तातडीने कृती करा",
      Orange: "🟠 ऑरेंज अलर्ट · सज्ज राहा",
      Yellow: "🟡 येलो अलर्ट · सतर्क राहा",
    },
    modalTitle: "आपत्ती सुरक्षा नियम (NDMA Guidelines)",
    closeModal: "समजले, बंद करा",
    dos: "काय करावे (Safety Dos):",
    donts: "काय करू नये (Safety Don'ts):",
  },
  gu: {
    source: "સ્ત્રોત: હવામાન વિભાગ (IMD) આપત્તિ ચેતવણી",
    affected: "અસરગ્રસ્ત વિસ્તારો / જિલ્લાઓ:",
    action: "તાત્કાલિક સુરક્ષા યોજના (Action Plan):",
    helpline: "1070 / 112 (આપત્તિ હેલ્પલાઇન)",
    protocols: "સુરક્ષા નિયમો જુઓ",
    listen: "સાંભળો (Voice)",
    stop: "રોકો",
    alertLabel: {
      Red: "🔴 રેડ એલર્ટ · તાત્કાલિક પગલાં લો",
      Orange: "🟠 ઓરેન્જ એલર્ટ · તૈયાર રહો",
      Yellow: "🟡 યલો એલર્ટ · સતર્ક રહો",
    },
    modalTitle: "આપત્તિ સુરક્ષા પ્રોટોકોલ (NDMA Guidelines)",
    closeModal: "સમજાયું, બંધ કરો",
    dos: "શું કરવું (Safety Dos):",
    donts: "શું ન કરવું (Safety Don'ts):",
  },
  pa: {
    source: "ਸਰੋਤ: ਮੌਸਮ ਵਿਭਾਗ (IMD) ਆਫ਼ਤ ਚੇਤਾਵਨੀ",
    affected: "ਪ੍ਰਭਾਵਿਤ ਜ਼ਿਲ੍ਹੇ:",
    action: "ਤੁਰੰਤ ਸੁਰੱਖਿਆ ਕਾਰਵਾਈ (Action Plan):",
    helpline: "1070 / 112 (ਆਫ਼ਤ ਹੈਲਪਲਾਈਨ)",
    protocols: "ਸੁਰੱਖਿਆ ਨਿਯਮ ਦੇਖੋ",
    listen: "ਸੁਣੋ (Voice)",
    stop: "ਰੋਕੋ",
    alertLabel: {
      Red: "🔴 ਰੈੱਡ ਅਲਰਟ · ਤੁਰੰਤ ਕਾਰਵਾਈ ਕਰੋ",
      Orange: "🟠 ਓਰੇਂਜ ਅਲਰਟ · ਤਿਆਰ ਰਹੋ",
      Yellow: "🟡 ਯੈਲੋ ਅਲਰਟ · ਸੁਚੇਤ ਰਹੋ",
    },
    modalTitle: "ਆਫ਼ਤ ਸੁਰੱਖਿਆ ਪ੍ਰੋਟੋਕੋਲ (NDMA Guidelines)",
    closeModal: "ਸਮਝਿਆ, ਬੰਦ ਕਰੋ",
    dos: "ਕੀ ਕਰਨਾ ਹੈ (Safety Dos):",
    donts: "ਕੀ ਨਹੀਂ ਕਰਨਾ (Safety Don'ts):",
  },
  bn: {
    source: "উৎস: আবহাওয়া দপ্তর (IMD) দুর্যোগ সতর্কতা",
    affected: "আক্রান্ত জেলাসমূহ:",
    action: "জরুরি সুরক্ষা নির্দেশিকা (Action Plan):",
    helpline: "1070 / 112 (দুর্যোগ হেল্পলাইন)",
    protocols: "সুরক্ষা নির্দেশ দেখুন",
    listen: "ভয়েস শুনুন",
    stop: "থামান",
    alertLabel: {
      Red: "🔴 লাল সতর্কতা · অবিলম্বে ব্যবস্থা নিন",
      Orange: "🟠 কমলা সতর্কতা · প্রস্তুত থাকুন",
      Yellow: "🟡 হলুদ সতর্কতা · সতর্ক থাকুন",
    },
    modalTitle: "দুর্যোগ নিরাপত্তা নির্দেশিকা (NDMA)",
    closeModal: "বুঝলাম, বন্ধ করুন",
    dos: "করণীয় (Safety Dos):",
    donts: "বর্জনীয় (Safety Don'ts):",
  },
  te: {
    source: "మూలం: వాతావరణ శాఖ (IMD) విపత్తు హెచ్చరిక",
    affected: "ప్రభావిత ప్రాంతాలు/జిల్లాలు:",
    action: "తక్షణ భద్రతా ప్రణాళిక (Action Plan):",
    helpline: "1070 / 112 (విపత్తు హెల్ప్‌లైన్)",
    protocols: "భద్రతా నిబంధనలు",
    listen: "వినండి (Voice)",
    stop: "ఆపండి",
    alertLabel: {
      Red: "🔴 రెడ్ అలర్ట్ · వెంటనే రక్షణ పొందండి",
      Orange: "🟠 ఆరెంజ్ అలర్ట్ · సిద్ధంగా ఉండండి",
      Yellow: "🟡 ఎల్లో అలర్ట్ · అప్రమత్తంగా ఉండండి",
    },
    modalTitle: "విపత్తు భద్రతా మార్గదర్శకాలు (NDMA)",
    closeModal: "అర్థమైంది, మూసివేయి",
    dos: "చేయవలసినవి (Safety Dos):",
    donts: "చేయకూడనివి (Safety Don'ts):",
  },
  ta: {
    source: "ஆதாரம்: வானிலை மையம் (IMD) பேரிடர் எச்சரிக்கை",
    affected: "பாதிக்கப்பட்ட பகுதிகள்/மாவட்டங்கள்:",
    action: "உடனடி பாதுகாப்பு வழிகாட்டுதல் (Action Plan):",
    helpline: "1070 / 112 (பேரிடர் உதவி எண்)",
    protocols: "பாதுகாப்பு விதிகள்",
    listen: "கேளுங்கள் (Voice)",
    stop: "நிறுத்து",
    alertLabel: {
      Red: "🔴 சிவப்பு எச்சரிக்கை · உடனடி நடவடிக்கை",
      Orange: "🟠 ஆரஞ்சு எச்சரிக்கை · தயாராக இருங்கள்",
      Yellow: "🟡 மஞ்சள் எச்சரிக்கை · எச்சரிக்கையுடன் இருங்கள்",
    },
    modalTitle: "பேரிடர் பாதுகாப்பு நெறிமுறைகள் (NDMA)",
    closeModal: "புரிந்தது, மூடு",
    dos: "செய்ய வேண்டியவை (Safety Dos):",
    donts: "செய்யக்கூடாதவை (Safety Don'ts):",
  },
}

/* ── Hero Spot Emergency Weather Alert Box ── */
export function LiveAlertHeroBox({ defaultLang = "hi" }: { defaultLang?: AlertLang }) {
  const [alerts, setAlerts] = useState<LiveAlertEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeModal, setActiveModal] = useState<LiveAlertEvent | null>(null)
  const [showDirectAlertModal, setShowDirectAlertModal] = useState(false)
  const [currentLang, setCurrentLang] = useState<AlertLang>(defaultLang)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const isHoveredRef = useRef(false)

  useEffect(() => {
    fetch("/api/alerts/stream")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeAlerts?.length > 0) {
          setAlerts(data.activeAlerts)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && !isHoveredRef.current) {
        setAlerts((prev) => {
          if (prev.length > 1) {
            setCurrentIndex((idx) => (idx + 1) % prev.length)
          }
          return prev
        })
      }
    }, 7000)

    return () => clearInterval(interval)
  }, [isPaused])

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const speakCurrentAlert = () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }

    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const current = alerts[currentIndex]
    if (!current) return

    const localized = MULTILINGUAL_ALERTS[current.id]?.[currentLang] || {
      headline: current.hindiHeadline || current.headline,
      action: current.recommendedAction,
    }

    const textToSpeak = `${localized.headline}. ${localized.action}`

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    const langObj = ALERT_LANGUAGES.find((l) => l.code === currentLang)
    utterance.lang = langObj?.speechLocale || "hi-IN"
    utterance.rate = 0.95

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (alerts.length === 0) return null

  const current = alerts[currentIndex]
  const isRed = current.severity === "Red"
  const ui = UI_TEXT[currentLang] || UI_TEXT.hi
  const localized = MULTILINGUAL_ALERTS[current.id]?.[currentLang] || {
    headline: current.hindiHeadline || current.headline,
    action: current.recommendedAction,
    regions: current.affectedRegions,
    hazard: current.hazardType,
    metrics: [],
    dos: [],
    donts: [],
  }

  return (
    <>
      <div
        onMouseEnter={() => { isHoveredRef.current = true }}
        onMouseLeave={() => { isHoveredRef.current = false }}
        className={`relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all h-full ${
          isRed
            ? "border-red-400/60 bg-gradient-to-br from-red-950/95 via-slate-950/95 to-slate-950 text-white shadow-red-950/40"
            : "border-amber-400/60 bg-gradient-to-br from-amber-950/95 via-slate-950/95 to-slate-950 text-white shadow-amber-950/40"
        }`}
      >
        {/* Top Header Bar: Severity Badge + Language Selector & Voice/Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          {/* Severity Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-md ${
                isRed
                  ? "bg-red-600 text-white shadow-red-500/40 animate-pulse"
                  : "bg-amber-600 text-white shadow-amber-500/40"
              }`}
            >
              <AlertOctagon className="size-3.5 shrink-0" />
              <span>{ui.alertLabel[current.severity]}</span>
            </span>

            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-300">
              {currentIndex + 1}/{alerts.length}
            </span>
          </div>

          {/* Quick Language Dropdown & Interactive Audio/Play Controls */}
          <div className="flex items-center gap-1.5">
            {/* Native Language Selector Pill */}
            <div className="flex items-center rounded-lg bg-white/15 px-2 py-1 border border-white/20">
              <span className="text-xs mr-1">🌐</span>
              <select
                value={currentLang}
                onChange={(e) => {
                  stopSpeaking()
                  setCurrentLang(e.target.value as AlertLang)
                }}
                aria-label="Select Alert Language"
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
              >
                {ALERT_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Read Aloud Button */}
            <button
              onClick={speakCurrentAlert}
              title={isSpeaking ? ui.stop : ui.listen}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                isSpeaking
                  ? "bg-emerald-500 text-white animate-pulse shadow-md shadow-emerald-500/40"
                  : "bg-white/15 text-slate-200 hover:bg-white/25 hover:text-white"
              }`}
            >
              {isSpeaking ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? ui.stop : ui.listen}</span>
            </button>

            {/* Carousel Navigation */}
            <button
              onClick={() => setCurrentIndex((idx) => (idx - 1 + alerts.length) % alerts.length)}
              title="Previous Alert"
              className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-slate-300 transition-colors"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentIndex((idx) => (idx + 1) % alerts.length)}
              title="Next Alert"
              className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-slate-300 transition-colors"
            >
              ▶
            </button>
            <button
              onClick={() => setIsPaused((p) => !p)}
              title={isPaused ? "Play Auto-cycle" : "Pause Auto-cycle"}
              className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-slate-300 transition-colors"
            >
              {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Source & Clean, Readable Headline */}
        <div className="mt-3">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            {ui.source}
          </p>
          <h3 className="mt-1 text-base sm:text-lg font-extrabold leading-snug text-white tracking-tight">
            {localized.headline}
          </h3>
        </div>

        {/* Key Hazard Metrics Badge Row */}
        {localized.metrics && localized.metrics.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {localized.metrics.map((m, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200"
              >
                <span className="text-slate-400 font-normal">{m.label}:</span>
                <span className="text-amber-300 font-bold">{m.val}</span>
              </span>
            ))}
          </div>
        )}

        {/* Affected Zones Tags */}
        <div className="mt-3">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <MapPin className="size-3 text-red-400" />
            <span>{ui.affected}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {localized.regions.map((reg) => (
              <span
                key={reg}
                className="rounded-md border border-white/20 bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
              >
                {reg}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="mt-3 rounded-xl border border-white/15 bg-black/50 p-3 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{ui.action}</span>
          </div>
          <p className="font-medium text-slate-100 pl-5">
            {localized.action}
          </p>
        </div>

        {/* Card Footer: Clickable Helpline, Direct Message to Affected Area & Protocols Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
          <a
            href="tel:1070"
            className="flex items-center gap-2 text-emerald-400 font-mono font-bold hover:underline bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <PhoneCall className="size-4" />
            <span>{ui.helpline}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDirectAlertModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:from-red-500 hover:to-amber-500 transition-all shadow-md shadow-red-600/30 cursor-pointer"
              title="Send direct emergency SMS / WhatsApp message to residents in affected area"
            >
              <Send className="size-3.5" />
              <span>Direct Alert for Area</span>
            </button>

            <button
              onClick={() => setActiveModal(current)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition-all shadow-md cursor-pointer"
            >
              <span>{ui.protocols}</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Modal with Localized SOPs (Dos & Don'ts) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/40 bg-slate-950 p-6 text-white shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl shadow-lg ${
                    activeModal.severity === "Red" ? "bg-red-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    {ui.source}
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    {localized.headline}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs sm:text-sm space-y-3">
              <div>
                <span className="text-slate-400 font-semibold">{ui.affected}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {localized.regions.map((reg) => (
                    <span
                      key={reg}
                      className="rounded-md bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 font-bold text-red-200"
                    >
                      {reg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Safety Dos & Don'ts Checklist */}
              {localized.dos && localized.dos.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
                    <span>✅</span> <span>{ui.dos}</span>
                  </div>
                  <ul className="space-y-1 text-slate-200 pl-4 list-disc">
                    {localized.dos.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {localized.donts && localized.donts.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="font-bold text-rose-400 mb-1.5 flex items-center gap-1">
                    <span>❌</span> <span>{ui.donts}</span>
                  </div>
                  <ul className="space-y-1 text-slate-200 pl-4 list-disc">
                    {localized.donts.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs">
              <a
                href="tel:1070"
                className="flex items-center gap-2 text-emerald-400 font-mono font-bold hover:underline"
              >
                <PhoneCall className="size-4" />
                <span>{ui.helpline}</span>
              </a>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
              >
                {ui.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Alert for Affected Area Modal */}
      <DirectAreaAlertModal
        isOpen={showDirectAlertModal}
        onClose={() => setShowDirectAlertModal(false)}
        initialArea={localized.regions?.join(', ') || current.affectedRegions?.join(', ') || 'Coastal Odisha'}
        initialHazard={localized.hazard || current.hazardType}
        initialSeverity={current.severity}
        initialHeadline={localized.headline || current.headline}
        initialAction={localized.action || current.recommendedAction}
      />
    </>
  )
}

