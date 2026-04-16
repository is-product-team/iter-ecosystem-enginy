# Proposal: Optimize Local AI (Zero Mock Strategy)

## Problem Statement
The current local AI implementation (Ollama) is inoperative due to several infrastructure issues:
1. **Accessibility**: Ollama ports are not published to the host, preventing external monitoring and manual testing.
2. **Resource Mismatch**: The system defaults to `llama3` (4.7GB RAM), but the Docker environment limits Ollama to 2GB RAM. This leads to crashes or extreme slowness.
3. **Ghost State**: Ollama starts empty; required models (`moondream`, `llama3`) are not automatically pulled during setup.

## Proposed Solution
Transition to a "Highly Optimized Local AI" stack:
1. **Lightweight Models**: Use `gemma:2b` (1.6GB) for NLP and `moondream` (1.8GB) for Vision.
2. **Infrastructure**: Expose Port 11434 for observability and add a `setup-ollama` service to automate model pulling.
3. **Configuration**: Harmonize `.env` with optimized model selections.

## Goals
- Full automation of AI setup.
- 100% local processing within 2GB RAM budget.
- Sub-second classification for teacher feedback.
