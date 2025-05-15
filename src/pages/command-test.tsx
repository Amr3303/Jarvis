import React, { useState, useEffect } from "react";
import {
  initializeCommandSystem,
  executeCommand,
  CommandResult,
} from "@/lib/commands";
import { logger } from "@/lib/utils/logger";

// Initialize commands
const commandExecutor = initializeCommandSystem();

export default function CommandTest() {
  const [commandText, setCommandText] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [availableCommands, setAvailableCommands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get available commands
    const commands = commandExecutor.listCommands();
    setAvailableCommands(commands);
  }, []);

  const handleExecute = async () => {
    if (!commandText.trim()) return;

    try {
      setIsLoading(true);
      logger.info(`Executing command: ${commandText}`);

      const commandResult = await executeCommand(commandText);

      setResult(commandResult);
      logger.info(`Command result: ${JSON.stringify(commandResult)}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Error executing command: ${errorMsg}`);

      setResult({
        success: false,
        message: "",
        error: errorMsg,
        action: "",
        additional_data: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Command Test Page</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Available Commands</h2>
        <div className="flex flex-wrap gap-2">
          {availableCommands.map((cmd) => (
            <button
              key={cmd}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded"
              onClick={() =>
                setCommandText((prevText) =>
                  prevText ? `${prevText} ${cmd}` : cmd
                )
              }
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          placeholder="Enter command (e.g., volume up 10)"
          className="flex-grow p-2 border rounded"
        />
        <button
          onClick={handleExecute}
          disabled={isLoading || !commandText.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? "Executing..." : "Execute"}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded mb-4 ${
            result.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-semibold">Success:</div>
            <div>{result.success ? "Yes" : "No"}</div>

            {result.message && (
              <>
                <div className="font-semibold">Message:</div>
                <div>{result.message}</div>
              </>
            )}

            {result.action && (
              <>
                <div className="font-semibold">Action:</div>
                <div>{result.action}</div>
              </>
            )}

            {result.error && (
              <>
                <div className="font-semibold">Error:</div>
                <div className="text-red-600">{result.error}</div>
              </>
            )}

            {Object.keys(result.additional_data).length > 0 && (
              <>
                <div className="font-semibold">Additional Data:</div>
                <div className="font-mono text-xs overflow-auto max-h-32">
                  {JSON.stringify(result.additional_data, null, 2)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Command Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">System Commands</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <code className="bg-gray-100 px-1">volume up 10</code> -
                Increase volume by 10%
              </li>
              <li>
                <code className="bg-gray-100 px-1">volume down 5</code> -
                Decrease volume by 5%
              </li>
              <li>
                <code className="bg-gray-100 px-1">volume mute</code> - Mute
                system volume
              </li>
              <li>
                <code className="bg-gray-100 px-1">brightness up 10</code> -
                Increase brightness by 10%
              </li>
              <li>
                <code className="bg-gray-100 px-1">brightness set 75</code> -
                Set brightness to 75%
              </li>
              <li>
                <code className="bg-gray-100 px-1">power sleep</code> - Put
                system to sleep
              </li>
              <li>
                <code className="bg-gray-100 px-1">power shutdown</code> -
                Shutdown the system
              </li>
              <li>
                <code className="bg-gray-100 px-1">screenshot</code> - Take a
                screenshot
              </li>
              <li>
                <code className="bg-gray-100 px-1">screenshot meeting</code> -
                Take a screenshot named "meeting"
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Media Commands</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <code className="bg-gray-100 px-1">youtube open</code> - Open
                YouTube homepage
              </li>
              <li>
                <code className="bg-gray-100 px-1">youtube search cats</code> -
                Search for cat videos
              </li>
              <li>
                <code className="bg-gray-100 px-1">youtube play despacito</code>{" "}
                - Play a video
              </li>
              <li>
                <code className="bg-gray-100 px-1">spotify open</code> - Open
                Spotify
              </li>
              <li>
                <code className="bg-gray-100 px-1">spotify search jazz</code> -
                Search for jazz music
              </li>
              <li>
                <code className="bg-gray-100 px-1">
                  spotify play Taylor Swift
                </code>{" "}
                - Play Taylor Swift music
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Web Commands</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <code className="bg-gray-100 px-1">
                  google weather in tokyo
                </code>{" "}
                - Search Google
              </li>
              <li>
                <code className="bg-gray-100 px-1">web github.com</code> - Open
                GitHub website
              </li>
              <li>
                <code className="bg-gray-100 px-1">web stackoverflow.com</code>{" "}
                - Open Stack Overflow
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">App Control</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <code className="bg-gray-100 px-1">open chrome</code> - Open
                Chrome browser
              </li>
              <li>
                <code className="bg-gray-100 px-1">open spotify</code> - Open
                Spotify
              </li>
              <li>
                <code className="bg-gray-100 px-1">close chrome</code> - Close
                Chrome browser
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
