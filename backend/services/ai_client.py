import logging
import ollama

DEFAULT_MODEL = "llama3.2:3b"
STREAM_MODEL = "llama3:latest"

logger = logging.getLogger(__name__)

_api_available = True


def generate_response(prompt: str, stream: bool = False):
    """
    Generate a response using Llama 3 via the local Ollama service.

    Returns a string for non-streaming calls, or a generator of strings for
    streaming calls. Returns None on failure.
    """
    try:
        if stream:
            def _stream():
                for chunk in ollama.chat(
                    model=STREAM_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    stream=True,
                ):
                    yield chunk["message"]["content"]
            return _stream()

        response = ollama.chat(
            model=DEFAULT_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return response["message"]["content"]

    except Exception as e:
        logger.error("Llama API call failed: %s", e)
        return None
