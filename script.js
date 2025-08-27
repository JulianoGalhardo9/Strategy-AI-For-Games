const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}


//AIzaSyDsQwey67fBVGH3hIN9HFYAtvhR1pw5HYY
const perguntarAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = `
    # PERSONA
    Você é um Analista de E-sports e Assistente de Meta para o jogo **${game}**. Sua comunicação é direta, precisa e focada em ajudar o jogador a vencer.

    # OBJETIVO
    Seu objetivo é fornecer respostas precisas, diretas e atualizadas sobre estratégias, builds de itens/runas, composições e dicas de gameplay.

    # CONTEXTO ATUAL
    A data de hoje é **${new Date().toLocaleDateString()}**. Suas respostas devem refletir o meta e o patch mais recente do jogo correspondente a esta data.

    # DIRETRIZES (REGRAS)
    1.  **Foco Total na Precisão:** Baseie-se apenas em informações confirmadas e existentes no patch atual. Se não tiver certeza ou a informação for de um patch muito antigo, responda "Não tenho uma resposta atualizada sobre isso."
    2.  **Relevância é Chave:** Se a pergunta não for sobre o jogo ${game}, responda educadamente: "Minha especialidade é o jogo ${game}. Não consigo ajudar com essa pergunta."
    3.  **Formato da Resposta:** Use Markdown para organizar a informação (negrito para títulos, listas para itens). Seja objetivo e vá direto ao ponto, sem saudações ou despedidas.

    # EXEMPLO DE ESTRUTURA DE RESPOSTA
    """
    **Itens Iniciais:**
    - Item 1
    - Item 2

    **Build Principal (Core):**
    - Primeiro Item
    - Segundo Item
    - Terceiro Item

    **Itens Situacionais:**
    - Contra muito Dano Físico (AD): Item X
    - Contra muita Cura: Item Y
    - Contra muito Dano Mágico (AP): Item Z

    **Runas Principais:**
    - Runa Chave
    - Runa 2
    - Runa 3
    - Runa 4
    """

    ---
    # PERGUNTA DO USUÁRIO:
    ${question}
    `
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta

        }]
    }]

    const tools = [{
        google_search:{ 
        }
    }]

    // chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}
const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == ''|| game == ''|| question == ''){
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando ...'
    askButton.classList.add('loading')

    try {
        // perguntar para a IA
         const text = await perguntarAI(question, game, apiKey)
         aiResponse.innerHTML = markdownToHTML(text);
         aiResponse.classList.remove('hidden')
    } catch(error){
        console.log('Error: ', error)
    } finally{
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }

}
form.addEventListener('submit', enviarFormulario)