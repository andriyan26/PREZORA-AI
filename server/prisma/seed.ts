import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PREZORA AI database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Upsert demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@prezora.ai' },
    update: {},
    create: {
      fullName: 'Andrian Syahputra',
      email: 'demo@prezora.ai',
      passwordHash,
      preferredLanguage: 'id',
      theme: 'dark',
      preferences: {
        create: {
          responseStyle: 'informative',
          responseLength: 'balanced',
          voiceEnabled: true,
          voiceSpeed: 1.0
        }
      }
    }
  });

  console.log('User created:', user.email);

  // Create initial sample conversation
  const conv = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Strategi Presentasi Sidang Skripsi',
      mode: 'assistant',
      messages: {
        create: [
          {
            role: 'user',
            content: 'Halo PREZORA AI, bagaimana tips membuka sidang skripsi yang meyakinkan di depan dosen penguji?'
          },
          {
            role: 'assistant',
            content: `Halo Andrian! Untuk membuka sidang skripsi dengan percaya diri dan meyakinkan di hadapan dewan penguji, berikut strategi 30 detik pertama yang terbukti efektif:\n\n1. **Salam & Artikulasi Tegas**: Berdiri tegak, tatap mata dewan penguji secara bergantian, dan sampaikan salam dengan intonasi jelas.\n2. **Urgensi Penelitian (The Hook)**: Mulai dengan 1 kalimat kuat mengenai fenomena atau masalah nyata yang mendasari skripsi Anda.\n3. **Problem Statement & Solusi**: Tautkan judul penelitian sebagai solusi komprehensif atas masalah tersebut.\n\n*Contoh Kalimat Pembuka:*\n> *"Selamat pagi yang terhormat dewan penguji. Setiap tahunnya, 65% mahasiswa mengalami kecemasan tinggi saat public speaking. Melalui penelitian ini, saya mengembangkan model PREZORA AI untuk membantu mahasiswa berlatih komunikasi secara terukur."*\n\nAnda juga bisa langsung membuka menu **Presentation Coach** untuk mensimulasikan sesi ini dengan persona Dosen Penguji!`
          }
        ]
      }
    }
  });

  // Create sample practice session
  const session = await prisma.practiceSession.create({
    data: {
      userId: user.id,
      title: 'Simulasi Sidang Skripsi: Sistem Cerdas Berbasis AI',
      practiceType: 'seminar',
      topic: 'Penerapan Machine Learning untuk Evaluasi Kemampuan Public Speaking',
      audienceType: 'dosen_penguji',
      difficulty: 'intermediate',
      targetDurationSeconds: 300,
      actualDurationSeconds: 280,
      language: 'id',
      interactionMode: 'interactive',
      status: 'completed',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3320000),
      transcripts: {
        create: [
          {
            speaker: 'user',
            sequenceNumber: 1,
            content: 'Selamat pagi dewan penguji yang saya hormati. Pada hari ini saya akan mempresentasikan hasil penelitian skripsi saya mengenai penerapan machine learning untuk evaluasi kemampuan public speaking secara terstruktur dan obyektif.'
          },
          {
            speaker: 'assistant',
            sequenceNumber: 2,
            content: 'Bisa dijelaskan apa novelty utama dari algoritma evaluasi yang Anda gunakan dibandingkan penelitian terdahulu?'
          },
          {
            speaker: 'user',
            sequenceNumber: 3,
            content: 'Novelty utama penelitian ini adalah penggabungan analisis teks transkrip dengan metrik tempo bicara dan deteksi kata pengisi (filler words) secara multi-aspek, bukan sekadar penilaian sentimen sederhana.'
          }
        ]
      },
      questions: {
        create: [
          {
            question: 'Bisa dijelaskan apa novelty utama dari algoritma evaluasi yang Anda gunakan dibandingkan penelitian terdahulu?',
            userAnswer: 'Novelty utama penelitian ini adalah penggabungan analisis teks transkrip dengan metrik tempo bicara dan deteksi kata pengisi secara multi-aspek.',
            feedback: 'Jawaban langsung menjawab pertanyaan dengan jelas dan menyebutkan diferensiasi spesifik.',
            sequenceNumber: 1,
            answeredAt: new Date()
          }
        ]
      },
      evaluations: {
        create: {
          overallScore: 84,
          summary: 'Penampilan presentasi terstruktur dengan baik. Penguasaan konsep skripsi sangat solid dan jawaban terhadap pertanyaan dosen penguji disampaikan dengan lugas.',
          evaluationJson: JSON.stringify([
            { name: 'Struktur Presentasi', score: 86, evidence: 'Pembukaan formal dan pengantar metodologi jelas.', suggestion: 'Perjelas ringkasan saran di akhir slide penutup.' },
            { name: 'Kejelasan Penjelasan', score: 88, evidence: 'Tempo bicara ~130 WPM, sangat ideal dan mudah dicerna.', suggestion: 'Pertahankan intonasi mantap saat menjelaskan kontribusi riset.' },
            { name: 'Relevansi Isi', score: 85, evidence: 'Materi selaras dengan fokus penelitian skripsi.', suggestion: 'Tambahkan data perbandingan akurasi numerik.' },
            { name: 'Alur Logika & Transisi', score: 82, evidence: 'Transisi antarbab logis dan sistematis.', suggestion: 'Gunakan frasa penghubung yang variatif.' },
            { name: 'Pemilihan Kata (Diksi)', score: 84, evidence: 'Kosakata akademis tepat dan minim filler words.', suggestion: 'Hindari kata "mungkin" ketika menjelaskan hasil pengujian.' },
            { name: 'Penguasaan Tanya Jawab', score: 86, evidence: 'Jawaban atas pertanyaan novelty langsung tepat sasaran.', suggestion: 'Lanjutkan dengan mengutip 1 referensi pendukung.' },
            { name: 'Manajemen Waktu', score: 90, evidence: 'Selesai dalam 4 menit 40 detik dari target 5 menit (93% akurat).', suggestion: 'Manajemen waktu sudah sangat optimal.' }
          ]),
          strengthsJson: JSON.stringify([
            'Pembukaan yang santun dan profesional sesuai etika sidang akademik.',
            'Kecepatan berbicara (pacing) sangat stabil dan percaya diri.',
            'Penjelasan kebaruan penelitian (novelty) disampaikan secara konkret.'
          ]),
          improvementsJson: JSON.stringify([
            {
              issue: 'Penggunaan kata pengurang keyakinan (hedging words)',
              original: 'Mungkin menurut kami algoritma ini cukup efektif',
              suggested: 'Berdasarkan hasil pengujian empiris, algoritma ini terbukti efektif meningkatkan akurasi hingga 15%',
              reason: 'Menghilangkan keraguan di depan dewan penguji dengan bersandar pada data faktual.'
            }
          ]),
          nextPracticeJson: JSON.stringify([
            'Latih simulasi Q&A tingkat lanjut untuk mengantisipasi pertanyaan metodologis yang mendalam.',
            'Latih penutupan dengan menegaskan implikasi praktis bagi institusi.'
          ]),
          evaluationVersion: 1
        }
      }
    }
  });

  console.log('Sample conversation and practice session created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
