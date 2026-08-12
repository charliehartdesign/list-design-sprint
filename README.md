# List Design Sprint

Prototype for Etsy’s Typeform-style listing create flow (Figma: **List-Create-Design-Sprint**). Collage typography, AI orange-square motion, media drop → best practices, and a locked bottom-left listing preview.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173/).

### Quick walkthrough

1. Click or drop on the media zone to fill photos and see **Best practices** on the right.
2. Scroll or use the footer ↑↓ control to move between questions.
3. Once media leaves the viewport, a listing preview locks to the bottom-left (24px margin).

## Tweak points

| What | Where |
| --- | --- |
| Motion durations / easings | `src/motion/tokens.js` |
| Colors + Collage type tokens | `src/index.css` |
| Form content & questions | `src/components/ListingForm.jsx` |
| Media empty → filled + practices | `src/components/MediaSection.jsx` |
| Layout styling | `src/components/ListingForm.css` |
