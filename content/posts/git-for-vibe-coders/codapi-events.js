// Wait for the custom element to be defined
customElements.whenDefined('codapi-snippet').then(() => {
    // Get all codapi snippets
    const snippets = document.querySelectorAll('codapi-snippet');
    
    snippets.forEach(snippet => {
        // Listen for the result event from Codapi
        snippet.addEventListener('result', (event) => {
            // Get the command from the snippet's template
            const command = snippet.getAttribute('template');
            const output = event.detail.stdout;
            
            // Emit our custom event
            const customEvent = new CustomEvent('codapiCommandComplete', {
                detail: {
                    command,
                    output
                }
            });
            console.log('emitting custom event', customEvent);
            document.dispatchEvent(customEvent);
        });
    });
}); 