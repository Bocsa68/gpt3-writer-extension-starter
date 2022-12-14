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

// Send message to the DOM
const sendMessage = (content) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0].id;

        chrome.tabs.sendMessage(
            activeTab,
            {message: 'inject', content},
            (response) => {
                if (response.status === 'failed') {
                    console.log('injection failed.');
                }
            }
        );
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
    return completion.choices.pop();
}

// Function here
const generateCompletionAction = async (info) => {
    try {
        // Send message with generating text (like loading indicator)
        sendMessage('generating...');

        const { selectionText } = info;
        const basePromptPrefix = `Write me a list of menu suggestions for a meal based on these criteria.
        Criteria: `;

        // Add call to GPT-3
        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

        // Add Second prompt
        const secondPrompt = `From the menu list below select one meal and generate a detailed recipe.
        Criteria: ${selectionText}

        Menu: ${baseCompletion}
        
        Recipe:
        `;

        // Call the second prompt
        const secondPromptCompletion = await generate(secondPrompt);

        // Send the output when we're complete
        sendMessage(secondPromptCompletion.text);

    console.log(baseCompletion.text)
    console.log(secondPromptCompletion.text)

    } catch (error) {
        console.log(error);

        // Add message if we run into any errors!
        sendMessage(error.toString());
    }
};

// Update to fix duplicate id error.
chrome.runtime.onInstalled.addListener(() =>{
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Generate Menu & Recipe',
        contexts: ['selection'],
    });
})

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
