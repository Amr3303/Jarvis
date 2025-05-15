const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a log file
const logFile = path.join(logsDir, `command-test-${Date.now()}.log`);
const logger = fs.createWriteStream(logFile, { flags: "a" });

function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logger.write(formattedMessage + "\n");
}

async function testCommand(command) {
  return new Promise((resolve, reject) => {
    log(`Testing command: "${command}"`);

    // Get the absolute path to the commands directory
    const commandsDir = path.join(__dirname, "commands");
    log(`Commands directory: ${commandsDir}`);
    log(`Directory exists: ${fs.existsSync(commandsDir)}`);

    // List files in commands directory for debugging
    if (fs.existsSync(commandsDir)) {
      log(
        `Files in commands directory: ${fs.readdirSync(commandsDir).join(", ")}`
      );
    }

    // Create Python code with detailed error handling and logging
    const pythonCode = `
import sys
import json
import traceback
import os

# Print Python version and current directory for debugging
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

# Add commands directory to path
commands_dir = r'${commandsDir.replace(/\\/g, "\\\\")}'
print(f"Adding to sys.path: {commands_dir}")
sys.path.append(commands_dir)

try:
    # Import CommandExecutor
    print("Attempting to import CommandExecutor...")
    from command_executor import CommandExecutor
    print("Import successful")
    
    # Execute command
    print(f"Executing command: '{command}'")
    result = CommandExecutor.execute('${command.replace(/'/g, "\\'")}')
    print(f"Raw result: {result}")
    print(json.dumps(result))
except ImportError as e:
    print(f"Import error: {e}")
    print(f"sys.path: {sys.path}")
    traceback.print_exc()
    print(json.dumps({
        'success': False,
        'error': f"Import error: {str(e)}",
        'message': 'Failed to import CommandExecutor',
        'action': '',
        'additional_data': {'sys_path': sys.path}
    }))
except Exception as e:
    print(f"Execution error: {e}")
    traceback.print_exc()
    print(json.dumps({
        'success': False,
        'error': str(e),
        'message': 'Failed to execute command',
        'action': '',
        'additional_data': {'traceback': traceback.format_exc()}
    }))
`;

    log("Python code to execute:");
    log(pythonCode);

    // Execute the Python code
    const pythonProcess = spawn("python", ["-c", pythonCode]);

    let stdoutData = "";
    let stderrData = "";

    // Log stdout data as it comes
    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdoutData += output;
      log(`Python stdout: ${output.trim()}`);
    });

    // Log stderr data as it comes
    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderrData += output;
      log(`Python stderr: ${output.trim()}`);
    });

    // Handle process completion
    pythonProcess.on("close", (code) => {
      log(`Python process exited with code ${code}`);

      if (code === 0) {
        // Try to extract JSON result from stdout
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
            log("No valid JSON found in output");
            reject(new Error("No valid JSON found in output"));
          }
        } catch (err) {
          log(`Error parsing output: ${err.message}`);
          reject(new Error(`Failed to parse output: ${err.message}`));
        }
      } else {
        log(`Python process failed: ${stderrData}`);
        reject(new Error(stderrData || "Unknown error executing command"));
      }
    });
  });
}

// Test with different commands
async function runTests() {
  const commands = ["volume up 10", "screenshot test", "youtube open"];

  for (const command of commands) {
    log(`==== Testing command: ${command} ====`);
    try {
      const result = await testCommand(command);
      log(`Test result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      log(`Test error: ${error.message}`);
    }
    log("");
  }

  // Close the log file
  logger.end();
}

// Run the tests
runTests().then(() => {
  console.log(`Tests completed. Log file: ${logFile}`);
});
