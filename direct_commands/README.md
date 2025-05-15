# Jarvis AI Assistant Command System (TypeScript/JavaScript)

This directory contains a TypeScript implementation of the Jarvis AI Assistant command system, designed for direct integration with React applications.

## Overview

The command system allows you to execute various commands through a unified interface. It's structured to be easily extensible, allowing you to add new commands as needed.

## Structure

- `Command.ts` - Defines the base Command interface and BaseCommand abstract class
- `CommandRegistry.ts` - Implements the command registry and executor
- `commands/` - Directory containing individual command implementations
- `index.ts` - Main entry point that exports all necessary components

## Usage in React

### Basic Usage

```typescript
import { processCommand } from "./direct_commands";

// Execute a command
const result = processCommand("youtube play despacito");
console.log(result);
```

### Using the React Hook

```tsx
import React, { useState } from "react";
import { useJarvisCommands } from "./direct_commands";

function CommandComponent() {
  const [commandText, setCommandText] = useState("");
  const [result, setResult] = useState(null);
  const { executeCommand, listCommands } = useJarvisCommands();

  const handleExecute = () => {
    const commandResult = executeCommand(commandText);
    setResult(commandResult);
  };

  return (
    <div>
      <h2>Jarvis Command System</h2>

      <div>
        <input
          type="text"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          placeholder="Enter a command..."
        />
        <button onClick={handleExecute}>Execute</button>
      </div>

      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div>
        <h3>Available Commands:</h3>
        <ul>
          {listCommands().map((cmd) => (
            <li key={cmd}>{cmd}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Adding New Commands

To add a new command:

1. Create a new file in the `commands/` directory
2. Implement the Command interface or extend the BaseCommand class
3. Register the command in `index.ts`

Example:

```typescript
// commands/MyNewCommand.ts
import { BaseCommand, CommandResult } from "../Command";

export class MyNewCommand extends BaseCommand {
  execute(args: string): CommandResult {
    // Implement your command logic here
    return {
      success: true,
      message: `Executed my new command with args: ${args}`,
    };
  }

  getHelp(): string {
    return "Help information for my new command";
  }
}

// Then in index.ts, add:
import { MyNewCommand } from "./commands/MyNewCommand";
registry.register(new MyNewCommand());
```

## Command Result Structure

Each command returns a `CommandResult` object with the following structure:

```typescript
interface CommandResult {
  success: boolean; // Whether the command executed successfully
  message: string; // A user-friendly message about the result
  error?: string; // Error message if any
  action?: string; // The action that was performed
  additionalData?: any; // Any additional data returned by the command
}
```

## Available Commands

Currently implemented commands:

- `youtube` - Control YouTube playback and search for videos

## Browser Compatibility

Some commands may have limited functionality in a browser environment due to security restrictions. For example, sending keyboard shortcuts to YouTube only works if the YouTube page is active and has focus.
