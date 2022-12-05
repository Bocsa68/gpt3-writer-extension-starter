const getKey = () => {
    return new Promise((resolve, reject) =>{
        chrome.storage.local.get(['openai-key'], (result)=> {
            if (result['openai-key']){
                const decodeKey =atob(result['openai-key']);
                resolve(decodeKey);
            }
        });
    });
};

const generate = async (prompt) => {
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';

    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.8,
        }),
    });

    const completion = await completionResponse.json();
    return completion.choises.pop();
}

const generateCompletionAction = async (info) => {
    try {
        const { selectionText } = info;
        const basePromptPrefix = `Write a professional and courteous email reply to this sender.
        Title: `;

        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

    console.log(baseCompletion.text)

    } catch (error) {
        console.log(error);
    }
};

chrome.contextMenus.create({
    id: 'context-run',
    title: 'Generate Email Reply',
    contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
