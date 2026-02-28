# Project Jupiter: The Rusted Whale Incident (GDD)

## 1. Game Overview
A web-based deduction mystery game inspired by "Return of the Obra Dinn" and "The Case of the Golden Idol". Players assume the role of an investigator boarding the drifting "Rusted Whale" to determine the fate of its crew using a "Memory Dive" device.

**Genre:** Puzzle / Interactive Fiction / Logic Deduction
**Platform:** Web (React + Tailwind + Vite)
**Visual Style:** Retro-futuristic Terminal / Cyberpunk UI (Green/Amber text on black).

## 2. Core Mechanics

### A. The Manifest (Crew List)
The player has a list of crew members. For each, they must determine:
1.  **Status:** Alive / Dead / MIA / Transformed.
2.  **Cause:** (If dead/transformed) e.g., Radiation, Gravity Crush, Friendly Fire, Sacrifice.
3.  **Detail:** (Who did it? / What specific event?)

**Crew List:**
1.  **Iron Uncle (Captain):** Silicon Cyborg.
2.  **Qiang (Pilot):** Human (Carbon).
3.  **Viper (Navigator):** Silicon Android.
4.  **Tank (Engineer):** Silicon Heavy Frame.
5.  **Doc (Medic):** Silicon Unit.
6.  **Ava (Ship AI):** Digital Entity.

### B. Memory Dive (Investigation)
- The game presents static scenes (using our concept art).
- **Interactions:** Clicking on specific areas (e.g., the red lever, the broken medical droid) triggers a "Memory Fragment" (text dialogue or audio log).
- **Clues:** Information is fragmented. Player must piece together the timeline.

### C. The Deduction Board
- A UI panel where players drag and drop words to form sentences:
  - "Qiang was [KILLED] by [GRAVITY] while [SAVING THE SHIP]."
  - "Iron Uncle [TRANSFORMED] [QIANG] using [THE CROSSOVER BOND]."

## 3. Story Flow (MVP Scope)

**Scene 1: The Airlock (Tutorial)**
- Boarding the silent ship. Accessing the damaged AI (Ava).
- **Goal:** Unlock the cockpit door.

**Scene 2: The Cockpit (Main Puzzle)**
- **Visual:** The "Struggle" art (red lights, sparks).
- **Clues:**
  - Broken manual lever (Qiang's DNA found).
  - Iron Uncle's frozen chassis (Memory log: "Protocol Override").
  - Ava's log: "G-Force warning. Pilot unconscious."

**Scene 3: The Med-Bay (The Twist)**
- **Visual:** The "Crossover" art.
- **Clues:**
  - Empty human body bag.
  - New Black Cyborg activation log.
  - Iron Uncle's final message: "Debt paid."

## 4. Technical Specifications

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Theme: `zinc-900` bg, `emerald-500` text for terminal feel).
- **State Management:** React Context or Zustand (to track found clues and deduction status).
- **Assets:** Images located in `../stories/the_heartbeat_in_the_abyss/assets/`.

## 5. Directory Structure
```
/game
  /public
    /assets (symlinked or copied from stories)
  /src
    /components
      DeductionBoard.tsx
      SceneViewer.tsx
      LogTerminal.tsx
    /data
      manifest.json (Game logic/answers)
      story.json (Dialogue fragments)
    App.tsx
```
