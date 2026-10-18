# CivicSense — Google Gemma Model Integration Plan

Architectural blueprint and implementation plan for integrating Google's Gemma model (`gemma-2-9b-it`) into CivicSense for intelligent, explainable, and secure civic hazard report classification.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during the interactive clarification interview:
> - **Model Choice**: `gemma-2-9b-it` for fast, structured, low-latency triage with built-in fallback to `gemini-2.5-flash` and local heuristics.
> - **Intake Workflow**: Automatic classification triggered as the citizen enters or pastes report description text (with debounced real-time preview and manual re-analyze control).
> - **API Key Resolution**: Server-side resolution checking `GEMMA_API_KEY` first, gracefully falling back to `GEMINI_API_KEY` if present, ensuring zero client-side exposure.

- **Confirmed Decision 1**: Use `gemma-2-9b-it` via official Google Gen AI SDK (`@google/genai`) or Google AI Studio inference API with structured JSON output.
- **Confirmed Decision 2**: Implement an isolated, reusable service module (`server/gemmaService.ts`) and expose `POST /api/ai/classify-hazard` in `server.ts`.
- **Confirmed Decision 3**: Preserve 100% of existing CivicSense features, views, Google Maps integration, accessibility VoiceAssist dock, and styling.

---

### 1. Overview & Core Concept

- **What It Does**: Enhances CivicSense with an AI intelligence engine powered by Google's Gemma model. As citizens report infrastructure issues (potholes, water leaks, damaged footpaths, streetlight failures), Gemma analyzes the text, validates authenticity, estimates urgency (0-100), tags the responsible municipal department, and flags uncertain or dangerous cases for human inspector review.
- **Target Audience**: Citizens reporting road and neighborhood hazards, municipal dispatchers prioritizing public works crews, and public safety teams triaging emergency vs. routine issues.
- **Key Safety Guardrails**:
  - Treat user text strictly as untrusted input data to prevent prompt-injection attacks.
  - Never mark an incident as physically verified solely based on AI classification.
  - Escalate immediate life-safety threats (e.g. exposed electrical lines, collapsing structures) to mandatory human review.

---

### 2. Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CivicSense Gemma Flow                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────┐           ┌──────────────────────────────┐
│  Frontend Intake & Review   │           │      Express API Proxy       │
│  • ReportHazardView.tsx     │           │  • POST /api/ai/classify-    │
│  • Debounced Auto-Trigger   │◄─────────►│    hazard                    │
│  • Gemma Prediction Badge   │           │  • Input Validation (Zod)    │
│  • User Correction Controls │           │  • Rate Limiting & Timeouts  │
└─────────────────────────────┘           └──────────────────────────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │      Gemma Service Layer     │
                                          │  • server/gemmaService.ts    │
                                          │  • gemma-2-9b-it / Fallback  │
                                          │  • Structured JSON Schema    │
                                          │  • Prompt-Injection Defense  │
                                          └──────────────────────────────┘
```

#### Structured Output Schema (`GemmaClassificationResult`)
```typescript
export interface GemmaClassificationResult {
  category:
    | 'pothole'
    | 'garbage'
    | 'water leakage'
    | 'drainage'
    | 'broken streetlight'
    | 'damaged road'
    | 'traffic hazard'
    | 'illegal dumping'
    | 'public infrastructure damage'
    | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  reasoning: string;
  recommendedDepartment: string;
  recommendedAction: string;
  urgencyScore: number; // 0 - 100
  requiresHumanReview: boolean;
  detectedLanguage: string;
  confidence: number; // 0.0 - 1.0 (model estimate)
  sourceModel: string;
}
```

---

### 3. Implementation Steps

#### Step 1: Gemma Service Layer (`server/gemmaService.ts`)
- Initialize client with `GEMMA_API_KEY || process.env.GEMINI_API_KEY`.
- Implement robust prompt template using system boundary delimiters (`<report_text>...</report_text>`) preventing prompt-injection.
- Enforce strict JSON schema validation.
- Implement intelligent fallback to heuristic engine if the model is unreachable, rate-limited, or times out.

#### Step 2: Backend API Route (`server.ts`)
- Implement `POST /api/ai/classify-hazard` with:
  - Payload validation: `{ description: string, location?: { address?: string, lat?: number, lng?: number } }`.
  - Request size limiting and sanitization.
  - Secure error handling that never leaks API keys, stack traces, or internal prompts.

#### Step 3: Frontend Intake Integration (`src/views/ReportHazardView.tsx`)
- Add real-time debounced Gemma classification when the user types or pastes the complaint description.
- Render an AI Classification Card:
  - Shows predicted category, severity badge, department, urgency score, and recommended municipal action.
  - Interactive "Apply AI Suggestions" and "Correct Category" buttons so citizens retain full control.
  - Clear visual disclaimer: *"Gemma AI model estimate — verified by citizen review."*
  - Friendly retry button if offline or API error occurs.

#### Step 4: Automated Testing Suite (`tests/gemmaClassifier.test.ts`)
- Unit and integration tests covering:
  1. Pothole on a busy road.
  2. Overflowing garbage / illegal dumping.
  3. Water leakage and drainage failure.
  4. Broken streetlight / electrical hazard.
  5. Exposed high-voltage wiring (critical safety escalation).
  6. Vague / incomplete text (requires human review).
  7. Multilingual / mixed language reports.
  8. Prompt-injection defense tests.
  9. Malformed JSON recovery and error handling.
  10. Timeout / rate-limit simulation.

---

### 4. Verification & Testing Plan

1. **Compilation**: Run `compile_applet` to verify that the TypeScript bundle builds without errors.
2. **Lint Check**: Run `lint_applet` (`tsc --noEmit`) to verify zero type mismatches.
3. **Automated Test Run**: Run test script via Node.js verifying all 10 test scenarios with mocked and live fallbacks.
4. **End-to-End Test**: Verify real HTTP request to `POST /api/ai/classify-hazard` and frontend UI updates.
