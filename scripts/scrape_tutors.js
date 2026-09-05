/**
 * Script: scrape_tutors.js
 * Scrapes verified tutor listings from https://ilmportal.vercel.app
 * Saves data into static JSON and CSV files for user review and Supabase ingestion.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SITE_URL || 'https://ilmportal.vercel.app';
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to escape CSV fields
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

async function scrapeAllTutors() {
  console.log(`📡 Fetching verified tutors from ${BASE_URL}...`);

  let allTutors = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const url = `${BASE_URL}/api/tutors?page=${page}&limit=50`;
      console.log(`   Fetching page ${page} from ${url}...`);

      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IlmiDunya-Data-Ingestion/1.0'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.success || !Array.isArray(data.tutors)) {
        throw new Error(`Unexpected API response: ${JSON.stringify(data)}`);
      }

      const tutorsOnPage = data.tutors;
      totalPages = data.totalPages || 1;

      for (const t of tutorsOnPage) {
        // Extract subjects
        const subjects = Array.isArray(t.subjects)
          ? t.subjects.map(s => (typeof s === 'string' ? s : s.name || s.title || '')).filter(Boolean)
          : [];

        // Normalize teaching modes
        const rawModes = Array.isArray(t.teachingModes) ? t.teachingModes : [t.teachingModes || 'online'];
        const teachingModes = rawModes.map(m => {
          if (m === 'in_person' || m === 'in-person') return 'In-Person';
          return 'Online';
        });

        // Determine city
        const city = t.user?.city || (Array.isArray(t.cities) && t.cities[0]?.name) || 'Pakistan';

        const profileId = t._id;
        const profileUrl = `${BASE_URL}/tutors/${profileId}`;

        allTutors.push({
          id: profileId,
          name: t.user?.name || 'Verified Tutor',
          city: city,
          gender: (t.gender || 'male').toLowerCase(),
          qualifications: t.qualifications || 'Certified Educator',
          bio: t.bio || '',
          experienceYears: Number(t.experienceYears) || 1,
          teachingModes: teachingModes,
          subjects: subjects,
          hourlyRate: Number(t.hourlyRate) || 1500,
          ratingAverage: Number(t.ratingAverage) || 5.0,
          ratingCount: Number(t.ratingCount) || 0,
          profileUrl: profileUrl,
          scrapedAt: new Date().toISOString()
        });
      }

      page++;
    }

    console.log(`✅ Successfully extracted ${allTutors.length} verified tutors!`);

    // 1. Save to JSON
    const jsonPath = path.join(DATA_DIR, 'tutors.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allTutors, null, 2), 'utf8');
    console.log(`📄 Saved JSON file: ${jsonPath}`);

    // 2. Save to CSV
    const csvHeaders = [
      'ID',
      'Name',
      'City',
      'Gender',
      'Qualifications',
      'Teaching Modes',
      'Subjects',
      'Experience (Years)',
      'Direct Hourly Rate (PKR Ref)',
      'Rating',
      'Profile Link'
    ];

    const csvRows = [csvHeaders.join(',')];

    for (const t of allTutors) {
      csvRows.push([
        escapeCsv(t.id),
        escapeCsv(t.name),
        escapeCsv(t.city),
        escapeCsv(t.gender),
        escapeCsv(t.qualifications),
        escapeCsv(t.teachingModes.join(', ')),
        escapeCsv(t.subjects.join(', ')),
        escapeCsv(t.experienceYears),
        escapeCsv(t.hourlyRate),
        escapeCsv(t.ratingAverage),
        escapeCsv(t.profileUrl)
      ].join(','));
    }

    const csvPath = path.join(DATA_DIR, 'tutors.csv');
    fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
    console.log(`📊 Saved CSV file: ${csvPath}`);

    return allTutors;
  } catch (error) {
    console.error('❌ Failed to scrape tutors:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  scrapeAllTutors();
}

module.exports = { scrapeAllTutors };
