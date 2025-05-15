/**
 * Command.ts - Base Command Interface
 *
 * This file defines the base Command interface that all command implementations
 * must follow. It provides the structure for executing commands and retrieving
 * command information.
 */

export interface CommandResult {
  success: boolean;
  message: string;
  error?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

export interface Command {
  /**
   * Execute the command with the given arguments
   * @param args The arguments for the command
   * @returns A CommandResult object with the result of the execution
   */
  execute(args: string): CommandResult;

  /**
   * Get the name of the command
   * @returns The name of the command
   */
  getCommandName(): string;

  /**
   * Get help information for the command
   * @returns Help text for the command
   */
  getHelp(): string;
}

/**
 * Abstract base class that implements common functionality for commands
 */
export abstract class BaseCommand implements Command {
  /**
   * Execute the command with the given arguments
   * @param args The arguments for the command
   * @returns A CommandResult object with the result of the execution
   */
  abstract execute(args: string): CommandResult;

  /**
   * Get the name of the command based on the class name
   * @returns The name of the command
   */
  getCommandName(): string {
    // Get class name and convert to lowercase
    const className = this.constructor.name.toLowerCase();
    // Remove 'command' suffix if present
    return className.endsWith("command") ? className.slice(0, -7) : className;
  }

  /**
   * Parse a command string into action and query parts
   * @param commandStr The full command string
   * @returns A tuple of [action, query]
   */
  protected parseCommand(commandStr: string): [string, string] {
    if (!commandStr) {
      return ["", ""];
    }

    const parts = commandStr.trim().split(/\s+(.*)/);
    const action = parts[0].toLowerCase();
    const query = parts.length > 1 ? parts[1] : "";

    return [action, query];
  }

  /**
   * Get help information for the command
   * @returns Help text for the command
   */
  getHelp(): string {
    return "No help available for this command.";
  }
}
