import type { AgeGroup, AgeId, Category } from '../types';

// Curated catalogue. `videos` are fallback IDs used when no YouTube API key is configured.
// Channel picks, evidence and cautions are documented in docs/channel-curation.md.
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
  'Reading & Language': '📚', 'Music & Movement': '🎵',
};

export const CATALOG: Record<AgeId, Category[]> = {
  '3-6': [
    { category: 'Science & Tech', channels: [
      { name: 'SciShow Kids', channelId: 'UCRFIPG2u1DxKLNuE3y2SjHA', why: "Short, accurate answers to little kids' 'why' questions; no new episodes since May 2025, but the library is large.", videos: ['0jKoOUZ1GBM','8qdYCpSW2eY','YR4wtGWK7eE','RvRU_4XWPlw','v8cDsAf0nN0'] },
      { name: 'Nat Geo Kids', channelId: 'UCXVCgDuD_QCkI7gTKU7-tpg', why: 'Real animal footage and simple facts; a few predator clips may upset sensitive children and some uploads are labelled ads.', videos: ['5rYfZXlqLvM','PZ5ZJYuD1vw','QNzpynjWGcw','svaGnbGxrs4','OFLJN2J0-l8'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Numberblocks',      channelId: 'UCPlwvN0w4qFSP1FllALB92w', why: 'Number characters split and combine on screen, so counting and early adding sink in naturally; many uploads are long compilations or Shorts.', videos: ['ys34lqBzSNI','f5N4dpyzXfk','kRMZhfGCnlo','wZFiRar-_sg','Z40NJQhjqNk'] },
      { name: 'Khan Academy Kids', channelId: 'UC2ri4rEb8abnNwXvTjg5ARw', why: 'Free, non-profit circle-time videos and read-alouds covering early maths and reading, with no selling.', videos: ['j5PaOUC1WBg','1ml47lVv5Vo','OqeFavYwwJs','_ocf_kpZ83Q','q9JEpdt8Bho'] },
    ]},
    { category: 'Reading & Language', channels: [
      { name: 'Alphablocks',      channelId: 'UC_qs3c0ehDvZkbiEbOj6Drg', why: 'A phonics-first show where letters join to make words, from the makers of Numberblocks; British pronunciation.', videos: ['0rm9UIGyjJU','kbxt9dljNgc','3bepWxmLSKg','ss3_AQ8ADwA','fQjDqxPtJKc'] },
      { name: 'Ms Rachel',        channelId: 'UCG2CL6EUjG8TVT1Tpl9nJdg', why: 'A former teacher uses slow speech, pauses and songs to build early language; aimed at ages 1–4, so it may feel young by 5.', videos: ['XN6OiXLO1to','P-QLrDbOl1E','yQyEmZIw1e8','w264Mn-2MnQ','1v3Dk41C_10'] },
      { name: 'Storyline Online', channelId: 'UCnBdzaRy-Ky9Vh54XJlFz1Q', why: 'Actors read real picture books aloud with gentle illustrations, from a non-profit literacy programme.', videos: ['iN63vWT2ZRI','qg6KK0iv9QI','ei-y8-VST5Y','8yGt87KX5_0','yt_GmmOx06Y'] },
    ]},
    { category: 'Soft Skills', channels: [
      { name: 'Sesame Street',                channelId: 'UCoookXUzPciGrEZEXmh4Jjg', why: 'Research-backed letters, numbers and feelings at a calm pace; some uploads are celebrity tie-ins or Shorts.', videos: ['52U_rJfsqpk','1FqWyIumLZs','9fX1B1UFzws','8H_rHojWFkk','J8IGhWc5bZg'] },
      { name: "Daniel Tiger's Neighbourhood", channelId: 'UCDqgSnRMGVx3dP4sn3ATZMA', why: 'Gentle episodes with simple songs that teach calming down, sharing and handling big feelings.', videos: ['_5qtsA25HRI','Kx7q23v1pPo','vCUjpjjava8','dFI1iOLAW0I','aWXmuxVBwOo'] },
      { name: 'PBS KIDS',                     channelId: 'UCrNnk0wFBnCS1awGjq_ijGQ', why: 'Clips and full episodes from curriculum-based PBS shows; it mixes many shows, so some videos are more fun than learning.', videos: ['iO_GLm5mrT8','W6gf_rx15dM','a7sdBMDOOck','pSL4qAaBRCo','YN1YtqYgbeo'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Art for Kids Hub', channelId: 'UC5XMF3Inoi8R9nSI8ChOsdQ', why: 'A dad draws step by step with his children at a slow pace and praises effort; have paper and pens ready.', videos: ['Mbka697fEUc','fc3IIwGIr2Y','IQB-_QkWhng','QDU7Qr8-JUc','cQvh1XLB2Ws'] },
    ]},
    { category: 'Music & Movement', channels: [
      { name: 'Cosmic Kids Yoga',     channelId: 'UC5uIZ2KOZZeQDQo_Gsi_qbQ', why: 'Story-based yoga and mindfulness that gets children moving and teaches simple ways to calm down; needs floor space.', videos: ['YZi_Dq6_dkA','OYKhjAtfsPM','hV2a0GumCQI','Q4fyzEm0bOQ','wUcqBo4Tbks'] },
      { name: 'Super Simple Songs',   channelId: 'UCLsooMJoIpl_7ux2jvdPB-Q', why: 'Slow, predictable action songs with gentle animation, a calmer alternative to fast nursery-rhyme channels.', videos: ['KKNHyhl6aXU','Ne-ZcF58px4','LuJe0ad1Ygk','GzIObE7uR8Q','uBweptmCYZg'] },
      { name: 'Jack Hartmann',        channelId: 'UCVcQH8A634mauPrGbWs7QlQ', why: 'A veteran teacher’s counting, alphabet and letter-sound songs with movement, widely used in kindergarten classes.', videos: ['zlJmokfjq18','adnF03N9nhM','ZX-l4-C8rQo','p38omsjzwxQ','Hocfvp5QItE'] },
    ]},
  ],
  '7-10': [
    { category: 'Science & Tech', channels: [
      { name: 'Nat Geo Kids',    channelId: 'UCXVCgDuD_QCkI7gTKU7-tpg', why: 'Trustworthy animal and world videos from a brand parents know; some content skews younger and some uploads are labelled ads.', videos: ['5rYfZXlqLvM','PZ5ZJYuD1vw','QNzpynjWGcw','svaGnbGxrs4','OFLJN2J0-l8'] },
      { name: 'SciShow Kids',    channelId: 'UCRFIPG2u1DxKLNuE3y2SjHA', why: 'Simple, accurate science answers best for ages 7–9; no new episodes since May 2025, but the back catalogue is large.', videos: ['0jKoOUZ1GBM','8qdYCpSW2eY','YR4wtGWK7eE','RvRU_4XWPlw','v8cDsAf0nN0'] },
      { name: 'Mystery Science', channelId: 'UCPRCRM3JKm3sw55lB_427qg', why: "Short answers to real children's science questions from elementary science teachers; some videos point to the paid classroom lessons.", videos: ['OmdqFJPILRA','D8aLGMdwwDs','_3tDtiAu2yM','08-yucOHkZc','UneFsgh7x7o'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Math Antics', channelId: 'UCBuMwlP7kHkNxdPAqtFSJTw', why: 'Clear, patient animated lessons from place value to fractions; it feels like a lesson, so it suits homework help.', videos: ['61OPqIp9xkA','pWJzqTYS8no','I1u3pM9g9o8','oL_Vf9fYCpg','QHq3CSoal0I'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Mark Rober', channelId: 'UCY1kMZp36IQSyNx_9h4mpCg', why: 'A former NASA engineer’s big builds make children want to tinker; he promotes his paid CrunchLabs box and some videos are cash-prize challenges.', videos: ['26P1KyvrmjI','_L1Rim7-IPo'] },
      { name: 'D!NG', channelId: 'UClq42foiSgl7sSpLupnugGA', why: 'Hands-on maths magic and science tricks from the makers of Vsauce, like the Monty Hall problem and Cartesian divers; no new videos since 2020, but every one is a keeper.', videos: ['1vq_h4myH1E','f6tHqOmIj1E','TVq2ivVpZgQ','L8GsxU6Zt0E','GjgImsVqPfg'] },
      { name: 'Primitive Technology', channelId: 'UCAL3JXZSzSm8AlZyD3nQdBA', why: 'Wordless videos of one man building huts, kilns and furnaces from mud, wood and stone, showing real engineering from scratch; talk about fire safety, as children should not copy the fire work.', videos: ['PXuV_YCt8g4','99j2NpomwLk','j4lS236jEjs','58LGFLT4lYg','LTu6xpoPvzg'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'TED-Ed', channelId: 'UCsooa4yRKGN_zEE8iknghZA', why: 'Animated riddles and short lessons that keep children thinking; best from about 9, and some topics are dark or aimed at teens.', videos: ['8EtdC9Bjubk','8RPK5KwYhgA','a_4eFB8pPwI','NPJ9KZqrl50','1uTRlM6MbMo'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Horrible Histories', channelId: 'UCUNYSwNARexFwxXp3oPAtvg', why: 'Funny sketches and songs that make history stick; the humour is gruesome by design and there have been no uploads since January 2025.', videos: ['tTcuDl9dK9Y','qrB1CQaqLSo','sLHVoZftFlk','4w7Rs_M4eK0','dBTQ_mttLCM'] },
      { name: 'Free School',        channelId: 'UCebMFnw6WxozGmqGekJHOJg', why: 'Calm, ad-light lessons on history, places, nature and art; no new videos since March 2025, but the library is large.', videos: ['TaqsdQADC6s','sm7O4R1uN9s','LE8agcLlma8','PmFP4K8-3NA','TCCP4MCy0Ck'] },
      { name: 'Homeschool Pop',     channelId: 'UCfPyVJEBD7Di1YYjTdS2v8g', why: 'A homeschool dad’s short primary-level lessons with quiz questions built in; the odd upload is a personal vlog.', videos: ['YPdfBOMP5Ng','g6OAQx1ynLo','HIABLFc7EXA','nXshD8Bz7Ac','zmAmDi_leqg'] },
    ]},
    { category: 'Reading & Language', channels: [
      { name: 'Crash Course Kids', channelId: 'UCONtPx56PSebXJOxbFv-2jQ', why: 'Its newest series teaches reading skills like inference and theme through well-known books; older episodes cover science and engineering.', videos: ['PkWU-lMdnJg','klu7TNy-7qw','ML2oX207Mwc','QVw521JjRjA','WrUX6j9MwUY'] },
      { name: 'Storyline Online',  channelId: 'UCnBdzaRy-Ky9Vh54XJlFz1Q', why: 'Actors read picture books aloud in an ad-light literacy programme; best for 7–8 and may feel young by 10.', videos: ['iN63vWT2ZRI','qg6KK0iv9QI','ei-y8-VST5Y','8yGt87KX5_0','yt_GmmOx06Y'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Art for Kids Hub', channelId: 'UC5XMF3Inoi8R9nSI8ChOsdQ', why: 'Step-by-step drawing with a family that builds confidence; mostly cartoon-style subjects.', videos: ['Mbka697fEUc','fc3IIwGIr2Y','IQB-_QkWhng','QDU7Qr8-JUc','cQvh1XLB2Ws'] },
      { name: 'Ingleton Pottery', channelId: 'UCjqCOLOIp8HKkBxBuiQFTdw', why: 'Calm videos of a potter turning lumps of clay into bowls, vases and pots on the wheel; relaxing to watch, with little talking.', videos: ['QicpUhLPJ0k','_41OnITkEdA','5P0OuNVvEuk','7Wyw6CZZjF8','Qyqq5kKvD6A'] },
    ]},
    { category: 'Music & Movement', channels: [
      { name: 'Hoffman Academy', channelId: 'UCiKUKTMbojTIPGWPR_eec9w', why: 'Free, structured piano lessons and quick music-theory tips; children need a keyboard, and the channel promotes its paid app.', videos: ['VWBvfUusNbY','ORBhuv0Yq7o','5DUVWyQquFg','Q1sbqJLObNA'] },
    ]},
  ],
  '11-13': [
    { category: 'Science & Tech', channels: [
      { name: 'Crash Course',   channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q', why: 'Fast, well-sourced courses on almost every school subject; pitched at older students, and current series include US government topics.', videos: ['oJXxCfwkb-o','y5RqfQvCaBY','2b-H-rxQ8m8','uJA1qZirWVc','9Q9WAe_aqPs'] },
      { name: 'Amoeba Sisters', channelId: 'UCb2GCoLSBXjmI_Qj1vk-44g', why: 'Two teachers explain cells, DNA and genetics with friendly cartoons that classrooms use.', videos: ['TbOQIbEEVtA','xdLr5F1BsT8','I-sucvMV0Ng','JsTbrFY5xow','Lo2GHUWwnAc'] },
      { name: 'Steve Mould', channelId: 'UCEIwxahdLz7bap-VDs9h35A', why: 'Clever hands-on demos of surprising physics, explained calmly and clearly; long videos come about once a month.', videos: ['Z-2pTzSZtLU','6gsZY_-kT3U','k3Q9UWWiPsQ','NvkZaWLe0Sk','ti2qiU_JTUQ'] },
      { name: 'The Action Lab', channelId: 'UC1VLQPn9cYSqx8plbk9RxxQ', why: 'A PhD engineer shows weekly physics experiments with clear explanations; titles are clickbaity and a few use fire, fireworks or liquid nitrogen, so remind children not to copy them.', videos: ['qB7d062jcNg','WzHKEXc-8f4','jXzARHsTBQY','tYNYqdRoKzg','y3P77vz0QyU'] },
      { name: 'MinuteEarth', channelId: 'UCeiYXex_fwgYDonaTcSIk6w', why: 'Short, accurate cartoon explainers on nature, weather and the planet; many uploads are Shorts, so fewer full videos show, and one recent topic is the plague.', videos: ['9PJvV5PYDm0','kIXkIBWo6vE','jsAFbi4HgFg','x-vpfrs7RIs','0AfM2Jitsps'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Math Antics',  channelId: 'UCBuMwlP7kHkNxdPAqtFSJTw', why: 'Clear explanations of fractions, ratios and pre-algebra for catching up or revising; may feel basic by 13.', videos: ['61OPqIp9xkA','pWJzqTYS8no','I1u3pM9g9o8','oL_Vf9fYCpg','QHq3CSoal0I'] },
      { name: 'Numberphile',  channelId: 'UCoxcjq-8xIDTYp3uz647V5A', why: 'Real mathematicians share number puzzles and surprising patterns; some videos go beyond school level.', videos: ['vCAD3W43lIk','EgnAN0ZUl08','Uvy5Cs9FDLg','bAnwMdfcMVw','Zh86i_azaQw'] },
      { name: 'Stand-up Maths', channelId: 'UCSju5G2aFaWMqn-_0YBtq5A', why: 'Matt Parker investigates playful maths puzzles and real-world number questions with humour; a few videos are about TV shows or games rather than maths.', videos: ['zuaVFnj4SWY','k3sIHbj-TUI','RAexoVJOqDQ','XllQPr8FtPE','kahGSss6SsU'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Mark Rober',      channelId: 'UCY1kMZp36IQSyNx_9h4mpCg', why: 'Engineering made exciting through big builds; expect CrunchLabs promotion and cash-prize challenge videos.', videos: ['26P1KyvrmjI','_L1Rim7-IPo'] },
      { name: 'SmarterEveryDay', channelId: 'UC6107grRI4m0o2-emgoDnAA', why: 'An engineer explores how things work with slow-motion experiments, in a wholesome tone; uploads are infrequent.', videos: ['pXypQ6d_iDg','5lCWqEFVzbY','WtQ64nSbdY4','-0JKHuzJ67A','XwBZx1cXEdM'] },
      { name: 'Veritasium',      channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA', why: 'Physics and maths experiments that challenge common misconceptions; long videos with sponsor reads, best for keen 12–13s.', videos: ['eyZEqSPeMwg','NiCgcUTL9_Q','ONAuUyml0yI','JsBZOcqZerk'] },
      { name: 'Stuff Made Here', channelId: 'UCj1VqrHhDte54oLgPG4xpuQ', why: 'An engineer designs, fails and rebuilds absurd machines, showing real engineering iteration; only a few videos a year, and the power tools are not for children to copy.', videos: ['BuRyQYf03xA','RpslsMqPFWA','2OfjZ3ORJfc','vJ43DjwLPGA','dXIkUkwzTQU'] },
      { name: 'D!NG', channelId: 'UClq42foiSgl7sSpLupnugGA', why: 'Maths puzzles, probability and physics demos from the makers of Vsauce, such as the Monty Hall problem and divisibility rules; no new videos since 2020, but the library holds up.', videos: ['1vq_h4myH1E','f6tHqOmIj1E','TVq2ivVpZgQ','L8GsxU6Zt0E','GjgImsVqPfg'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'TED-Ed', channelId: 'UCsooa4yRKGN_zEE8iknghZA', why: 'Short animated lessons and logic riddles written by educators; preview the odd darker history or biology topic.', videos: ['8EtdC9Bjubk','8RPK5KwYhgA','a_4eFB8pPwI','NPJ9KZqrl50','1uTRlM6MbMo'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Extra History', channelId: 'UCCODtTcd5M1JavPCOr_Uydg', why: 'Animated history series of about ten minutes that teachers use for middle school; heavy on wars, with occasional mild language.', videos: ['rBnn4LGtx6A','2CRV8i4WYLE','AG5jzaocy4I','LAIJclA8nD0','WCPEypa2CjA'] },
      { name: 'Tom Scott', channelId: 'UCBa659QWEk1AI4Tg--mrJ2A', why: 'Weekly on-location videos about surprising engineering, history and places, from the power grid to wartime codebreakers; clean and curious, though some run nearly 30 minutes.', videos: ['NBXu6Z9Fw_M','-E47v4Oy7fE','BxXfeotgVVA','TumxO2glmPQ','drrUvxtT6lU'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Jazza', channelId: 'UCHu2KNu6TtJ0p4hpSW7Yv7Q', why: 'An artist’s drawing, painting and sculpting challenges with real technique tips; some videos review art products he was sent.', videos: ['n52GoJMsi44','IJeWrxwxg1k','wq-So3pvskw','-IBrx0LhIXc','vsH5--kTMxE'] },
      { name: 'Ingleton Pottery', channelId: 'UCjqCOLOIp8HKkBxBuiQFTdw', why: 'A working potter shows how bowls, vases and moon jars are thrown on the wheel, step by step and at a calm pace.', videos: ['QicpUhLPJ0k','_41OnITkEdA','5P0OuNVvEuk','7Wyw6CZZjF8','Qyqq5kKvD6A'] },
    ]},
    { category: 'Financial Literacy', channels: [
      { name: 'Biz Kid$', channelId: 'UCufmiGK0I_9g_iwUR-E8mwA', why: 'Short public-TV lessons on saving, budgeting, banking and starting a small business, written for young people.', videos: ['6B5gNBLfHoE','N6-4EYfI_JQ','xUcjWtKlH3A','CLMQVex7rpo','qoS4sYhNyf4'] },
    ]},
  ],
  '14-16': [
    { category: 'Science & Tech', channels: [
      { name: 'Crash Course',   channelId: 'UCX6b17PVsYBQ0ip5gyeme-Q', why: 'Full high-school courses in short, well-sourced episodes, useful for GCSE and AP-style revision; rated 12+.', videos: ['oJXxCfwkb-o','y5RqfQvCaBY','2b-H-rxQ8m8','uJA1qZirWVc','9Q9WAe_aqPs'] },
      { name: 'Kurzgesagt',     channelId: 'UCsXVk37bltHxD1rDPwtNM8Q', why: 'Carefully animated explainers on space, biology and big ideas; recent topics include drugs, cancer and existential risk, and its funding disclosures have been criticised.', videos: ['PXbVn-f_wuM','_y9JuojAIg0','ujkD4SxPKOI','QW_jlUn4gA8','5_Fayfx2NUM'] },
      { name: 'Amoeba Sisters', channelId: 'UCb2GCoLSBXjmI_Qj1vk-44g', why: 'Clear cartoon biology lessons on cells, genetics and evolution that match high-school courses.', videos: ['TbOQIbEEVtA','xdLr5F1BsT8','I-sucvMV0Ng','JsTbrFY5xow','Lo2GHUWwnAc'] },
      { name: 'Steve Mould', channelId: 'UCEIwxahdLz7bap-VDs9h35A', why: 'Careful, surprising demos of physics and materials that reward close thinking; about one long video a month.', videos: ['Z-2pTzSZtLU','6gsZY_-kT3U','k3Q9UWWiPsQ','NvkZaWLe0Sk','ti2qiU_JTUQ'] },
      { name: 'Up and Atom', channelId: 'UCSIvk78tK2TiviLQn4fSHaw', why: 'Friendly explainers on physics and maths paradoxes, infinity and dark matter; uploads every month or two.', videos: ['N86IOd6nYvo','OBIpIiZHf5w','XUDkQA7cVWI','ND9eyW5Fw0s','EjZB81jCGj4'] },
      { name: 'SciShow', channelId: 'UCZYTClx2T1of7BRZ86-8fow', why: 'Broad, reliable science answers from the Crash Course team; recent topics include alcohol, cannabis and mental health, so it sits with the teens.', videos: ['G25Vd8hpLJI','3bc9r8zk36s','LiAAayT_v84','dfA_VA20A2Y','SfRqo_trkNo'] },
    ]},
    { category: 'Mathematics', channels: [
      { name: 'Khan Academy', channelId: 'UC4a-Gbdw7vOaccHmFo40b9g', why: 'Free, step-by-step worked examples across high-school maths and science; plain whiteboard style.', videos: ['cPxnWRp4oPo','1lBFWPbEX5I','3pPsVNNEm08','PrykTpvJDOM','Fj_G5tN84Eg'] },
      { name: '3Blue1Brown',  channelId: 'UCYO_jab_esuFRV4b17AJtAw', why: 'Animated visual intuition for calculus, linear algebra and probability; best for confident or advanced students.', videos: ['LKrwhjOI8Nc','Nbwv5wHQoj0','GlYgs6v2YfU','l6DKRf-fAAM'] },
      { name: 'Numberphile',  channelId: 'UCoxcjq-8xIDTYp3uz647V5A', why: 'Mathematicians explain puzzles and famous problems, building interest beyond the syllabus.', videos: ['vCAD3W43lIk','EgnAN0ZUl08','Uvy5Cs9FDLg','bAnwMdfcMVw','Zh86i_azaQw'] },
      { name: 'Eddie Woo', channelId: 'UCq0EGvLTyy-LLT1oUSO_0FQ', why: 'A real Sydney maths teacher films his classroom lessons, such as annuities and circle equations; follows the Australian syllabus.', videos: ['LHRwssEDUlc','Ubwp1AKeSF0','aYN_aZ2fTc4','5aKhvfNBn4w','I1b_FdGnYSk'] },
      { name: 'Stand-up Maths', channelId: 'UCSju5G2aFaWMqn-_0YBtq5A', why: 'Matt Parker\'s funny, rigorous investigations of maths puzzles and real-world numbers; a few videos are about TV or games.', videos: ['zuaVFnj4SWY','k3sIHbj-TUI','RAexoVJOqDQ','XllQPr8FtPE','kahGSss6SsU'] },
    ]},
    { category: 'Logic & STEM', channels: [
      { name: 'Veritasium',      channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA', why: 'A physicist tests misconceptions with experiments and careful reasoning; long videos with sponsor reads.', videos: ['eyZEqSPeMwg','NiCgcUTL9_Q','ONAuUyml0yI','JsBZOcqZerk'] },
      { name: 'MinutePhysics',   channelId: 'UCUHW94eEFW7hkUMVaZz4eDg', why: 'Very short whiteboard explainers that make hard physics ideas approachable; uploads are irregular.', videos: ['QXXqSh5qAuA','4YvnVJRlQQs','sYdXa_yp0fc','R2G8Xy6hiyg','dLtRtdg67PU'] },
      { name: 'SmarterEveryDay', channelId: 'UC6107grRI4m0o2-emgoDnAA', why: 'Engineering and physics explored with slow-motion footage and real experts; includes some firearms and nuclear topics framed educationally.', videos: ['pXypQ6d_iDg','5lCWqEFVzbY','WtQ64nSbdY4','-0JKHuzJ67A','XwBZx1cXEdM'] },
      { name: 'Stuff Made Here', channelId: 'UCj1VqrHhDte54oLgPG4xpuQ', why: 'Ambitious engineering builds that show design, prototyping and debugging in detail; only a few videos a year.', videos: ['BuRyQYf03xA','RpslsMqPFWA','2OfjZ3ORJfc','vJ43DjwLPGA','dXIkUkwzTQU'] },
      { name: 'Primitive Technology', channelId: 'UCAL3JXZSzSm8AlZyD3nQdBA', why: 'Silent, methodical experiments recreating early technology (kilns, bellows, iron smelting) from raw materials, showing trial, failure and iteration.', videos: ['PXuV_YCt8g4','99j2NpomwLk','j4lS236jEjs','58LGFLT4lYg','LTu6xpoPvzg'] },
    ]},
    { category: 'Critical Thinking & Life Skills', channels: [
      { name: 'TED-Ed', channelId: 'UCsooa4yRKGN_zEE8iknghZA', why: 'Educator-written animated lessons on science, history, money and ethics that work well as discussion starters.', videos: ['8EtdC9Bjubk','8RPK5KwYhgA','a_4eFB8pPwI','NPJ9KZqrl50','1uTRlM6MbMo'] },
    ]},
    { category: 'History & Geography', channels: [
      { name: 'Extra History',  channelId: 'UCCODtTcd5M1JavPCOr_Uydg', why: 'Well-researched animated history series that go beyond the textbook; heavy on wars and conflict.', videos: ['rBnn4LGtx6A','2CRV8i4WYLE','AG5jzaocy4I','LAIJclA8nD0','WCPEypa2CjA'] },
      { name: 'OverSimplified', channelId: 'UCNIuvl7V8zACPpTmmNIqP2A', why: 'Very funny stick-figure accounts of major wars that hook reluctant history students; contains mild swearing and crude jokes (rated 13+) and uploads are rare.', videos: ['1BVJzaXv3rk','Q-nWA0WeF98','lsbcN9-jU1Y','805SIqgDZIE','hRSGxw2AQnk'] },
      { name: 'Tom Scott', channelId: 'UCBa659QWEk1AI4Tg--mrJ2A', why: 'Well-told weekly videos on engineering, infrastructure and odd bits of history, filmed on location with experts; clean throughout.', videos: ['NBXu6Z9Fw_M','-E47v4Oy7fE','BxXfeotgVVA','TumxO2glmPQ','drrUvxtT6lU'] },
      { name: 'Wendover Productions', channelId: 'UC9RM-iSvTu1uPJb8X5yp3EQ', why: 'Well-researched explainers on how transport, trade and countries work, from the Channel Tunnel to Botswana’s economy; some videos cover war and military topics, and most include a sponsor read.', videos: ['2hx9r7JE6mg','PXuQ5ZEBfTA','gLkbK8h_9fc','2gpRaJMjHbc','VuliaG_-uao'] },
    ]},
    { category: 'Financial Literacy', channels: [
      { name: 'Two Cents', channelId: 'UCL8w_A8p8P1HWI3k6PR5Z6w', why: 'Well-researched PBS personal-finance explainers used in high-school finance classes; aimed at young adults, and some topics touch on politics.', videos: ['xoWjeM5ltv8','rewsNWT8aiw','lF31x_K1v-A','_fMBNx0Msic','fAE1nPfqi5M'] },
      { name: 'Biz Kid$',  channelId: 'UCufmiGK0I_9g_iwUR-E8mwA', why: 'Short lessons on budgeting, saving vs investing, banking and earning money, written for teens.', videos: ['6B5gNBLfHoE','N6-4EYfI_JQ','xUcjWtKlH3A','CLMQVex7rpo','qoS4sYhNyf4'] },
    ]},
    { category: 'Arts & Creativity', channels: [
      { name: 'Jazza', channelId: 'UCHu2KNu6TtJ0p4hpSW7Yv7Q', why: 'Drawing, painting and sculpting challenges with practical technique; some videos review art products he was sent.', videos: ['n52GoJMsi44','IJeWrxwxg1k','wq-So3pvskw','-IBrx0LhIXc','vsH5--kTMxE'] },
      { name: 'Ingleton Pottery', channelId: 'UCjqCOLOIp8HKkBxBuiQFTdw', why: 'A potter throws bowls, vases and jars on the wheel with practical tips, a calm intro to ceramics as a craft.', videos: ['QicpUhLPJ0k','_41OnITkEdA','5P0OuNVvEuk','7Wyw6CZZjF8','Qyqq5kKvD6A'] },
    ]},
    { category: 'Music & Movement', channels: [
      { name: 'David Bruce Composer', channelId: 'UCh-PyMficPzVAihCJkFJVAA', why: 'A composer explains rhythm, harmony and music history through pieces from Tchaikovsky to Balinese gamelan; uploads are now infrequent and one title contains a bleeped swear word.', videos: ['_cX4I-r7Oos','frXX5KWYUaY','B5hBEFw3zbY','y7M2nhlSBCA','2rJY9g7bfSg'] },
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
