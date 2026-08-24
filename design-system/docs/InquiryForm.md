---
category: Forms
---

# InquiryForm

The B2B export inquiry form.

The only form in the system, and the one place `Button`'s underline and red variants
appear together.

Labels sit above their inputs in the 12px role; inputs are underlined rules with no box,
no radius and no fill, matching the button species.

The four interest values are fixed — each maps to a different CRM follow-up sequence, so
changing them silently breaks lead routing.

Validation messages come back from the server per field. The client does not duplicate the
rules, so there is exactly one source of truth for what is valid.

## Usage

```tsx
import { InquiryForm } from '@orkay/ds';

<InquiryForm />
<InquiryForm initialState="sent" />
```
