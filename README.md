# Kya Banana Hai

Pick a meal. Shop only what you need.

A small mobile-first web app. A user picks one to six meals (up to two days), sees one combined grocery list, ticks what they already have at home, and leaves with a priced shopping list to share or print. English and Hindi, with spoken Hindi or English summaries.

**One user type, one journey:** decide what to cook, subtract what is at home, finalise the list.

## Run it locally

No build step and no database. You only need to serve the folder (opening `index.html` by double-click will not work, because the app loads its data files).

```bash
npm run dev            # needs Node 18+, serves http://localhost:3000
# or, with no Node:
python3 -m http.server 3000
```

## Deploy on Vercel

The app is a plain static site, so it needs no Vercel-specific services.

1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty (or set Output Directory to `.`). Click **Deploy**.
4. Every push to `main` redeploys automatically.

## Update prices every week

Prices live in one file: `data/prices.json`.

- Change `zepto` and `blinkit` for an ingredient. Both prices are for the same `pack` size: the lowest-priced standard option on each app, no brand matching.
- Set `"updated"` to today's date, written like `26-10-2026`. The date shows on the shopping list.
- Run `npm run validate` before committing. It catches missing prices, unknown ingredients and missing images.

Pack size and price must be for the same pack. If you change a pack from 500 g to 1 kg, change `pack` and both prices together.

## What is in the data folder

| File | What it holds |
|---|---|
| `data/prices.json` | Pack size, Zepto price, Blinkit price. **The weekly file.** |
| `data/ingredients.json` | Names in English and Hindi, unit, household measure (katori, tsp, tbsp, pc), notes such as "any cooking oil works", substitutes, and which items count as kitchen staples. |
| `data/dishes.json` | The eight dishes: time, heavy or light, meal slots, prep note, equipment, ingredient quantities for one serve (`optional: true` means Good to have), photo, and which three dishes show plate costs on Screen 1. |
| `data/strings.json` | Every piece of on-screen text, as `[English, Hindi]`. |
| `images/` | Dish photos, named by dish id. |

### Add a dish

1. Add the photo as `images/<id>.webp` (about 320 px square).
2. Add an entry to `data/dishes.json`, using ingredient ids that already exist.
3. If it needs a new ingredient, add it to `data/ingredients.json` and `data/prices.json`.
4. Run `npm run validate`.

## How the numbers work

- **To buy** = needed − at home, never below zero, rounded **up to whole packs**. Price = packs × pack price.
- **Plate cost on Screens 1 and 2:** must-have ingredients only, minus six kitchen staples (salt, oil, turmeric, garam masala, mustard seeds, cumin), at Zepto prices, counting only the amount one plate uses.
- **Per serve on Screen 5:** the amount of each bought item that one serve uses, at the chosen channel's price, for the user's own cart.
- State (name, language, meals, ticks, last plan) is saved in the browser's local storage. Nothing leaves the device.

## Pantry memory

Every shopping list is kept as a pending shop. When the user taps **I have bought these: save leftovers** on the list, or answers **Yes** to "Did you buy your last list?" on the next visit, the app remembers what is left of each bought pack. **No** drops the list without remembering anything. It is once per shopping list, not once per dish. The next plan starts with those items ticked on Screen 4, and the user can untick anything. Fresh items are forgotten after 3 days, cabinet items are kept. It is stored in the browser only (`pt` in local storage), and **Clear remembered items** wipes it.

The app also keeps a local list of plan times (`lg`). Type `STATS()` in the browser console to see plans made and plans started within 7 days of the first. This never leaves the device, so measuring "plan again within 7 days" across testers needs a privacy-friendly counter (for example GoatCounter) or asking testers directly.

## Known limits

- Prices are not live. All 42 were checked on Zepto and Blinkit for pincode 110052 on 16-11-2026 and are refreshed by hand. Neither app has a public price feed. Each list item links to a search on the chosen app, not to an exact product.
- Hindi audio uses the browser's built-in voice, so quality depends on the device.
- "Demo login" is a front-end shortcut, not real authentication.
- Ingredient rows have no photos (text only).

## Out of scope

Recipe method, live prices, ordering or checkout, accounts and sync, nutrition filters, custom dishes, languages other than English and Hindi.

## Ingredient groups and cautions

Each ingredient in `data/ingredients.json` has a `group` (`fresh` or `cabinet`). Screen 4 shows fresh items first and full size, and cabinet items below in a quieter, compact list. An ingredient can also have a `care` block with a `caution` and a `fix` (English and Hindi). It shows as a "Watch out" line on screens 3 and 4 and is left out when an ingredient has none.
