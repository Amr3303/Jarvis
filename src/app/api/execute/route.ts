import { NextResponse } from 'next/server';
import { executePythonCommand } from '../../../api/execute';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a log file for API routes
const logFile = path.join(logsDir, 'api-route.log');
const logger = fs.createWriteStream(logFile, { flags: 'a' });

function log(message: string) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logger.write(formattedMessage + '\n');
}

export async function POST(request: Request) {
  log('Received POST request to /api/execute');
  
  try {
    const body = await request.json();
    log(`Request body: ${JSON.stringify(body)}`);
    
    const { command } = body;

    if (!command) {
      log('Error: No command provided');
      return NextResponse.json(
        { success: false, error: 'No command provided' },
        { status: 400 }
      );
    }

    log(`Executing command: "${command}"`);
    
    // Execute the command using our Python bridge
    const result = await executePythonCommand(command);
    
    log(`Command result: ${JSON.stringify(result)}`);
    
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error executing command: ${errorMessage}`);
    
    if (error instanceof Error && error.stack) {
      log(`Error stack: ${error.stack}`);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Failed to execute command',
        action: '',
        additional_data: {}
      },
      { status: 500 }
    );
  }
} 