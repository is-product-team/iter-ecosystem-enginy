# Specification: Evaluations & Feedback

This capability manages the assessment of student competencies and the collection of satisfaction feedback from all program stakeholders (students, teachers, and centers).

## 1. Teacher-Led Competency Evaluation

Teachers evaluate students on specific technical and transversal skills at the end of each workshop.

- **Competency Matrix**: Evaluates predefined competencies (e.g., Teamwork, Technical Proficiency, Initiative).
- **Scoring**: Uses a numerical scale (typically 1-5).
- **Persistence**: Data is stored in the `avaluacions` and `avaluacio_competencial` models, linked to a specific `inscripcio` (enrollment).

## 2. AI-Assisted Evaluation (Voice & Sentiment)

The `EvaluationService` provides AI tools to streamline the teacher's evaluation process:

- **Speech-to-Text Transcription**: Teachers can dictate observations rather than typing.
- **Sentiment Analysis**: The AI analyzes the transcribed text for positive or negative sentiment.
- **Score Suggestions**: Based on keyword detection (e.g., *"proactive"*, *"disciplined"*), the system suggests a competency score (e.g., 4 or 5) for the teacher to review and confirm.

## 3. Dynamic Satisfaction Surveys

The system handles dynamic questionnaires for students, centers, and teachers throughout the program lifecycle.

### Models & Enviaents
- **Questionnaire Models**: Templates with dynamic questions (Rating, Single Choice, Multi Choice, Text).
- **Tracking**: The `EnviamentQuestionari` model tracks whether a survey has been sent, viewed, or responded to for a specific assignment.
- **Lifecycle**: Surveys are typically triggered during the **Closing Phase** (`Tancament`) of a workshop.

## 4. Student Autoconsulta (Self-Evaluation)

A specialized feedback loop for students to reflect on their experience:
- **Vocational Impact**: Tracks if the workshop influenced their career or educational choices.
- **Key Learnings**: Open-ended feedback on the most valuable skills acquired.
- **Experience Rating**: Global satisfaction with the workshop and the teaching staff.

## 5. Metrics & Impact Analysis

The `QuestionariService` aggregates response data to provide high-level metrics:
- **General Satisfaction Index**: Average rating across all workshops.
- **Vocational Impact Distribution**: Percentage of students reporting a positive career influence.
- **Educational Gaps**: Identifying competencies with consistently low scores for program improvement.
