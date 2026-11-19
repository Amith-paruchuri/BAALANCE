# Tricha safety benchmark

- Run: 2026-11-19 17:31 UTC, with `node scripts/benchmark-triage.mjs` (offline, on the real source files)
- **Emergency detection: 28 of 28 (100%)**, false alarms: 0 of 30
- Triage overall: 58 of 58; data checks: 12 of 12
- Cases are synthetic, written by the BAALANCE team, including hard ones (Hindi, denials, look-alikes, unit errors).

## How this benchmark was used
The first run (19 Nov 2026) found two errors: "I can not breathe" (two words) was missed, and "Our sprint review collapsed into chaos" raised a false alarm. Both rules were fixed, and four new cases were added afterwards to check the fixes generalise. The results below are after the fix. The cases are our own, so they show the rules work on what we anticipated; the AIIMS pilot will test them on real messages.

## Triage by group
| Group | Passed |
|---|---|
| emergency: plain | 17 of 17 |
| emergency: hard | 7 of 7 |
| emergency: Hindi | 4 of 4 |
| see a doctor | 12 of 12 |
| routine | 6 of 6 |
| routine: denial | 4 of 4 |
| routine: look-alike | 8 of 8 |

## Failures (expected vs actual, and the component responsible)
None.

## All triage cases
| Message | Group | Expected | Actual | Why |
|---|---|---|---|---|
| I have chest pain right now | emergency: plain | emergency | emergency | chest pain or pressure |
| My chest feels tight and heavy since this morning | emergency: plain | emergency | emergency | chest pain or pressure |
| I get chest pain at night when I lie down | emergency: plain | emergency | emergency | chest pain or pressure |
| There is a crushing pressure in my chest | emergency: plain | emergency | emergency | chest pain or pressure |
| I can not breathe properly, it is getting worse | emergency: plain | emergency | emergency | trouble breathing |
| I can't breathe after climbing stairs today | emergency: plain | emergency | emergency | trouble breathing |
| Shortness of breath and sweating at my desk | emergency: plain | emergency | emergency | trouble breathing |
| I fainted in the meeting room an hour ago | emergency: plain | emergency | emergency | fainting or collapse |
| My colleague just collapsed next to me | emergency: plain | emergency | emergency | fainting or collapse |
| I passed out twice this week | emergency: plain | emergency | emergency | fainting or collapse |
| Her face is drooping and her speech is slurred | emergency: plain | emergency | emergency | possible stroke signs |
| Sudden weakness on one side of my body | emergency: plain | emergency | emergency | possible stroke signs |
| This is the worst headache of my life, it came on suddenly | emergency: plain | emergency | emergency | sudden severe headache |
| I had a seizure yesterday | emergency: plain | emergency | emergency | seizure |
| I am coughing up blood | emergency: plain | emergency | emergency | coughing or vomiting blood |
| My throat is swelling after eating nuts | emergency: plain | emergency | emergency | severe allergic reaction |
| My heart is racing and I feel dizzy and faint | emergency: plain | emergency | emergency | heart racing with dizziness or pain |
| Since the deadline week my chest is tight, is that stress? | emergency: hard | emergency | emergency | chest pain or pressure |
| Is it normal to have pain in my chest during long calls? | emergency: hard | emergency | emergency | chest pain or pressure |
| pls help chest pain since 20 min | emergency: hard | emergency | emergency | chest pain or pressure |
| My father has chest pain and is sweating | emergency: hard | emergency | emergency | chest pain or pressure |
| Seene mein dard ho raha hai | emergency: Hindi | emergency | emergency | chest pain (Hindi) |
| Chhati me dard hai aur pasina aa raha hai | emergency: Hindi | emergency | emergency | chest pain (Hindi) |
| Saans nahi aa rahi | emergency: Hindi | emergency | emergency | trouble breathing (Hindi) |
| सीने में दर्द हो रहा है | emergency: Hindi | emergency | emergency | chest pain (Hindi) |
| Struggling to breathe and my lips feel numb | emergency: hard | emergency | emergency | trouble breathing |
| I have palpitations during busy weeks | see a doctor | see_doctor | see_doctor | heart symptoms |
| I have not slept properly in weeks, insomnia every night | see a doctor | see_doctor | see_doctor | long-term sleep problems |
| Should I take melatonin for sleep? | see a doctor | see_doctor | see_doctor | medicine or dose question |
| Can I stop my antidepressant if my cortisol drops? | see a doctor | see_doctor | see_doctor | medicine or dose question |
| I use a steroid cream for eczema, does that matter? | see a doctor | see_doctor | see_doctor | medicine or dose question |
| I can't cope with work any more | see a doctor | see_doctor | see_doctor | feeling unable to cope |
| I had a panic attack before my presentation | see a doctor | see_doctor | see_doctor | feeling unable to cope |
| My hair is falling out in clumps | see a doctor | see_doctor | see_doctor | physical symptoms |
| I feel dizzy every afternoon | see a doctor | see_doctor | see_doctor | physical symptoms |
| I am pregnant, is the hair test still valid? | see a doctor | see_doctor | see_doctor | pregnancy |
| Should I see a doctor about my results? | see a doctor | see_doctor | see_doctor | asks about a doctor |
| Can you help me find a psychiatrist? | see a doctor | see_doctor | see_doctor | asks about a doctor |
| Why was my cortisol high in September? | routine | routine | routine |  |
| What should I change in my calendar? | routine | routine | routine |  |
| How does the hair test work? | routine | routine | routine |  |
| Is hair cortisol scientifically valid? | routine | routine | routine |  |
| When should I re-test? | routine | routine | routine |  |
| Thanks, that helps! | routine | routine | routine |  |
| No chest pain, just tired all the time | routine: denial | routine | routine |  |
| I have never fainted, but I feel drained after meetings | routine: denial | routine | routine |  |
| No shortness of breath, only stress at work | routine: denial | routine | routine |  |
| I do not have chest pain, I just want to understand my score | routine: denial | routine | routine |  |
| I did chest day at the gym and my legs are sore | routine: look-alike | routine | routine |  |
| Breathing exercises help me before meetings | routine: look-alike | routine | routine |  |
| My deadlines are killing me this month | routine: look-alike | routine | routine |  |
| That presentation took my breath away | routine: look-alike | routine | routine |  |
| Meetings after 7 PM give me a headache | routine: look-alike | routine | routine |  |
| Our sprint review collapsed into chaos | routine: look-alike | routine | routine |  |
| I cannot catch my breath since lunch | emergency: hard | emergency | emergency | trouble breathing |
| My mother suddenly collapsed in the kitchen | emergency: hard | emergency | emergency | fainting or collapse |
| The deal collapsed and I am stressed | routine: look-alike | routine | routine |  |
| Can not stop thinking about work | routine: look-alike | routine | routine |  |

## All data-check cases
| Case | Group | Expected | Actual |
|---|---|---|---|
| Complete, plausible inputs | complete | no warnings | no warnings |
| No hair result at all | missing | hair | warn:hair |
| Only two months of hair | missing | hair-info | info:hair |
| A month with no value | missing | hair | warn:hair |
| Zero cortisol | wrong value | hair | warn:hair |
| Negative cortisol | wrong value | hair | warn:hair |
| Unit error: 2840 instead of 28.4 | wrong value | hair | warn:hair |
| Same month twice | wrong value | hair | warn:hair |
| No calendar connected | missing | calendar-info | info:calendar |
| Calendar with 140 hours in a week | wrong value | calendar | warn:calendar |
| PSS-10 not taken | missing | pss10-info | info:pss10 |
| PSS-10 out of range (55) | wrong value | pss10 | warn:pss10 |
