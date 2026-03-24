async function runDemo(kind, inputId, outputId, button) {
  const prompt = document.getElementById(inputId).value;
  const output = document.getElementById(outputId);
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Running...';
  output.textContent = 'Running...';

  try {
    const res = await fetch(`/api/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    output.textContent = data.ok ? data.output : `Error: ${data.error}`;
  } catch (error) {
    output.textContent = `Request failed: ${error.message}`;
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

async function saveChat() {
  const text = document.getElementById('memoryPrompt').value;
  const output = document.getElementById('memoryOutput');
  const res = await fetch('/api/memory/save-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: 'web-demo', text })
  });
  const data = await res.json();
  output.textContent = data.ok ? data.output : `Error: ${data.error}`;
}

async function rememberNote() {
  const text = document.getElementById('memoryPrompt').value;
  const output = document.getElementById('memoryOutput');
  const res = await fetch('/api/memory/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  output.textContent = data.ok ? data.output : `Error: ${data.error}`;
}

async function listChats() {
  const output = document.getElementById('memoryOutput');
  const res = await fetch('/api/memory/list-chats');
  const data = await res.json();
  output.textContent = data.ok ? data.output : `Error: ${data.error}`;
}

async function listMemories() {
  const output = document.getElementById('memoryOutput');
  const res = await fetch('/api/memory/list-memories');
  const data = await res.json();
  output.textContent = data.ok ? data.output : `Error: ${data.error}`;
}
