export default {
  async fetch(request, env, ctx) {
    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    try {
      console.log('Request method:', request.method);
      
      if (request.method !== 'POST') {
        return new Response('Use POST method with image file', { 
          status: 405,
          headers: corsHeaders
        });
      }

      // Get form data
      const formData = await request.formData();
      const imageFile = formData.get('image');
      
      if (!imageFile) {
        return new Response('No image file provided', { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Load pre-computed text embeddings from KV
      const embeddingsData = await env.EMBEDDINGS_KV.get('embeddings');
      if (!embeddingsData) {
        console.error('Text embeddings not found in KV storage');
        return new Response('Text embeddings not available', { 
          status: 500,
          headers: corsHeaders
        });
      }

      const textEmbeddings = JSON.parse(embeddingsData);

      // Use Cloudflare Workers AI for image classification
      // We'll use LLaVA which is a vision-language model that can describe images
      const imageBuffer = await imageFile.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      
      const visionResult = await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
        image: imageArray,
        prompt: "Describe what you see in this image in detail, focusing on the type of waste, material, and specific objects visible. Just answer with the main waste type on the image.",
        max_tokens: 512
      });

      const imageDescription = visionResult.description || visionResult.response || visionResult;

      // Generate embedding for the image description using Cloudflare Workers AI
      const descriptionEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: imageDescription
      });

      const imageVector = descriptionEmbedding.data[0];

      // Calculate cosine similarity with all text embeddings
      function cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
      }

      // Find best matches
      const similarities = textEmbeddings.embeddings.map((embedding, index) => ({
        label: textEmbeddings.labels[index],
        similarity: cosineSimilarity(imageVector, embedding),
        index
      }));

      // Sort by similarity (highest first)
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topMatches = similarities.slice(0, 5);

      const result = {
        success: true,
        imageDescription,
        classification: {
          topLabel: topMatches[0].label,
          confidence: topMatches[0].similarity,
          allMatches: topMatches.map(match => ({
            label: match.label,
            confidence: parseFloat(match.similarity.toFixed(4))
          }))
        },
        processingInfo: {
          modelUsed: 'Cloudflare Workers AI (LLaVA + BGE)',
          embeddingModel: '@cf/baai/bge-base-en-v1.5',
          visionModel: '@cf/llava-hf/llava-1.5-7b-hf',
          totalLabels: textEmbeddings.labels.length
        }
      };

      return new Response(JSON.stringify(result, null, 2), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  },
}; 