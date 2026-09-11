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
 * Splits raw qualifications string on commas, semicolons, newlines, bullets, and middots.
 * Preserves parenthetical context like "(NUST)" or "(Dars-e-Nizami)".
 */
export function parseRawQualifications(qualificationsStr) {
  const list = [];
  if (!qualificationsStr || typeof qualificationsStr !== 'string' || !qualificationsStr.trim()) {
    return list;
  }

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

  return list;
}

/**
 * Returns strictly the verified Sanad credentials for display in the Qualifications section.
 * When a tutor has verified/approved Sanad documents, ONLY those verified Sanads are returned,
 * preventing arbitrary unverified strings (like skills/marketing tags) from cluttering credentials.
 */
export function parseDegreesAndCertificates(qualificationsStr, sanadDocuments = [], isVerified = false) {
  // 1. Filter for verified / approved Sanad documents
  const verifiedDocs = (Array.isArray(sanadDocuments) ? sanadDocuments : []).filter(
    doc => doc?.status === 'verified' || doc?.status === 'approved'
  );

  const parsedQuals = parseRawQualifications(qualificationsStr);

  // 2. If the tutor has verified Sanad document(s), ONLY display the Sanad(s) that are verified!
  if (verifiedDocs.length > 0) {
    const list = [];
    verifiedDocs.forEach((doc, idx) => {
      let title = doc?.title?.trim();
      // If doc title is generic placeholder like "Sanad / Degree Document",
      // use the matching qualification title from qualificationsStr if available
      const isGeneric = !title ||
        title.toLowerCase() === 'sanad / degree document' ||
        title.toLowerCase() === 'document' ||
        title.toLowerCase() === 'sanad' ||
        title.toLowerCase() === 'degree document';

      if (isGeneric && parsedQuals[idx]) {
        title = parsedQuals[idx];
      } else if (!title) {
        title = parsedQuals[idx] || parsedQuals[0] || 'Verified Sanad';
      }

      if (title && !list.some(item => item.toLowerCase() === title.toLowerCase())) {
        list.push(title);
      }
    });

    return list.length > 0 ? list : ['Verified Sanad'];
  }

  // 3. If tutor profile is marked isSanadVerified: true but documents array is empty
  if (isVerified) {
    if (parsedQuals.length > 0) {
      return [parsedQuals[0]]; // Only display the 1 verified primary qualification
    }
    return ['Verified Sanad'];
  }

  // 4. If no verified sanads, fall back to parsed qualifications (unverified)
  return parsedQuals.length > 0 ? parsedQuals : ['Verified Faculty'];
}
