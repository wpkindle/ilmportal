const API_BASE = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function runTests() {
  console.log('=== STARTING LMS NEW FEATURES VERIFICATION ===\n');

  try {
    // 1. Authenticate Admin
    console.log('1. Logging in as Admin...');
    const adminLogin = await req(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@pakistanlms.pk',
        password: 'Admin@12345'
      })
    });
    const adminToken = adminLogin.token;
    console.log('✅ Admin Logged In successfully.\n');

    // 2. Authenticate Tutor (Qari Muhammad Huzaifa)
    console.log('2. Logging in as Tutor (Qari Muhammad Huzaifa)...');
    const tutorLogin = await req(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'qari.huzaifa@example.com',
        password: 'Password@123'
      })
    });
    const tutorToken = tutorLogin.token;
    const tutorUser = tutorLogin.user;
    console.log(`✅ Tutor Logged In: ${tutorUser.name} (${tutorUser.id || tutorUser._id})\n`);

    // 3. Authenticate Student (Hamza Khan)
    console.log('3. Logging in as Student (Hamza Khan)...');
    const studentLogin = await req(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'student.hamza@example.com',
        password: 'Password@123'
      })
    });
    const studentToken = studentLogin.token;
    const studentUser = studentLogin.user;
    const studentId = studentUser.id || studentUser._id;
    const tutorId = tutorUser.id || tutorUser._id;
    console.log(`✅ Student Logged In: ${studentUser.name} (${studentId})\n`);

    // 4. Tutor creates Deal Offer with Subject & Calendar/Time details
    console.log('4. Tutor sending Course Deal Offer to Student...');
    const offerRes = await req(`${API_BASE}/deals/offer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tutorToken}` },
      body: JSON.stringify({
        studentId: studentId,
        subject: 'Tajweed al-Quran & Makhaarij Foundation',
        price: 2500,
        priceUnit: 'per_month',
        scheduleDetails: 'Starts 07 Sep 2026 • Mon, Wed, Fri at 06:00 PM PKT (45 min/class)',
        mode: 'online',
        notes: 'Includes Makhaarij audio diagnostics and Tajweed rules workbook.'
      })
    });
    const createdDeal = offerRes.deal;
    console.log(`✅ Deal Offer Created! ID: ${createdDeal._id}, Status: ${createdDeal.status}`);
    console.log(`   Message Text: ${offerRes.messageData.text}\n`);

    // 5. Student responds and ACCEPTS the deal offer (starts 3-day trial)
    console.log('5. Student ACCEPTING the Deal Offer...');
    const acceptRes = await req(`${API_BASE}/deals/${createdDeal._id}/respond`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ action: 'accept' })
    });
    console.log(`✅ Deal Offer Accepted! New Status: ${acceptRes.deal.status}`);
    console.log(`   Trial Window: ${acceptRes.deal.trialStartDate} to ${acceptRes.deal.trialEndDate}\n`);

    // 6. Student submits Incident Report to Admin
    console.log('6. Student submitting Incident Report to Admin...');
    const conversationId = [tutorId, studentId].sort().join('_');
    const reportRes = await req(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        reportedUserId: tutorId,
        conversationId,
        category: 'technical_issue',
        subject: 'WebRTC video camera audio glitch test report',
        description: 'Testing incident reporting workflow from student chat interface to admin panel.',
        chatSnapshot: [
          { sender: 'Hamza Khan', text: 'Assalam-o-Alaikum Qari Sahab, testing WebRTC audio!', createdAt: new Date() },
          { sender: 'Qari Muhammad Huzaifa', text: 'Wa Alaikum Assalam Hamza, audio is clear!', createdAt: new Date() }
        ]
      })
    });
    const createdReport = reportRes.report;
    console.log(`✅ Incident Report Filed! ID: ${createdReport._id}, Category: ${createdReport.category}`);
    console.log(`   Reporter: ${createdReport.reporter.name} -> Reported: ${createdReport.reportedUser.name}\n`);

    // 7. Admin lists all reports
    console.log('7. Admin fetching Incident Reports...');
    const listReportsRes = await req(`${API_BASE}/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Admin retrieved ${listReportsRes.count} incident reports.\n`);

    // 8. Admin resolves the report with notes
    console.log('8. Admin resolving the incident report with notes...');
    const resolveRes = await req(`${API_BASE}/reports/${createdReport._id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'resolved',
        adminNotes: 'Verified camera feed settings and confirmed WebRTC configuration is optimal.'
      })
    });
    console.log(`✅ Report Resolved! Status: ${resolveRes.report.status}`);
    console.log(`   Admin Notes: ${resolveRes.report.adminNotes}\n`);

    // 9. Verify unread conversations for Navbar counter
    console.log('9. Checking student conversations for unread count...');
    const convRes = await req(`${API_BASE}/chat/conversations`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✅ Conversations Count: ${convRes.conversations.length}\n`);

    console.log('🎉 ALL 9 TEST SUITES PASSED SUCCESSFULLY! 100% OPERATIONAL.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();

