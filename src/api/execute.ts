import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import type { CommandResult } from "../types/command";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a log file for API calls
const logFile = path.join(logsDir, "command-api.log");
const logger = fs.createWriteStream(logFile, { flags: "a" });

function log(message: string) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logger.write(formattedMessage + "\n");
}

/**
 * Execute a command using the Python CommandExecutor
 *
 * @param command - The command to execute
 * @returns A promise with the execution result
 */
export async function executePythonCommand(
  command: string
): Promise<CommandResult> {
  log(`Executing Python command: "${command}"`);

  return new Promise((resolve, reject) => {
    // Get the absolute path to the commands directory
    const commandsDir = path.join(process.cwd(), "commands");
    log(`Commands directory: ${commandsDir}`);
    log(`Directory exists: ${fs.existsSync(commandsDir)}`);

    // List files in commands directory for debugging
    if (fs.existsSync(commandsDir)) {
      log(
        `Files in commands directory: ${fs.readdirSync(commandsDir).join(", ")}`
      );
    }

    // Create Python code with detailed logging
    const pythonCode = `
import sys
import json
import traceback
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api_command.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api_command")

# Log debugging information
logger.debug(f"Python version: {sys.version}")
logger.debug(f"Current working directory: {os.getcwd()}")

# Add commands directory to path
commands_dir = r'${commandsDir.replace(/\\/g, "\\\\")}'
logger.debug(f"Adding to sys.path: {commands_dir}")
sys.path.append(commands_dir)

try:
    # Import CommandExecutor
    logger.debug("Attempting to import CommandExecutor...")
    from command_executor import CommandExecutor
    logger.debug("Import successful")
    
    # Execute command
    logger.debug(f"Executing command: '{command}'")
    result = CommandExecutor.execute('${command.replace(/'/g, "\\'")}')
    logger.debug(f"Raw result: {result}")
    
    # Ensure result is JSON serializable and has all required fields
    if not isinstance(result, dict):
        logger.warning(f"Result is not a dict: {result}")
        result = {
            'success': True,
            'message': f'Command executed with non-dict result: {result}',
            'action': '${command.replace(/'/g, "\\'")}',
            'error': '',
            'additional_data': {'raw_result': str(result)}
        }
    
    # Print the result as JSON for the Node.js process to capture
    print(json.dumps(result))
except ImportError as e:
    error_msg = f"Import error: {str(e)}"
    logger.error(error_msg)
    logger.error(f"sys.path: {sys.path}")
    logger.error(traceback.format_exc())
    
    print(json.dumps({
        'success': False,
        'error': error_msg,
        'message': 'Failed to import CommandExecutor',
        'action': '',
        'additional_data': {'sys_path': sys.path, 'traceback': traceback.format_exc()}
    }))
except Exception as e:
    error_msg = f"Execution error: {str(e)}"
    logger.error(error_msg)
    logger.error(traceback.format_exc())
    
    print(json.dumps({
        'success': False,
        'error': error_msg,
        'message': 'Failed to execute command',
        'action': '',
        'additional_data': {'traceback': traceback.format_exc()}
    }))
`;

    log("Executing Python with the following code:");
    log(pythonCode);

    // Execute the Python code
    const pythonProcess = spawn("python", ["-c", pythonCode]);

    let stdoutData = "";
    let stderrData = "";

    // Collect stdout data
    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdoutData += output;
      log(`Python stdout: ${output.trim()}`);
    });

    // Collect stderr data
    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderrData += output;
      log(`Python stderr: ${output.trim()}`);
    });

    // Process completion
    pythonProcess.on("close", (code) => {
      log(`Python process exited with code ${code}`);

      if (code === 0 && stdoutData) {
        try {
          // Find and parse the last line that looks like valid JSON
          const lines = stdoutData.trim().split("\n");
          let jsonLine = "";

          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith("{") && line.endsWith("}")) {
              jsonLine = line;
              break;
            }
          }

          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            log(`Parsed result: ${JSON.stringify(result, null, 2)}`);
            resolve(result);
          } else {
            const errorMsg = "No valid JSON found in output";
            log(errorMsg);
            reject(new Error(errorMsg));
          }
        } catch (err) {
          const errorMsg = `Error parsing output: ${
            err instanceof Error ? err.message : String(err)
          }`;
          log(errorMsg);
          reject(new Error(errorMsg));
        }
      } else {
        const errorMsg = stderrData || "Unknown error executing command";
        log(`Python process error: ${errorMsg}`);
        reject(new Error(errorMsg));
      }
    });
  });
}
