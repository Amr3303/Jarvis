/**
 * YoutubeCommand.ts - YouTube Command Implementation
 *
 * This file implements the YouTube command for controlling YouTube playback and search.
 * It provides methods to search for videos, play videos, and control playback.
 */

import { BaseCommand, CommandResult } from "../Command";

interface CommandMapping {
  requiresQuery: boolean;
  method: string;
  args?: string[];
}

/**
 * Command for controlling YouTube playback and search
 */
export class YoutubeCommand extends BaseCommand {
  // Command mapping for easy integration
  private commandMap: Record<string, CommandMapping> = {
    search: { requiresQuery: true, method: "_youtubeSearch" },
    play: { requiresQuery: true, method: "_youtubePlay" },
    pause: { requiresQuery: false, method: "_youtubeSendKey", args: ["k"] },
    resume: { requiresQuery: false, method: "_youtubeSendKey", args: ["k"] },
    fullscreen: {
      requiresQuery: false,
      method: "_youtubeSendKey",
      args: ["f"],
    },
    open: { requiresQuery: false, method: "_youtubeOpen" },
    rewind: { requiresQuery: false, method: "_youtubeSendKey", args: ["j"] },
    forward: { requiresQuery: false, method: "_youtubeSendKey", args: ["l"] },
    volume_up: {
      requiresQuery: false,
      method: "_youtubeSendKey",
      args: ["ArrowUp"],
    },
    volume_down: {
      requiresQuery: false,
      method: "_youtubeSendKey",
      args: ["ArrowDown"],
    },
    mute: { requiresQuery: false, method: "_youtubeSendKey", args: ["m"] },
    captions: { requiresQuery: false, method: "_youtubeSendKey", args: ["c"] },
    theater: { requiresQuery: false, method: "_youtubeSendKey", args: ["t"] },
    miniplayer: {
      requiresQuery: false,
      method: "_youtubeSendKey",
      args: ["i"],
    },
    skip_next: {
      requiresQuery: false,
      method: "_youtubeSendKey",
      args: ["Shift+ArrowRight"],
    },
    skip_prev: {
      requiresQuery: false,
      method: "_youtubeSendKey",
      args: ["Shift+ArrowLeft"],
    },
    start: { requiresQuery: false, method: "_youtubeSendKey", args: ["0"] },
    end: { requiresQuery: false, method: "_youtubeSendKey", args: ["End"] },
  };

  /**
   * Execute the YouTube command with the given arguments
   * @param args The arguments for the command
   * @returns A CommandResult object with the result of the execution
   */
  execute(args: string): CommandResult {
    const response: CommandResult = {
      success: false,
      action: "",
      message: "",
      error: "",
    };

    const [action, query] = this.parseCommand(args);

    if (!action) {
      response.error = "No action provided. Usage: youtube <action> [query]";
      console.error(response.error);
      return response;
    }

    if (!(action in this.commandMap)) {
      response.error = `Unknown YouTube action: ${action}`;
      console.error(response.error);
      return response;
    }

    const command = this.commandMap[action];
    if (command.requiresQuery && !query) {
      response.error = `No search query provided. Usage: youtube ${action} <query>`;
      console.error(response.error);
      return response;
    }

    try {
      // Get the method to call
      const method = this[command.method as keyof this] as Function;
      if (!method || typeof method !== "function") {
        throw new Error(`Method ${command.method} not found`);
      }

      // Prepare arguments
      const methodArgs = command.args || (query ? [query] : []);

      // Call the method
      const success = method.apply(this, methodArgs);

      response.success = success;
      response.action = action;
      response.message = success
        ? `Successfully executed ${action}`
        : "Command failed";
    } catch (e) {
      response.success = false;
      response.error = e instanceof Error ? e.message : String(e);
      response.message = `Error executing ${action}`;
      console.error(`Error executing ${action}: ${response.error}`);
    }

    return response;
  }

  /**
   * Open YouTube homepage
   * @returns true if successful, false otherwise
   */
  private _youtubeOpen(): boolean {
    try {
      window.open("https://www.youtube.com", "_blank");
      console.info("Opened YouTube homepage");
      return true;
    } catch (e) {
      console.error(`Error opening YouTube: ${e}`);
      return false;
    }
  }

  /**
   * Search for videos on YouTube
   * @param query The search query
   * @returns true if successful, false otherwise
   */
  private _youtubeSearch(query: string): boolean {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query
      )}`;
      window.open(searchUrl, "_blank");
      console.info(`Searched YouTube for: ${query}`);
      return true;
    } catch (e) {
      console.error(`Error searching YouTube: ${e}`);
      return false;
    }
  }

  /**
   * Play a video on YouTube
   * @param query The search query or video URL
   * @returns true if successful, false otherwise
   */
  private _youtubePlay(query: string): boolean {
    try {
      // Check if the query is a URL
      if (query.startsWith("http") && query.includes("youtube.com/watch")) {
        window.open(query, "_blank");
        console.info(`Playing YouTube video: ${query}`);
        return true;
      }

      // Otherwise, search for the video and play the first result
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query
      )}`;
      window.open(searchUrl, "_blank");
      console.info(`Searching and playing YouTube video: ${query}`);

      // Note: In a browser environment, we can't automatically click on the first result
      // due to security restrictions. The user will need to click on the video manually.
      return true;
    } catch (e) {
      console.error(`Error playing YouTube video: ${e}`);
      return false;
    }
  }

  /**
   * Send a keyboard shortcut to YouTube
   * @param key The key to send
   * @returns true if successful, false otherwise
   */
  private _youtubeSendKey(key: string): boolean {
    try {
      // This is a simplified implementation since we can't directly send keys to YouTube
      // in a browser environment unless we're on the YouTube page and have focus
      console.info(
        `Would send key ${key} to YouTube if we were on the YouTube page`
      );

      // In a real implementation, you would need to check if we're on YouTube
      // and then dispatch a keyboard event to the page
      const isOnYouTube = window.location.href.includes("youtube.com");
      if (isOnYouTube) {
        // Create and dispatch a keyboard event
        const event = new KeyboardEvent("keydown", {
          key,
          code: key,
          keyCode: key.charCodeAt(0),
          which: key.charCodeAt(0),
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(event);
        return true;
      } else {
        console.warn("Not on YouTube, cannot send key");
        return false;
      }
    } catch (e) {
      console.error(`Error sending key to YouTube: ${e}`);
      return false;
    }
  }

  /**
   * Get help information for the command
   * @returns Help text for the command
   */
  getHelp(): string {
    return `
      YouTube Command - Control YouTube playback and search for videos
      
      Usage: youtube <action> [query]
      
      Actions:
        search <query>     - Search for videos on YouTube
        play <query>       - Play a video on YouTube
        pause              - Pause the current video
        resume             - Resume the current video
        fullscreen         - Toggle fullscreen mode
        open               - Open YouTube homepage
        rewind             - Rewind the video
        forward            - Fast forward the video
        volume_up          - Increase volume
        volume_down        - Decrease volume
        mute               - Toggle mute
        captions           - Toggle captions
        theater            - Toggle theater mode
        miniplayer         - Toggle miniplayer
        skip_next          - Skip to next video
        skip_prev          - Skip to previous video
        start              - Go to start of video
        end                - Go to end of video
    `;
  }
}
