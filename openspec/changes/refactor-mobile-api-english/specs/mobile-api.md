# Spec: Mobile API English Naming

This specification defines the field name changes for the mobile API integration to align with the backend's English naming conventions.

## Field Mappings

| Feature | Catalan Property (Old) | English Property (New) | Type |
| --- | --- | --- | --- |
| **Attendance** | `numero_sessio` | `sessionNumber` | `number` |
| **Attendance** | `estat` | `status` | `string` (Enum) |
| **Attendance** | `observacions` | `comments` | `string` |
| **Assignment** | `data_inici` | `startDate` | `string` (ISO Date) |
| **Student** | `cognoms` | `surnames` | `string` |

## API Endpoints Affected

### POST /attendance
The payload must now include `sessionNumber`, `status`, and `comments` instead of their Catalan counterparts.

### GET /teachers/me/assignments
The returned `Assignment` objects will now contain `startDate` instead of `data_inici`.

### GET /assignments/{id}/students
The returned `Enrollment` and `Student` objects will now use `surnames` instead of `cognoms`.
