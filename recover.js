const fs = require('fs');

const transcriptPath = `C:\\Users\\jayth\\.gemini\\antigravity-ide\\brain\\9e9501f2-ca76-4fc0-bf22-3205ddf2fe17\\.system_generated\\logs\\transcript.jsonl`;
const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

let bestContent = null;
let latestTime = 0;

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const parsed = JSON.parse(line);
    if (parsed.tool_calls) {
      for (const call of parsed.tool_calls) {
        if (call.function && call.function.name === 'write_to_file') {
          try {
            const args = JSON.parse(call.function.arguments);
            if (args.TargetFile && args.TargetFile.includes('app\\admin\\dashboard\\page.tsx')) {
              bestContent = args.CodeContent;
            }
          } catch(e) {}
        }
      }
    }
  } catch(e) {}
}

if (bestContent) {
  fs.writeFileSync('j:\\Excuta\\Executa\\recovered_page.tsx', bestContent);
  console.log('Recovered from write_to_file!');
} else {
  console.log('No full write_to_file found. We need to reconstruct from chunks or check if there is a backup.');
}
