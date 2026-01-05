# Agent Instructions - Marathon Training

READ ~/Desktop/dev/agent-scripts/AGENTS.md BEFORE ANYTHING (skip if missing).

---

# Marathon Training - Project-Specific Rules

<project-identity>
  <name>The Long Game</name>
  <type>Marathon training web application</type>
  <stack>Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase</stack>
</project-identity>

<project-context>
  This is a marathon training app focused on hybrid training methodologies.
  Reference COACHSPEC.md for training logic and methodology.
  Reference DESIGN.md for visual and UI standards.
</project-context>

<project-specific-rules>
  <icon-standards>
    ## Icon Standards
    
    **Static Icons:** Use `lucide-react` (already installed)
    ```tsx
    import { Footprints, Target, Activity } from 'lucide-react';
    <Footprints size={20} className="text-[var(--v2-accent)]" />
    ```
    
    **Animated Icons:** Use lucide-animated from https://lucide-animated.com/
    Install individual icons via npm:
    ```bash
    npx jsrepo add @nicepkg/lucide-animated/activity
    ```
    These are stored in `/components/ui/` as individual files (e.g., activity.tsx, flame.tsx).
    
    **Guidelines:**
    - Use animated icons sparingly (1-2 per screen) for key moments
    - Prefer static Lucide for general UI
    - Never use emoji for icons in the app UI
    - Icon sizes: 16px (inline), 20px (buttons), 24px (cards), 32px+ (hero)
  </icon-standards>
</project-specific-rules>
