/**
 * index.ts - Main Entry Point for Jarvis AI Assistant Commands
 *
 * This file exports all the necessary components for using commands in a React application.
 * It provides a simple way to register and use commands.
 */

// Export base interfaces and classes
export { Command, BaseCommand, CommandResult } from "./Command";
export {
  CommandRegistry,
  CommandExecutor,
  executeCommand,
} from "./CommandRegistry";

// Export commands
import { YoutubeCommand } from "./commands/YoutubeCommand";

// Create and export a registry with all commands
const registry = new CommandRegistry();

// Register all commands
registry.register(new YoutubeCommand());

// Export the registry
export { registry };

/**
 * Initialize the command system
 * This function should be called when the application starts
 */
export function initializeCommandSystem(): void {
  console.info("Initializing Jarvis AI Assistant command system...");
  // Any additional initialization can be done here
}

/**
 * React Hook for using the command system in React components
 *
 * @example
 * ```tsx
 * import { useJarvisCommands } from './direct_commands';
 *
 * function MyComponent() {
 *   const { executeCommand, listCommands } = useJarvisCommands();
 *
 *   const handleCommand = () => {
 *     const result = executeCommand('youtube play despacito');
 *     console.log(result);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCommand}>Execute Command</button>
 *       <div>Available commands: {listCommands().join(', ')}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useJarvisCommands() {
  return {
    executeCommand,
    listCommands: () => registry.listCommands(),
    getCommand: (name: string) => registry.getCommand(name),
  };
}

// Export a simple function to process a command from a string
// This is the main entry point for the command system
export function processCommand(commandText: string): CommandResult {
  return executeCommand(commandText);
}
