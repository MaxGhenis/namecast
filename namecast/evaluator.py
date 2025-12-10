"""Brand name oracle - core forecasting logic."""

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
class SocialHandleResult:
    """Result for a single social platform."""
    platform: str
    exact_available: bool  # Is @name available?
    best_alternative: Optional[str] = None  # Best available alternative handle
    alternatives_checked: list[str] = field(default_factory=list)  # All alternatives checked


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
    social: dict[str, SocialHandleResult] = field(default_factory=dict)
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
            "| Platform | @exact | Best Alternative |",
            "|----------|--------|------------------|",
        ])
        for platform, result in self.social.items():
            if isinstance(result, SocialHandleResult):
                exact = "✓" if result.exact_available else "✗"
                alt = result.best_alternative or "-"
                lines.append(f"| {platform} | {exact} | {alt} |")
            else:
                # Backwards compat with old bool format
                status = "✓" if result else "✗"
                lines.append(f"| {platform} | {status} | - |")

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

    def evaluate(
        self,
        name: str,
        mission: Optional[str] = None,
        planned_domain: Optional[str] = None,
    ) -> EvaluationResult:
        """Run full evaluation on a brand name.

        Args:
            name: The brand name to evaluate
            mission: Optional company mission for alignment scoring
            planned_domain: The domain you plan to use (e.g., "farness.ai") -
                           used to suggest matching social handle alternatives
        """
        domains = self.check_domains(name)
        social = self.check_social(name, planned_domain)
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

    def check_social(self, name: str, planned_domain: Optional[str] = None) -> dict[str, SocialHandleResult]:
        """Check social media handle availability with alternatives.

        Args:
            name: The brand name to check
            planned_domain: The domain you plan to use (e.g., "farness.ai") -
                           used to suggest matching alternatives like @farnessai
        """
        results = {}
        name_lower = name.lower()

        # Generate alternative handles based on name and planned domain
        alternatives = self._generate_handle_alternatives(name_lower, planned_domain)

        for platform in self.DEFAULT_PLATFORMS:
            # TODO: Implement actual availability checks via API/scraping
            # For now, return the alternatives we would check
            results[platform] = SocialHandleResult(
                platform=platform,
                exact_available=True,  # Placeholder - would check @{name}
                best_alternative=alternatives[0] if alternatives else None,
                alternatives_checked=[name_lower] + alternatives,
            )

        return results

    def _generate_handle_alternatives(self, name: str, planned_domain: Optional[str] = None) -> list[str]:
        """Generate alternative handles to check if exact name is taken."""
        alternatives = []

        # If planned domain provided, derive alternatives from it
        # e.g., farness.ai -> farnessai, farness_ai
        if planned_domain:
            # Remove protocol if present
            domain = planned_domain.replace("https://", "").replace("http://", "")
            # Get TLD
            if "." in domain:
                base, tld = domain.rsplit(".", 1)
                alternatives.append(f"{base}{tld}")  # farnessai
                alternatives.append(f"{base}_{tld}")  # farness_ai
                alternatives.append(f"{base}.{tld}")  # farness.ai (some platforms allow dots)
                alternatives.append(f"get{base}")  # getfarness
                alternatives.append(f"{base}hq")  # farnesshq
                alternatives.append(f"{base}app")  # farnessapp

        # Common suffix alternatives
        alternatives.extend([
            f"{name}hq",      # namehq
            f"{name}app",    # nameapp
            f"get{name}",    # getname
            f"try{name}",    # tryname
            f"use{name}",    # usename
            f"{name}_",      # name_
            f"_{name}",      # _name
            f"{name}io",     # nameio (if planning .io)
            f"{name}ai",     # nameai (if planning .ai)
            f"the{name}",    # thename
            f"{name}official",  # nameofficial
        ])

        # Remove duplicates while preserving order
        seen = set()
        unique = []
        for alt in alternatives:
            if alt not in seen and alt != name:
                seen.add(alt)
                unique.append(alt)

        return unique[:10]  # Top 10 alternatives

    def check_trademark(self, name: str) -> TrademarkResult:
        """Search for trademark conflicts."""
        # TODO: Implement USPTO TESS search
        return TrademarkResult(risk_level="low", matches=[])

    def find_similar_companies(self, name: str) -> SimilarCompaniesResult:
        """Find similar-sounding or confusingly similar existing companies."""
        # Use LLM to research similar companies
        if os.environ.get("ANTHROPIC_API_KEY"):
            try:
                return self._find_similar_with_llm(name)
            except Exception as e:
                print(f"LLM similar companies search failed: {e}")

        # Fallback: no matches if no API key
        return SimilarCompaniesResult(matches=[], confusion_risk="low")

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
                from namecast.perception import analyze_with_personas
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

    def _calc_social_score(self, social: dict[str, SocialHandleResult]) -> float:
        """Calculate social handle availability score (0-100).

        Scoring:
        - Exact handle available: 100% for that platform
        - Alternative available: 70% for that platform
        - Nothing available: 0% for that platform
        """
        if not social:
            return 0

        total_score = 0
        for result in social.values():
            if isinstance(result, SocialHandleResult):
                if result.exact_available:
                    total_score += 100
                elif result.best_alternative:
                    total_score += 70  # Alternative is decent but not perfect
                # else: 0 points
            else:
                # Backwards compat with old bool format
                total_score += 100 if result else 0

        return total_score / len(social)

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
