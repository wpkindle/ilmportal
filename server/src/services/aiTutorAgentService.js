/**
 * Service: aiTutorAgentService.js
 * High-performance, website-grounded AI counselor for IlmiDunya Pakistan.
 * Answers any user inquiry using real tutor data, trial policies, direct fee rules, and safety charter.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'tutors.json');
const BASE_URL = process.env.SITE_URL || 'https://ilmportal.vercel.app';
const WHATSAPP_NUM = '+92 317 1759093';

let tutorsCache = null;
let lastCacheTime = 0;

function loadTutors() {
  const now = Date.now();
  if (tutorsCache && now - lastCacheTime < 60000) {
    return tutorsCache;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      tutorsCache = JSON.parse(raw);
      lastCacheTime = now;
      return tutorsCache;
    }
  } catch (err) {
    console.warn('Could not read tutors.json:', err.message);
  }

  return [];
}

/**
 * Clean and extract keywords from user text
 */
function analyzeQuery(text) {
  const lower = (text || '').toLowerCase();

  // 1. Gender preference
  let gender = null;
  if (/female|alimah|woman|lady|girl|baji|aurat|larki|women/i.test(lower)) {
    gender = 'female';
  } else if (/\bmale\b|qari|ustadh|man|boy|gents|mard|bhai/i.test(lower)) {
    gender = 'male';
  }

  // 2. City preference
  let city = null;
  const cities = ['lahore', 'karachi', 'islamabad', 'peshawar', 'rawalpindi', 'faisalabad', 'multan', 'quetta'];
  for (const c of cities) {
    if (lower.includes(c)) {
      city = c;
      break;
    }
  }

  // 3. Mode preference
  let mode = null;
  if (/in-person|in person|home tutor|ghar|physically|offline/i.test(lower)) {
    mode = 'In-Person';
  } else if (/online|internet|zoom|remote|video/i.test(lower)) {
    mode = 'Online';
  }

  // 4. Intent detection
  const isGreeting = /^(hi|hello|hey|salam|assalam|assalam-o-alaikum|aoa|adaab)\b/i.test(lower.trim());
  const isAdmission = /admission|procedure|kese lein|kaise lein|join|start|enroll|registration|apply/i.test(lower);
  const isFee = /fee|fees|charges|price|kitne paise|cost|hourly rate|package|rate/i.test(lower);
  const isTrial = /trial|free class|demo|testing|azmaish/i.test(lower);
  const isSafety = /safety|privacy|camera|parda|security|safe|female privacy/i.test(lower);
  const isPayment = /meezan|jazzcash|easypaisa|raast|bank|pay|account number/i.test(lower);
  const isHumanRequest = /human|admin|agent|staff|call|phone|whatsapp|contact/i.test(lower);

  // 5. Subject detection
  const subjectMatches = [];
  const subjectMap = [
    { key: 'tajweed', name: 'Tajweed al-Quran' },
    { key: 'qaida', name: 'Noorani Qaida for Beginners' },
    { key: 'noorani', name: 'Noorani Qaida for Beginners' },
    { key: 'nazra', name: 'Nazra Quran for Kids & Adults' },
    { key: 'hifz', name: 'Hifz al-Quran (Memorization)' },
    { key: 'tafseer', name: 'Quran Translation & Tafseer' },
    { key: 'translation', name: 'Quran Translation & Tafseer' },
    { key: 'arabic', name: 'Arabic Grammar & Spoken Arabic' },
    { key: 'fiqh', name: 'Islamic Studies & Fiqh / Hadith' },
    { key: 'hadith', name: 'Islamic Studies & Fiqh / Hadith' },
    { key: 'o-level', name: 'O-Level / IGCSE Cambridge' },
    { key: 'o level', name: 'O-Level / IGCSE Cambridge' },
    { key: 'a-level', name: 'A-Level Cambridge' },
    { key: 'a level', name: 'A-Level Cambridge' },
    { key: 'cambridge', name: 'Cambridge Coaching' },
    { key: 'matric', name: 'Matric / SSC Science (Class 9 & 10)' },
    { key: '9th', name: 'Matric / SSC Science (Class 9 & 10)' },
    { key: '10th', name: 'Matric / SSC Science (Class 9 & 10)' },
    { key: 'fsc', name: 'FSc / HSSC Pre-Medical & Pre-Engineering' },
    { key: 'biology', name: 'Biology & MDCAT' },
    { key: 'mdcat', name: 'MDCAT Entry Test Prep' },
    { key: 'chemistry', name: 'Chemistry' },
    { key: 'physics', name: 'Physics' },
    { key: 'math', name: 'Mathematics' }
  ];

  for (const s of subjectMap) {
    if (lower.includes(s.key)) {
      subjectMatches.push(s.name);
    }
  }

  return {
    gender,
    city,
    mode,
    isGreeting,
    isAdmission,
    isFee,
    isTrial,
    isSafety,
    isPayment,
    isHumanRequest,
    subjects: subjectMatches
  };
}

/**
 * Filter and score tutors from tutors.json
 */
function findMatchingTutors(queryAnalysis) {
  const tutors = loadTutors();
  if (!tutors.length) return [];

  const { gender, city, mode, subjects } = queryAnalysis;

  const scored = tutors.map(t => {
    let score = 0;

    // Gender match
    if (gender && t.gender === gender) {
      score += 50;
    }

    // City match
    if (city && t.city.toLowerCase() === city.toLowerCase()) {
      score += 40;
    }

    // Mode match
    if (mode && Array.isArray(t.teachingModes) && t.teachingModes.includes(mode)) {
      score += 30;
    }

    // Subject match
    if (subjects.length > 0 && Array.isArray(t.subjects)) {
      for (const subj of subjects) {
        const hasSubj = t.subjects.some(ts => ts.toLowerCase().includes(subj.toLowerCase()) || subj.toLowerCase().includes(ts.toLowerCase()));
        if (hasSubj) score += 60;
      }
    }

    // Experience & rating bonus
    score += (t.ratingAverage || 5.0) * 2;
    score += Math.min(t.experienceYears || 1, 10);

    return { tutor: t, score };
  });

  // Sort descending
  scored.sort((a, b) => b.score - a.score);

  // Return top 3-4
  return scored.slice(0, 3).map(s => s.tutor);
}

/**
 * Main response generation function
 */
async function generateSupportChatResponse(userMessage, conversationHistory = []) {
  const query = analyzeQuery(userMessage);
  const matchingTutors = findMatchingTutors(query);

  let replyText = '';

  // 1. Admission Procedure Inquiry
  if (query.isAdmission) {
    replyText = `**Assalam-o-Alaikum!** IlmiDunya par admission lene ka procedure nihayat aasan aur **100% Free** hai:

1. 🔍 **Tutor Search Karein**: Website par apni pasand ke Qari Sahab, Alimah, ya Academic Tutor ki profile open karein.
2. 📅 **3-Day Free Trial Book Karein**: Profile par ja kar **"Book Free Trial"** par click karein. Is ke liye koi registration ya platform fee nahi hai.
3. 💻 **1-on-1 Live Class**: Hamare safe in-platform classroom mein camera-off privacy ke sath classes attend karein.
4. 🤝 **Direct Agreed Fee**: Trial pasand aane par aap direct tutor ke sath monthly fees aur schedule tay karte hain (0% platform commission).

👉 Aap apni pasand ka subject (maslan Tajweed, Hifz, O-Level, FSc) ya shehar batayein, main foran behtareen verified tutor recommend kar deta hoon!`;
  }

  // 2. Fees & Pricing Inquiry
  else if (query.isFee) {
    replyText = `**Fees Policy (Direct Dealing & Zero Commission):**

IlmiDunya platform koi admission fee ya commission nahi leta. 
* Har verified tutor ki fee **"Direct Agreed Rate"** hoti hai jo student aur tutor aapas mein 3-Day Free Trial ke doran direct tay karte hain.
* Tutors ke reference rates aam tor par **PKR 300 se PKR 3,000 / hour** tak hote hain (subject, qualification aur class level ke hisaab se).
* Payment direct Meezan Bank, Raast, EasyPaisa, ya JazzCash ke zariye hoti hai.

Aap kis subject ya class ke tutor ki fees maloom karna chahte hain?`;
  }

  // 3. Free Trial Inquiry
  else if (query.isTrial) {
    replyText = `**3-Day Free Trial Policy:**

* Har naye student ke liye **3-Day Free Trial** bilkul muft hai bina kisi advance payment ke.
* Aap 3 din tak tutor ki teaching method, tajweed makharij, aur time punctuality check kar sakte hain.
* Agar aap satisfied hon, tabhi aapas mein monthly fee tay karke regular classes continue karein.`;
  }

  // 4. Female Safety & Privacy Charter
  else if (query.isSafety) {
    replyText = `🛡️ **Female Safety & Family Privacy Guarantee:**

* **Camera-Off Default**: Female students aur bachiyon ke liye video camera default tor par off hota hai.
* **Verified Alimahs**: Wafaq-ul-Madaris certified female scholars (Jamia Hafsa & Punjab University vetted).
* **CNIC & Sanad Verified**: Platform par har teacher ke CNIC aur asool-e-deen sanads verified hain.`;
  }

  // 5. Payment Methods Inquiry
  else if (query.isPayment) {
    replyText = `💳 **Verified Payment Methods:**

Aap direct Pakistani banking ya mobile wallet ke zariye fee transfer kar sakte hain:
* **Meezan Bank**: \`96010105435308\` (Title: Abdul Khaliq)
* **Raast ID / EasyPaisa / JazzCash / UPaisa**: \`03171759093\`
* Kisi bhi qisam ki receipt ya confirmation ke liye aap administration ko WhatsApp \`+92 317 1759093\` par contact kar sakte hain.`;
  }

  // 6. Specific Tutor Search (Subject, City, or Gender Mentioned)
  else if (query.subjects.length > 0 || query.city || query.gender) {
    const filterDesc = [];
    if (query.gender) filterDesc.push(query.gender === 'female' ? 'Female Alimah/Teacher' : 'Male Qari/Tutor');
    if (query.city) filterDesc.push(query.city.toUpperCase());
    if (query.subjects.length) filterDesc.push(query.subjects.join(', '));

    replyText = `Humne aapke liye **IlmiDunya** ke verified tutors dhoond liye hain (${filterDesc.join(' • ')}):\n\n`;

    for (let i = 0; i < matchingTutors.length; i++) {
      const t = matchingTutors[i];
      const modesStr = t.teachingModes.join(', ');
      replyText += `**${i + 1}. ${t.name}** (${t.city} • ${modesStr})
🎓 **Qualifications**: ${t.qualifications}
📚 **Subjects**: ${t.subjects.slice(0, 3).join(', ')}
⭐ **Rating**: ${t.ratingAverage} / 5.0 (${t.experienceYears} Years Experience)
🔗 [View Profile & Book Free Trial](${t.profileUrl})\n\n`;
    }

    replyText += `Aap in mein se kisi bhi tutor ki profile link par click karke foran **3-Day Free Trial** shuru kar sakte hain!`;
  }

  // 7. Human Support Request
  else if (query.isHumanRequest) {
    replyText = `Zaroor! Hamari support team live active hai:
* 💬 Aap isi chat mein apna sawal likh sakte hain, admin foran reply karega.
* 📱 Direct WhatsApp Support: [Chat on WhatsApp](https://wa.me/923171759093) (\`+92 317 1759093\`)
* 📧 Email: \`contact@ilmidunya.pk\``;
  }

  // 8. Polite Greeting & General Assistant Fallback
  else {
    replyText = `**Assalam-o-Alaikum!** Main IlmiDunya Pakistan ka Academic & Quran Support Counselor hoon. 

Main aapki website ke data ke mutabiq sahi madad kar sakta hoon:
1. 📖 **Verified Tutors**: Female Alimahs, Qaris, Cambridge O/A-Level, aur Matric teachers dhoondein.
2. 🎓 **Admission & 3-Day Trial**: Free trial booking ka tareeqa.
3. 💰 **Fees Policy**: Direct agreed rates ki maloomat.
4. 🛡️ **Female Safety**: Camera-off privacy rules.

Aapko kis subject ya class ke liye tutor chahiye? (Maslan: *"Lahore mein Tajweed teacher"* ya *"Online O-Level physics"*).`;
  }

  return {
    reply: replyText,
    matchingTutors,
    intent: query
  };
}

module.exports = {
  generateSupportChatResponse,
  findMatchingTutors,
  analyzeQuery
};
