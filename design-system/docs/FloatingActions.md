---
category: Forms
---

# FloatingActions

The two persistent buttons at the bottom right.

WhatsApp, and chat.

The chat button degrades honestly: with no chat widget mounted it becomes a link to the
contact block rather than a button that does nothing. **Never render a control here with
nothing behind it** — a dead floating button is worse than no floating button.

WhatsApp opens with the inquiry already written, so the buyer's first message is a real one
and reaches the CRM already qualified.

## Usage

```tsx
import { FloatingActions } from '@orkay/ds';

<FloatingActions whatsapp="919104488859" />
```
