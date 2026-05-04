import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// STORAGE LAYER
// Artifact sandbox: uses in-memory store.
// For Vercel/StackBlitz: set USE_LOCAL_STORAGE = true
// ============================================================================
const USE_LOCAL_STORAGE = true;
const _mem = {};
const store = {
  get:    (k)    => { if (USE_LOCAL_STORAGE) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } } return _mem[k] ?? null; },
  set:    (k, v) => { if (USE_LOCAL_STORAGE) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } else { _mem[k] = v; } },
  remove: (k)    => { if (USE_LOCAL_STORAGE) { try { localStorage.removeItem(k); } catch {} } else { delete _mem[k]; } },
};

// Storage keys
const KEY_MAX_AGE     = 'kj_maxAge';
const KEY_VIEWING_AGE = 'kj_viewingAge';
const KEY_PIN         = 'kj_pin';
const KEY_WATCHED     = 'kj_watched';                             // string[] — all watched video IDs across all channels
const KEY_BULK_DONE   = (ageId) => `kj_bulkDone_${ageId}`;       // bool — bulk fetch completed for this age group
const KEY_POOL        = (chId)  => `kj_pool_${chId}`;            // string[] — fetched video IDs for this channel
const KEY_NEXT_TOKEN  = (chId)  => `kj_nextToken_${chId}`;       // string — YouTube nextPageToken for re-fetch

// ============================================================================
// YOUTUBE API
// StackBlitz / Vite: VITE_YOUTUBE_API_KEY in .env
// CRA:               REACT_APP_YOUTUBE_API_KEY in .env
// ============================================================================
const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || null;

/**
 * Fetch 25 videos for one channel.
 * Uses the official uploads playlist (channels → contentDetails → playlistItems).
 * Pass pageToken to resume from where the last batch ended.
 * Quota: 2 units per call.
 */
async function fetchChannelVideos(channelId, pageToken = '') {
  if (!YT_KEY) return { videos: [], nextPageToken: '' };
  try {
    // Step 1 — resolve verified uploads playlist ID
    const chRes  = await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${YT_KEY}&id=${channelId}&part=contentDetails`);
    const chData = await chRes.json();
    const uploadsId = chData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) return { videos: [], nextPageToken: '' };

    // Step 2 — fetch 25 items, resuming from pageToken if provided
    const params = new URLSearchParams({ key: YT_KEY, playlistId: uploadsId, part: 'snippet,status', maxResults: '25', ...(pageToken ? { pageToken } : {}) });
    const plRes  = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    const plData = await plRes.json();
    if (!plData.items?.length) return { videos: [], nextPageToken: '' };

    const videos = plData.items
      .filter(item => {
        const title   = item.snippet?.title?.toLowerCase() || '';
        const privacy = item.status?.privacyStatus;
        const lang    = item.snippet?.defaultAudioLanguage || item.snippet?.defaultLanguage || 'en';
        return (
          item.snippet?.resourceId?.kind === 'youtube#video' &&
          privacy === 'public' &&
          !title.includes('deleted video') &&
          !title.includes('private video') &&
          lang.startsWith('en')
        );
      })
      .map(item => ({
        id:    item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumb: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url ||
               `https://img.youtube.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg`,
      }));

    return { videos, nextPageToken: plData.nextPageToken || '' };
  } catch (e) {
    console.error('fetchChannelVideos:', e);
    return { videos: [], nextPageToken: '' };
  }
}

/**
 * Bulk-fetch all channels for an age group in one go.
 * Called once when the user selects an age group for the first time.
 * Results are stored immediately per channel so the UI can render as they arrive.
 * onProgress(channelId, videoIds) is called after each channel resolves.
 */
async function bulkFetchAgeGroup(channelIds, onProgress) {
  await Promise.all(
    channelIds.map(async chId => {
      const existing = store.get(KEY_POOL(chId));
      if (existing?.length) { onProgress(chId, existing); return; } // already cached
      const { videos, nextPageToken } = await fetchChannelVideos(chId);
      const ids = videos.map(v => v.id);
      store.set(KEY_POOL(chId),       ids);
      store.set(KEY_NEXT_TOKEN(chId), nextPageToken);
      onProgress(chId, ids);
    })
  );
}

// ============================================================================
// STATIC CONFIG
// ============================================================================
const AGE_GROUPS = [
  { id: '3-6',   label: 'Early Years',   range: 'Ages 3–6',   emoji: '🌱', accent: '#16a34a', light: '#dcfce7' },
  { id: '7-10',  label: 'Primary',       range: 'Ages 7–10',  emoji: '🚀', accent: '#2563eb', light: '#dbeafe' },
  { id: '11-13', label: 'Middle School', range: 'Ages 11–13', emoji: '🔭', accent: '#7c3aed', light: '#ede9fe' },
  { id: '14-16', label: 'High School',   range: 'Ages 14–16', emoji: '⚡', accent: '#ea580c', light: '#fed7aa' },
];
const AGE_ORDER = ['3-6', '7-10', '11-13', '14-16'];
const ageIndex  = id => AGE_ORDER.indexOf(id);

const CAT_ICONS = {
  'Science & Tech': '🔬', 'Mathematics': '📐', 'Critical Thinking & Life Skills': '🧠',
  'History & Geography': '🌍', 'Arts & Creativity': '🎨', 'Financial Literacy': '💰',
  'Logic & STEM': '⚙️', 'Media Literacy': '📱', 'Soft Skills': '🤝',
};

const RAW = {
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

// Pull every unique channelId for an age group
function allChannelIds(ageId) {
  const seen = new Set();
  (RAW[ageId] || []).forEach(cat => cat.channels.forEach(ch => seen.add(ch.channelId)));
  return [...seen];
}

// ============================================================================
// UI COMPONENTS
// ============================================================================
function FadeCard({ children, removing }) {
  return (
    <div style={{ transition: 'opacity 0.4s ease, transform 0.4s ease, max-height 0.5s ease', opacity: removing ? 0 : 1, transform: removing ? 'scale(0.95)' : 'scale(1)', maxHeight: removing ? 0 : 2000, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function PINModal({ title, subtitle, onSuccess, onClose, currentPIN }) {
  const [entered, setEntered] = useState('');
  const [err, setErr] = useState(false);
  const tap = d => {
    if (entered.length >= 4) return;
    const next = entered + d; setEntered(next);
    if (next.length === 4) setTimeout(() => { if (next === currentPIN) onSuccess(); else { setErr(true); setEntered(''); } }, 200);
  };
  const dots = Array(4).fill(0).map((_, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < entered.length ? '#6366f1' : 'var(--color-border-secondary)' }} />);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--color-background-primary)', borderRadius: 16, padding: '2rem', width: 280, boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, textAlign: 'center', margin: '0 0 4px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', margin: '0 0 8px' }}>{subtitle}</p>}
        {err && <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', margin: '4px 0' }}>Incorrect PIN. Try again.</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '16px 0 20px' }}>{dots}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d,i) => (
            <button key={i} onClick={() => d==='⌫' ? setEntered(p=>p.slice(0,-1)) : d!=='' ? tap(String(d)) : null}
              style={{ padding: '14px 0', fontSize: 18, fontWeight: 500, borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: d===''?'transparent':'var(--color-background-secondary)', cursor: d===''?'default':'pointer', color: 'var(--color-text-primary)' }}>{d}</button>
          ))}
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary)' }}>Cancel</button>
      </div>
    </div>
  );
}

function ChangePINModal({ currentPIN, onSave, onClose }) {
  const [step,setStep]=useState(1); const [old,setOld]=useState(''); const [n1,setN1]=useState(''); const [n2,setN2]=useState(''); const [err,setErr]=useState('');
  const active=step===1?old:step===2?n1:n2; const setActive=step===1?setOld:step===2?setN1:setN2;
  const tap=d=>{ if(active.length>=4) return; const next=active+d; setActive(next);
    if(next.length===4) setTimeout(()=>{ if(step===1){if(next===currentPIN){setStep(2);setErr('');}else{setErr('Incorrect current PIN');setOld('');}} else if(step===2){setStep(3);setErr('');} else{if(next===n1)onSave(n1);else{setErr("PINs don't match");setN1('');setN2('');setStep(2);}}},200);};
  const label=step===1?'Enter current PIN':step===2?'Enter new PIN':'Confirm new PIN';
  const val=step===1?old:step===2?n1:n2;
  const dots=Array(4).fill(0).map((_,i)=><div key={i} style={{width:14,height:14,borderRadius:'50%',background:i<val.length?'#6366f1':'var(--color-border-secondary)'}}/>);
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:'var(--color-background-primary)',borderRadius:16,padding:'2rem',width:280,boxSizing:'border-box'}}>
        <h2 style={{fontSize:16,fontWeight:500,textAlign:'center',margin:'0 0 4px'}}>Change PIN</h2>
        <p style={{fontSize:13,color:'var(--color-text-secondary)',textAlign:'center',margin:'0 0 8px'}}>{label}</p>
        {err&&<p style={{fontSize:12,color:'#dc2626',textAlign:'center',margin:'0 0 8px'}}>{err}</p>}
        <div style={{display:'flex',justifyContent:'center',gap:12,margin:'8px 0 20px'}}>{dots}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d,i)=>(
            <button key={i} onClick={()=>d==='⌫'?setActive(p=>p.slice(0,-1)):d!==''?tap(String(d)):null}
              style={{padding:'14px 0',fontSize:18,fontWeight:500,borderRadius:8,border:'0.5px solid var(--color-border-tertiary)',background:d===''?'transparent':'var(--color-background-secondary)',cursor:d===''?'default':'pointer',color:'var(--color-text-primary)'}}>{d}</button>
          ))}
        </div>
        <button onClick={onClose} style={{width:'100%',marginTop:12,padding:'10px 0',borderRadius:8,border:'0.5px solid var(--color-border-tertiary)',background:'transparent',cursor:'pointer',fontSize:13,color:'var(--color-text-secondary)'}}>Cancel</button>
      </div>
    </div>
  );
}

// Age selection screen — shown only on first visit
function AgeSelect({ onSelect, fetchingAge }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-background-tertiary)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: '0 0 6px', textAlign: 'center' }}>Welcome to The Knowledge Journey</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 2rem', textAlign: 'center' }}>Select your age group to get started</p>
      {fetchingAge ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Loading videos for <strong>{AGE_GROUPS.find(g=>g.id===fetchingAge)?.label}</strong>…</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>This only happens once. Subsequent visits are instant.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', width: '100%', maxWidth: 560 }}>
          {AGE_GROUPS.map(g => (
            <button key={g.id} onClick={() => onSelect(g.id)}
              style={{ padding: '1.5rem 1rem', borderRadius: 16, border: `2px solid ${g.accent}40`, background: g.light, cursor: 'pointer', textAlign: 'center', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{g.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: g.accent }}>{g.label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{g.range}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VIDEO CARD
// Pool logic:
//   - On mount, reads persisted pool from store (set during bulk fetch).
//   - Shows up to 5 unwatched at a time.
//   - "Finished" writes the ID to the global watched set.
//   - When ALL 25 pool IDs are watched → triggers a single new API fetch
//     using the stored nextPageToken, excludes already-watched IDs.
// ============================================================================
function VideoCard({ ch, ageAccent, ageLight, catIcon }) {
  const pKey  = KEY_POOL(ch.channelId);
  const tKey  = KEY_NEXT_TOKEN(ch.channelId);

  const getWatched = () => new Set(store.get(KEY_WATCHED) || []);

  const [pool,     setPool]     = useState(() => store.get(pKey) || ch.videos);
  const [watched,  setWatched]  = useState(getWatched);
  const [removing, setRemoving] = useState(null);
  const [playing,  setPlaying]  = useState(null);
  const [fetching, setFetching] = useState(false);
  const fetchLock = useRef(false);

  const unwatched = pool.filter(id => !watched.has(id));
  const visible   = unwatched.slice(0, 5);

  // When ALL pool videos are watched, fetch the next batch for THIS channel only
  useEffect(() => {
    if (unwatched.length > 0) return;
    if (pool.length === 0)    return;
    if (fetchLock.current)    return;
    fetchLock.current = true;
    setFetching(true);

    const currentWatched = getWatched();
    const token = store.get(tKey) || '';

    fetchChannelVideos(ch.channelId, token).then(({ videos, nextPageToken }) => {
      // Exclude any video that was already watched
      const freshIds = videos.map(v => v.id).filter(id => !currentWatched.has(id));
      if (freshIds.length) {
        store.set(pKey, freshIds);
        store.set(tKey, nextPageToken);
        setPool(freshIds);
      }
      setFetching(false);
      fetchLock.current = false;
    });
  }, [unwatched.length, pool.length]);

  const markWatched = vid => {
    setRemoving(vid);
    setTimeout(() => {
      if (playing === vid) setPlaying(null);
      const updated = getWatched();
      updated.add(vid);
      store.set(KEY_WATCHED, [...updated]);
      setWatched(new Set(updated));
      setRemoving(null);
    }, 450);
  };

  const allDone = !fetching && unwatched.length === 0 && pool.length > 0;

  if (allDone) return (
    <div style={{ background: 'var(--color-background-primary)', border: `1.5px solid ${ageAccent}`, borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: ageAccent }}>Channel Mastered!</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{ch.name}</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: ageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{catIcon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{ch.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              {fetching ? '⏳ Loading next batch…' : `${unwatched.length} video${unwatched.length !== 1 ? 's' : ''} remaining`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: ageAccent, background: ageLight, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
            {[...watched].filter(id => pool.includes(id)).length} / {pool.length} watched
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 0', lineHeight: 1.5 }}>{ch.why}</p>
      </div>

      <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fetching && visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)', fontSize: 13 }}>⏳ Fetching next batch of videos…</div>
        )}
        {visible.map(vid => (
          <FadeCard key={vid} removing={removing === vid}>
            <div style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: 8, overflow: 'hidden' }}>
              {playing === vid ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                  <iframe src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`} title="video" frameBorder="0" allowFullScreen allow="autoplay; encrypted-media" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                </div>
              ) : (
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setPlaying(vid)}>
                  <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="" style={{ width: '100%', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ borderLeft: '18px solid #e00', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: 4 }} />
                    </div>
                  </div>
                </div>
              )}
              <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                {playing === vid && <button onClick={() => setPlaying(null)} style={{ padding: '5px 12px', fontSize: 12, borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Close</button>}
                <button onClick={() => markWatched(vid)} style={{ padding: '5px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: 'none', background: ageAccent, color: '#fff', cursor: 'pointer' }}>✓ Finished</button>
              </div>
            </div>
          </FadeCard>
        ))}
        {unwatched.length > 5 && (
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '4px 0' }}>
            + {unwatched.length - 5} more queued in this batch
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [maxAge,     setMaxAge]     = useState(() => store.get(KEY_MAX_AGE));
  const [viewingAge, setViewingAge] = useState(() => store.get(KEY_VIEWING_AGE) || store.get(KEY_MAX_AGE));
  const [pin,        setPIN]        = useState(() => store.get(KEY_PIN) || '1234');
  const [activeCategory, setActiveCategory] = useState('Science & Tech');
  const [showPINModal,   setShowPINModal]   = useState(false);
  const [pinTarget,      setPinTarget]      = useState(null);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showChangePIN,  setShowChangePIN]  = useState(false);

  // fetchingAge: the age whose bulk fetch is in progress (shows loading screen)
  const [fetchingAge, setFetchingAge] = useState(null);
  // poolReady: tracks which channelIds have had their pool stored in-session
  const [poolReady, setPoolReady] = useState({});

  useEffect(() => { if (maxAge)     store.set(KEY_MAX_AGE,     maxAge);     }, [maxAge]);
  useEffect(() => { if (viewingAge) store.set(KEY_VIEWING_AGE, viewingAge); }, [viewingAge]);
  useEffect(() => {                 store.set(KEY_PIN,         pin);        }, [pin]);

  // Called when user picks an age on the first-visit screen
  const handleAgeSelect = useCallback(async id => {
    const alreadyDone = store.get(KEY_BULK_DONE(id));
    if (alreadyDone) {
      // Subsequent visits: pools already stored, skip to app immediately
      store.set(KEY_MAX_AGE, id); store.set(KEY_VIEWING_AGE, id);
      setMaxAge(id); setViewingAge(id); setActiveCategory('Science & Tech');
      return;
    }

    // First visit for this age: show loading screen, bulk-fetch all channels
    setFetchingAge(id);
    const channelIds = allChannelIds(id);

    await bulkFetchAgeGroup(channelIds, (chId, ids) => {
      // Mark each channel as ready as results arrive
      setPoolReady(prev => ({ ...prev, [chId]: ids }));
    });

    store.set(KEY_BULK_DONE(id), true);
    store.set(KEY_MAX_AGE, id); store.set(KEY_VIEWING_AGE, id);
    setFetchingAge(null);
    setMaxAge(id); setViewingAge(id); setActiveCategory('Science & Tech');
  }, []);

  // First visit: show age selector (with optional loading overlay)
  if (!maxAge) return <AgeSelect onSelect={handleAgeSelect} fetchingAge={fetchingAge} />;

  const group      = AGE_GROUPS.find(g => g.id === viewingAge);
  const ageData    = RAW[viewingAge] || [];
  const currentCat = ageData.find(c => c.category === activeCategory) || ageData[0];

  const handleTabClick = targetId => {
    if (targetId === viewingAge) return;
    if (ageIndex(targetId) > ageIndex(maxAge)) {
      setPinTarget(targetId); setShowPINModal(true);
    } else {
      setViewingAge(targetId); setActiveCategory('Science & Tech');
    }
  };

  const handlePINSuccess = () => {
    setShowPINModal(false);
    if (pinTarget) {
      // Unlocking a higher age — bulk-fetch its channels if not done yet
      const doUnlock = async () => {
        const alreadyDone = store.get(KEY_BULK_DONE(pinTarget));
        if (!alreadyDone) {
          setFetchingAge(pinTarget);
          await bulkFetchAgeGroup(allChannelIds(pinTarget), (chId, ids) => {
            setPoolReady(prev => ({ ...prev, [chId]: ids }));
          });
          store.set(KEY_BULK_DONE(pinTarget), true);
          setFetchingAge(null);
        }
        setMaxAge(pinTarget); setViewingAge(pinTarget);
        setActiveCategory('Science & Tech'); setPinTarget(null);
      };
      doUnlock();
    } else {
      setShowSettings(true);
    }
  };

  // Show loading screen while bulk-fetching a newly unlocked age group
  if (fetchingAge) {
    const g = AGE_GROUPS.find(a => a.id === fetchingAge);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-tertiary)', padding: '2rem' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{g?.emoji}</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 8px', textAlign: 'center' }}>Loading {g?.label}</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 24px', textAlign: 'center' }}>
          Fetching videos for all channels — this only happens once.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
          {allChannelIds(fetchingAge).map(chId => {
            const ready = !!poolReady[chId] || !!store.get(KEY_POOL(chId));
            return (
              <div key={chId} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: ready ? '#dcfce7' : 'var(--color-background-secondary)', color: ready ? '#16a34a' : 'var(--color-text-tertiary)', border: `1px solid ${ready ? '#16a34a40' : 'var(--color-border-tertiary)'}` }}>
                {ready ? '✓' : '⏳'} {chId.slice(0, 8)}…
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)', minHeight: '100vh', background: 'var(--color-background-tertiary)' }}>
      {/* Header */}
      <div style={{ background: group.accent, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{group.emoji}</span>
            <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 500, margin: 0 }}>The Knowledge Journey</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '2px 0 0' }}>
            {group.label} · {group.range}
            {viewingAge !== maxAge && <span style={{ marginLeft: 8, background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 7px' }}>browsing ↓</span>}
          </p>
        </div>
        <button onClick={() => { setPinTarget(null); setShowPINModal(true); }} title="Parental Settings"
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 18, color: '#fff' }}>🔒</button>
      </div>

      {/* Age tabs */}
      <div style={{ background: 'var(--color-background-primary)', borderBottom: '0.5px solid var(--color-border-tertiary)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', padding: '0 1rem', gap: 4, minWidth: 'max-content' }}>
          {AGE_GROUPS.map(g => {
            const isActive       = viewingAge === g.id;
            const isAboveCeiling = ageIndex(g.id) > ageIndex(maxAge);
            return (
              <button key={g.id} onClick={() => handleTabClick(g.id)} title={isAboveCeiling ? 'PIN required' : ''}
                style={{ padding: '12px 16px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: 'transparent', whiteSpace: 'nowrap',
                  color: isActive ? g.accent : isAboveCeiling ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
                  borderBottom: isActive ? `2.5px solid ${g.accent}` : '2.5px solid transparent', opacity: isAboveCeiling ? 0.5 : 1 }}>
                {isAboveCeiling ? '🔒 ' : ''}{g.emoji} {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ width: 172, flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Categories</p>
          {ageData.map(cat => (
            <button key={cat.category} onClick={() => setActiveCategory(cat.category)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 3,
                border: '0.5px solid', borderColor: activeCategory === cat.category ? group.accent : 'var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)', cursor: 'pointer', fontSize: 12,
                background: activeCategory === cat.category ? group.light : 'var(--color-background-primary)',
                color: activeCategory === cat.category ? group.accent : 'var(--color-text-primary)',
                fontWeight: activeCategory === cat.category ? 500 : 400 }}>
              <span style={{ fontSize: 14 }}>{CAT_ICONS[cat.category] || '📚'}</span>
              <span style={{ lineHeight: 1.3 }}>{cat.category}</span>
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{CAT_ICONS[currentCat?.category]}</span>
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{currentCat?.category}</h2>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: group.light, color: group.accent, fontWeight: 500 }}>{group.label}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentCat?.channels.map((ch, i) => (
              <VideoCard key={ch.channelId + i} ch={ch}
                ageAccent={group.accent} ageLight={group.light}
                catIcon={CAT_ICONS[currentCat.category] || '📚'} />
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: group.light, borderRadius: 'var(--border-radius-lg)', border: `0.5px solid ${group.accent}40` }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: group.accent, margin: '0 0 4px' }}>Learning tip for {group.range}</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {viewingAge === '3-6'   && 'Watch together and ask open questions. Co-viewing dramatically boosts learning outcomes.'}
              {viewingAge === '7-10'  && 'Encourage note-taking or drawing what they learn. Active recall cements knowledge powerfully.'}
              {viewingAge === '11-13' && "Challenge them to teach you what they've learned. Teaching others deepens understanding by up to 90%."}
              {viewingAge === '14-16' && 'Pair videos with related books or articles. Multi-modal learning builds the highest-order thinking.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPINModal && !showSettings && (
        <PINModal
          title={pinTarget ? `Unlock ${AGE_GROUPS.find(g=>g.id===pinTarget)?.label}` : 'Parental Lock'}
          subtitle={pinTarget ? `Enter PIN to allow access to ${AGE_GROUPS.find(g=>g.id===pinTarget)?.range}` : null}
          currentPIN={pin} onSuccess={handlePINSuccess}
          onClose={() => { setShowPINModal(false); setPinTarget(null); }} />
      )}

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--color-background-primary)', borderRadius: 16, padding: '2rem', width: 320, boxSizing: 'border-box' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px' }}>Parental Settings</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>Manage age ceiling and security PIN</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Set age ceiling</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {AGE_GROUPS.map(g => (
                <button key={g.id} onClick={() => { setMaxAge(g.id); if (ageIndex(viewingAge) > ageIndex(g.id)) { setViewingAge(g.id); setActiveCategory('Science & Tech'); } }}
                  style={{ padding: '10px 8px', borderRadius: 8, border: `1.5px solid ${maxAge===g.id?g.accent:'var(--color-border-tertiary)'}`, background: maxAge===g.id?g.light:'var(--color-background-secondary)', cursor: 'pointer', fontSize: 12, color: maxAge===g.id?g.accent:'var(--color-text-primary)', fontWeight: maxAge===g.id?500:400 }}>
                  {g.emoji} {g.label}<br /><span style={{ fontSize: 10, opacity: 0.7 }}>{g.range}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowSettings(false); setShowChangePIN(true); }}
              style={{ width: '100%', padding: '10px 0', marginBottom: 8, borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>🔑 Change PIN</button>
            <button onClick={() => { setShowSettings(false); store.remove(KEY_MAX_AGE); store.remove(KEY_VIEWING_AGE); setMaxAge(null); setViewingAge(null); }}
              style={{ width: '100%', padding: '10px 0', marginBottom: 8, borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary)' }}>↩ Back to age selection</button>
            <button onClick={() => setShowSettings(false)}
              style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Done</button>
          </div>
        </div>
      )}

      {showChangePIN && (
        <ChangePINModal currentPIN={pin}
          onSave={newPIN => { setPIN(newPIN); store.set(KEY_PIN, newPIN); setShowChangePIN(false); setShowSettings(true); }}
          onClose={() => { setShowChangePIN(false); setShowSettings(true); }} />
      )}
    </div>
  );
}
