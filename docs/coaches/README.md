# Coaches Brain - The Long Game

This directory contains comprehensive documentation on the coaching methodologies that power The Long Game training engine.

## Purpose

These documents serve as the authoritative reference for:
1. Understanding WHY we train the way we do
2. Explaining methodology to users (feeding `whatThisMeans` content)
3. Validating training engine logic against coach principles
4. Onboarding new contributors to the philosophy

## Coaches Documented

- **Jack Daniels** - VDOT system, training zones (E/M/T/I/R), interval science
- **Hansons** - Cumulative fatigue, 16-mile cap, 6-day structure
- **Hal Higdon** - Novice-friendly plans, long-run progression, simplicity
- **Stephen Seiler** - Polarized training, 80/20, interference effect
- **Jay Dicharry** - Movement quality, durability, injury prevention
- **Kelly Starrett** - Mobility, position, daily maintenance
- **Øyvind Støren** - Heavy strength for running economy
- **Pete Pfitzinger** - Advanced marathoning, lactate threshold
- **Matt Fitzgerald** - 80/20 practical implementation
- **Steve Magness** - Modern running science synthesis
- **Gjert Ingebrigtsen** - Norwegian double-threshold method

## Coach Bio Standards

When adding a new coach to `methodology.ts`, ensure the following:

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `credentials` | Formal titles, degrees, honors (max 30 chars) | "PhD, 2x Olympic Medalist" |
| `bio` | 3-5 sentence narrative: background → achievements → philosophy | See existing coaches |
| `achievements` | 3-5 verifiable accomplishments as bullet points | ["Won 1984 Olympic Trials", "2:11:43 marathon PR"] |

### Optional Fields

| Field | When to Include |
|-------|-----------------|
| `publications` | If coach has authored notable books |
| `notableAthletes` | If coach has trained recognizable athletes |
| `photoUrl` | Reserved for future use (not currently displayed) |

### Quality Bar

1. **Verifiability**: Every claim must be traceable to an official source
2. **Tone**: Third person, professional, factual (not promotional)
3. **Coach-Approvable**: Content should pass review by the coach themselves
4. **Source Integrity**: `source` field links to primary reference (book, official website, research paper)

### Bio Structure

1. **Opening**: Who they are + primary credential
2. **Middle**: Key achievements + coaching philosophy
3. **Closing**: Why their methodology is credible for our app

## Additional Resources

- `onboarding-research.md` - Best practices from top app onboarding experiences
- `marathon-onboarding.md` - Fitness app specific onboarding patterns
