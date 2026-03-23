import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function runAgentBrowser(args) {
  const { stdout, stderr } = await execFileAsync('agent-browser', args, {
    maxBuffer: 1024 * 1024 * 10,
  });

  const output = stdout?.trim() || stderr?.trim() || '';

  try {
    return JSON.parse(output);
  } catch {
    const lines = output.split('\n');
    const jsonLine = [...lines].reverse().find((line) => line.trim().startsWith('{'));
    if (!jsonLine) {
      throw new Error(`Failed to parse agent-browser output:\n${output}`);
    }
    return JSON.parse(jsonLine);
  }
}

export class AgentBrowserSession {
  constructor(sessionName = `computer-use-${Date.now()}`) {
    this.sessionName = sessionName;
  }

  async open(url) {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'open', url]);
    return this.waitForLoad();
  }

  async waitForLoad(mode = 'networkidle') {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'wait', '--load', mode]);
  }

  async wait(ms) {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'wait', String(ms)]);
  }

  async snapshot() {
    return runAgentBrowser(['--session', this.sessionName, 'snapshot', '-i', '--json']);
  }

  async fill(ref, text) {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'fill', ref, text]);
  }

  async press(key) {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'press', key]);
  }

  async click(ref) {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'click', ref]);
  }

  async getText(ref) {
    return runAgentBrowser(['--session', this.sessionName, 'get', 'text', ref, '--json']);
  }

  async getAttr(ref, attr) {
    return runAgentBrowser(['--session', this.sessionName, 'get', 'attr', ref, attr, '--json']);
  }

  async getUrl() {
    return runAgentBrowser(['--session', this.sessionName, 'get', 'url', '--json']);
  }

  async close() {
    await execFileAsync('agent-browser', ['--session', this.sessionName, 'close']);
  }
}
