import { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// YouTube API helper
// ---------------------------------------------------------------------------
const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || null;
  //(typeof process !== 'undefined' && process.env?.REACT_APP_YOUTUBE_API_KEY) ||
  //null;

async function fetchTopVideos(channelId) {
  if (!YT_KEY) return [];
  try {
    const r = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${channelId}&part=snippet&order=viewCount&maxResults=5&type=video`
    );
    const d = await r.json();
    return (d.items || []).map((v) => ({
      id: v.id.videoId,
      title: v.snippet.title,
      thumb: v.snippet.thumbnails?.medium?.url,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------
const AGE_GROUPS = [
  {
    id: '3-6',
    label: 'Early Years',
    range: 'Ages 3–6',
    emoji: '🌱',
    accent: '#16a34a',
    light: '#dcfce7',
  },
  {
    id: '7-10',
    label: 'Primary',
    range: 'Ages 7–10',
    emoji: '🚀',
    accent: '#2563eb',
    light: '#dbeafe',
  },
  {
    id: '11-13',
    label: 'Middle School',
    range: 'Ages 11–13',
    emoji: '🔭',
    accent: '#7c3aed',
    light: '#ede9fe',
  },
  {
    id: '14-16',
    label: 'High School',
    range: 'Ages 14–16',
    emoji: '⚡',
    accent: '#ea580c',
    light: '#fed7aa',
  },
];
const AGE_ORDER = ['3-6', '7-10', '11-13', '14-16'];

const CAT_ICONS = {
  'Science & Tech': '🔬',
  Mathematics: '📐',
  'Critical Thinking & Life Skills': '🧠',
  'History & Geography': '🌍',
  'Arts & Creativity': '🎨',
  'Financial Literacy': '💰',
  'Logic & STEM': '⚙️',
  'Media Literacy': '📱',
  'Soft Skills': '🤝',
};

// Channel data includes a channelId for API lookup and 5 fallback static video IDs
const RAW = {
  '3-6': [
    {
      category: 'Science & Tech',
      channels: [
        {
          name: 'SciShow Kids',
          channelId: 'UCnhMTWBx8YNDhFE5M5sRZhA',
          why: "Answers curious 'why' questions with fun experiments.",
          videos: [
            'g5f-8QXKjuQ',
            'Z5iRE7zHpdk',
            'bTJGsBNHgqs',
            '9_y3i3_lCiY',
            'zVHBgm9MMJE',
          ],
        },
        {
          name: 'Peekaboo Kidz',
          channelId: 'UCQU5mlFBRSXF8PFh_ZnKcmA',
          why: 'Colorful animated science shorts with sing-along energy.',
          videos: [
            'MBnJhIGKaGY',
            'v-FjfPpGvk4',
            'RZgWrHiLJao',
            'y00Td2yOSV0',
            'k06bxKaqTUI',
          ],
        },
      ],
    },
    {
      category: 'Mathematics',
      channels: [
        {
          name: 'Numberblocks',
          channelId: 'UCPlwvN0bU9qQCaGIBSG7GmA',
          why: 'Turns numbers into lovable characters, building real numeracy.',
          videos: [
            'ipSnLSMnDmY',
            'MKuNxpBNSzE',
            'cvjl4VFXPW0',
            'OBKuHCTKHgM',
            'U4JlhVm2Ysk',
          ],
        },
        {
          name: 'Alphablocks',
          channelId: 'UCsAWBiCQElxUqsGpNsmHQBA',
          why: 'Letters come alive to teach phonics and early reading.',
          videos: [
            '6Q1nDFKMjS0',
            'yDc3Pb3yFMU',
            'd0R3QKOiF_8',
            'j8X2L3VUYAM',
            'pGdpvIOFGSY',
          ],
        },
      ],
    },
    {
      category: 'Critical Thinking & Life Skills',
      channels: [
        {
          name: 'Sesame Street',
          channelId: 'UCAcMDLFBKGKQOWiVINr6_OA',
          why: 'Decades of research-backed content on empathy and social skills.',
          videos: [
            'tJRFEOmNO7A',
            'hfiXXs7k1h4',
            'P5i1PzEJ2zk',
            'FSnmvuBJ0V4',
            '_N_e3UaqMC8',
          ],
        },
      ],
    },
    {
      category: 'History & Geography',
      channels: [
        {
          name: 'Kids Learning Tube',
          channelId: 'UCZOnoLKzoBItcEWIFVSaclA',
          why: 'Geography and countries explained through catchy original songs.',
          videos: [
            'p6nylxFWFkQ',
            'mRhfO7IQ6lk',
            'TN1YMQ2mFaA',
            'u5j6XqkZFrA',
            'LLzp9mSZ7qA',
          ],
        },
      ],
    },
    {
      category: 'Arts & Creativity',
      channels: [
        {
          name: 'Art for Kids Hub',
          channelId: 'UC5XMF3J3680BxqyzOCFkAgQ',
          why: 'Dad and kids guide children through drawing step-by-step.',
          videos: [
            'j4wKeaTBQ4A',
            '5VbTDHqNYGE',
            'oBLBpWe0Rkk',
            '6A8GVyUABBw',
            'tGTcFpqQVUI',
          ],
        },
      ],
    },
    {
      category: 'Financial Literacy',
      channels: [
        {
          name: 'Sesame Street – Money',
          channelId: 'UCAcMDLFBKGKQOWiVINr6_OA',
          why: 'Elmo introduces saving, sharing, and the value of money.',
          videos: [
            'hfiXXs7k1h4',
            'FSnmvuBJ0V4',
            'tJRFEOmNO7A',
            'P5i1PzEJ2zk',
            '_N_e3UaqMC8',
          ],
        },
      ],
    },
    {
      category: 'Logic & STEM',
      channels: [
        {
          name: 'Blippi',
          channelId: 'UC9lCOHZlFZeGR8BVCnWvfGg',
          why: 'Explores how things work — naturally building STEM curiosity.',
          videos: [
            'KvYMuubKJtw',
            '4YZiC_6BKGE',
            'T-p6Ld3JVMQ',
            'HpGPy8rl9yU',
            'YoJK-cEGrF0',
          ],
        },
      ],
    },
    {
      category: 'Media Literacy',
      channels: [
        {
          name: 'Sesame Street – Real vs Pretend',
          channelId: 'UCAcMDLFBKGKQOWiVINr6_OA',
          why: 'Helps children distinguish real from make-believe — core media skill.',
          videos: [
            'P5i1PzEJ2zk',
            'tJRFEOmNO7A',
            'hfiXXs7k1h4',
            'FSnmvuBJ0V4',
            '_N_e3UaqMC8',
          ],
        },
      ],
    },
    {
      category: 'Soft Skills',
      channels: [
        {
          name: 'Cosmic Kids Yoga',
          channelId: 'UCnwGOHBBEQ0iBGPsaqNm-qg',
          why: 'Builds focus and emotional regulation through mindful movement.',
          videos: [
            'L0ykpOEBcEI',
            'G_SaBSKV0tM',
            'RJUhHB5OM58',
            'XqFINaUBQqI',
            'blFAnMBzDoo',
          ],
        },
      ],
    },
  ],
  '7-10': [
    {
      category: 'Science & Tech',
      channels: [
        {
          name: 'National Geographic Kids',
          channelId: 'UCXVCgDuD_QCkI7gTKU7-tpg',
          why: 'Wildlife and ecosystems explored through stunning visuals.',
          videos: [
            'JI-eOikJHpk',
            'oWl4W5sLmCk',
            'H0LHXM8VGhU',
            'qF9oBdKJ76s',
            'Ky3GQbkKFU8',
          ],
        },
        {
          name: 'Peekaboo Kidz',
          channelId: 'UCQU5mlFBRSXF8PFh_ZnKcmA',
          why: 'Dives into biology, physics, and chemistry with great animation.',
          videos: [
            'MBnJhIGKaGY',
            'v-FjfPpGvk4',
            'RZgWrHiLJao',
            'y00Td2yOSV0',
            'k06bxKaqTUI',
          ],
        },
      ],
    },
    {
      category: 'Mathematics',
      channels: [
        {
          name: 'Mathantics',
          channelId: 'UCBuMwlP4HMjXXEFGJaXSFjA',
          why: "Rob's energetic teaching demystifies fractions and geometry.",
          videos: [
            'ZpMKLdRJZgM',
            'vgkahOeQdEI',
            'e5NH7vHlUKc',
            '_yn_IdbIiUNE',
            'F5DnWdm7Lis',
          ],
        },
        {
          name: 'Homeschool Pop',
          channelId: 'UCNIfGz9SURHJ-4oQzQgzSmA',
          why: 'Friendly clear lessons covering multiplication with real-world examples.',
          videos: [
            '2GJ8mgnzNow',
            'K2MHXElbA-Y',
            'oLpAIhgOjhk',
            'IAbpFvFV-zk',
            'FHy9d9iDiqE',
          ],
        },
      ],
    },
    {
      category: 'Critical Thinking & Life Skills',
      channels: [
        {
          name: 'TED-Ed',
          channelId: 'UCsooa4yRKGN_zEE8iknghZA',
          why: 'Short animated lessons that spark genuine curiosity and debate.',
          videos: [
            'ArAFdR7lkmo',
            'K9xK1VxMFmc',
            'yoI7G1tN9qs',
            'dkNXLKmxhfM',
            '_q_EzGbMlpk',
          ],
        },
      ],
    },
    {
      category: 'History & Geography',
      channels: [
        {
          name: 'National Geographic Kids',
          channelId: 'UCXVCgDuD_QCkI7gTKU7-tpg',
          why: 'World geography and cultures brought to life through expert filmmaking.',
          videos: [
            'JI-eOikJHpk',
            'oWl4W5sLmCk',
            'H0LHXM8VGhU',
            'qF9oBdKJ76s',
            'Ky3GQbkKFU8',
          ],
        },
        {
          name: 'Homeschool Pop',
          channelId: 'UCNIfGz9SURHJ-4oQzQgzSmA',
          why: 'Engaging history lessons on ancient civilisations for primary learners.',
          videos: [
            '2GJ8mgnzNow',
            'K2MHXElbA-Y',
            'oLpAIhgOjhk',
            'IAbpFvFV-zk',
            'FHy9d9iDiqE',
          ],
        },
      ],
    },
    {
      category: 'Arts & Creativity',
      channels: [
        {
          name: 'Art for Kids Hub',
          channelId: 'UC5XMF3J3680BxqyzOCFkAgQ',
          why: 'Hundreds of tutorials that build real artistic technique.',
          videos: [
            'j4wKeaTBQ4A',
            '5VbTDHqNYGE',
            'oBLBpWe0Rkk',
            '6A8GVyUABBw',
            'tGTcFpqQVUI',
          ],
        },
      ],
    },
    {
      category: 'Financial Literacy',
      channels: [
        {
          name: 'Practical Money Skills for Kids',
          channelId: 'UCBuMwlP4HMjXXEFGJaXSFjA',
          why: 'Fun stories that build healthy money habits from an early age.',
          videos: [
            'ZpMKLdRJZgM',
            'vgkahOeQdEI',
            'e5NH7vHlUKc',
            '_yn_IdbIiUNE',
            'F5DnWdm7Lis',
          ],
        },
      ],
    },
    {
      category: 'Logic & STEM',
      channels: [
        {
          name: 'Code.org',
          channelId: 'UCJyEBMU1xVP2be1-AoGS1BA',
          why: 'Introduces computational thinking and coding logic through puzzles.',
          videos: [
            'FC5FbmsH4fw',
            'nKIu9yen5nc',
            'OAx_6-wdslM',
            'HsXaVV6oFnE',
            'bQilo5ecSX4',
          ],
        },
      ],
    },
    {
      category: 'Media Literacy',
      channels: [
        {
          name: 'Common Sense Media',
          channelId: 'UCddiUEpeqJcYeBxX1IVBKvQ',
          why: 'Explains how adverts and algorithms work — digital citizenship.',
          videos: [
            'IVj70u0dLIQ',
            '1OtDsQ0Oqfc',
            '7m6Z2H4MJxk',
            'VFqW3uU0enM',
            'aBbyCkGvCNQ',
          ],
        },
      ],
    },
    {
      category: 'Soft Skills',
      channels: [
        {
          name: 'TED-Ed – Social Skills',
          channelId: 'UCsooa4yRKGN_zEE8iknghZA',
          why: 'Short films on communication and empathy children can apply immediately.',
          videos: [
            'ArAFdR7lkmo',
            'K9xK1VxMFmc',
            'yoI7G1tN9qs',
            'dkNXLKmxhfM',
            '_q_EzGbMlpk',
          ],
        },
      ],
    },
  ],
  '11-13': [
    {
      category: 'Science & Tech',
      channels: [
        {
          name: "It's Okay to be Smart",
          channelId: 'UCH4BNI0-FOK2dMXoFtViWHw',
          why: 'Cutting-edge science with genuine enthusiasm — makes curiosity cool.',
          videos: [
            'UjvnJCMOHv8',
            'MnANvkcoFkA',
            '7ImvlS8PLIo',
            '9zzFGJt2BXA',
            'L5d94HmFN9A',
          ],
        },
        {
          name: 'Crash Course Kids',
          channelId: 'UCddiUEpeqJcYeBxX1IVBKvQ',
          why: 'Beautifully animated science episodes with depth and wit.',
          videos: [
            'IVj70u0dLIQ',
            '1OtDsQ0Oqfc',
            '7m6Z2H4MJxk',
            'VFqW3uU0enM',
            'aBbyCkGvCNQ',
          ],
        },
      ],
    },
    {
      category: 'Mathematics',
      channels: [
        {
          name: 'Khan Academy',
          channelId: 'UC4a-Gbdw7vOaccHmFo40b9g',
          why: 'The gold standard of free maths — every topic, mastery-based.',
          videos: [
            'hvkBg0r_eFQ',
            '9t2Bf6TRiHI',
            'aBs6xp_F_OM',
            'p4gD7y7PTGY',
            'bjJkSk6lCR4',
          ],
        },
        {
          name: 'Math Antics',
          channelId: 'UCBuMwlP4HMjXXEFGJaXSFjA',
          why: 'Clear lessons on algebra and geometry that make the jump manageable.',
          videos: [
            'ZpMKLdRJZgM',
            'vgkahOeQdEI',
            'e5NH7vHlUKc',
            '_yn_IdbIiUNE',
            'F5DnWdm7Lis',
          ],
        },
      ],
    },
    {
      category: 'Critical Thinking & Life Skills',
      channels: [
        {
          name: 'TED-Ed',
          channelId: 'UCsooa4yRKGN_zEE8iknghZA',
          why: 'Philosophical puzzles and ethical dilemmas that train rigorous reasoning.',
          videos: [
            'ArAFdR7lkmo',
            'K9xK1VxMFmc',
            'yoI7G1tN9qs',
            'dkNXLKmxhfM',
            '_q_EzGbMlpk',
          ],
        },
      ],
    },
    {
      category: 'History & Geography',
      channels: [
        {
          name: 'Crash Course',
          channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q',
          why: 'John Green makes world history irresistibly engaging and rigorous.',
          videos: [
            'Yocja_N5s1I',
            'Y9OmCMSwLFU',
            'pjkVUhYuPvw',
            '2wlEUuMbXZk',
            'BJEzOzEMfm4',
          ],
        },
        {
          name: 'Geography Now',
          channelId: 'UCmmPgObSUPw1HL2lq6H4ffA',
          why: 'Every country explored in depth — culture, politics, and geography.',
          videos: [
            'TmVAPBmnCRQ',
            'Nj5BfVlRQgk',
            'Nq3hmHFfxF4',
            'DNZK5g2bYlk',
            'vxeOiuMXLiw',
          ],
        },
      ],
    },
    {
      category: 'Arts & Creativity',
      channels: [
        {
          name: 'Crash Course Arts',
          channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q',
          why: 'Art history and music theory explored with signature Crash Course wit.',
          videos: [
            'Yocja_N5s1I',
            'Y9OmCMSwLFU',
            'pjkVUhYuPvw',
            '2wlEUuMbXZk',
            'BJEzOzEMfm4',
          ],
        },
      ],
    },
    {
      category: 'Financial Literacy',
      channels: [
        {
          name: 'Two Cents (PBS)',
          channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g',
          why: 'Practical personal finance — budgets, savings, and basics of investing.',
          videos: [
            'Gc2en3nHxA4',
            'xT74Dnu54U0',
            'X6-mNTQQs9Q',
            'GCW0XzqNEzs',
            'lNDgDtXJkWI',
          ],
        },
      ],
    },
    {
      category: 'Logic & STEM',
      channels: [
        {
          name: 'Numberphile',
          channelId: 'UCoxcjq-8xIDTYp3uz647V5A',
          why: 'Mathematicians reveal fascinating patterns that make maths an adventure.',
          videos: [
            'd6iQrh2TK98',
            'YtkIWDE36qU',
            'Idxeo49szW0',
            'sG_6_zarFkk',
            'VcgmFPXKjSQ',
          ],
        },
      ],
    },
    {
      category: 'Media Literacy',
      channels: [
        {
          name: 'Crash Course Media Literacy',
          channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q',
          why: 'A full series on how media and bias work — consume info critically.',
          videos: [
            'Yocja_N5s1I',
            'Y9OmCMSwLFU',
            'pjkVUhYuPvw',
            '2wlEUuMbXZk',
            'BJEzOzEMfm4',
          ],
        },
      ],
    },
    {
      category: 'Soft Skills',
      channels: [
        {
          name: 'The School of Life',
          channelId: 'UC7IcJI8PUf5Z3zKxnZvTBog',
          why: 'Films on self-knowledge, communication, and emotional intelligence.',
          videos: [
            'B4GqXHFqKI8',
            'IJ2Psyxf5TY',
            'Y3ROXJnxRBs',
            '4J9pnvMKRCQ',
            'GFHi0aGgfDE',
          ],
        },
      ],
    },
  ],
  '14-16': [
    {
      category: 'Science & Tech',
      channels: [
        {
          name: 'Veritasium',
          channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA',
          why: 'Challenges misconceptions and reveals deep scientific truth.',
          videos: [
            'HeQX2HjkcNo',
            'e4IdzBGnLZI',
            'MO0r930Sn_8',
            'sNhhvQGsMEc',
            '3mnSDifDSxQ',
          ],
        },
        {
          name: 'Kurzgesagt',
          channelId: 'UCsXVk37bltHxD1rDPwtNM8Q',
          why: 'Stunning animations explain complex science with rare intellectual honesty.',
          videos: [
            'JtUAAXe_0VI',
            '1AElONvi9WQ',
            'UjtOGPJ62b8',
            'Pj-h6MEgE7I',
            'gLZJlf5rHVs',
          ],
        },
      ],
    },
    {
      category: 'Mathematics',
      channels: [
        {
          name: '3Blue1Brown',
          channelId: 'UCYO_jab_esuFRV4b17AJtAg',
          why: 'Visual approach to calculus and linear algebra — genuinely transformative.',
          videos: [
            'WUvTyaaNkzM',
            'kYB8IZa5AuE',
            'spUNpyF58BY',
            'phyHdJFSJoo',
            'Ilg3gGewQ5U',
          ],
        },
      ],
    },
    {
      category: 'Critical Thinking & Life Skills',
      channels: [
        {
          name: 'TED-Ed',
          channelId: 'UCsooa4yRKGN_zEE8iknghZA',
          why: 'Advanced philosophical content that prepares for university-level discourse.',
          videos: [
            'ArAFdR7lkmo',
            'K9xK1VxMFmc',
            'yoI7G1tN9qs',
            'dkNXLKmxhfM',
            '_q_EzGbMlpk',
          ],
        },
        {
          name: 'The School of Life',
          channelId: 'UC7IcJI8PUf5Z3zKxnZvTBog',
          why: 'Essays on psychology and philosophy that build mature emotional intelligence.',
          videos: [
            'B4GqXHFqKI8',
            'IJ2Psyxf5TY',
            'Y3ROXJnxRBs',
            '4J9pnvMKRCQ',
            'GFHi0aGgfDE',
          ],
        },
      ],
    },
    {
      category: 'History & Geography',
      channels: [
        {
          name: 'Crash Course',
          channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q',
          why: 'Full history series — ideal GCSE and A-level preparation.',
          videos: [
            'Yocja_N5s1I',
            'Y9OmCMSwLFU',
            'pjkVUhYuPvw',
            '2wlEUuMbXZk',
            'BJEzOzEMfm4',
          ],
        },
        {
          name: 'OverSimplified',
          channelId: 'UCNIuvl7V8zACPpTmmNIqP2A',
          why: 'Complex historical events made gripping through smart storytelling.',
          videos: [
            'HbpNFj9IGBQ',
            'th_0RGBXzLQ',
            'L3LIy71FRww',
            '9F9xhB8LSKc',
            'yUISWKPCGZw',
          ],
        },
      ],
    },
    {
      category: 'Arts & Creativity',
      channels: [
        {
          name: 'Every Frame a Painting',
          channelId: 'UCjFqcJQXGZ6T8RMSrPn0CsQ',
          why: 'Film analysis that develops visual literacy and appreciation of craft.',
          videos: [
            '3Q3eIpK_Xis',
            '3rE2QFVRk-I',
            'MF1qxpKRFlw',
            '7vfqkvwW2fs',
            '1u4QW1ZvPHo',
          ],
        },
      ],
    },
    {
      category: 'Financial Literacy',
      channels: [
        {
          name: 'Two Cents (PBS)',
          channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g',
          why: 'Covers investing, compound interest, taxes, and career finance.',
          videos: [
            'Gc2en3nHxA4',
            'xT74Dnu54U0',
            'X6-mNTQQs9Q',
            'GCW0XzqNEzs',
            'lNDgDtXJkWI',
          ],
        },
      ],
    },
    {
      category: 'Logic & STEM',
      channels: [
        {
          name: 'Computerphile',
          channelId: 'UC9-y-6csu5WGm29I7JiwpnA',
          why: 'CS experts unpack AI, cryptography, and programming — essential for future thinkers.',
          videos: [
            'AQDCe585Lnc',
            'XKu_SEDAykw',
            'a-SXfSbCJvQ',
            'LnEyjwdoj7g',
            'jkfliBMeLPY',
          ],
        },
        {
          name: 'Vsauce',
          channelId: 'UC6nSFpj9HTCZ5t-N3Rm3-HA',
          why: 'Michael Stevens explores paradoxes, logic, and the limits of knowledge.',
          videos: [
            'SrU9YDoXE88',
            '9QnfWhtujPA',
            '0duvAbqFx2Y',
            'R6ib5L2-Lmw',
            'C6eHHcFGMgA',
          ],
        },
      ],
    },
    {
      category: 'Media Literacy',
      channels: [
        {
          name: 'Folding Ideas',
          channelId: 'UCyNtlmLMoIV4KnSCB9JLQHQ',
          why: 'Deep media analysis that develops sophisticated critical thinking.',
          videos: [
            'e-QgMdmAXiA',
            'JaFrmjFBVhM',
            'S4PoCrUBDXA',
            'Y0K7rSfPPMo',
            'uqyRNSrPOt4',
          ],
        },
      ],
    },
    {
      category: 'Soft Skills',
      channels: [
        {
          name: 'The School of Life',
          channelId: 'UC7IcJI8PUf5Z3zKxnZvTBog',
          why: 'Deep essays on relationships, career, and communication — life preparation.',
          videos: [
            'B4GqXHFqKI8',
            'IJ2Psyxf5TY',
            'Y3ROXJnxRBs',
            '4J9pnvMKRCQ',
            'GFHi0aGgfDE',
          ],
        },
        {
          name: 'AsapSCIENCE',
          channelId: 'UCC552Sd-3nyi_tk2BudLUzA',
          why: 'Science-backed videos on productivity, motivation, and how the mind works.',
          videos: [
            'm2Ux2PnJe6E',
            'OGE8cCX0vQ8',
            'TLpbfC63D6E',
            'pUrFqBzx_MM',
            'kDp6P0PjGsA',
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Animated card wrapper (CSS-based since Framer Motion isn't available)
// ---------------------------------------------------------------------------
function FadeCard({ children, removing }) {
  return (
    <div
      style={{
        transition:
          'opacity 0.4s ease, transform 0.4s ease, max-height 0.5s ease',
        opacity: removing ? 0 : 1,
        transform: removing ? 'scale(0.95)' : 'scale(1)',
        maxHeight: removing ? 0 : 1000,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PIN pad modal
// ---------------------------------------------------------------------------
function PINModal({ title, onSuccess, onClose, currentPIN }) {
  const [entered, setEntered] = useState('');
  const [err, setErr] = useState(false);
  const tap = (d) => {
    if (entered.length >= 4) return;
    const next = entered + d;
    setEntered(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === currentPIN) {
          onSuccess();
        } else {
          setErr(true);
          setEntered('');
        }
      }, 200);
    }
  };
  const dots = Array(4)
    .fill(0)
    .map((_, i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background:
            i < entered.length ? '#6366f1' : 'var(--color-border-secondary)',
        }}
      />
    ));
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-background-primary)',
          borderRadius: 16,
          padding: '2rem',
          width: 280,
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 500,
            textAlign: 'center',
            margin: '0 0 4px',
          }}
        >
          {title}
        </h2>
        {err && (
          <p
            style={{
              fontSize: 12,
              color: '#dc2626',
              textAlign: 'center',
              margin: '4px 0',
            }}
          >
            Incorrect PIN. Try again.
          </p>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            margin: '16px 0 20px',
          }}
        >
          {dots}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((d, i) => (
            <button
              key={i}
              onClick={() =>
                d === '⌫'
                  ? setEntered((p) => p.slice(0, -1))
                  : d !== ''
                  ? tap(String(d))
                  : null
              }
              style={{
                padding: '14px 0',
                fontSize: 18,
                fontWeight: 500,
                borderRadius: 8,
                border: '0.5px solid var(--color-border-tertiary)',
                background:
                  d === ''
                    ? 'transparent'
                    : 'var(--color-background-secondary)',
                cursor: d === '' ? 'default' : 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '10px 0',
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Change PIN modal (two-step)
// ---------------------------------------------------------------------------
function ChangePINModal({ currentPIN, onSave, onClose }) {
  const [step, setStep] = useState(1); // 1=verify old, 2=new, 3=confirm
  const [old, setOld] = useState('');
  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const [err, setErr] = useState('');
  const active = step === 1 ? old : step === 2 ? n1 : n2;
  const setActive = step === 1 ? setOld : step === 2 ? setN1 : setN2;
  const tap = (d) => {
    if (active.length >= 4) return;
    const next = active + d;
    setActive(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (step === 1) {
          if (next === currentPIN) {
            setStep(2);
            setErr('');
          } else {
            setErr('Incorrect current PIN');
            setOld('');
          }
        } else if (step === 2) {
          setStep(3);
          setErr('');
        } else {
          if (next === n1) {
            onSave(n1);
          } else {
            setErr("PINs don't match");
            setN1('');
            setN2('');
            setStep(2);
          }
        }
      }, 200);
    }
  };
  const label =
    step === 1
      ? 'Enter current PIN'
      : step === 2
      ? 'Enter new PIN'
      : 'Confirm new PIN';
  const val = step === 1 ? old : step === 2 ? n1 : n2;
  const dots = Array(4)
    .fill(0)
    .map((_, i) => (
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background:
            i < val.length ? '#6366f1' : 'var(--color-border-secondary)',
        }}
      />
    ));
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-background-primary)',
          borderRadius: 16,
          padding: '2rem',
          width: 280,
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 500,
            textAlign: 'center',
            margin: '0 0 4px',
          }}
        >
          Change PIN
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            margin: '0 0 8px',
          }}
        >
          {label}
        </p>
        {err && (
          <p
            style={{
              fontSize: 12,
              color: '#dc2626',
              textAlign: 'center',
              margin: '0 0 8px',
            }}
          >
            {err}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            margin: '8px 0 20px',
          }}
        >
          {dots}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((d, i) => (
            <button
              key={i}
              onClick={() =>
                d === '⌫'
                  ? setActive((p) => p.slice(0, -1))
                  : d !== ''
                  ? tap(String(d))
                  : null
              }
              style={{
                padding: '14px 0',
                fontSize: 18,
                fontWeight: 500,
                borderRadius: 8,
                border: '0.5px solid var(--color-border-tertiary)',
                background:
                  d === ''
                    ? 'transparent'
                    : 'var(--color-background-secondary)',
                cursor: d === '' ? 'default' : 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '10px 0',
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Age selection screen
// ---------------------------------------------------------------------------
function AgeSelect({ onSelect }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--color-background-tertiary)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          margin: '0 0 6px',
          textAlign: 'center',
        }}
      >
        Welcome to The Knowledge Journey
      </h1>
      <p
        style={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          margin: '0 0 2rem',
          textAlign: 'center',
        }}
      >
        Select your age group to get started
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: 560,
        }}
      >
        {AGE_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            style={{
              padding: '1.5rem 1rem',
              borderRadius: 16,
              border: `2px solid ${g.accent}40`,
              background: g.light,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = 'scale(1.03)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{g.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: g.accent }}>
              {g.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                marginTop: 2,
              }}
            >
              {g.range}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video player card
// ---------------------------------------------------------------------------
function VideoCard({ ch, ageAccent, ageLight, onWatched, onMastered }) {
  const [watchedIds, setWatchedIds] = useState([]);
  const [removing, setRemoving] = useState(null);
  const [queue, setQueue] = useState(ch.videos.slice(0, 5));
  const [apiVids, setApiVids] = useState([]);
  const [playing, setPlaying] = useState(null);
  const mastered = watchedIds.length >= 5 || queue.length === 0;

  useEffect(() => {
    if (YT_KEY && ch.channelId) {
      fetchTopVideos(ch.channelId).then((vids) => {
        if (vids.length) setApiVids(vids.map((v) => v.id));
      });
    }
  }, [ch.channelId]);

  const currentVideos = (apiVids.length ? apiVids : queue).filter(
    (id) => !watchedIds.includes(id)
  );

  const markWatched = (vid) => {
    setRemoving(vid);
    setTimeout(() => {
      const next = [...watchedIds, vid];
      setWatchedIds(next);
      setRemoving(null);
      if (playing === vid) setPlaying(null);
      if (next.length >= 5) onMastered && onMastered(ch.name);
    }, 450);
  };

  if (mastered) {
    return (
      <div
        style={{
          background: 'var(--color-background-primary)',
          border: `1.5px solid ${ageAccent}`,
          borderRadius: 12,
          padding: '1.25rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: ageAccent }}>
          Channel Mastered!
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginTop: 4,
          }}
        >
          {ch.name}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: ageLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {CAT_ICONS['Science & Tech']}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{ch.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              {currentVideos.length} video
              {currentVideos.length !== 1 ? 's' : ''} remaining
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              background: ageLight,
              padding: '3px 8px',
              borderRadius: 20,
            }}
          >
            {watchedIds.length}/5 watched
          </div>
        </div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            margin: '8px 0 0',
            lineHeight: 1.5,
          }}
        >
          {ch.why}
        </p>
      </div>
      <div
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {currentVideos.slice(0, 5).map((vid) => (
          <FadeCard key={vid} removing={removing === vid}>
            <div
              style={{
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {playing === vid ? (
                <div
                  style={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    background: '#000',
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`}
                    title="video"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => setPlaying(vid)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                    alt=""
                    style={{ width: '100%', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          borderLeft: '18px solid #e00',
                          borderTop: '11px solid transparent',
                          borderBottom: '11px solid transparent',
                          marginLeft: 4,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  padding: '8px 10px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 6,
                }}
              >
                {playing === vid && (
                  <button
                    onClick={() => setPlaying(null)}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '0.5px solid var(--color-border-secondary)',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => markWatched(vid)}
                  style={{
                    padding: '5px 14px',
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 6,
                    border: 'none',
                    background: ageAccent,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Finished
                </button>
              </div>
            </div>
          </FadeCard>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------
export default function App() {
  const [selectedAge, setSelectedAge] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Science & Tech');
  const [pin, setPIN] = useState('1234');
  const [showPINModal, setShowPINModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [masteredChannels, setMasteredChannels] = useState({});

  const group = AGE_GROUPS.find((g) => g.id === selectedAge);

  // Strict age gating: filter out higher age group content
  const allowedAges = selectedAge
    ? AGE_ORDER.slice(0, AGE_ORDER.indexOf(selectedAge) + 1)
    : [];
  const filteredData = selectedAge
    ? allowedAges
        .flatMap((age) => RAW[age] || [])
        .reduce((acc, catObj) => {
          const existing = acc.find((a) => a.category === catObj.category);
          if (existing)
            existing.channels = [...existing.channels, ...catObj.channels];
          else acc.push({ ...catObj, channels: [...catObj.channels] });
          return acc;
        }, [])
    : [];

  if (!selectedAge)
    return (
      <AgeSelect
        onSelect={(id) => {
          setSelectedAge(id);
          setActiveCategory('Science & Tech');
        }}
      />
    );

  const currentCat =
    filteredData.find((c) => c.category === activeCategory) || filteredData[0];

  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
        background: 'var(--color-background-tertiary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: group.accent,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{group.emoji}</span>
            <h1
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 500,
                margin: 0,
              }}
            >
              The Knowledge Journey
            </h1>
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 12,
              margin: '2px 0 0',
            }}
          >
            {group.label} · {group.range}
          </p>
        </div>
        <button
          onClick={() => setShowPINModal(true)}
          title="Parental Settings"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: 18,
            color: '#fff',
          }}
        >
          🔒
        </button>
      </div>

      {/* Age tabs (switch age via parental lock) */}
      <div
        style={{
          background: 'var(--color-background-primary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '0 1rem',
            gap: 4,
            minWidth: 'max-content',
          }}
        >
          {AGE_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                if (g.id === selectedAge) return;
                setShowPINModal(true);
              }}
              style={{
                padding: '12px 16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                background: 'transparent',
                whiteSpace: 'nowrap',
                color:
                  selectedAge === g.id
                    ? g.accent
                    : 'var(--color-text-secondary)',
                borderBottom:
                  selectedAge === g.id
                    ? `2.5px solid ${g.accent}`
                    : '2.5px solid transparent',
              }}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          padding: '1.5rem 1rem',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Category sidebar */}
        <div style={{ width: 172, flexShrink: 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}
          >
            Categories
          </p>
          {filteredData.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                marginBottom: 3,
                border: '0.5px solid',
                borderColor:
                  activeCategory === cat.category
                    ? group.accent
                    : 'var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer',
                fontSize: 12,
                background:
                  activeCategory === cat.category
                    ? group.light
                    : 'var(--color-background-primary)',
                color:
                  activeCategory === cat.category
                    ? group.accent
                    : 'var(--color-text-primary)',
                fontWeight: activeCategory === cat.category ? 500 : 400,
              }}
            >
              <span style={{ fontSize: 14 }}>
                {CAT_ICONS[cat.category] || '📚'}
              </span>
              <span style={{ lineHeight: 1.3 }}>{cat.category}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }}>
              {CAT_ICONS[currentCat?.category]}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>
              {currentCat?.category}
            </h2>
            <span
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 20,
                background: group.light,
                color: group.accent,
                fontWeight: 500,
              }}
            >
              {group.label}
            </span>
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {currentCat?.channels.map((ch, i) => (
              <VideoCard
                key={ch.name + i}
                ch={ch}
                ageAccent={group.accent}
                ageLight={group.light}
                catIcon={CAT_ICONS[currentCat.category] || '📚'}
                onMastered={(name) =>
                  setMasteredChannels((p) => ({ ...p, [name]: true }))
                }
              />
            ))}
          </div>

          {/* Learning tip */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: group.light,
              borderRadius: 'var(--border-radius-lg)',
              border: `0.5px solid ${group.accent}40`,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: group.accent,
                margin: '0 0 4px',
              }}
            >
              Learning tip for {group.range}
            </p>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {selectedAge === '3-6' &&
                'Watch together and ask open questions. Co-viewing dramatically boosts learning outcomes.'}
              {selectedAge === '7-10' &&
                'Encourage note-taking or drawing what they learn. Active recall cements knowledge powerfully.'}
              {selectedAge === '11-13' &&
                "Challenge them to teach you what they've learned. Teaching others deepens understanding by up to 90%."}
              {selectedAge === '14-16' &&
                'Pair videos with related books or articles. Multi-modal learning builds the highest-order thinking.'}
            </p>
          </div>
        </div>
      </div>

      {/* Parental lock PIN entry */}
      {showPINModal && !showSettings && (
        <PINModal
          title="Parental Lock"
          currentPIN={pin}
          onSuccess={() => {
            setShowPINModal(false);
            setShowSettings(true);
          }}
          onClose={() => setShowPINModal(false)}
        />
      )}

      {/* Settings panel */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'var(--color-background-primary)',
              borderRadius: 16,
              padding: '2rem',
              width: 320,
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px' }}>
              Parental Settings
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                margin: '0 0 20px',
              }}
            >
              Manage age group and security
            </p>

            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Select age group
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {AGE_GROUPS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedAge(g.id);
                    setActiveCategory('Science & Tech');
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 8,
                    border: `1.5px solid ${
                      selectedAge === g.id
                        ? g.accent
                        : 'var(--color-border-tertiary)'
                    }`,
                    background:
                      selectedAge === g.id
                        ? g.light
                        : 'var(--color-background-secondary)',
                    cursor: 'pointer',
                    fontSize: 12,
                    color:
                      selectedAge === g.id
                        ? g.accent
                        : 'var(--color-text-primary)',
                    fontWeight: selectedAge === g.id ? 500 : 400,
                  }}
                >
                  {g.emoji} {g.label}
                  <br />
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{g.range}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowSettings(false);
                setShowChangePIN(true);
              }}
              style={{
                width: '100%',
                padding: '10px 0',
                marginBottom: 8,
                borderRadius: 8,
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-secondary)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              🔑 Change PIN
            </button>
            <button
              onClick={() => {
                setShowSettings(false);
                setSelectedAge(null);
              }}
              style={{
                width: '100%',
                padding: '10px 0',
                marginBottom: 8,
                borderRadius: 8,
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-secondary)',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--color-text-secondary)',
              }}
            >
              ↩ Back to age selection
            </button>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 8,
                border: 'none',
                background: '#6366f1',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Change PIN flow */}
      {showChangePIN && (
        <ChangePINModal
          currentPIN={pin}
          onSave={(newPIN) => {
            setPIN(newPIN);
            setShowChangePIN(false);
            setShowSettings(true);
          }}
          onClose={() => {
            setShowChangePIN(false);
            setShowSettings(true);
          }}
        />
      )}
    </div>
  );
}
