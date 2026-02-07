# Auto-GSD System

## How It Works

When you start a conversation with Claude Code in this project, the `CLAUDE.md` file instructs Claude to:

1. **Auto-detect project state** by checking for planning files
2. **Suggest the right action** based on where you are in the workflow
3. **Support quick commands** like `/go`, `/status`, `/next`

## Quick Commands

### `/go` or `/auto`
Automatically detects project state and runs the most appropriate GSD command:

- No planning folder? → Creates project structure
- Has project, no roadmap? → Creates roadmap
- Has roadmap, phase not planned? → Plans the phase
- Has plan? → Executes the plan
- Mid-work? → Resumes from `.continue-here.md`

### `/status`
Quick project overview:
- Current milestone and phase
- Progress percentage
- Next recommended action

### `/next`
Shows what to work on next based on:
- Incomplete tasks in current phase
- Pending phases in roadmap
- Any blockers or decisions needed

## State Detection Logic

```
if (!exists('.planning/')) {
  suggest('/gsd:new-project')
} else if (!exists('.planning/PROJECT.md')) {
  suggest('/gsd:new-project')
} else if (!exists('.planning/ROADMAP.md')) {
  suggest('/gsd:create-roadmap')
} else if (currentPhaseNeedsPlan()) {
  suggest('/gsd:plan-phase')
} else if (exists('.continue-here.md') && hasRecentWork()) {
  suggest('/gsd:resume-work')
} else if (hasPlanForCurrentPhase()) {
  suggest('/gsd:execute-plan')
} else if (phaseComplete()) {
  suggest('/gsd:verify-work')
}
```

## File Structure

```
.planning/
├── PROJECT.md          # Project definition
├── ROADMAP.md          # Milestone/phase overview
├── auto-gsd.md         # This file
├── phases/
│   ├── phase-1-PLAN.md
│   ├── phase-2-PLAN.md
│   └── ...
└── codebase/           # Optional: codebase documentation

CLAUDE.md               # Claude Code configuration (root)
.continue-here.md       # Session continuity (root)
```

## Customization

Edit `CLAUDE.md` to customize:
- Project-specific context
- Coding standards
- Team information
- Auto-detection behavior

## Usage Examples

### Starting Fresh
```
You: "Let's build a new feature"
Claude: "I see you have a roadmap. The current phase is 'Layout & Navigation'.
        Want me to run /gsd:execute-plan to continue, or /gsd:plan-phase
        for a new phase?"
```

### Resuming Work
```
You: "/go"
Claude: "Detected: Mid-phase work with .continue-here.md
        Last session: Working on HomePage component
        Resuming from where we left off..."
```

### Checking Status
```
You: "/status"
Claude: "📊 The Video Pool - React Conversion

        Phase 4/6: Layout & Navigation (75% complete)
        ✅ HeaderV2, LayoutPresetSelector, DraggableSections
        🔄 HomePage (in progress)
        ⏳ Keyboard shortcuts, Recent section

        Next: Complete HomePage with all v5.5 sections"
```
