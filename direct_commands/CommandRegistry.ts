/**
 * CommandRegistry.ts - Command Registry for Jarvis AI Assistant
 *
 * This file implements the CommandRegistry class that manages all available commands.
 * It provides methods to register commands, retrieve commands by name, and list all
 * available commands.
 */

import { Command, CommandResult } from "./Command";

/**
 * Registry for all available commands
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * Register a command instance
   * @param command The command instance to register
   */
  register(command: Command): void {
    const commandName = command.getCommandName();
    this.commands.set(commandName, command);
    console.debug(`Registered command: ${commandName}`);
  }

  /**
   * Get a command instance by name
   * @param commandName The name of the command to retrieve
   * @returns The command instance or undefined if not found
   */
  getCommand(commandName: string): Command | undefined {
    const normalizedName = commandName.toLowerCase();
    return this.commands.get(normalizedName);
  }

  /**
   * List all available commands
   * @returns An array of command names
   */
  listCommands(): string[] {
    return Array.from(this.commands.keys()).sort();
  }
}

/**
 * Main assistant class that processes user commands
 */
export class CommandExecutor {
  private registry: CommandRegistry;

  constructor() {
    this.registry = new CommandRegistry();
  }

  /**
   * Load and register all available commands
   */
  loadCommands(): void {
    // Import commands dynamically
    // This would be implemented based on how you want to load commands
    // For now, we'll leave it as a placeholder
  }

  /**
   * Execute a command using the full command text
   * @param commandText The full command text (e.g., "youtube play despacito")
   * @returns A CommandResult object with the result of the execution
   */
  execute(commandText: string): CommandResult {
    try {
      console.debug(`Executing command: '${commandText}'`);

      // Parse the command text to get the command name and arguments
      const parts = commandText.trim().split(/\s+(.*)/);
      const commandName = parts[0].toLowerCase();
      const args = parts.length > 1 ? parts[1] : "";

      // Get the command instance
      const command = this.registry.getCommand(commandName);

      // If the command doesn't exist, return an error
      if (!command) {
        console.warn(`Command not found: ${commandName}`);
        return {
          success: false,
          message: `Unknown command: ${commandName}`,
          error: `Command '${commandName}' not found`,
          action: "",
        };
      }

      // Execute the command
      const result = command.execute(args);

      // Ensure required fields exist in the result
      return {
        success: result.success ?? true,
        message: result.message ?? "Command executed successfully",
        action: result.action ?? commandName,
        error: result.error ?? "",
        additionalData: result.additionalData ?? {},
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error(`Error executing command '${commandText}': ${error}`);

      return {
        success: false,
        message: "Error executing command",
        error,
        action: "",
        additionalData: {
          command: commandText,
          stack: e instanceof Error ? e.stack : undefined,
        },
      };
    }
  }
}

// Export a singleton instance for easy import
export const commandExecutor = new CommandExecutor();

/**
 * Helper function to execute a command
 * @param commandText The full command text
 * @returns A CommandResult object with the result of the execution
 */
export function executeCommand(commandText: string): CommandResult {
  return commandExecutor.execute(commandText);
}
