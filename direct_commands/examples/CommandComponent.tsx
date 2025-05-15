import React, { useState } from "react";
import { useJarvisCommands } from "../index";
import { CommandResult } from "../Command";

/**
 * Example React component that demonstrates how to use the Jarvis command system
 */
const CommandComponent: React.FC = () => {
  // State for the command input and result
  const [commandText, setCommandText] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);

  // Use the Jarvis commands hook
  const { executeCommand, listCommands } = useJarvisCommands();

  // Handle command execution
  const handleExecute = () => {
    if (!commandText.trim()) return;

    const commandResult = executeCommand(commandText);
    setResult(commandResult);

    // Clear the input after execution
    setCommandText("");
  };

  // Handle key press (execute on Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
    }
  };

  return (
    <div className="jarvis-command-component">
      <h2>Jarvis Command System</h2>

      <div className="command-input">
        <input
          type="text"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a command (e.g., 'youtube play music')"
          className="command-text-input"
        />
        <button
          onClick={handleExecute}
          disabled={!commandText.trim()}
          className="execute-button"
        >
          Execute
        </button>
      </div>

      {result && (
        <div className="command-result">
          <h3>Result:</h3>
          <div
            className={`result-status ${result.success ? "success" : "error"}`}
          >
            {result.success ? "✓ Success" : "✗ Error"}
          </div>
          <div className="result-message">
            <strong>Message:</strong> {result.message}
          </div>
          {result.error && (
            <div className="result-error">
              <strong>Error:</strong> {result.error}
            </div>
          )}
          {result.action && (
            <div className="result-action">
              <strong>Action:</strong> {result.action}
            </div>
          )}
          {result.additionalData &&
            Object.keys(result.additionalData).length > 0 && (
              <div className="result-additional-data">
                <strong>Additional Data:</strong>
                <pre>{JSON.stringify(result.additionalData, null, 2)}</pre>
              </div>
            )}
        </div>
      )}

      <div className="available-commands">
        <h3>Available Commands:</h3>
        <ul>
          {listCommands().map((cmd) => (
            <li key={cmd}>{cmd}</li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .jarvis-command-component {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .command-input {
          display: flex;
          margin-bottom: 20px;
        }

        .command-text-input {
          flex: 1;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px 0 0 4px;
        }

        .execute-button {
          padding: 10px 20px;
          font-size: 16px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
        }

        .execute-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .command-result {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }

        .result-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .result-status.success {
          background-color: #dff2bf;
          color: #4f8a10;
        }

        .result-status.error {
          background-color: #ffbaba;
          color: #d8000c;
        }

        .result-message,
        .result-error,
        .result-action {
          margin-bottom: 10px;
        }

        .result-additional-data pre {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }

        .available-commands ul {
          list-style-type: none;
          padding: 0;
        }

        .available-commands li {
          padding: 5px 10px;
          margin-bottom: 5px;
          background-color: #f0f0f0;
          border-radius: 4px;
          display: inline-block;
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default CommandComponent;
