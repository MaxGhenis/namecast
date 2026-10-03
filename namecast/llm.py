"""Shared settings and response handling for Claude API calls."""

# Evaluator calls (similar companies, brand scope, taglines, name generation)
SONNET_MODEL = "claude-sonnet-5-5"
# Perception calls (personas, synthesis, mission alignment, two-pass analysis)
OPUS_MODEL = "claude-opus-5-5"

# Thinking is always on for the 5.5 models and counts toward max_tokens.
# Every call here is short JSON or text generation, so run at low effort.
EFFORT = "low"
OUTPUT_CONFIG = {"effort": EFFORT}
MAX_TOKENS = 16000


class ClaudeRefusalError(RuntimeError):
    """Claude declined the request (stop_reason == "refusal")."""


def response_text(response) -> str:
    """Return the text of a Messages API response.

    Reads text blocks by type, since thinking blocks can come first.
    Raises ClaudeRefusalError on a refusal and ValueError when there is no text,
    so callers fall back the same way they do for any other API failure.
    """
    if response.stop_reason == "refusal":
        details = getattr(response, "stop_details", None)
        category = getattr(details, "category", None)
        raise ClaudeRefusalError(f"Claude declined the request (category: {category})")

    text = "".join(block.text for block in response.content if block.type == "text")
    if not text.strip():
        raise ValueError(f"Claude returned no text (stop_reason: {response.stop_reason})")
    return text
