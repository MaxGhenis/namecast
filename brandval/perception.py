"""AI-powered brand perception forecasting with multiple personas."""

import os
import json
from dataclasses import dataclass
from typing import Optional
from anthropic import Anthropic


@dataclass
class PersonaResponse:
    """Response from a single persona."""
    persona: str
    age: int
    occupation: str
    evokes: str
    industry_guess: str
    would_trust: bool
    memorable: bool
    explanation: str


@dataclass
class PerceptionAnalysis:
    """Aggregated perception analysis from multiple personas."""
    evokes: str
    industry_association: list[str]
    memorability: str
    persona_responses: list[PersonaResponse]
    consensus_score: float  # 0-1, how much personas agree
    mission_alignment: Optional[float] = None
    mission_explanation: Optional[str] = None


# Diverse personas for brand perception testing
PERSONAS = [
    {
        "name": "Sarah",
        "age": 28,
        "occupation": "Software Engineer",
        "background": "Tech-savvy millennial who works at a startup. Values innovation and authenticity.",
    },
    {
        "name": "Robert",
        "age": 55,
        "occupation": "Small Business Owner",
        "background": "Runs a local accounting firm. Conservative, values trust and reliability.",
    },
    {
        "name": "Maya",
        "age": 34,
        "occupation": "Marketing Director",
        "background": "Works at a Fortune 500 company. Expert in branding, very critical of names.",
    },
    {
        "name": "James",
        "age": 42,
        "occupation": "Investor",
        "background": "VC partner who evaluates hundreds of startups. Focuses on market positioning.",
    },
    {
        "name": "Lisa",
        "age": 22,
        "occupation": "College Student",
        "background": "Gen Z, heavy social media user. Cares about authenticity and social impact.",
    },
]


def analyze_with_personas(
    name: str,
    mission: Optional[str] = None,
    num_personas: int = 5,
) -> PerceptionAnalysis:
    """
    Forecast brand perception using multiple AI personas.

    Get diverse oracle predictions on how different demographics
    will perceive the brand name.
    """
    client = Anthropic()
    responses = []

    for persona in PERSONAS[:num_personas]:
        response = _query_persona(client, name, persona, mission)
        if response:
            responses.append(response)

    return _aggregate_responses(responses, name, mission, client)


def _query_persona(
    client: Anthropic,
    name: str,
    persona: dict,
    mission: Optional[str],
) -> Optional[PersonaResponse]:
    """Query a single persona about the brand name."""

    mission_context = ""
    if mission:
        mission_context = f"\n\nThe company's mission is: {mission}"

    prompt = f"""You are {persona['name']}, a {persona['age']}-year-old {persona['occupation']}.
Background: {persona['background']}

You're being asked about a brand name for a company. Answer AS THIS PERSONA, based on their background and perspective.

Brand name: "{name}"{mission_context}

Answer these questions from {persona['name']}'s perspective in JSON format:
{{
    "evokes": "What does this name make you think of? (1-2 sentences)",
    "industry_guess": "What industry/type of company would you guess this is?",
    "would_trust": true/false - Would you trust a company with this name?,
    "memorable": true/false - Is this name memorable to you?,
    "explanation": "Brief explanation of your overall impression (2-3 sentences)"
}}

Respond ONLY with valid JSON, no other text."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )

        result = json.loads(response.content[0].text)

        return PersonaResponse(
            persona=persona["name"],
            age=persona["age"],
            occupation=persona["occupation"],
            evokes=result.get("evokes", ""),
            industry_guess=result.get("industry_guess", ""),
            would_trust=result.get("would_trust", True),
            memorable=result.get("memorable", True),
            explanation=result.get("explanation", ""),
        )
    except Exception as e:
        print(f"Error querying persona {persona['name']}: {e}")
        return None


def _aggregate_responses(
    responses: list[PersonaResponse],
    name: str,
    mission: Optional[str],
    client: Anthropic,
) -> PerceptionAnalysis:
    """Aggregate persona responses into overall analysis."""

    if not responses:
        # Fallback if no API responses
        return PerceptionAnalysis(
            evokes="professional, modern",
            industry_association=["technology", "business"],
            memorability="high",
            persona_responses=[],
            consensus_score=0.0,
        )

    # Collect all evocations and industries
    all_evokes = [r.evokes for r in responses]
    all_industries = [r.industry_guess for r in responses]

    # Calculate consensus
    trust_rate = sum(1 for r in responses if r.would_trust) / len(responses)
    memorable_rate = sum(1 for r in responses if r.memorable) / len(responses)
    consensus_score = (trust_rate + memorable_rate) / 2

    # Determine memorability category
    if memorable_rate >= 0.8:
        memorability = "high"
    elif memorable_rate >= 0.5:
        memorability = "medium"
    else:
        memorability = "low"

    # Use Claude to synthesize the evocations
    synthesis_prompt = f"""Given these diverse reactions to the brand name "{name}":

{chr(10).join(f'- {r.persona} ({r.age}, {r.occupation}): "{r.evokes}"' for r in responses)}

Synthesize into a single 1-2 sentence summary of what this name evokes. Be specific and concrete."""

    try:
        synthesis = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=150,
            messages=[{"role": "user", "content": synthesis_prompt}],
        )
        evokes_summary = synthesis.content[0].text.strip()
    except:
        evokes_summary = all_evokes[0] if all_evokes else "professional, modern"

    # Get unique industries
    unique_industries = list(set(all_industries))[:4]

    result = PerceptionAnalysis(
        evokes=evokes_summary,
        industry_association=unique_industries,
        memorability=memorability,
        persona_responses=responses,
        consensus_score=consensus_score,
    )

    # Mission alignment if provided
    if mission:
        alignment = _evaluate_mission_alignment(client, name, mission, evokes_summary)
        result.mission_alignment = alignment["score"]
        result.mission_explanation = alignment["explanation"]

    return result


def _evaluate_mission_alignment(
    client: Anthropic,
    name: str,
    mission: str,
    evokes: str,
) -> dict:
    """Evaluate how well the name aligns with the mission."""

    prompt = f"""Evaluate how well the brand name "{name}" aligns with this company mission:

Mission: {mission}

The name evokes: {evokes}

Rate the alignment from 1-10 and explain briefly.

Respond in JSON format:
{{
    "score": <1-10>,
    "explanation": "<2-3 sentences>"
}}

Respond ONLY with valid JSON."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        return json.loads(response.content[0].text)
    except:
        return {"score": 5.0, "explanation": "Unable to evaluate alignment."}
