# Case study: OpenMessages name analysis

Real-world name evaluation conducted February 2026 for an open-source messaging client with AI integration.

## Context

The product started as "OpenMessages" (openmessages.ai). During launch prep, the founder noticed that `openmessage.ai` (singular) was also available. This triggered a full name analysis to decide whether to rename.

## Analysis performed

### 1. Syllable comparison

- **OpenMessages**: 5 syllables (O-pen-Mes-sa-ges)
- **OpenMessage**: 4 syllables (O-pen-Mes-sage)

One syllable fewer is meaningful. Shorter names are easier to say, type, and remember. The bar for keeping the longer name should be high.

### 2. Brand identity risk

"OpenMessages" reads as "open-source Google Messages" — which is literally what the product was at launch. But the vision was a unified messaging client across WhatsApp, Signal, Telegram, etc. The plural name anchored the product to a single service clone rather than establishing its own identity.

Additional concern: Google could see the name as derivative of their "Google Messages" product name.

### 3. Existing company search

Web search revealed **OpenMessage Inc.**, a NYC-based company founded in 2018:
- Built a branded multimedia text messaging platform
- Had LinkedIn, Crunchbase, GitHub presence
- Raised venture funding (amount undisclosed)

This initially seemed like a blocker. Deeper investigation revealed:
- **Website** (openmessage.com): SSL certificate broken (ERR_TLS_CERT_ALTNAME_INVALID)
- **Last press**: April 2019 (appointing a CCO). No news in 6+ years
- **LinkedIn**: Claims "11-50 employees" but only 3 profiles listed
- **No recent activity** on any platform

**Conclusion**: Company appears defunct or dormant.

### 4. USPTO trademark search (the key step)

This was the decisive check. Used the USPTO Trademark Electronic Search System (TESS) at `tmsearch.uspto.gov`.

#### Search: "openmessage" (singular)

**2 results found, both DEAD:**

| Serial | Owner | Status | Classes |
|--------|-------|--------|---------|
| 74672042 | Open Software Associates, Inc. (DE) | DEAD - ABANDONED | 009 |
| 88284020 | OpenMessage Inc. (DE) | DEAD - ABANDONED | 009, 035, 042 |

The actual OpenMessage company (serial 88284020) filed for the trademark and **abandoned it**. This means they either failed to respond to an office action, didn't file a statement of use, or actively abandoned the application.

#### Search: "openmessages" (plural)

**0 results.** Nobody has ever filed for this mark in any form — live or dead.

### 5. Domain availability

- `openmessages.ai`: Already owned by the founder
- `openmessage.ai`: Available for purchase

### 6. Decision

**Rename to OpenMessage.** Rationale:
- 4 syllables vs 5 (meaningfully shorter)
- Sounds like its own brand, not a clone of "Google Messages"
- Both USPTO trademarks are dead/abandoned
- The previous trademark holder (OpenMessage Inc.) appears defunct
- openmessage.ai domain is available
- No active products or companies use the name

## Lessons for namecast

### Gap 1: Trademark search needs real methodology

The evaluate-brand skill mentions "Search USPTO TESS database via WebSearch" but this doesn't work — TESS is a JavaScript-heavy app that doesn't return useful results via web search or web fetch.

**What actually works:**
1. Navigate to `tmsearch.uspto.gov` in a browser
2. Use the Wordmark search (default)
3. Enter the exact name
4. Check both Live and Dead status filters
5. Read results for: status (Live/Dead), filing type (Abandoned/Cancelled/Registered), owner, and class codes

**Key insight**: Dead/abandoned trademarks are **good news**, not bad news. They mean someone tried and gave up. A name with 0 results (never filed) or only dead results is clear to use.

**Status meanings:**
- **Live - Registered**: Someone owns this. Potential conflict.
- **Live - Pending**: Someone is trying to register. Could still be contested.
- **Dead - Abandoned**: Filed but abandoned. Safe to use (with caveats about common law rights).
- **Dead - Cancelled**: Was registered but cancelled (non-renewal, etc.). Safe to use.

### Gap 2: "Dead company" analysis

The similar companies check currently looks at whether companies exist, but doesn't assess whether they're **active**. Signals of a defunct company:

- Broken SSL certificate on their domain
- No press/news in 2+ years
- LinkedIn employee count doesn't match listed profiles
- Abandoned USPTO trademark filings
- No recent commits on GitHub
- Crunchbase shows no recent funding rounds

A "dead" competitor with the same name is very different from a live one. Namecast should surface this distinction.

### Gap 3: Singular vs plural comparison

When evaluating a name, automatically check both singular and plural forms:
- Different syllable counts
- Different trademark landscapes
- Different domain availability
- Different "feel" (plural can sound like a feature of something else)

### Gap 4: Brand identity vs product name

Evaluate whether the name sounds like:
- **Its own brand** ("OpenMessage" — could be anything)
- **A clone/fork of an existing product** ("OpenMessages" sounds like "open-source Google Messages")

Names that sound derivative limit the product's ability to expand beyond its initial scope.

## Methodology checklist (for namecast to implement)

1. Check syllable count for both singular and plural forms
2. Search USPTO TESS for exact wordmark (requires browser automation or API)
3. Check both Live and Dead trademark results
4. If similar companies found, assess whether they're active:
   - Try loading their website (SSL errors = likely dead)
   - Check for recent news (2+ years of silence = likely dead)
   - Check LinkedIn employee count vs actual profiles
5. Evaluate whether the name sounds derivative of existing products
6. Consider the vision scope — does the name limit future expansion?
