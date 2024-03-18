import { GenerateAnswerParams, Provider } from '../types'
import OpenAI from "openai";

export class OpenAIProvider implements Provider {
  private openai: OpenAI;

  constructor(private token: string, private model: string) {
    this.token = token
    this.model = model
    this.openai = new OpenAI({ apiKey: this.token });
  }

  async generateAnswer(params: GenerateAnswerParams) {
    const stream = await this.openai.chat.completions.create({
      messages: [{ role: "user", content: params.prompt }],
      model: this.model,
      stream: true,
    });
    let text = ''
    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      text += chunkText
      console.debug('chunkText:', chunkText)
      params.onEvent({
        type: 'answer',
        data: {
          text: text,
          messageId: chunk.id,
          conversationId: chunk.id,
        },
      })
    }
    params.onEvent({ type: 'done' })
    return {}
  }
}
