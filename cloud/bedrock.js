
const BedrockRuntime = async (req, res) =>
{
  const AWS = require("@aws-sdk/client-bedrock-runtime");

  res.statusCode = 200;
  res.setHeader("Transfer-Encoding", "chunked");

  const bedrockruntime = new AWS.BedrockRuntime({
    region: 'us-east-1'
  });

  const prompt = req.body.prompt || '';
  const max_tokens_to_sample = req.body.max_tokens_to_sample || 200;
  const temperature = req.body.temperature || 1;
  const top_k = req.body.top_k || 250;
  const top_p = req.body.top_p || 0.999;

  const formattedPrompt = `Human: ${prompt}\nAssistant:`;


  const requestBody = {
    prompt: formattedPrompt,
    max_tokens_to_sample,
    temperature,
    top_k,
    top_p
  };

  const params = {
    body: Buffer.from(JSON.stringify(requestBody)), modelId: "anthropic.claude-v2", contentType: 'application/json', accept: '*/*'
  }

  try{
    const response = await bedrockruntime.invokeModelWithResponseStream(params);

    const events = response.body;
    for await (const event of events)
    {
      if (event.chunk) {
        res.write(event.chunk.bytes);
      }
    }

  } catch(error) {
    console.log(error);
  }finally {
    res.end();
  }

}

module.exports = {BedrockRuntime};