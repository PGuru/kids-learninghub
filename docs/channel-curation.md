# Channel curation: how the catalogue was judged

Date: 2026-11-03. This report covers the curated channel list in `src/data/catalog.ts`. Parents can change that list for their own family on the **Manage channels** screen; their changes sit on top of it (`src/data/effective.ts`).

## Method

1. **Research.** Four research passes, one per age group, collected recommendations from parents and teachers.
2. **Judging.** Each candidate was scored against the rubric below for each age group separately, so a channel can be kept for one age and rejected for another.
3. **Verification.** Every kept channel was checked on 2026-11-03 against YouTube's free public RSS feed (`youtube.com/feeds/videos.xml?channel_id=…`). The check required HTTP 200 and a feed title matching the channel. The 5 fallback `videos` for each channel came from that feed:
   - Regular videos were preferred over Shorts.
   - Titles that looked like a livestream, an hour-plus compilation, a promotion or something off-topic were skipped.
   - For the preschool channels, durations were also spot-checked on the public watch pages. The app already filters out videos over 60 minutes, but the fallback list is not filtered, so this mattered there.
4. **No paid services were used.** All checks used only `curl`/`fetch` against public YouTube pages.

### Rubric (applied per channel, per age)

| # | Criterion | How it was used |
|---|---|---|
| 1 | Parent and teacher consensus | More independent sources counted as stronger evidence. Real parent posts (forums, Hacker News, Reddit via archive) counted more than curated listicles. |
| 2 | Safety and age fit | The warn-list was excluded: CoComelon, Ryan's World, MrBeast, unboxing, kidfluencer and family-vlog channels, prank channels, 5-Minute Crafts, Bright Side, manosphere creators and The School of Life. Crude humour excluded a channel under 13. A 13+ rating was allowed at 14–16 only when the content was mild and strongly endorsed. |
| 3 | Educational value | Learning-first channels ranked above pure entertainment. |
| 4 | Still useful | Active channels were preferred. An inactive channel was kept only if its **latest** uploads, which the app shows first, are themselves good. |
| 5 | Upload mix | The app shows recent uploads. Channels dominated by Shorts, hour-long compilations, livestreams, vlogs or off-topic videos were dropped or demoted, unless those uploads are clearly on-topic. |
| 6 | Commercialism | Heavy merch or sponsor promotion counted against a channel and is noted in its `why`, but did not exclude it on its own. |

### Evidence caveats

- **Reddit was mostly blocked.** The 3–6, 7–10 and 14–16 researchers could not read Reddit directly.
  - 3–6 got one r/ScienceBasedParenting thread through a mirror.
  - 14–16 had only second-hand Reddit summaries.
  - **Only the 11–13 pass read Reddit threads in full**, 16 of them, through the Arctic Shift archive. As a result, 11–13 has the strongest first-hand parent evidence and 14–16 the weakest.
- **What replaced Reddit.** The other passes relied on Mumsnet, Hacker News "Ask HN" parent threads, Common Sense Media reviews, homeschool hubs (Treehouse Schoolhouse, The Homeschool Mom, Freedom Homeschooling, HomeschoolPicks) and teacher outlets (WeAreTeachers). Some sources are commercial and count less: Screenwise, Yippee TV, Pastory and DIY.org.
- **Teen evidence is thin.** At 14–16, most "endorsements" are editorial lists rather than parent voices. Treat those source counts as rough consensus.
- **Source counts are approximate.** The researchers counted distinct pages or threads. A single Hacker News thread with five parents counts as one source.
- **The upload-mix checks are a snapshot.** They reflect the 15 most recent feed entries on 2026-11-03, and channels change what they post.

## Critical findings about the old catalogue

Several channel IDs in the previous `catalog.ts` pointed to the **wrong channel** (each one checked against its feed title). These alone justified replacing the catalogue.

| Old entry | ID used | What that ID actually is |
|---|---|---|
| Common Sense Media (7–10), Crash Course Kids (11–13) | `UCddiUEpeqJcYeBxX1IVBKvQ` | **The Verge**, an adult tech news channel |
| Two Cents (PBS) (11–13, 14–16) | `UCqECaJ8Gagnn7YCbPEzWH6g` | **Taylor Swift**'s official channel |
| Practical Money Skills for Kids (7–10) | `UCKCsVSA5THlkHbnkZTPm6-g` | Learn Bright |
| Khan Academy (7–10) | `UC2ri4rEb8abnNwXvTjg5ARw` | Khan Academy **Kids** |
| 3Blue1Brown (14–16) | `UCYO_jab_esuFRV4b17AJtAg` | Not found (404). The correct ID is `…AJtAw`. |
| Folding Ideas, Every Frame a Painting (14–16) | `UCyNtlmLMoIV4KnSCB9JLQHQ`, `UCjFqcJQXGZ6T8RMSrPn0CsQ` | Not found (404) |

The old catalogue also reused **the same fallback video IDs across unrelated channels**. For example, the same five videos were listed for Sesame Street, Daniel Tiger, Hey Duggee, Common Sense Education and PBS Kids. Every fallback list is now taken from that channel's own feed.

---

## Ages 3–6 (Early Years): 14 channels kept

| Channel | Category | Evidence | Sources | Caution |
|---|---|---|---|---|
| SciShow Kids | Science & Tech | High | 6 | Inactive since 2025-05-27. Its latest uploads are good volcano episodes and compilations. |
| Nat Geo Kids | Science & Tech | Medium-high | 6 | Some predator clips. Some uploads are labelled "AD". It also posts livestreams, which the app filters out. |
| Numberblocks | Mathematics | **Highest** (9, incl. 8+ HN parents, CSM 2+) | 9 | The recent feed is almost all 58–90 minute compilations plus Shorts: only 1 of the last 15 videos is a regular upload of 60 minutes or less. Kept anyway because the Shorts are episode clips and consensus is overwhelming. Merch tie-ins. |
| Khan Academy Kids | Mathematics | Medium | 3 | Some uploads are in Spanish. The app's English filter only drops the ones whose language metadata says Spanish. |
| Alphablocks | Reading & Language | High | 6 | British pronunciation. About half its uploads are over 60 minutes and get filtered out. |
| Ms Rachel | Reading & Language | High | 7 (CSM 2+) | Aimed at ages 1–4. Many uploads run about 60 minutes, though 9 of 15 still pass the filter. |
| Storyline Online | Reading & Language | Medium-high | 3 | Some books are aimed at ages 6–8. |
| Sesame Street | Soft Skills | High | 8 | About half its uploads are 2-hour compilations. There are also SNL and Netflix tie-ins, which were skipped in the fallback list. |
| Daniel Tiger's Neighbourhood (Scholastic) | Soft Skills | High (as a show) | 4 | The channel is the international licensee channel, not a PBS channel. The researcher could not confirm it as official, but the feed title and content match. |
| PBS KIDS | Soft Skills | High | 7 | A mixed-show channel with many Shorts. |
| Art for Kids Hub | Arts & Creativity | High | 4 | About half the recent uploads are off-topic trivia Shorts. Paid membership needed to remove ads. |
| Cosmic Kids Yoga | Music & Movement | High | 6 | Livestreams are filtered out. Needs floor space. |
| Super Simple Songs | Music & Movement | High | 5 | Many uploads run 50–57 minute compilations, which still pass the filter. One recent NHL tie-in. |
| Jack Hartmann | Music & Movement | Medium | 3 | Repetitive, with dated visuals. Occasional livestreams. |

**Rejected or demoted (3–6)**
- **Bluey (Official):** the recent feed is 2–6 hour compilations and clips. It is entertainment, not instruction, and full episodes are on Disney+.
- **GoNoodle:** 13 of its last 15 uploads are Shorts, mostly promotional.
- **The Laurie Berkner Band:** 10 of its last 15 uploads are Shorts.
- **Puffin Rock:** almost all compilations and Shorts, with little teaching.
- **Super Simple Play with Caitie:** the recent feed is an NHL hockey promotion, and the researcher marked the evidence as medium-low.
- **StoryBots:** no verifiable official channel. It is spread across Netflix Jr., which also carries CoComelon content.
- **Mister Rogers' Neighborhood:** a good, calm option with 3 sources. Demoted only because of the 3-per-category cap. Its feed also has livestreams and compilations. A good parent add.
- **Brightly Storytime and Bri Reads:** single or thin sources. Fine for a parent to add.
- **Free School:** kept for 7–10 instead, where the evidence is stronger.
- **Blippi:** mixed parent views, plus speech-therapy and presenter concerns (S8, HN).
- **On the warn-list:** CoComelon, Ryan's World, unboxing channels and hyper-fast nursery-rhyme channels.

**Removed from the old 3–6 list**
- **Peekaboo Kidz:** weak evidence, and recent topics include "Are Souls Real? What happens after death?".
- **Kids Learning Tube (KLT):** clickbait exoplanet titles and Shorts.
- **Hey Duggee:** not endorsed by any source, and its feed is marathons and livestreams.
- **Simple Learning for Kids:** inactive since 2025-04 and unendorsed.
- **LearningMole:** unendorsed.
- **Common Sense Education:** a teacher-PD channel. Recent topics include sexting and online betting.
- **"Hey Duggee" as Financial Literacy:** a mismatched category.

---

## Ages 7–10 (Primary): 13 channels kept

| Channel | Category | Evidence | Sources | Caution |
|---|---|---|---|---|
| Nat Geo Kids | Science & Tech | High | 10 | Skews young. Some uploads are "AD"-labelled. |
| SciShow Kids | Science & Tech | High | 8 | Inactive since May 2025. Best for ages 7–9. |
| Mystery Science | Science & Tech | Medium-high | 4 | Upsells its paid curriculum. Some hook-style titles. |
| Math Antics | Mathematics | High | 4 | Lesson tone. A T-shirt promo Short was skipped in the fallback list. |
| Mark Rober | Logic & STEM | High | 6 (CSM 8+) | **13 of 15 recent uploads are Shorts.** There are cash-prize challenge videos ("Beat me, win $100") and CrunchLabs promotion. Kept on consensus; the cautions are in the `why`. |
| TED-Ed | Critical Thinking & Life Skills | High | 8 | Rated 9+. Recent uploads include "Scary stories" and adult money topics. |
| Horrible Histories | History & Geography | High | 4 (Mumsnet) | Gruesome humour. Inactive since 2025-01, but its latest uploads are good clips. |
| Free School | History & Geography | High | 5 | Inactive since 2025-03. Its latest uploads (Mayflower, Louisiana Purchase, Grand Canyon, snow) are good. |
| Homeschool Pop | History & Geography | Medium | 3 | One recent personal vlog ("I Did Early Voting"). Its 75–283 minute premiere streams are filtered out by the app. The 3-minute lessons are fine. |
| Crash Course Kids | Reading & Language | High | 7 | The newest uploads are a **literature series** (inference, theme, poetry), so it is filed under Reading. The back catalogue is science and engineering. |
| Storyline Online | Reading & Language | Medium | 3 | May feel young by 10. |
| Art for Kids Hub | Arts & Creativity | High | 4 | As for 3–6. |
| Hoffman Academy | Music & Movement | Medium | 2 | 11 of 15 uploads are Shorts, but they are on-topic piano tips. Upsells its app. Needs a keyboard. |

**Rejected or demoted (7–10)**
- **Kurzgesagt:** recent uploads cover ketamine, magic mushrooms and late-stage cancer, so it does not fit this age. The researcher already rated it medium.
- **Geography Now:** recent uploads are Shorts, livestreams and "BRB" vlog posts, with adult-oriented jokes. Rejected for all ages.
- **Brave Wilderness:** sting and bite stunts with clickbait thumbnails.
- **Simple History:** recent uploads are **weapons Shorts** ("AK-47/M16 hybrid", "Weirdest Grenades") and "Unit 731". Removed for all ages.
- **KLT:** clickbait titles, uneven quality, and Shorts.
- **Peekaboo Kidz:** inactive or ASMR Shorts at the researcher's handle, and off-topic at the old catalogue ID.
- **Science Max:** hype titles and about half Shorts. A reasonable parent add.
- **MinuteEarth:** 10 of 15 uploads are Shorts and it targets middle school. A parent can add it for 11–13.
- **Learn Bright:** active and fine, but the feed is flooded with duplicate ASL versions. Demoted in favour of Homeschool Pop; a parent can add it.
- **BBC Bitesize for Teachers:** good history songs, but uploads are sparse and the latest is a football careers video.
- **Extra History and OverSimplified:** 10+ and 13+ respectively. Moved to older groups.
- **CrunchLabs:** effectively an advertisement for the paid box.
- **Operation Ouch:** inactive since 2024-07, with mild gore.
- **On the warn-list:** MrBeast (CSM 14+), Ryan's World, Like Nastya, Kids Diana Show, Vlad and Niki, Unspeakable and Preston.

**Removed from the old 7–10 list**
- **Bright Side:** a TheSoul Publishing content farm.
- **Code.org:** now "CodeAI", posting teacher-facing AI Shorts.
- **Tinkernut:** inactive since 2021, with adult Raspberry Pi tutorials.
- **Charisma on Command:** adult self-improvement ("aura", "intimidation"), close to manosphere framing.
- **"Common Sense Media":** the ID was actually The Verge.
- **"Practical Money Skills":** the ID was actually Learn Bright.
- **"Khan Academy":** the ID was actually Khan Academy Kids.
- **Red Ted Art:** only one passing mention in the research. A good, harmless parent add.
- **Geography Now and Simple History:** see above.
- **Biz Kid$:** moved to 11–13 and 14–16, because its current uploads are written for teens.

---

## Ages 11–13 (Middle School): 12 channels kept

This age group has the best evidence: Reddit threads were read in full.

| Channel | Category | Evidence | Sources | Caution |
|---|---|---|---|---|
| Crash Course | Science & Tech | High | ~11 | Fast-paced and pitched at grades 8–12. Its current series are US Government and Geology. Some parents note a political slant in History. |
| SciShow | Science & Tech | High | ~8 | Some recent topics (first alcoholic drink, AI psychosis) suit 12–13 better. |
| Amoeba Sisters | Science & Tech | Medium | 3 | Covers reproduction and genetics. |
| Math Antics | Mathematics | High | ~5 | Can feel basic by 13. |
| Numberphile | Mathematics | Medium | ~4 | Some videos go beyond school level. |
| Mark Rober | Logic & STEM | High | ~10 (CSM 8+, Reddit ×8) | Mostly Shorts lately. Consumerism (CSM), cash-prize challenges, and MrBeast collaborations. |
| SmarterEveryDay | Logic & STEM | Medium-high | ~4 | Infrequent uploads. |
| Veritasium | Logic & STEM | Medium-high | ~5 | Long videos and sponsor reads. 11 of 15 uploads are Shorts (on-topic). |
| TED-Ed | Critical Thinking & Life Skills | High | ~10 | A few videos target teens. |
| Extra History | History & Geography | Medium-high | ~5 | Heavy on war, occasional mild language. Some Shorts have edgy titles. |
| Jazza | Arts & Creativity | Low-medium | 1 (Screenwise ×2 guides) | **Thin evidence.** Kept to cover the arts category. Product-review videos. |
| Biz Kid$ | Financial Literacy | Low-medium | 1 (7–10 report) plus the old catalogue | **Thin evidence.** Verified as the official channel ("Biz Kid$ (TV Series)"), active, with clean on-topic uploads. |

**Rejected or demoted (11–13)**
- **Kurzgesagt** (7 sources): rejected for this age **despite strong consensus**. Its current upload mix is "How does ketamine work?", "Your brain on magic mushrooms" and a late-stage cancer story, and the app shows those first. Kept for 14–16.
- **Overly Sarcastic Productions** (5 sources): recent uploads are mostly **"Red plays Hades II" gaming let's-plays**, plus innuendo. Upload mix fails.
- **OverSimplified:** Screenwise rates it 13+ for sexual references and swearing. Moved to 14–16.
- **Khan Academy** (6 sources): **demoted** because its current uploads are AP Physics and MCAT. Parents should point children to Khan's maths units directly. Kept for 14–16.
- **Simple History:** weapons Shorts (see 7–10).
- **Geography Now:** see 7–10.
- **Snake Discovery** (5 Reddit parents): recent uploads are breeding and reptile-expo vlogs, more hobby than lesson, and include live-prey feeding. A fine parent add for animal-loving kids.
- **PBS Eons, MinuteEarth, MinutePhysics, Be Smart:** all fine content, but mostly Shorts and/or squeezed out by the 3-per-category cap. Good parent adds.
- **MediaWise:** 15 of 15 uploads are Shorts and election-heavy. It was kept for 14–16 at first, then **removed** once the hub began filtering out Shorts, because it would show no videos.
- **Two Cents:** skews to young adults. Kept for 14–16.
- **The Brain Scoop, CGP Grey, Deep Look, Stated Clearly:** inactive, Shorts-dominated or single-source.
- **On the warn-list:** MrBeast, PewDiePie, Logan Paul, Miranda Sings, Preston, Unspeakable, LankyBox, Sam O'Nella (f-bomb), zefrank (sex jokes), Thug Notes, BreadTube or ContraPoints, family vlogs and Zack D. Films.

**Removed from the old 11–13 list**
- **The School of Life:** warn-listed. Its recent uploads include "The Sex Starved Relationship" and "Reasons to Remain Single".
- **"Crash Course Kids":** the ID was actually The Verge.
- **"Crash Course Arts" and "Crash Course Media Literacy":** both duplicated the main Crash Course ID; a channel can only appear once per age.
- **"Two Cents":** the ID was actually Taylor Swift.
- **Geography Now:** see 7–10.
- **It's Okay to be Smart (now "Be Smart"):** 12 of 15 uploads are Shorts and evidence is thin. A parent add.
- **Khan Academy:** see above.

---

## Ages 14–16 (High School): 16 channels kept

Evidence for this age is mostly editorial lists, so parent voices are thin.

| Channel | Category | Evidence | Sources | Caution |
|---|---|---|---|---|
| Crash Course | Science & Tech | High | 10 (CSM 12+) | Covers war, suicide and sex education (animated). The current series is US Government. |
| Kurzgesagt | Science & Tech | Medium | 2 (plus 7 at 11–13) | Drugs, cancer and existential topics. Its funding disclosures have been criticised (S17). |
| Amoeba Sisters | Science & Tech | Medium-high | 2 | None. |
| Khan Academy | Mathematics | High | 4 | Dry. Current uploads are AP Physics, which suits this age. |
| 3Blue1Brown | Mathematics | Medium-high | 2 (one unverified) | Advanced. 11 of 15 uploads are Shorts (on-topic puzzles). |
| Numberphile | Mathematics | Medium-high | 2 | None. |
| Veritasium | Logic & STEM | High | 4 | Long videos, sponsor reads. |
| MinutePhysics | Logic & STEM | High | 4 | Irregular uploads. |
| SmarterEveryDay | Logic & STEM | High | 3 | Some firearms, ballistics and nuclear videos, framed educationally. |
| TED-Ed | Critical Thinking & Life Skills | High | 7 | Some dark topics. |
| Extra History | History & Geography | Medium-high | ~5 (11–13 report) | Heavy on war. |
| OverSimplified | History & Geography | Medium | 2–3 | **Included with caution:** a 13+ rating for mild profanity and crude jokes. Its latest uploads are the Punic Wars series. Dormant since 2025-01. |
| Two Cents (correct ID) | Financial Literacy | Medium-high | 1 strong (NGPF teachers) | Aimed at young adults. Some political topics. About half its uploads are Shorts. |
| Biz Kid$ | Financial Literacy | Low-medium | thin | Current uploads are explicitly for teens. |
| ~~MediaWise~~ | Media Literacy | Low-medium | 2 | **Removed:** all of its uploads are Shorts, and the hub now filters Shorts out. 14–16 has no Media Literacy channel; see the gaps below. |
| Jazza | Arts & Creativity | Low-medium | 1 (Screenwise, 10–18) | Product reviews. |

**Rejected or demoted (14–16)**
- **Mark Rober:** skews to ages 8–13 (the researcher noted it is lighter for 16-year-olds), with consumerism. Kept for the younger groups.
- **SciShow and Be Smart:** single-source at this age. Be Smart is also mostly Shorts.
- **Eddie Woo:** a real maths teacher with clean uploads (an annuities series), but single-source and on the Australian syllabus. Squeezed out by the 3-per-category cap. **Strong parent add.**
- **Practical Engineering, Up and Atom, Socratica, Periodic Videos:** clean, active and educational, but single-source mentions only. Good parent adds.
- **The Royal Institution:** single source, and mostly Shorts.
- **Above The Noise:** inactive since 2023-11, and its latest uploads are Shorts on contested issues.
- **AsapSCIENCE:** recent uploads are sexuality-clickbait Shorts ("Is your hand gay?").
- **Vsauce:** 15 of 15 uploads are Shorts, including "POV: I'm your trip sitter" and a Waco segment.
- **The School of Life:** warn-listed, with mature relationship and sex content.
- **Bozeman Science and Tyler DeWitt:** inactive since 2024.
- **The Art Assignment and Ours Poetica:** inactive since 2022.
- **Geography Now:** see 7–10.
- **On the warn-list:** 5-Minute Crafts, Bright Side and manosphere creators.

**Removed from the old 14–16 list**
- **"3Blue1Brown":** the old ID returned 404; it is now under the correct ID.
- **Folding Ideas and Every Frame a Painting:** both IDs return 404, neither appeared in the research, and Every Frame a Painting is inactive.
- **"Two Cents":** the ID was actually Taylor Swift.
- **Vsauce, The School of Life and AsapSCIENCE:** see above.
- **Computerphile:** clean, but no parent or teacher endorsement was found. A parent add for keen coders.

---

## Second pass: the owner's pasted channel list

The site owner pasted a long, general "educational YouTube" list (about 230 channels, origin not stated). It is aimed mostly at adults and isn't a parent thread, so it was judged with the same rules, applied strictly. Its podcasts, websites and browser extensions were out of scope, and some of those links were piracy or paywall-bypass sites, which were ignored.

**How it was checked:** five checkers split the list by section. For every channel they resolved the real channel ID, read its latest 15 uploads from the public feed, and counted how many were Shorts. They also judged whether recent uploads suited kids. The owner stopped the run partway, so only two sections were fully checked and used:

- **General Science, Experiments, Math:** 38 channels checked. 14 were good enough to add, 5 were already in, and 19 were rejected.
- **Lectures, Explainers, Music, Chill, Outdoors:** 53 channels checked. 10 were good enough to add, 4 were already in, and 39 were rejected.

The **Biology, Physics, Chemistry, Anatomy**, **Engineering, Computer Science, Space** and **History, Documentaries, Blue Collar, Comedy, Other** sections were **not checked** and nothing from them was added.

**Added** (all IDs and sample videos verified; sample videos are regular videos, not Shorts):

| Age | Channel | Category | Note |
|---|---|---|---|
| 7–10 | D!NG | Logic & STEM | From the Vsauce team; inactive since 2020, but the whole library is suitable |
| 7–10, 11–13, 14–16 | Primitive Technology / Ingleton Pottery | Logic & STEM / Arts & Creativity | Wordless and calm. Primitive Technology shows fire work, so its note says not to copy it. Primitive Technology isn't in 11–13 because that group's Logic & STEM slots were full |
| 11–13, 14–16 | Steve Mould | Science & Tech | Hands-on physics demos |
| 11–13 | The Action Lab, MinuteEarth | Science & Tech | Action Lab's note warns against copying its fire and liquid-nitrogen experiments |
| 11–13, 14–16 | Stand-up Maths, Stuff Made Here, Tom Scott | Mathematics / Logic & STEM / History & Geography | |
| 11–13 | D!NG | Logic & STEM | |
| 14–16 | Up and Atom | Science & Tech | |
| 14–16 | Eddie Woo | Mathematics | Real classroom lessons |
| 14–16 | Wendover Productions | History & Geography | Some military topics; has sponsor reads |
| 14–16 | David Bruce Composer | Music & Movement | Fills the empty 14–16 music gap; posts rarely, and one title has a bleeped swear word |

**Moved:** SciShow went from 11–13 to 14–16. Its newest uploads, which the app shows first, cover alcohol, cannabis and "AI psychosis".

**Verified, but held back to keep categories from getting crowded:** The Science Asylum, Sixty Symbols, AlphaPhoenix, Real Science (inactive since Dec 2025), Mathologer, blackpenredpen, Tipping Point Math (inactive since 2018), Learn Your Land, New Mind, Half as Interesting (sarcastic innuendo) and The Organic Chemistry Tutor. Parents can add any of these from **Manage channels**. Their verified IDs are in the checkers' working notes.

**Main reasons for rejecting:**
- **Dangerous experiments kids could copy:** Cody's Lab, TheBackyardScientist, Science Marshall, Tech Ingredients.
- **Adult tone or topics:** Sciencephile the AI, Thought Emporium, Sabine Hossenfelder, Joe Scott, Vsauce2.
- **Explicit or adult music:** Marc Rebillet, The Dooo.
- **Mostly Shorts:** Vsauce, Be Smart, Domain of Science, Macro Room.
- **University lectures over an hour:** MIT, Yale, Harvard, Professor Leonard.
- **Inactive:** PBS Infinite Series, Verge Science, Bozeman Science.
- **Deleted:** Vihart.

---

## Open gaps for parents to fill on "Manage channels"

| Age | Gap | Suggested candidates (verified IDs, add if you like them) |
|---|---|---|
| 3–6 | Calm social-emotional content (beyond the 3 kept) | Mister Rogers' Neighborhood `UCQr37RLNViAkEwli9WiaUug` |
| 3–6 | More read-alouds | Brightly Storytime `UCvQagFNHMrGgQpYunk4rHXg` |
| 7–10 | **Mathematics has only one channel** | No parent-endorsed second channel was found. Numberblocks' later seasons cover multiplication for 7-year-olds. |
| 7–10 | Financial, Media Literacy and Soft Skills | Researchers found **no** parent-endorsed channels. Use individual videos instead. |
| 7–10 | Crafts | Red Ted Art `UCjjRFKvjpU1L1eDmfBWcqig`, Science Max `UCbprhISv-0ReKPPyhf7-Dtw` (science experiments) |
| 11–13 | Reading & Language, Media Literacy, Soft Skills | No suitable active channel (OSP fails on its upload mix). Crash Course's "Navigating Digital Information" playlist is a good media-literacy unit. |
| 11–13 | Nature | Snake Discovery `UCnIrLy19cFV50Eai8Xj-ArA`, PBS Eons `UCzR-rom72PHN9Zg7RML9EbA`, MinuteEarth `UCeiYXex_fwgYDonaTcSIk6w` |
| 14–16 | Reading & Language, Music, Soft Skills | Nothing well-endorsed and active was found. |
| 14–16 | Stronger maths and engineering | Eddie Woo `UCq0EGvLTyy-LLT1oUSO_0FQ`, Practical Engineering `UCMOqf8ab-42UUQIdVoKwjlQ`, Socratica `UCW6TXMZ5Pq6yL6_k5NZ2e0Q` |
| All | Shorts | **Fixed:** the app now filters out Shorts (vertical videos of 3 minutes or less, anything 60 seconds or under, and #shorts titles), and reads up to 4 pages of uploads to find 12 watchable videos. Fallback video IDs were checked, and the 24 Shorts among them were swapped for regular videos. Shorts-heavy channels such as Mark Rober and Numberblocks will show fewer, older videos. |
| 14–16 | Media Literacy | MediaWise was removed because it posts only Shorts. Crash Course's "Navigating Digital Information" series is the best alternative. |

## Key sources

- **Parent forums**
  - Hacker News "Ask HN" threads: https://news.ycombinator.com/item?id=36716809, https://news.ycombinator.com/item?id=37204090, https://news.ycombinator.com/item?id=32833581
  - Mumsnet: https://www.mumsnet.com/talk/preschool/5210809-fun-and-educational-youtube-channels-for-toddlers
  - Reddit, read through the archive:
    - r/Teachers: https://www.reddit.com/r/Teachers/comments/1setfrx/
    - r/MensLib: https://www.reddit.com/r/MensLib/comments/n6ztqd/
    - r/Parenting: https://www.reddit.com/r/Parenting/comments/1k9i4o6/
    - r/homeschool: https://www.reddit.com/r/homeschool/comments/s8by55/
- **Ratings**
  - Common Sense Media, Mark Rober (8+): https://www.commonsensemedia.org/youtube-reviews/mark-rober
  - Common Sense Media, Crash Course (12+): https://www.commonsensemedia.org/youtube-reviews/crash-course
  - Common Sense Media, MrBeast (14+): https://www.commonsensemedia.org/youtube-reviews/mrbeast
  - Screenwise, OverSimplified (13+): https://screenwiseapp.com/media/oversimplified-youtube
- **Homeschool and teacher lists**
  - Treehouse Schoolhouse: https://treehouseschoolhouse.com/blog/best-educational-youtube-channels-kids-homeschool
  - HomeschoolPicks: https://homeschoolpicks.com/free-resources/best-youtube-channels-homeschool/
  - The Homeschool Mom: https://www.thehomeschoolmom.com/20-youtube-channels-for-homeschooling/
  - WeAreTeachers: https://www.weareteachers.com/educational-youtube-channels
  - Next Gen Personal Finance on Two Cents: https://www.ngpf.org/blog/personal-finance/digging-deeper-into-the-pbs-series-two-cents-the-universal-personal-finance-currency-for-all-ages/
- **Warn-list**
  - Internet Matters on content farms: https://www.internetmatters.org/hub/news-blogs/what-is-content-farm-how-harmful/
  - BrightCanary: https://www.brightcanary.io/?p=976
  - Bark on Unspeakable: https://www.bark.us/content-review/unspeakable-youtube-channel-review/
