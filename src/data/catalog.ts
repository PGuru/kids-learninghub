import type { AgeGroup, AgeId, Category } from '../types';

// Curated catalogue. `videos` are fallback IDs used when no YouTube API key is configured.
export const AGE_GROUPS: AgeGroup[] = [
  { id: '3-6',   label: 'Early Years',   range: 'Ages 3–6',   emoji: '🌱', accent: '#16a34a', light: '#dcfce7' },
  { id: '7-10',  label: 'Primary',       range: 'Ages 7–10',  emoji: '🚀', accent: '#2563eb', light: '#dbeafe' },
  { id: '11-13', label: 'Middle School', range: 'Ages 11–13', emoji: '🔭', accent: '#7c3aed', light: '#ede9fe' },
  { id: '14-16', label: 'High School',   range: 'Ages 14–16', emoji: '⚡', accent: '#ea580c', light: '#fed7aa' },
];
export const AGE_ORDER: AgeId[] = ['3-6', '7-10', '11-13', '14-16'];
export const ageIndex = (id: AgeId) => AGE_ORDER.indexOf(id);

export const CAT_ICONS: Record<string, string> = {
  'Science & Tech': '🔬', 'Mathematics': '📐', 'Critical Thinking & Life Skills': '🧠',
  'History & Geography': '🌍', 'Arts & Creativity': '🎨', 'Financial Literacy': '💰',
  'Logic & STEM': '⚙️', 'Media Literacy': '📱', 'Soft Skills': '🤝',
};

export const CATALOG: Record<AgeId, Category[]> = {
  '3-6': [
    { category: 'Science & Tech', channels: [
      { name: 'SciShow Kids',  channelId: 'UCRFIPG2u1DxKLNuE3y2SjHA', why: "Answers curious 'why' questions with fun experiments.", videos: ['g5f-8QXKjuQ','dLQ0lHpyZd8','kSlq08dm89I','9_y3i3_lCiY','zVHBgm9MMJE'] },
      { name: 'Peekaboo Kidz', channelId: 'UCxlJ45KjG4XVcQ_hd8j227A', why: 'Colorful animated science shorts with sing-along energy.', videos: ['MBnJhIGKaGY','v-FjfPpGvk4','RZgWrHiLJao','y00Td2yOSV0','k06bxKaqTUI'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Numberblocks', channelId: 'UCPlwvN0w4qFSP1FllALB92w', why: 'Turns numbers into lovable characters, building real numeracy.', videos: ['ipSnLSMnDmY','MKuNxpBNSzE','cvjl4VFXPW0','OBKuHCTKHgM','U4JlhVm2Ysk'] },
      { name: 'Alphablocks',  channelId: 'UC_qs3c0ehDvZkbiEbOj6Drg', why: 'Letters come alive to teach phonics and early reading.', videos: ['6Q1nDFKMjS0','yDc3Pb3yFMU','d0R3QKOiF_8','j8X2L3VUYAM','pGdpvIOFGSY'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'Sesame Street',              channelId: 'UCoookXUzPciGrEZEXmh4Jjg', why: 'Decades of research-backed content on empathy and social skills.', videos: ['tJRFEOmNO7A','hfiXXs7k1h4','P5i1PzEJ2zk','FSnmvuBJ0V4','_N_e3UaqMC8'] },
      { name: "Daniel Tiger's Neighbourhood", channelId: 'UCDqgSnRMGVx3dP4sn3ATZMA', why: 'Gentle social-emotional learning through relatable scenarios.', videos: ['tJRFEOmNO7A','hfiXXs7k1h4','P5i1PzEJ2zk','FSnmvuBJ0V4','_N_e3UaqMC8'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Kids Learning Tube', channelId: 'UC7EFWpvc1wYuUwrtZ_BLi9A', why: 'Geography and countries explained through catchy original songs.', videos: ['p6nylxFWFkQ','mRhfO7IQ6lk','TN1YMQ2mFaA','u5j6XqkZFrA','LLzp9mSZ7qA'] },
      { name: 'Nat Geo Kids',       channelId: 'UCXVCgDuD_QCkI7gTKU7-tpg', why: 'Wildlife and world places through stunning visuals.', videos: ['p6nylxFWFkQ','mRhfO7IQ6lk','TN1YMQ2mFaA','u5j6XqkZFrA','LLzp9mSZ7qA'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Art for Kids Hub', channelId: 'UC5XMF3Inoi8R9nSI8ChOsdQ', why: 'Step-by-step drawing tutorials that build creative confidence.', videos: ['j4wKeaTBQ4A','5VbTDHqNYGE','oBLBpWe0Rkk','6A8GVyUABBw','tGTcFpqQVUI'] },
      { name: 'Cosmic Kids Yoga', channelId: 'UC5uIZ2KOZZeQDQo_Gsi_qbQ', why: 'Builds creativity and calm through storytelling and movement.', videos: ['L0ykpOEBcEI','G_SaBSKV0tM','RJUhHB5OM58','XqFINaUBQqI','blFAnMBzDoo'] },
    ]},
    { category: 'Financial Literacy', channels: [
      { name: 'Hey Duggee Official', channelId: 'UCj_mFUb-47d9QNiJ5556LjQ', why: 'Badge-earning adventures that teach responsibility and value.', videos: ['hfiXXs7k1h4','FSnmvuBJ0V4','tJRFEOmNO7A','P5i1PzEJ2zk','_N_e3UaqMC8'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Simple Learning for Kids', channelId: 'UCStMBYkcDWY3oJhMW-f0adA', why: 'Explores how things work — naturally building STEM curiosity.', videos: ['KvYMuubKJtw','4YZiC_6BKGE','T-p6Ld3JVMQ','HpGPy8rl9yU','YoJK-cEGrF0'] },
      { name: 'Learning Mole',           channelId: 'UCq2Sm0h2cDmqKtlaonWNUpQ', why: 'Fun STEM explorations for little learners.', videos: ['KvYMuubKJtw','4YZiC_6BKGE','T-p6Ld3JVMQ','HpGPy8rl9yU','YoJK-cEGrF0'] },
    ]},
    { category: 'Media Literacy', channels: [
      { name: 'Common Sense Education', channelId: 'UCu378IVA2__mBS_AO5197FQ', why: 'Helps children distinguish real from make-believe.', videos: ['P5i1PzEJ2zk','tJRFEOmNO7A','hfiXXs7k1h4','FSnmvuBJ0V4','_N_e3UaqMC8'] },
      { name: 'PBS Kids',               channelId: 'UCrNnk0wFBnCS1awGjq_ijGQ', why: 'Age-appropriate media with positive values woven in.', videos: ['P5i1PzEJ2zk','tJRFEOmNO7A','hfiXXs7k1h4','FSnmvuBJ0V4','_N_e3UaqMC8'] },
    ]},
    { category: 'Soft Skills', channels: [
      { name: 'Super Simple Songs', channelId: 'UCLsooMJoIpl_7ux2jvdPB-Q', why: 'Builds focus and emotional regulation through sing-along learning.', videos: ['L0ykpOEBcEI','G_SaBSKV0tM','RJUhHB5OM58','XqFINaUBQqI','blFAnMBzDoo'] },
    ]},
  ],
  '7-10': [
    { category: 'Science & Tech', channels: [
      { name: 'National Geographic Kids', channelId: 'UCXVCgDuD_QCkI7gTKU7-tpg', why: 'Wildlife and ecosystems explored through stunning visuals.', videos: ['JI-eOikJHpk','oWl4W5sLmCk','H0LHXM8VGhU','qF9oBdKJ76s','Ky3GQbkKFU8'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Mathantics',    channelId: 'UCBuMwlP7kHkNxdPAqtFSJTw', why: "Rob's energetic teaching demystifies fractions and geometry.", videos: ['ZpMKLdRJZgM','vgkahOeQdEI','e5NH7vHlUKc','_yn_IdbIiUNE','F5DnWdm7Lis'] },
      { name: 'Homeschool Pop', channelId: 'UCfPyVJEBD7Di1YYjTdS2v8g', why: 'Friendly clear lessons with real-world examples.', videos: ['2GJ8mgnzNow','K2MHXElbA-Y','oLpAIhgOjhk','IAbpFvFV-zk','FHy9d9iDiqE'] },
      { name: 'Khan Academy',  channelId: 'UC2ri4rEb8abnNwXvTjg5ARw', why: 'Mastery-based maths for every level.', videos: ['2GJ8mgnzNow','K2MHXElbA-Y','oLpAIhgOjhk','IAbpFvFV-zk','FHy9d9iDiqE'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'TED-Ed',     channelId: 'UCsooa4yRKGN_zEE8iknghZA', why: 'Short animated lessons that spark genuine curiosity.', videos: ['ArAFdR7lkmo','K9xK1VxMFmc','yoI7G1tN9qs','dkNXLKmxhfM','_q_EzGbMlpk'] },
      { name: 'Bright Side', channelId: 'UC4rlAVgAK0SGk-yTfe48Qpw', why: 'Fun riddles and challenges that train lateral thinking.', videos: ['ArAFdR7lkmo','K9xK1VxMFmc','yoI7G1tN9qs','dkNXLKmxhfM','_q_EzGbMlpk'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Geography Now', channelId: 'UCmmPgObSUPw1HL2lq6H4ffA', why: 'World geography and cultures through expert filmmaking.', videos: ['JI-eOikJHpk','oWl4W5sLmCk','H0LHXM8VGhU','qF9oBdKJ76s','Ky3GQbkKFU8'] },
      { name: 'Simple History', channelId: 'UC510QYlOlKNyhy_zdQxnGYw', why: 'Engaging history lessons on ancient civilisations.', videos: ['2GJ8mgnzNow','K2MHXElbA-Y','oLpAIhgOjhk','IAbpFvFV-zk','FHy9d9iDiqE'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Red Ted Art', channelId: 'UCjjRFKvjpU1L1eDmfBWcqig', why: 'Tutorials that build real artistic technique.', videos: ['j4wKeaTBQ4A','5VbTDHqNYGE','oBLBpWe0Rkk','6A8GVyUABBw','tGTcFpqQVUI'] },
    ]},
    { category: 'Financial Literacy', channels: [
      { name: 'Practical Money Skills for Kids', channelId: 'UCKCsVSA5THlkHbnkZTPm6-g', why: 'Fun stories that build healthy money habits.', videos: ['ZpMKLdRJZgM','vgkahOeQdEI','e5NH7vHlUKc','_yn_IdbIiUNE','F5DnWdm7Lis'] },
      { name: 'Biz Kids',                        channelId: 'UCufmiGK0I_9g_iwUR-E8mwA', why: 'Kids learning entrepreneurship through stories.', videos: ['ZpMKLdRJZgM','vgkahOeQdEI','e5NH7vHlUKc','_yn_IdbIiUNE','F5DnWdm7Lis'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Code.org',        channelId: 'UCJyEBMU1xVP2be1-AoGS1BA', why: 'Computational thinking and coding logic through puzzles.', videos: ['FC5FbmsH4fw','nKIu9yen5nc','OAx_6-wdslM','HsXaVV6oFnE','bQilo5ecSX4'] },
      { name: 'Crash Course Kids', channelId: 'UCONtPx56PSebXJOxbFv-2jQ', why: 'Science and engineering fundamentals with energy.', videos: ['FC5FbmsH4fw','nKIu9yen5nc','OAx_6-wdslM','HsXaVV6oFnE','bQilo5ecSX4'] },
      { name: 'Tinkernut',       channelId: 'UCZDA1kA3y3EIg25BpcHSpwQ', why: 'Hands-on tech projects for curious minds.', videos: ['FC5FbmsH4fw','nKIu9yen5nc','OAx_6-wdslM','HsXaVV6oFnE','bQilo5ecSX4'] },
    ]},
    { category: 'Media Literacy', channels: [
      { name: 'Common Sense Media', channelId: 'UCddiUEpeqJcYeBxX1IVBKvQ', why: 'Explains how adverts and algorithms work.', videos: ['IVj70u0dLIQ','1OtDsQ0Oqfc','7m6Z2H4MJxk','VFqW3uU0enM','aBbyCkGvCNQ'] },
    ]},
    { category: 'Soft Skills', channels: [
      { name: 'Charisma on Command', channelId: 'UCU_W0oE_ock8bWKjALiGs8Q', why: 'Films on communication and empathy.', videos: ['ArAFdR7lkmo','K9xK1VxMFmc','yoI7G1tN9qs','dkNXLKmxhfM','_q_EzGbMlpk'] },
    ]},
  ],
  '11-13': [
    { category: 'Science & Tech', channels: [
      { name: "It's Okay to be Smart", channelId: 'UCH4BNI0-FOK2dMXoFtViWHw', why: 'Cutting-edge science that makes curiosity cool.', videos: ['UjvnJCMOHv8','MnANvkcoFkA','7ImvlS8PLIo','9zzFGJt2BXA','L5d94HmFN9A'] },
      { name: 'Crash Course Kids',     channelId: 'UCddiUEpeqJcYeBxX1IVBKvQ', why: 'Animated science episodes with depth and wit.', videos: ['IVj70u0dLIQ','1OtDsQ0Oqfc','7m6Z2H4MJxk','VFqW3uU0enM','aBbyCkGvCNQ'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Khan Academy', channelId: 'UC4a-Gbdw7vOaccHmFo40b9g', why: 'The gold standard of free maths — mastery-based.', videos: ['hvkBg0r_eFQ','9t2Bf6TRiHI','aBs6xp_F_OM','p4gD7y7PTGY','bjJkSk6lCR4'] },
      { name: 'Math Antics',  channelId: 'UCBuMwlP7kHkNxdPAqtFSJTw', why: 'Clear lessons on algebra and geometry.', videos: ['ZpMKLdRJZgM','vgkahOeQdEI','e5NH7vHlUKc','_yn_IdbIiUNE','F5DnWdm7Lis'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'TED-Ed', channelId: 'UCsooa4yRKGN_zEE8iknghZA', why: 'Philosophical puzzles that train rigorous reasoning.', videos: ['ArAFdR7lkmo','K9xK1VxMFmc','yoI7G1tN9qs','dkNXLKmxhfM','_q_EzGbMlpk'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Crash Course',  channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q', why: 'John Green makes world history irresistibly engaging.', videos: ['Yocja_N5s1I','Y9OmCMSwLFU','pjkVUhYuPvw','2wlEUuMbXZk','BJEzOzEMfm4'] },
      { name: 'Geography Now', channelId: 'UCmmPgObSUPw1HL2lq6H4ffA', why: 'Every country explored in depth.', videos: ['TmVAPBmnCRQ','Nj5BfVlRQgk','Nq3hmHFfxF4','DNZK5g2bYlk','vxeOiuMXLiw'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Crash Course Arts', channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q', why: 'Art history and music theory with Crash Course wit.', videos: ['Yocja_N5s1I','Y9OmCMSwLFU','pjkVUhYuPvw','2wlEUuMbXZk','BJEzOzEMfm4'] },
    ]},
    { category: 'Financial Literacy', channels: [
      { name: 'Two Cents (PBS)', channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g', why: 'Practical personal finance — budgets, savings, investing.', videos: ['Gc2en3nHxA4','xT74Dnu54U0','X6-mNTQQs9Q','GCW0XzqNEzs','lNDgDtXJkWI'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Numberphile', channelId: 'UCoxcjq-8xIDTYp3uz647V5A', why: 'Mathematicians reveal patterns that make maths an adventure.', videos: ['d6iQrh2TK98','YtkIWDE36qU','Idxeo49szW0','sG_6_zarFkk','VcgmFPXKjSQ'] },
    ]},
    { category: 'Media Literacy', channels: [
      { name: 'Crash Course Media Literacy', channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q', why: 'How media and bias work — consume info critically.', videos: ['Yocja_N5s1I','Y9OmCMSwLFU','pjkVUhYuPvw','2wlEUuMbXZk','BJEzOzEMfm4'] },
    ]},
    { category: 'Soft Skills', channels: [
      { name: 'The School of Life', channelId: 'UC7IcJI8PUf5Z3zKxnZvTBog', why: 'Films on self-knowledge, communication, emotional intelligence.', videos: ['B4GqXHFqKI8','IJ2Psyxf5TY','Y3ROXJnxRBs','4J9pnvMKRCQ','GFHi0aGgfDE'] },
    ]},
  ],
  '14-16': [
    { category: 'Science & Tech', channels: [
      { name: 'Veritasium', channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA', why: 'Challenges misconceptions and reveals deep scientific truth.', videos: ['HeQX2HjkcNo','e4IdzBGnLZI','MO0r930Sn_8','sNhhvQGsMEc','3mnSDifDSxQ'] },
      { name: 'Kurzgesagt',  channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', why: 'Stunning animations explain complex science.', videos: ['JtUAAXe_0VI','1AElONvi9WQ','UjtOGPJ62b8','Pj-h6MEgE7I','gLZJlf5rHVs'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: '3Blue1Brown', channelId: 'UCYO_jab_esuFRV4b17AJtAg', why: 'Visual approach to calculus and linear algebra.', videos: ['WUvTyaaNkzM','kYB8IZa5AuE','spUNpyF58BY','phyHdJFSJoo','Ilg3gGewQ5U'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'TED-Ed',           channelId: 'UCsooa4yRKGN_zEE8iknghZA', why: 'Advanced philosophical content for university-level discourse.', videos: ['ArAFdR7lkmo','K9xK1VxMFmc','yoI7G1tN9qs','dkNXLKmxhfM','_q_EzGbMlpk'] },
      { name: 'The School of Life', channelId: 'UC7IcJI8PUf5Z3zKxnZvTBog', why: 'Essays on psychology and philosophy.', videos: ['B4GqXHFqKI8','IJ2Psyxf5TY','Y3ROXJnxRBs','4J9pnvMKRCQ','GFHi0aGgfDE'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Crash Course',   channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q', why: 'Full history series — ideal GCSE and A-level prep.', videos: ['Yocja_N5s1I','Y9OmCMSwLFU','pjkVUhYuPvw','2wlEUuMbXZk','BJEzOzEMfm4'] },
      { name: 'OverSimplified', channelId: 'UCNIuvl7V8zACPpTmmNIqP2A', why: 'Complex historical events made gripping.', videos: ['HbpNFj9IGBQ','th_0RGBXzLQ','L3LIy71FRww','9F9xhB8LSKc','yUISWKPCGZw'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Every Frame a Painting', channelId: 'UCjFqcJQXGZ6T8RMSrPn0CsQ', why: 'Film analysis that develops visual literacy.', videos: ['3Q3eIpK_Xis','3rE2QFVRk-I','MF1qxpKRFlw','7vfqkvwW2fs','1u4QW1ZvPHo'] },
    ]},
    { category: 'Financial Literacy', channels: [
      { name: 'Two Cents (PBS)', channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g', why: 'Investing, compound interest, taxes, and career finance.', videos: ['Gc2en3nHxA4','xT74Dnu54U0','X6-mNTQQs9Q','GCW0XzqNEzs','lNDgDtXJkWI'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Computerphile', channelId: 'UC9-y-6csu5WGm29I7JiwpnA', why: 'AI, cryptography, and programming from CS experts.', videos: ['AQDCe585Lnc','XKu_SEDAykw','a-SXfSbCJvQ','LnEyjwdoj7g','jkfliBMeLPY'] },
      { name: 'Vsauce',        channelId: 'UC6nSFpj9HTCZ5t-N3Rm3-HA', why: 'Paradoxes, logic, and the limits of human knowledge.', videos: ['SrU9YDoXE88','9QnfWhtujPA','0duvAbqFx2Y','R6ib5L2-Lmw','C6eHHcFGMgA'] },
    ]},
    { category: 'Media Literacy', channels: [
      { name: 'Folding Ideas', channelId: 'UCyNtlmLMoIV4KnSCB9JLQHQ', why: 'Deep media analysis for sophisticated critical thinking.', videos: ['e-QgMdmAXiA','JaFrmjFBVhM','S4PoCrUBDXA','Y0K7rSfPPMo','uqyRNSrPOt4'] },
    ]},
    { category: 'Soft Skills', channels: [
      { name: 'The School of Life', channelId: 'UC7IcJI8PUf5Z3zKxnZvTBog', why: 'Deep essays on relationships, career, and communication.', videos: ['B4GqXHFqKI8','IJ2Psyxf5TY','Y3ROXJnxRBs','4J9pnvMKRCQ','GFHi0aGgfDE'] },
      { name: 'AsapSCIENCE',       channelId: 'UCC552Sd-3nyi_tk2BudLUzA', why: 'Science-backed videos on productivity and motivation.', videos: ['m2Ux2PnJe6E','OGE8cCX0vQ8','TLpbfC63D6E','pUrFqBzx_MM','kDp6P0PjGsA'] },
    ]},
  ],
};

export const TIPS: Record<AgeId, string> = {
  '3-6':   'Watch together and ask open questions. Co-viewing dramatically boosts learning outcomes.',
  '7-10':  'Encourage note-taking or drawing what they learn. Active recall cements knowledge powerfully.',
  '11-13': "Challenge them to teach you what they've learned. Teaching others deepens understanding.",
  '14-16': 'Pair videos with related books or articles. Multi-modal learning builds the highest-order thinking.',
};

export const ageGroup = (id: AgeId) => AGE_GROUPS.find(g => g.id === id)!;

// Every unique channelId for an age group
export function allChannelIds(ageId: AgeId): string[] {
  const seen = new Set<string>();
  CATALOG[ageId].forEach(cat => cat.channels.forEach(ch => seen.add(ch.channelId)));
  return [...seen];
}
