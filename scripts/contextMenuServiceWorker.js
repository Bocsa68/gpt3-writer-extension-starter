// Function to get + decode API key
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

// Setup our generate function
const generate = async (prompt) => {
    //Get you API key from storage
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';

    // Call completions endpoint
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

    // Select the top choice and send back
    const completion = await completionResponse.json();
    return completion.choises.pop();
}

// Function here
const generateCompletionAction = async (info) => {
    try {
        // Send message with generation text (loading indicator)
        sendMessage("generating...");

        const { selectionText } = info;
        const basePromptPrefix = `Write a professional and courteous email reply to this sender.
        Title: `;

        // Add call to GPT-3
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

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
