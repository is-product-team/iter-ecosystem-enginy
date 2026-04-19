## Context

The incident system is already operational on the backend (`/issues`) and the web app. The mobile app needs to consume these services and provide a native UI that matches the "Iter" aesthetic (rich, premium styling using NativeWind).

## Goals / Non-Goals

**Goals:**
- Provide a responsive and intuitive UI for reporting problems.
- Ensure messages sync correctly between mobile and web admin.
- Support both Catalan and Spanish.

**Non-Goals:**
- Push notifications for new messages (currently out of scope, purely in-app polling or manual refresh).
- Media attachments in chat (text-only for now).

## Decisions

- **Service Abstraction**: Create `apps/mobile/services/issueService.ts` to encapsulate all API calls. This maintains consistency with other services like `workshopService`.
- **Navigation Structure**: Use Expo Router stacks. `/support` will act as the home for incidents, and `/issue/new` and `/issue/[id]` will be sub-screens within the professor stack.
- **Form State**: Simple `useState` for the creation form. Validation using basic checks before submission.
- **Styling**: Leverage `NativeWind` and `Ionicons` to match the existing profile and dashboard design patterns (Apple-style large headers, rounded cards).

### Data Flow Diagram

```
[Mobile UI] <---> [IssueService] <---> [API (/issues)] <---> [Database]
      |                                      ^
      |                                      |
      +--------------------------------------+ [Web Admin Dashboard]
```

## Risks / Trade-offs

- [Risk] Connection issues during submission → [Mitigation] Implement simple error handling and loading states in the form.
- [Risk] Screen overflow on small devices → [Mitigation] Use `KeyboardAvoidingView` and `ScrollView` for all forms and chat views.
