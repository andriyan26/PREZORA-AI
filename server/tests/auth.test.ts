import { prisma } from '../src/config/prisma';
import { hashPassword, comparePassword } from '../src/utils/hash';
import { generateAccessToken, verifyAccessToken } from '../src/utils/jwt';
import { AIService } from '../src/services/ai/aiService';

async function runTests() {
  console.log('🧪 Running automated tests for PREZORA AI...');

  // 1. Password hashing test
  const rawPw = 'SuperSecret2026!';
  const hashed = await hashPassword(rawPw);
  const match = await comparePassword(rawPw, hashed);
  if (!match) throw new Error('Password hash comparison failed');
  console.log('✅ 1. Password hashing & verification: PASSED');

  // 2. JWT token generation & verification test
  const payload = { userId: 'test-user-uuid', email: 'test@prezora.ai' };
  const token = generateAccessToken(payload);
  const verified = verifyAccessToken(token);
  if (verified.userId !== payload.userId || verified.email !== payload.email) {
    throw new Error('JWT verification payload mismatch');
  }
  console.log('✅ 2. JWT token encoding & decoding: PASSED');

  // 3. Database user query test
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@prezora.ai' },
    include: { preferences: true }
  });
  if (!demoUser) throw new Error('Demo user not found in MySQL database');
  console.log('✅ 3. MySQL Database query (User & Preferences): PASSED (' + demoUser.fullName + ')');

  // 4. Conversation & Message persistence test
  const conversations = await prisma.conversation.findMany({
    where: { userId: demoUser.id },
    include: { messages: true }
  });
  if (conversations.length === 0) throw new Error('Conversations count is zero');
  console.log(`✅ 4. Conversations & Messages verified: PASSED (${conversations.length} conversation(s) found)`);

  // 5. Practice Session & Evaluation retrieval test
  const sessions = await prisma.practiceSession.findMany({
    where: { userId: demoUser.id },
    include: { evaluations: true, transcripts: true, questions: true }
  });
  if (sessions.length === 0) throw new Error('Practice sessions count is zero');
  const sampleEval = sessions[0].evaluations[0];
  if (!sampleEval || sampleEval.overallScore === null) throw new Error('Practice evaluation score missing');
  console.log(`✅ 5. Practice Session & Evaluation retrieval: PASSED (Score: ${sampleEval.overallScore}/100)`);

  // 6. AI Service evaluation engine test
  const evalResult = await AIService.evaluatePresentation({
    topic: 'Pengembangan Aplikasi Cerdas',
    audienceType: 'dosen_penguji',
    targetDuration: 300,
    actualDuration: 290,
    transcripts: [
      { speaker: 'user', content: 'Selamat pagi dewan penguji. Pada kesempatan ini saya ingin memaparkan sistem kecerdasan buatan untuk membantu latihan presentasi.' },
      { speaker: 'assistant', content: 'Bagaimana cara sistem mengukur kejelasan bicara?' },
      { speaker: 'user', content: 'Sistem mengukur kata per menit dan mendeteksi variasi kosakata secara multi-dimensi.' }
    ],
    qaSession: [
      { question: 'Bagaimana cara sistem mengukur kejelasan bicara?', answer: 'Sistem mengukur kata per menit dan mendeteksi variasi kosakata.' }
    ]
  });

  if (evalResult.overallScore < 0 || evalResult.overallScore > 100) {
    throw new Error('Evaluation overall score out of 0-100 range');
  }
  if (!evalResult.criteria || evalResult.criteria.length === 0) {
    throw new Error('Evaluation criteria empty');
  }
  if (!evalResult.improvements || evalResult.improvements.length === 0) {
    throw new Error('Evaluation improvements empty');
  }
  console.log(`✅ 6. AI Presentation Evaluation Engine: PASSED (Score: ${evalResult.overallScore}/100, Criteria count: ${evalResult.criteria.length})`);

  console.log('\n🎉 ALL 6 AUTOMATED BACKEND TESTS PASSED SUCCESSFULLY!\n');
}

runTests()
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
