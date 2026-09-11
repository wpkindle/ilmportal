/**
 * Authoritative avatar helper for tutors and faculty members.
 * Ensures culturally authentic portraits for Islamic faculty and academic teachers,
 * preventing stale or mismatched Unsplash stock photos from persisting.
 */
export function getTutorAvatar(tutorOrUser, fallbackName = "Verified Tutor") {
  if (!tutorOrUser) {
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(fallbackName) + "&background=0c2217&color=d4a359";
  }

  const name = (
    (typeof tutorOrUser === "string" ? tutorOrUser : "") ||
    tutorOrUser.name ||
    tutorOrUser.user?.name ||
    fallbackName ||
    ""
  ).toLowerCase();

  // 1. Authoritative cultural portraits for core faculty
  if (name.includes("ayesha")) {
    return "/images/dr-ayesha.jpg";
  }
  if (name.includes("fatima") || name.includes("zahra") || name.includes("alimah")) {
    return "/images/tutors/alimah-fatima.jpg";
  }
  if (name.includes("huzaifa") || name.includes("qari")) {
    return "/images/tutors/qari-huzaifa.jpg";
  }
  if (name.includes("rehman") || name.includes("rahman") || name.includes("ustadh")) {
    return "/images/tutors/ustadh-abdul-rehman.jpg";
  }

  const rawAvatar = tutorOrUser.avatar || tutorOrUser.user?.avatar || "";

  // 2. Filter out legacy mismatched stock Unsplash IDs
  const mismatchedUnsplashIds = [
    "507003211169", // old huzaifa stock
    "573496359142", // old fatima stock
    "472099645785", // old abdul rehman stock
    "594824813575", // old ayesha stock
    "1507003211169",
    "1573496359142",
    "1472099645785"
  ];

  if (rawAvatar && !mismatchedUnsplashIds.some(id => rawAvatar.includes(id))) {
    return rawAvatar;
  }

  return "https://ui-avatars.com/api/?name=" + encodeURIComponent(
    tutorOrUser.name || tutorOrUser.user?.name || fallbackName
  ) + "&background=0c2217&color=d4a359";
}

/**
 * Splits and normalizes tutor qualifications and sanad documents into distinct verified credentials.
 * Preserves parenthetical details like "(Dars-e-Nizami)" or "(Punjab University)" without chopping.
 * Splits on commas, semicolons, newlines, and bullets.
 */
export function parseDegreesAndCertificates(qualificationsStr, sanadDocuments = []) {
  const list = [];

  if (qualificationsStr && typeof qualificationsStr === 'string' && qualificationsStr.trim()) {
    const raw = qualificationsStr.trim();
    let cur = '';
    let parenDepth = 0;

    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '(' || ch === '[' || ch === '{') parenDepth++;
      else if (ch === ')' || ch === ']' || ch === '}') parenDepth = Math.max(0, parenDepth - 1);

      if ((ch === ',' || ch === ';' || ch === '\n' || ch === '\r' || ch === '•' || ch === '·') && parenDepth === 0) {
        const cleaned = cur.trim();
        if (cleaned && cleaned.toLowerCase() !== 'tutor qualifications' && cleaned.toLowerCase() !== 'certified educator') {
          if (!list.some(item => item.toLowerCase() === cleaned.toLowerCase())) {
            list.push(cleaned);
          }
        }
        cur = '';
      } else {
        cur += ch;
      }
    }

    const last = cur.trim();
    if (last && last.toLowerCase() !== 'tutor qualifications' && last.toLowerCase() !== 'certified educator') {
      if (!list.some(item => item.toLowerCase() === last.toLowerCase())) {
        list.push(last);
      }
    }
  }

  // Also include titles of verified/approved sanad documents if not already in list
  if (Array.isArray(sanadDocuments)) {
    sanadDocuments.forEach(doc => {
      const title = doc?.title?.trim();
      if (title && title.toLowerCase() !== 'sanad / degree document' && title.toLowerCase() !== 'document') {
        if (!list.some(item => item.toLowerCase() === title.toLowerCase())) {
          list.push(title);
        }
      }
    });
  }

  if (list.length === 0) {
    return ['Verified Educator'];
  }

  return list;
}
