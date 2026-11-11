# Compass Roulette — First Landfall development plan

Status: IN DEVELOPMENT. Do not merge or deploy to GitHub Pages until sea/land correctness and mobile gameplay are tested.

## Rules
- Start at Monkseaton. One shared explorer, alternating human and Little Boots turns.
- A bearing produces a 12 statute-mile great-circle move (19.312128 km).
- If the twelve-mile endpoint is on land, stop there.
- If the endpoint is water, continue along the same initial great-circle bearing until the first coastline entry, including small islands. No nearest-mainland shortcut. Show the twelve-mile point and first-landfall point separately.
- A sea landing counts when the *12-mile endpoint* is water; crossing a short inlet while finishing on land does not count.
- Each player has their own sea count. On the fourth sea landing, that player forfeits their next scheduled turn, then their count resets. Landfalls count toward the sea counter even when the first coast is distant.
- Pause after every completed move; show a readable arrival card and an explicit Continue button. Don't automatically take Little Boots' turn before exploration.
- Same engine and rules for both players. Little Boots targets the Faroes; human targets North Pole.
- If no landfall is found on the great-circle route before reaching the pole or returning to the origin, report an unresolved sea journey rather than fabricate a landfall. Do not hand over the turn as though resolved.
- Render animated red boots on land and a boat during sea crossings, with motion consistent with the calculated route.
- Historical discoveries must be sourced; approximate geocoded locality must be labelled as approximate, not exact landfall.

## Technical implementation
1. Obtain authoritative coastline polygons with island coverage (e.g. OpenStreetMap-derived dataset), including data licensing and attribution. Prefer preprocessed regional/global land-mask geometry bundled or hosted for reliable mobile performance.
2. Classify endpoint as land/water. Validate points on the coast with explicit tolerance and avoid ocean-only reverse geocoding.
3. Trace a great-circle ray using sufficiently fine adaptive stepping and binary-search coastline transitions; never skip narrow islands. Validate against known islands, estuaries, coastline edges, antimeridian and polar routes.
4. Persist turn state and counters in game logic; do not count a move until resolved. Test fourth-sea penalty for both players and skipped turns.
5. Animate the route and display a pause card, then enable Continue.
6. Test on mobile, then merge to main only after explicit user approval.

## Acceptance tests
- Twelve miles into the North Sea from Monkseaton continues to first land on same bearing.
- Small islands are not skipped.
- Finishing on land after briefly crossing water does not increment sea count.
- Fourth sea endpoint for human skips human's next scheduled turn; Little Boots' count unaffected.
- Fourth sea endpoint for Little Boots skips Little Boots' next scheduled turn; human count unaffected.
- Reset clears both counters, routes, pending timers, and pause state.
- No unverified landfall or historical story presented as fact.
