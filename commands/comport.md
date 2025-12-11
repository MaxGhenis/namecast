---
description: "Two-pass evaluation: Does the product comport with the name?"
argument-hint: "<name> <product_description>"
---

# Two-Pass Comport Evaluation

Parse the user input to extract:
- **Name**: The brand name to evaluate (first word/token)
- **Product Description**: What the company/product actually does (everything after the name)

## The Two-Pass Method

This evaluation reveals whether a name-product mismatch is **intentional contrast** (like Mailchimp - playful name, serious product) or a **jarring disconnect**.

**Pass 1**: "What would you expect a company named {NAME} to do?"
**Pass 2**: "{NAME} does {PRODUCT}. Does that comport?"

The delta between expectation and reality is the key signal.

## Your Task

Run the two-pass evaluation using 5 diverse personas (Opus 4.5 is critical for detecting wordplay):

### 1. Define Personas
Use these default personas (or generate dynamic ones based on the product):
- Sarah, 28, Software Engineer - Tech-savvy millennial, values innovation
- Robert, 55, Small Business Owner - Conservative, values trust and reliability
- Maya, 34, Marketing Director - Branding expert, very critical of names
- James, 42, Investor - VC who evaluates hundreds of startups
- Lisa, 22, College Student - Gen Z, cares about authenticity

### 2. For Each Persona, Run Both Passes

**Pass 1 (Name Only):**
Roleplay as the persona seeing ONLY the name "{NAME}":
- What industry would you guess they're in?
- What product/service would you expect?
- Would you trust this company? (yes/no)
- Memorability (1-10)
- Professionalism (1-10)

**Pass 2 (Reality Check):**
Now reveal: "{NAME} {PRODUCT_DESCRIPTION}"
- Does this match your expectations? (yes/partially/no)
- Comport score (1-10): How well does the product fit the name?
- Reaction:
  - "positive_surprise" - better/more sophisticated than expected
  - "matches" - exactly what I expected
  - "neutral" - no strong feeling
  - "jarring_mismatch" - confusing, doesn't fit
- Would you trust them NOW? (yes/no)
- If there's a mismatch, does it work intentionally? (yes/no)

### 3. Aggregate Results

Calculate:
- **Avg Comport Score**: Mean of all comport scores (1-10)
- **Comport Rate**: % who said "yes" it comports
- **Positive Surprise Rate**: % who were pleasantly surprised
- **Contrast Works Rate**: Of those who saw a mismatch, % who say it works intentionally
- **Trust Delta**: Change in trust from Pass 1 to Pass 2

### 4. Determine Verdict

- **STRONG FIT**: Avg comport >= 7 AND comport rate >= 60%
- **POSITIVE CONTRAST**: Positive surprise rate >= 40% AND contrast works rate >= 50%
- **JARRING MISMATCH**: Jarring rate >= 40% OR (avg comport < 5 AND contrast works rate < 50%)
- **NEUTRAL**: Everything else

### 5. Present Results

## {NAME} - Comport Analysis

**Verdict: [STRONG FIT / POSITIVE CONTRAST / NEUTRAL / JARRING MISMATCH]**

| Metric | Value |
|--------|-------|
| Comport Score | X.X/10 |
| Comport Rate | X% |
| Positive Surprise Rate | X% |
| Contrast Works Rate | X% |
| Trust Delta | +X% / -X% |

**Persona Responses:**

For each persona:
> **{Name}** ({age}, {occupation})
> - Expected: {what they expected}
> - Reaction: {emoji} {reaction} (comport: X/10)
> - {their explanation}

**Key Insight:** [Did personas catch any wordplay? Did the contrast work or jar?]

**Recommendation:** [Should they keep the name? What would help - tagline, explanation, different name?]

---

**IMPORTANT**: Use Opus 4.5 for this evaluation. Sonnet misses wordplay (e.g., "EggNest" → "nest egg" pun).
