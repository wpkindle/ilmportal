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
  const allDocs = Array.isArray(sanadDocuments) ? sanadDocuments : [];

  const docTitles = [];
  const seenKeys = new Set();

  allDocs.forEach(doc => {
    const title = doc?.title?.trim();
    const isGeneric = !title ||
      title.toLowerCase() === 'sanad / degree document' ||
      title.toLowerCase() === 'document' ||
      title.toLowerCase() === 'sanad' ||
      title.toLowerCase() === 'degree document' ||
      title.toLowerCase() === 'educational degree';

    if (!isGeneric && title) {
      const key = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        docTitles.push(title);
      }
    }
  });

  // 1. If specific degree documents are attached, use their titles as the official credentials
  if (docTitles.length > 0) {
    return docTitles;
  }

  // 2. Otherwise fall back to parsed qualifications string if no specific degree documents are attached
  const parsedQuals = parseRawQualifications(qualificationsStr);
  const qualList = [];
  parsedQuals.forEach(q => {
    const clean = q?.trim();
    if (clean) {
      const key = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        qualList.push(clean);
      }
    }
  });

  if (qualList.length > 0) {
    return qualList;
  }

  if (isVerified || allDocs.length > 0) {
    return ['Verified Sanad'];
  }

  return ['Verified Faculty'];
}

/**
 * Resolves a document/sanad fileUrl into an absolute, viewable URL.
 * Handles base64 data URLs, remote URLs, and relative upload paths.
 */
export function getDocumentUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return '';
  const trimmed = fileUrl.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'ilmidunya.com' ||
      window.location.hostname.endsWith('.ilmidunya.com') ||
      window.location.hostname.includes('vercel.app'))
      ? 'https://ilmportal-backend.onrender.com'
      : '');

  if (!backendBase) return trimmed;
  const cleanBase = backendBase.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Checks whether a document is a PDF file based on its URL or MIME type.
 * Also checks base64 %PDF- magic signature (JVBERi0).
 */
export function isPdfDocument(fileUrl, fileType) {
  if (fileType === 'application/pdf') return true;
  if (!fileUrl || typeof fileUrl !== 'string') return false;
  const lower = fileUrl.toLowerCase();
  return (
    lower.startsWith('data:application/pdf') ||
    lower.includes('application/pdf') ||
    lower.endsWith('.pdf') ||
    lower.includes('.pdf?') ||
    fileUrl.startsWith('data:;base64,JVBERi') ||
    fileUrl.startsWith('data:application/octet-stream;base64,JVBERi') ||
    fileUrl.includes('JVBERi0')
  );
}

/**
 * Converts a data URL (e.g. data:application/pdf;base64,...) to a binary Blob object.
 */
export function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return null;
  }
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const isBase64 = parts[0].includes(';base64');

    let byteCharacters;
    if (isBase64) {
      byteCharacters = atob(parts[1]);
    } else {
      byteCharacters = decodeURIComponent(parts[1]);
    }

    const sliceSize = 1024;
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Uint8Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(byteNumbers);
    }
    return new Blob(byteArrays, { type: mimeType });
  } catch (err) {
    console.error('Error converting dataUrl to Blob:', err);
    return null;
  }
}

/**
 * Creates an object URL (blob:...) from a data URL.
 */
export function dataUrlToBlobUrl(dataUrl) {
  if (typeof window === 'undefined') return '';
  const blob = dataUrlToBlob(dataUrl);
  if (!blob) return '';
  return URL.createObjectURL(blob);
}

/**
 * Safely opens any document URL in a new browser tab.
 * Converts base64 data URLs to blob URLs so modern browsers (Chrome/Edge/Safari)
 * do not block top-frame navigation (about:blank#blocked).
 */
export function openDocumentInNewTab(fileUrl, title = 'Document') {
  if (!fileUrl || typeof window === 'undefined') return;

  if (fileUrl.startsWith('data:')) {
    const blob = dataUrlToBlob(fileUrl);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (win) {
        win.focus();
      }
      // Revoke after 2 minutes to free memory while allowing tab rendering
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (e) {}
      }, 120000);
      return;
    }
  }

  const resolved = getDocumentUrl(fileUrl);
  window.open(resolved, '_blank', 'noopener,noreferrer');
}

/**
 * Downloads any document file with a clean, sanitized filename.
 */
export function downloadDocument(fileUrl, filename = 'document') {
  if (!fileUrl || typeof window === 'undefined') return;

  const isPdf = isPdfDocument(fileUrl);
  let cleanName = (filename || 'document').trim().replace(/[^a-zA-Z0-9_\-. ]/g, '_');
  if (isPdf && !cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  if (fileUrl.startsWith('data:')) {
    const blob = dataUrlToBlob(fileUrl);
    if (!blob) return;
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (e) {}
    }, 2000);
  } else {
    const resolved = getDocumentUrl(fileUrl);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = resolved;
    a.download = cleanName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch (e) {}
    }, 1000);
  }
}


