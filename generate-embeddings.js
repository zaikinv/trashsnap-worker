import { readFileSync, writeFileSync } from 'fs';
import 'dotenv/config';

const labels = readFileSync('data/labels_EN.txt', 'utf8').trim().split('\n');
console.log(`Found ${labels.length} labels`);

// Load credentials from .env file
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;

if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
  console.error('Please set CF_API_TOKEN and CF_ACCOUNT_ID environment variables');
  console.error('Get your API token from: https://dash.cloudflare.com/profile/api-tokens');
  console.error('Get your account ID from your Workers dashboard');
  process.exit(1);
}

const embeddings = [];

for (let i = 0; i < labels.length; i++) {
  const label = labels[i];
  
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: label }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    embeddings.push(result.result.data[0]);
    
    if ((i + 1) % 50 === 0) {
      console.log(`Processed ${i + 1}/${labels.length} labels`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
    
  } catch (error) {
    console.error(`Error processing label "${label}":`, error);
    process.exit(1);
  }
}

const data = { labels, embeddings };
writeFileSync('embeddings.json', JSON.stringify(data));
console.log('Saved embeddings.json');
console.log(`File size: ${(JSON.stringify(data).length / 1024 / 1024).toFixed(1)}MB`); 