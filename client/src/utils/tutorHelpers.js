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
