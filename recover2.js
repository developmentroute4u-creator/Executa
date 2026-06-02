const fs = require('fs');

const transcriptPath = `C:\\Users\\jayth\\.gemini\\antigravity-ide\\brain\\9e9501f2-ca76-4fc0-bf22-3205ddf2fe17\\.system_generated\\logs\\transcript.jsonl`;
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

let history = [];

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const parsed = JSON.parse(line);
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
        if (call.function) {
          try {
            const args = JSON.parse(call.function.arguments);
            if (args.TargetFile && args.TargetFile.includes('app\\admin\\dashboard\\page.tsx')) {
              history.push({
                type: call.function.name,
                args: args
              });
            }
          } catch(e) {}
        }
      }
    }
  } catch(e) {}
}

fs.writeFileSync('j:\\Excuta\\Executa\\page_history.json', JSON.stringify(history, null, 2));
console.log(`Found ${history.length} operations on page.tsx`);
