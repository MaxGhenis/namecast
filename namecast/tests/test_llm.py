"""Tests for the Claude API call sites.

Requests go through the real Anthropic SDK with a mock HTTP transport, so the
tests check the exact request body the SDK sends and parse real response
objects. Nothing reaches the network.
"""

import itertools
import json
from types import SimpleNamespace

import anthropic
import pytest

if int(anthropic.__version__.split(".", 1)[0]) >= 1:
    import httpx2 as sdk_httpx
else:  # anthropic 0.x uses httpx, even when httpx2 is also installed
    import httpx as sdk_httpx

from namecast import perception
from namecast.evaluator import BrandEvaluator, NamecastWorkflow
from namecast.llm import (
    MAX_TOKENS,
    OPUS_MODEL,
    SONNET_MODEL,
    ClaudeRefusalError,
    response_text,
)

RealAnthropic = anthropic.Anthropic

PERSONA = perception.DEFAULT_PERSONAS[0]
MISSION = "An education technology platform for lifelong learners"

# Parameters Claude Opus 5.5 / Sonnet 5.5 reject (400) or that force tool use or prefill.
FORBIDDEN_PARAMS = {"temperature", "top_p", "top_k", "thinking", "tool_choice"}


def _message(content, stop_reason="end_turn", stop_details=None, model=SONNET_MODEL):
    return {
        "id": "msg_test",
        "type": "message",
        "role": "assistant",
        "model": model,
        "content": content,
        "stop_reason": stop_reason,
        "stop_sequence": None,
        "stop_details": stop_details,
        "usage": {"input_tokens": 1, "output_tokens": 1},
    }


def _text_reply(payload):
    """A reply that opens with a thinking block, as 5.5 models can."""
    text = payload if isinstance(payload, str) else json.dumps(payload)
    return _message([
        {"type": "thinking", "thinking": "", "signature": "sig"},
        {"type": "text", "text": text},
    ])


REFUSAL = _message(
    [],
    stop_reason="refusal",
    stop_details={"type": "refusal", "category": "cyber", "explanation": None},
)


class Recorder:
    """Real Anthropic client whose transport records requests and replies with a canned body."""

    def __init__(self, reply):
        self.reply = reply
        self.requests = []

    def _handle(self, request):
        self.requests.append(json.loads(request.content))
        return sdk_httpx.Response(200, json=self.reply)

    def client(self, *args, **kwargs):
        return RealAnthropic(
            api_key="test-key-not-used",
            base_url="http://claude.test",
            max_retries=0,
            http_client=anthropic.DefaultHttpxClient(
                transport=sdk_httpx.MockTransport(self._handle)
            ),
        )


@pytest.fixture
def api_env(monkeypatch):
    """Set a dummy key (so key-gated paths run) and route Anthropic() to a Recorder."""
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key-not-used")
    monkeypatch.setenv("ANTHROPIC_BASE_URL", "http://127.0.0.1:9")

    def install(reply):
        recorder = Recorder(reply)
        monkeypatch.setattr(anthropic, "Anthropic", recorder.client)
        monkeypatch.setattr(perception, "Anthropic", recorder.client)
        return recorder

    return install


# Each call site: (id, model, success payload, run(recorder) -> result,
# check(result) on success, check(result) after a refusal).
def _run_similar(r):
    return BrandEvaluator().find_similar_companies("Stripey")


def _run_brand_scope(r):
    return BrandEvaluator().analyze_brand_scope("Luminary", MISSION)


def _run_taglines(r):
    return BrandEvaluator().generate_taglines("Luminary", MISSION)


def _run_generate_names(r):
    return NamecastWorkflow()._generate_names("A tool for planning garden layouts", 3)


def _run_dynamic_personas(r):
    return perception.generate_dynamic_personas(MISSION, r.client())


def _run_query_persona(r):
    return perception._query_persona(r.client(), "Luminary", PERSONA, MISSION)


def _persona_response():
    return perception.PersonaResponse(
        persona="Sarah", age=28, occupation="Software Engineer",
        evokes="a guiding light", industry_guess="education",
        would_trust=True, memorable=True, memorability_score=8,
        professionalism_score=7, explanation="Clear and warm.",
    )


def _run_synthesis(r):
    return perception._aggregate_responses([_persona_response()], "Luminary", None, r.client())


def _run_mission_alignment(r):
    return perception._evaluate_mission_alignment(r.client(), "Luminary", MISSION, "a guiding light")


def _run_two_pass(r):
    return perception._query_two_pass(r.client(), "Luminary", "runs online courses", PERSONA)


TWO_PASS_PAYLOAD = {
    "expected_industry": "education", "expected_product": "courses",
    "initial_trust": True, "initial_memorability": 8, "initial_professionalism": 7,
    "comports": "yes", "comport_score": 9, "reaction": "matches",
    "final_trust": True, "contrast_works": False, "explanation": "Fits well.",
}

CALL_SITES = [
    pytest.param(
        SONNET_MODEL,
        {"matches": [{"name": "Stripe", "industry": "payments", "similarity_score": 0.8,
                      "reason": "visually similar"}], "confusion_risk": "high"},
        _run_similar,
        lambda res: [m.name for m in res.matches] == ["Stripe"] and res.confusion_risk == "high",
        lambda res: res.matches == [] and res.confusion_risk == "low",
        id="evaluator.similar_companies",
    ),
    pytest.param(
        SONNET_MODEL,
        {"narrowness": 9, "expansion_potential": 8, "vision_alignment": 7, "assessment": "Broad."},
        _run_brand_scope,
        lambda res: (res.narrowness, res.assessment) == (9, "Broad."),
        lambda res: res.assessment.startswith("Heuristic analysis"),
        id="evaluator.brand_scope",
    ),
    pytest.param(
        SONNET_MODEL,
        ["Learn for life", "Light the way", "Always learning"],
        _run_taglines,
        lambda res: res == ["Learn for life", "Light the way", "Always learning"],
        lambda res: res == [],
        id="evaluator.taglines",
    ),
    pytest.param(
        SONNET_MODEL,
        ["Plotwise", "Bedrow", "Sprigly"],
        _run_generate_names,
        lambda res: res == ["Plotwise", "Bedrow", "Sprigly"],
        lambda res: res == [],
        id="workflow.generate_names",
    ),
    pytest.param(
        OPUS_MODEL,
        [{"name": "Ana", "age": 40, "occupation": "Teacher", "background": "Teaches adults."}],
        _run_dynamic_personas,
        lambda res: res == [{"name": "Ana", "age": 40, "occupation": "Teacher",
                             "background": "Teaches adults."}],
        lambda res: res == perception.DEFAULT_PERSONAS,
        id="perception.dynamic_personas",
    ),
    pytest.param(
        OPUS_MODEL,
        {"evokes": "light", "industry_guess": "education", "would_trust": True,
         "memorable": True, "memorability_score": 8, "professionalism_score": 7,
         "explanation": "Warm."},
        _run_query_persona,
        lambda res: (res.evokes, res.memorability_score) == ("light", 8),
        lambda res: res is None,
        id="perception.query_persona",
    ),
    pytest.param(
        OPUS_MODEL,
        "Evokes guidance and learning.",
        _run_synthesis,
        lambda res: res.evokes == "Evokes guidance and learning.",
        lambda res: res.evokes == "a guiding light",
        id="perception.synthesis",
    ),
    pytest.param(
        OPUS_MODEL,
        {"score": 8, "explanation": "Fits the mission."},
        _run_mission_alignment,
        lambda res: res == {"score": 8, "explanation": "Fits the mission."},
        lambda res: res["score"] == 5.0,
        id="perception.mission_alignment",
    ),
    pytest.param(
        OPUS_MODEL,
        TWO_PASS_PAYLOAD,
        _run_two_pass,
        lambda res: (res.comports, res.comport_score) == ("yes", 9),
        lambda res: res is None,
        id="perception.two_pass",
    ),
]


class TestCallSites:
    """Every Claude call site sends a request the 5.5 models accept and parses by block type."""

    @pytest.mark.parametrize("model,payload,run,ok,_fallback", CALL_SITES)
    def test_request_shape(self, api_env, model, payload, run, ok, _fallback):
        recorder = api_env(_text_reply(payload))
        run(recorder)
        assert len(recorder.requests) == 1
        body = recorder.requests[0]
        assert body["model"] == model
        assert body["output_config"] == {"effort": "low"}
        assert body["max_tokens"] >= 16000
        assert not FORBIDDEN_PARAMS & body.keys()
        assert body["messages"][-1]["role"] == "user"  # no assistant prefill

    @pytest.mark.parametrize("model,payload,run,ok,_fallback", CALL_SITES)
    def test_parses_text_after_thinking_block(self, api_env, model, payload, run, ok, _fallback):
        recorder = api_env(_text_reply(payload))
        assert ok(run(recorder))

    @pytest.mark.parametrize("model,payload,run,_ok,fallback", CALL_SITES)
    def test_refusal_uses_existing_fallback(self, api_env, model, payload, run, _ok, fallback):
        recorder = api_env(REFUSAL)
        assert fallback(run(recorder))
        assert len(recorder.requests) == 1


def _block(kind, text):
    if kind == "text":
        return SimpleNamespace(type="text", text=text)
    return SimpleNamespace(type="thinking", thinking="", signature="sig")


class TestResponseText:
    """response_text reads text blocks by type and never returns a refusal's content."""

    @pytest.mark.parametrize("length", range(5))
    def test_all_block_orders(self, length):
        """For every thinking/text order up to 4 blocks, the result is the text blocks joined in order."""
        pieces = ["a", " ", "", "b"]
        for kinds in itertools.product(["text", "thinking"], repeat=length):
            for texts in itertools.product(pieces, repeat=kinds.count("text")):
                it = iter(texts)
                blocks = [_block(k, next(it) if k == "text" else None) for k in kinds]
                response = SimpleNamespace(stop_reason="end_turn", content=blocks)
                expected = "".join(texts)
                if expected.strip():
                    assert response_text(response) == expected
                else:
                    with pytest.raises(ValueError):
                        response_text(response)

    @pytest.mark.parametrize("content", [[], [_block("text", "{}")], [_block("thinking", None)]])
    def test_refusal_always_raises(self, content):
        response = SimpleNamespace(
            stop_reason="refusal",
            stop_details=SimpleNamespace(category="bio"),
            content=content,
        )
        with pytest.raises(ClaudeRefusalError, match="bio"):
            response_text(response)

    def test_refusal_without_stop_details(self):
        response = SimpleNamespace(stop_reason="refusal", stop_details=None, content=[])
        with pytest.raises(ClaudeRefusalError):
            response_text(response)


def test_max_tokens_leaves_room_for_thinking():
    assert MAX_TOKENS >= 16000
