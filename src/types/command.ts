/**
 * Command result interface
 *
 * This interface represents the structure of command execution results
 * from the Python CommandExecutor.
  */
export interface CommandResult {
  /** Whether the command executed successfully */
  success: boolean;

  /** A user-friendly message about the result */
  message: string;

  /** Error message if any */
  error: string;

  /** The action that was performed */
  action: string;

  /** Any additional data returned by the command */
  additional_data: Record<string, any>;
}
