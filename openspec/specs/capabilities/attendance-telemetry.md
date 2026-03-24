# Specification: Attendance & Telemetry

This capability tracks the physical presence, punctuality, and real-time location (telemetry) of students during workshop sessions to ensure safety and program integrity.

## 1. Attendance Tracking

Teachers use the mobile application to log the status of each student in every session.

### Attendance States
- **Present**: The student is physically present at the scheduled time.
- **Retard (Late)**: The student arrived after the start time.
- **Absència (Absent)**: Unjustified absence.
- **Absència Justificada**: Absence with a valid reason documented by the center.

### Process
1.  Teacher selects an active session for an assignment.
2.  The mobile app fetches the **Nominal Register** (list of enrolled students).
3.  Statuses are toggled manually or assisted by **NLP**.
4.  Data is synchronised with the central API and reflected in the Admin Panel.

## 2. NLP-Assisted Presence & Competency

The `NLPService` processes textual observations (often transcribed from voice) to automate data entry:

- **Punctuality Detection**: Keywords like *"late"*, *"retraso"*, or *"retras"* automatically flag a student as `Retard`.
- **Behavioral Insights**: Positive keywords like *"ayuda"*, *"lidera"*, or *"proactiu"* trigger an automatic competency update for **Transversal Competence**, suggesting a higher score.
- **Observation Cleaning**: Sanitizes the raw input into formal session records.

## 3. Telemetry: High-Frequency GPS Tracking (Proposed)

For workshops involving field activities or outdoor movement, the system specifies a requirements for high-frequency telemetry:

- **GPS Ingestion**: High-frequency coordinate updates sent from the mobile app.
- **Real-time Monitoring**: Visualization of student groups on a map for safety and logistical management.
- **Geofencing**: Automated alerts if a group deviates from the expected activity area.
- **Architecture**: Utilization of **Redis** for efficient ingestion and real-time filtering before persisting key checkpoints to PostgreSQL.

## 4. Integration with Risk Analysis

Attendance data is the primary input for the `RiskAnalysisService`:
- **Persistent Tardiness**: Triggers "Medium" risk alerts.
- **Multiple Absences**: Triggers "High/Critical" risk alerts and notifies the origin center automatically.
