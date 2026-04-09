# Specification: Local AI Infrastructure

## Overview
This specification defines the requirements for moving the application's AI capabilities from heuristic mocks to local, self-hosted models for privacy and accuracy.

## Requirement 1: Ollama Backend
- The system must provide a local LLM endpoint via an **Ollama** service.
- The `docker-compose.yml` must include an `ollama` container with GPU acceleration support (NVIDIA Docker Toolkit) or CPU-only fallbacks.
- API requests must be routed to the local Ollama instance (default: `http://ollama:11434`).

## Requirement 2: Vision Model (Llava)
- The system must use a vision-capable local model (e.g., `llava`) to process PDF/Image buffers from pedagogical agreements.
- Accuracy requirement: Correctly detect signature presence in 95% of test cases.

## Requirement 3: NLP Parsing (Llama3/Mistral)
- The system must use a local general-purpose LLM (e.g., `llama3`) to parse natural language feedback into structured JSON.
- Multi-language support: Must correctly parse ES/CA/EN feedback into standardized EN keys.

## Requirement 4: Privacy & Data Protection
- No prompt data or telemetry from the local models should be sent to external APIs (e.g., LangSmith, OpenAI, Gemini).
- Sensitive teacher/student comments must be processed entirely within the local container stack.
