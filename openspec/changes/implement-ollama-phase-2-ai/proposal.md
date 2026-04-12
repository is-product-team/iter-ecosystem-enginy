# Proposal: Transition to Local Server AI (Ollama)

## Problem
The current Phase 2 documentation workflow is fragmented. It attempts to perform signature detection in the browser using TensorFlow.js (Option A), which is:
1.  **Unstable**: Depends on user hardware.
2.  **Incomplete**: Missing model weights.
3.  **Redundant**: We already have a local AI server (Ollama) that can handle this more robustly.
Additionally, document uploads are failing due to pathing issues in the Docker environment.

## Goal
Consolidate all AI validation into the local Ollama instance (Option B) to ensure 100% privacy and better accuracy, while fixing the underlying upload infrastructure.

## Scope
-   **Phase 2**: Document classification and signature detection.
-   **Security**: Ensure data never leaves the Docker network.
-   **Infrastructure**: Fix persistent storage for sub-modules.

## Alternatives Considered
-   **Cloud AI**: Rejected due to privacy concerns with sensitive student data.
-   **Keep TF.js**: Rejected because it increases frontend bundle size and lacks reasoning capabilities.
