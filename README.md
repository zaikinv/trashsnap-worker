### Test

```bash
npx wrangler dev --remote
```

### Deploy

```bash
npx wrangler deploy
```

### Generate embeddings

```bash
node generate-embeddings.js 
```

### Update KV

#### Prod

```bash
npx wrangler kv key put "embeddings" --namespace-id="632746a9a416483ea81f79303bfed0c7" --path="embeddings.json"
```

#### Local

```bash
npx wrangler kv key put "embeddings" --namespace-id="2d6759750c484775bcc48afa2897517c" --path="embeddings.json"
```

