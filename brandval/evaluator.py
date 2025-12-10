"""Brand name evaluator - core evaluation logic."""

from dataclasses import dataclass, field, asdict
from typing import Optional
import os
import json
import whois


@dataclass
class SimilarCompany:
    """A similar-sounding existing company."""
    name: str
    similarity_score: float  # 0-1, higher = more similar
    industry: str
    reason: str  # Why it's similar (phonetic, spelling, etc.)


@dataclass
class SimilarCompaniesResult:
    """Result of similar companies search."""
    matches: list[SimilarCompany]
    confusion_risk: str  # "low", "medium", "high"


@dataclass
class TrademarkResult:
    """Result of trademark search."""
    risk_level: str  # "low", "medium", "high"
    matches: list[dict]


@dataclass
class PronunciationResult:
    """Result of pronunciation analysis."""
    score: float
    syllables: int
    spelling_difficulty: str  # "easy", "medium", "hard"


@dataclass
class PerceptionResult:
    """Result of AI perception analysis."""
    evokes: str
    industry_association: list[str]
    memorability: str
    mission_alignment: Optional[float] = None


@dataclass
class EvaluationResult:
    """Complete brand evaluation result."""
    name: str
    overall_score: float
    domain_score: float
    social_score: float
    trademark_score: float
    pronunciation_score: float
    international_score: float
    similar_companies_score: float = 100.0

    domains: dict[str, bool] = field(default_factory=dict)
    social: dict[str, bool] = field(default_factory=dict)
    trademark: Optional[TrademarkResult] = None
    pronunciation: Optional[PronunciationResult] = None
    international: dict[str, dict] = field(default_factory=dict)
    perception: Optional[PerceptionResult] = None
    similar_companies: Optional[SimilarCompaniesResult] = None

    def to_dict(self) -> dict:
        """Export as dictionary."""
        return asdict(self)

    def to_json(self) -> str:
        """Export as JSON string."""
        return json.dumps(self.to_dict(), indent=2, default=str)

    def to_markdown(self) -> str:
        """Export as markdown report."""
        lines = [
            f"## Brand Evaluation: {self.name}",
            "",
            f"### Overall Score: {self.overall_score:.0f}/100",
            "",
            "### Domain Availability",
            "| TLD | Status |",
            "|-----|--------|",
        ]
        for tld, available in self.domains.items():
            status = "Available" if available else "Taken"
            lines.append(f"| {tld} | {status} |")

        lines.extend([
            "",
            "### Social Handles",
            "| Platform | Status |",
            "|----------|--------|",
        ])
        for platform, available in self.social.items():
            status = "Available" if available else "Taken"
            lines.append(f"| {platform} | {status} |")

        if self.trademark:
            lines.extend([
                "",
                f"### Trademark Risk: {self.trademark.risk_level.upper()}",
            ])

        if self.pronunciation:
            lines.extend([
                "",
                f"### Pronunciation Score: {self.pronunciation.score:.1f}/10",
                f"- Syllables: {self.pronunciation.syllables}",
                f"- Spelling: {self.pronunciation.spelling_difficulty}",
            ])

        if self.similar_companies and self.similar_companies.matches:
            lines.extend([
                "",
                f"### Similar Companies: {self.similar_companies.confusion_risk.upper()} RISK",
                "",
            ])
            for company in self.similar_companies.matches:
                lines.append(f"- **{company.name}** ({company.industry}) - {company.reason}")

        return "\n".join(lines)


def whois_lookup(domain: str) -> Optional[dict]:
    """Look up WHOIS info for a domain. Returns None if not registered."""
    try:
        w = whois.whois(domain)
        if w.domain_name:
            return {"domain_name": w.domain_name, "creation_date": w.creation_date}
        return None
    except Exception:
        return None


class BrandEvaluator:
    """Main brand name evaluator."""

    DEFAULT_TLDS = [".com", ".io", ".co", ".ai", ".app"]
    DEFAULT_PLATFORMS = ["twitter", "instagram", "linkedin", "tiktok", "github"]

    def __init__(self):
        pass

    def evaluate(self, name: str, mission: Optional[str] = None) -> EvaluationResult:
        """Run full evaluation on a brand name."""
        domains = self.check_domains(name)
        social = self.check_social(name)
        trademark = self.check_trademark(name)
        pronunciation = self.analyze_pronunciation(name)
        international = self.check_international(name)
        perception = self.analyze_perception(name, mission)
        similar_companies = self.find_similar_companies(name)

        # Calculate scores
        domain_score = self._calc_domain_score(domains)
        social_score = self._calc_social_score(social)
        trademark_score = self._calc_trademark_score(trademark)
        pronunciation_score = pronunciation.score * 10  # 0-10 -> 0-100
        international_score = self._calc_international_score(international)
        similar_companies_score = self._calc_similar_companies_score(similar_companies)

        # Weighted overall score
        overall_score = (
            domain_score * 0.20
            + social_score * 0.10
            + trademark_score * 0.20
            + pronunciation_score * 0.15
            + international_score * 0.15
            + similar_companies_score * 0.20
        )

        return EvaluationResult(
            name=name,
            overall_score=overall_score,
            domain_score=domain_score,
            social_score=social_score,
            trademark_score=trademark_score,
            pronunciation_score=pronunciation_score,
            international_score=international_score,
            similar_companies_score=similar_companies_score,
            domains=domains,
            social=social,
            trademark=trademark,
            pronunciation=pronunciation,
            international=international,
            perception=perception,
            similar_companies=similar_companies,
        )

    def check_domains(self, name: str) -> dict[str, bool]:
        """Check domain availability across TLDs."""
        result = {}
        name_lower = name.lower()
        for tld in self.DEFAULT_TLDS:
            domain = f"{name_lower}{tld}"
            info = whois_lookup(domain)
            result[tld] = info is None  # Available if no WHOIS record
        return result

    def check_social(self, name: str) -> dict[str, bool]:
        """Check social media handle availability."""
        # TODO: Implement actual social media checks
        # For now, return placeholder
        return {platform: True for platform in self.DEFAULT_PLATFORMS}

    def check_trademark(self, name: str) -> TrademarkResult:
        """Search for trademark conflicts."""
        # TODO: Implement USPTO TESS search
        return TrademarkResult(risk_level="low", matches=[])

    def find_similar_companies(self, name: str) -> SimilarCompaniesResult:
        """Find similar-sounding or confusingly similar existing companies."""
        # Always start with static check for speed
        static_result = self._find_similar_static(name)

        # If we have an API key, enhance with LLM analysis
        if os.environ.get("ANTHROPIC_API_KEY"):
            try:
                llm_result = self._find_similar_with_llm(name)
                # Merge results, preferring LLM findings but keeping static matches
                return self._merge_similar_results(static_result, llm_result)
            except Exception as e:
                print(f"LLM similar companies search failed: {e}")

        return static_result

    def _merge_similar_results(
        self, static: SimilarCompaniesResult, llm: SimilarCompaniesResult
    ) -> SimilarCompaniesResult:
        """Merge static and LLM similarity results."""
        # Combine matches, avoiding duplicates
        seen_names = set()
        merged_matches = []

        # LLM results first (usually more comprehensive)
        for match in llm.matches:
            name_lower = match.name.lower()
            if name_lower not in seen_names:
                seen_names.add(name_lower)
                merged_matches.append(match)

        # Add static matches not found by LLM
        for match in static.matches:
            name_lower = match.name.lower()
            if name_lower not in seen_names:
                seen_names.add(name_lower)
                merged_matches.append(match)

        # Sort by similarity and take top 5
        merged_matches.sort(key=lambda x: x.similarity_score, reverse=True)
        merged_matches = merged_matches[:5]

        # Use higher risk level
        risk_order = {"low": 0, "medium": 1, "high": 2}
        confusion_risk = static.confusion_risk
        if risk_order.get(llm.confusion_risk, 0) > risk_order.get(static.confusion_risk, 0):
            confusion_risk = llm.confusion_risk

        return SimilarCompaniesResult(matches=merged_matches, confusion_risk=confusion_risk)

    def _find_similar_static(self, name: str) -> SimilarCompaniesResult:
        """Check against a static database of well-known companies."""
        name_lower = name.lower()
        matches = []

        # Database of well-known tech/business companies for comparison
        known_companies = {
            "stripe": "payments",
            "shopify": "e-commerce",
            "slack": "communication",
            "zoom": "video conferencing",
            "notion": "productivity",
            "figma": "design",
            "canva": "design",
            "asana": "project management",
            "trello": "project management",
            "airtable": "database",
            "hubspot": "marketing",
            "mailchimp": "email marketing",
            "twilio": "communication APIs",
            "plaid": "fintech",
            "brex": "fintech",
            "ramp": "fintech",
            "gusto": "HR/payroll",
            "rippling": "HR",
            "deel": "HR",
            "lattice": "HR",
            "lever": "recruiting",
            "greenhouse": "recruiting",
            "datadog": "monitoring",
            "snowflake": "data",
            "databricks": "data",
            "confluent": "data streaming",
            "vercel": "hosting",
            "netlify": "hosting",
            "supabase": "database",
            "firebase": "backend",
            "mongodb": "database",
            "elastic": "search",
            "algolia": "search",
            "auth0": "authentication",
            "okta": "identity",
            "cloudflare": "infrastructure",
            "fastly": "CDN",
            "segment": "analytics",
            "amplitude": "analytics",
            "mixpanel": "analytics",
            "intercom": "customer support",
            "zendesk": "customer support",
            "freshworks": "customer support",
            "calendly": "scheduling",
            "loom": "video",
            "miro": "collaboration",
            "linear": "project management",
            "monday": "project management",
            "clickup": "project management",
            "anthropic": "AI",
            "openai": "AI",
            "cohere": "AI",
            "stability": "AI",
            "midjourney": "AI",
            "jasper": "AI",
            "copy.ai": "AI",
            "grammarly": "writing",
            "notion": "productivity",
            "coda": "productivity",
            "airtable": "productivity",
        }

        for company, industry in known_companies.items():
            similarity = self._calculate_similarity(name_lower, company)
            if similarity > 0.5:
                reason = self._get_similarity_reason(name_lower, company)
                matches.append(SimilarCompany(
                    name=company.title(),
                    similarity_score=similarity,
                    industry=industry,
                    reason=reason,
                ))

        # Sort by similarity score
        matches.sort(key=lambda x: x.similarity_score, reverse=True)
        matches = matches[:5]  # Top 5 matches

        # Determine confusion risk
        if not matches:
            confusion_risk = "low"
        elif any(m.similarity_score > 0.8 for m in matches):
            confusion_risk = "high"
        elif any(m.similarity_score > 0.6 for m in matches):
            confusion_risk = "medium"
        else:
            confusion_risk = "low"

        return SimilarCompaniesResult(matches=matches, confusion_risk=confusion_risk)

    def _find_similar_with_llm(self, name: str) -> SimilarCompaniesResult:
        """Use LLM to find similar companies."""
        from anthropic import Anthropic
        client = Anthropic()

        prompt = f"""Find existing companies with names that could be confused with "{name}".

Consider ALL types of similarity:

1. **Phonetic similarity** - names that sound alike when spoken
   - Example: "Lyft" ~ "Lift", "Figma" ~ "Sigma"

2. **Visual similarity** - names that look alike when written
   - Example: "Stripe" ~ "Stripey", "Notion" ~ "Motion"

3. **Semantic similarity** - names with similar meanings or concepts
   - Example: "PayFlow" ~ "Stripe" (both evoke payment/flow)
   - Example: "CloudBase" ~ "Firebase" (both evoke cloud/base)

4. **Morphological similarity** - shared prefixes, suffixes, or word parts
   - Example: "Datadog" ~ "Databricks" (shared "Data-")
   - Example: "Mailchimp" ~ "Mailgun" (shared "Mail-")

5. **Industry confusion** - names that suggest the same product category
   - Example: "ChatBot AI" ~ "ChatGPT" (both chat + AI)

Focus on REAL, existing companies that someone might confuse with "{name}".
Include well-known tech companies, startups, and established brands.

For each similar company, provide:
- name: The company's actual name
- industry: Their primary industry/product
- similarity_score: 0.0-1.0 (how likely to cause confusion)
- reason: Specific type of similarity

Respond in JSON format:
{{
    "matches": [
        {{"name": "CompanyName", "industry": "their industry", "similarity_score": 0.7, "reason": "phonetically similar - both end in '-ify'"}}
    ],
    "confusion_risk": "low|medium|high"
}}

Guidelines for confusion_risk:
- "high": Very similar to a well-known company, or multiple close matches
- "medium": Moderately similar to known companies, some confusion possible
- "low": Only loose similarity, minimal confusion risk

Only include companies with similarity_score > 0.4. Respond ONLY with valid JSON, no markdown."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}],
        )

        result = json.loads(response.content[0].text)

        matches = [
            SimilarCompany(
                name=m["name"],
                similarity_score=m["similarity_score"],
                industry=m["industry"],
                reason=m["reason"],
            )
            for m in result.get("matches", [])
        ]

        return SimilarCompaniesResult(
            matches=matches,
            confusion_risk=result.get("confusion_risk", "low"),
        )

    def _calculate_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity between two names using multiple metrics."""
        # Levenshtein-based similarity
        edit_distance = self._levenshtein_distance(name1, name2)
        max_len = max(len(name1), len(name2))
        edit_similarity = 1 - (edit_distance / max_len) if max_len > 0 else 1

        # Phonetic similarity (simplified soundex-like)
        phonetic1 = self._simplify_phonetic(name1)
        phonetic2 = self._simplify_phonetic(name2)
        phonetic_similarity = 1.0 if phonetic1 == phonetic2 else 0.0
        if phonetic1.startswith(phonetic2) or phonetic2.startswith(phonetic1):
            phonetic_similarity = 0.7

        # Prefix/suffix similarity
        prefix_len = 0
        for i in range(min(len(name1), len(name2))):
            if name1[i] == name2[i]:
                prefix_len += 1
            else:
                break
        prefix_similarity = prefix_len / max_len if max_len > 0 else 0

        # Combined score (weighted average)
        return (edit_similarity * 0.4 + phonetic_similarity * 0.4 + prefix_similarity * 0.2)

    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein edit distance."""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        prev_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            curr_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = prev_row[j + 1] + 1
                deletions = curr_row[j] + 1
                substitutions = prev_row[j] + (c1 != c2)
                curr_row.append(min(insertions, deletions, substitutions))
            prev_row = curr_row

        return prev_row[-1]

    def _simplify_phonetic(self, name: str) -> str:
        """Simplified phonetic encoding."""
        name = name.lower()
        # Common phonetic substitutions
        replacements = [
            ("ph", "f"),
            ("ck", "k"),
            ("gh", "g"),
            ("kn", "n"),
            ("wr", "r"),
            ("wh", "w"),
            ("ee", "i"),
            ("ea", "i"),
            ("oo", "u"),
            ("ou", "u"),
            ("ai", "a"),
            ("ay", "a"),
            ("ey", "i"),
            ("ie", "i"),
            ("y", "i"),
        ]
        for old, new in replacements:
            name = name.replace(old, new)
        # Remove vowels except first
        if len(name) > 1:
            name = name[0] + "".join(c for c in name[1:] if c not in "aeiou")
        return name

    def _get_similarity_reason(self, name1: str, name2: str) -> str:
        """Determine why two names are similar."""
        if name1 == name2:
            return "identical"
        if name1.startswith(name2) or name2.startswith(name1):
            return "shares prefix"
        if self._simplify_phonetic(name1) == self._simplify_phonetic(name2):
            return "sounds similar"
        edit_dist = self._levenshtein_distance(name1, name2)
        if edit_dist <= 2:
            return "very close spelling"
        if edit_dist <= 4:
            return "similar spelling"
        return "partially similar"

    def score_pronunciation(self, name: str) -> float:
        """Score pronunciation difficulty (0-10, higher = easier)."""
        result = self.analyze_pronunciation(name)
        return result.score

    def analyze_pronunciation(self, name: str) -> PronunciationResult:
        """Analyze pronunciation characteristics."""
        syllables = self._count_syllables(name)

        # Score based on syllables (1-2 ideal)
        if syllables <= 2:
            base_score = 9.0
        elif syllables <= 3:
            base_score = 7.0
        elif syllables <= 4:
            base_score = 5.0
        else:
            base_score = 3.0

        # Penalize difficult consonant clusters
        difficult_patterns = ["xw", "zx", "ptl", "tch", "sch"]
        for pattern in difficult_patterns:
            if pattern in name.lower():
                base_score -= 1.5

        # Determine spelling difficulty
        if self._is_phonetic(name):
            spelling = "easy"
        elif any(c in name.lower() for c in ["ph", "gh", "ough"]):
            spelling = "hard"
        else:
            spelling = "medium"

        return PronunciationResult(
            score=max(0, min(10, base_score)),
            syllables=syllables,
            spelling_difficulty=spelling,
        )

    def check_international(self, name: str) -> dict[str, dict]:
        """Check for problematic meanings in other languages."""
        languages = ["spanish", "french", "german", "mandarin", "japanese", "portuguese", "arabic"]
        result = {}

        # Known problematic words
        problematic = {
            "mist": {"german": "manure/dung"},
            "fart": {"scandinavian": "speed"},
            "nova": {"spanish": "doesn't go (no va)"},
        }

        name_lower = name.lower()
        for lang in languages:
            issue = None
            if name_lower in problematic and lang in problematic[name_lower]:
                issue = problematic[name_lower][lang]
            result[lang] = {"has_issue": issue is not None, "meaning": issue}

        return result

    def analyze_perception(self, name: str, mission: Optional[str] = None) -> PerceptionResult:
        """Analyze brand perception using AI personas."""
        # Check if we have an API key for real analysis
        if os.environ.get("ANTHROPIC_API_KEY"):
            try:
                from brandval.perception import analyze_with_personas
                analysis = analyze_with_personas(name, mission, num_personas=5)
                return PerceptionResult(
                    evokes=analysis.evokes,
                    industry_association=analysis.industry_association,
                    memorability=analysis.memorability,
                    mission_alignment=analysis.mission_alignment,
                )
            except Exception as e:
                print(f"AI perception analysis failed: {e}")

        # Fallback to placeholder if no API key or error
        result = PerceptionResult(
            evokes="professional, modern",
            industry_association=["technology", "business"],
            memorability="high",
        )
        if mission:
            result.mission_alignment = 7.0  # Placeholder
        return result

    def _count_syllables(self, word: str) -> int:
        """Count syllables in a word."""
        word = word.lower()
        vowels = "aeiouy"
        count = 0
        prev_was_vowel = False
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                count += 1
            prev_was_vowel = is_vowel
        # Handle silent e
        if word.endswith("e") and count > 1:
            count -= 1
        return max(1, count)

    def _is_phonetic(self, name: str) -> bool:
        """Check if name is phonetically simple."""
        # Simple heuristic: no unusual letter combos
        unusual = ["ph", "gh", "ough", "tion", "sion", "xc", "cq"]
        return not any(u in name.lower() for u in unusual)

    def _calc_domain_score(self, domains: dict[str, bool]) -> float:
        """Calculate domain availability score (0-100)."""
        if not domains:
            return 0
        # .com is worth 50%, others split the rest
        score = 0
        if domains.get(".com"):
            score += 50
        other_tlds = [tld for tld in domains if tld != ".com"]
        available_others = sum(1 for tld in other_tlds if domains.get(tld))
        if other_tlds:
            score += (available_others / len(other_tlds)) * 50
        return score

    def _calc_social_score(self, social: dict[str, bool]) -> float:
        """Calculate social handle availability score (0-100)."""
        if not social:
            return 0
        available = sum(1 for v in social.values() if v)
        return (available / len(social)) * 100

    def _calc_trademark_score(self, trademark: TrademarkResult) -> float:
        """Calculate trademark safety score (0-100)."""
        if trademark.risk_level == "low":
            return 100
        elif trademark.risk_level == "medium":
            return 50
        else:
            return 10

    def _calc_international_score(self, international: dict[str, dict]) -> float:
        """Calculate international safety score (0-100)."""
        if not international:
            return 100
        issues = sum(1 for v in international.values() if v.get("has_issue"))
        return max(0, 100 - (issues * 20))

    def _calc_similar_companies_score(self, similar: SimilarCompaniesResult) -> float:
        """Calculate similar companies score (0-100). Lower = more conflicts."""
        if not similar.matches:
            return 100
        # High risk = big penalty
        if similar.confusion_risk == "high":
            return 20
        elif similar.confusion_risk == "medium":
            return 60
        else:
            return 85
