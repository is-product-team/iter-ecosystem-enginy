## Implementation Design

### 1. DataTable Refinements
The objective is to make the grid feel more "airy" and consistent.

- **Index Cell (#)**: Remove the `bg-background-subtle/5` color. The cell will now use the same background as the rest of the row (or the `even:` striping).
- **Alignment**: Update the default column alignment logic from `left` to `center`. This will affect both the `<th>` (header) and the `<td>` (cell).

### 2. Requests Status UI
Refactor the rendering of the `status` column in `AdminRequestsPage.tsx`.

- **Current Style**: Colored badge with border and background.
- **Proposed Style**: Neutral background, colored icon and text only.
    - **Approved**: Lucide `CheckCircle` svg, `text-green-600`.
    - **Rejected**: Lucide `XCircle` svg, `text-red-600`.
    - **Pending**: Lucide `Clock` svg, `text-orange-600`.

## Visual Mockup (Centered everything)

```
|   #   |   Center   |   Date   |   Status   |
|:-----:|:----------:|:--------:|:----------:|
|   1   | CenterName | 10/10/26 |  ✅ Assigned |
|   2   | CenterName | 12/10/26 |  ❌ Rejected |
```
*(No squares behind the index numbers or statuses)*
