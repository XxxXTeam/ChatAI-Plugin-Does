# Galgame Module

The Galgame module provides a visual novel-like dialogue game experience with affection system, event triggers, and immersive storytelling.

## Features

- 🎭 **AI-Driven Story** - AI generates storylines and character reactions in real-time
- 💕 **Affection System** - Your choices affect character affection levels
- 🎬 **Event Triggers** - Unlock different story events based on affection
- 💾 **Save System** - Auto-save game progress
- 🎨 **Multiple Settings** - Campus, Fantasy, Urban, Historical, Sci-Fi and more

## Quick Start

### Start New Game

```bash
#游戏开始
```

After sending the command, AI will randomly generate a character and scene to begin your Galgame adventure.

### Continue Game

```bash
#游戏继续
```

Resume your previous game progress and continue interacting with the character.

### End Game

```bash
#游戏结束
```

End current game session (progress is auto-saved).

## Gameplay

### Dialogue Interaction

Send messages directly to chat with the character:

```
Hello, nice to meet you
The weather is nice today
What do you like to do?
```

### Choice Selection

When story choices appear, AI will display something like:

```
[Option 1: Go to the library with her]
[Option 2: Say you need to leave]
[Option 3: Invite her to dinner]
```

Select by replying with a number or emoji reaction:
- Reply `1` or `Option 1` to select the first option
- Click the corresponding emoji reaction

### Event Triggers

Special events have success rate checks:

```
[Trigger Event: Give Gift|A carefully chosen gift|Success Rate 70]
[Event Option 1: Give it personally|+15|-5]
[Event Option 2: Leave it on the desk secretly|+8|-2]
```

Results are determined based on success rate and chosen option.

## Affection System

### Affection Levels

| Affection | Level | Description |
|-----------|-------|-------------|
| -100 ~ -50 | 😠 Hatred | Character strongly dislikes you |
| -49 ~ -20 | 😒 Dislike | Character has negative impression |
| -19 ~ 0 | 😐 Cold | Character is indifferent |
| 1 ~ 20 | 🙂 Stranger | Just met |
| 21 ~ 40 | 😊 Familiar | Getting to know each other |
| 41 ~ 60 | 😄 Fond | Character likes you |
| 61 ~ 80 | 🥰 Love | Character has feelings for you |
| 81 ~ 100 | 💕 Adore | Character adores you |
| 100+ | 💖 Soulmate | Maximum affection |

### Affection Effects

Different affection levels affect:
- Character's dialogue attitude and intimacy
- Types of events that can be triggered
- Story direction and endings

## Commands

| Command | Description |
|---------|-------------|
| `#游戏开始` | Start new Galgame |
| `#游戏继续` | Continue previous game |
| `#游戏结束` | End current game |
| `#游戏状态` | View game status |
| `#游戏存档` | View save list |

## Game Status

Use `#游戏状态` to view:

```
🎮 Game Status
━━━━━━━━━━
Character: Xiaoxue
Affection: 45 😄 Fond
Relationship: Friends
Current Scene: Library
```

## Tips & Suggestions

### Increase Affection

1. **Show Care** - Ask about character's preferences and feelings
2. **Match Interests** - Choose topics that suit the character's personality
3. **Gift Wisely** - Give gifts at appropriate times
4. **Stay Active** - Chat with the character regularly

### Avoid Decreasing Affection

1. **Don't Offend** - Avoid topics the character dislikes
2. **Respect Boundaries** - Don't force unwanted actions
3. **Choose Carefully** - Think before making important choices

## World Settings

Random settings are generated at game start:

- **Campus** - School life, youth romance
- **Fantasy** - Magical world, adventure stories
- **Urban** - Modern city, workplace romance
- **Historical** - Ancient era, poetic romance
- **Sci-Fi** - Future world, technology elements

## Data Storage

Game data is automatically saved to local database:
- Game sessions and progress
- Dialogue history
- Affection and relationship status
- Triggered events

## Next Steps

- [Commands](./commands) - View all commands
- [Presets & Personas](./presets) - Customize AI persona
