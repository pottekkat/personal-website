// Wait for the custom element to be defined
customElements.whenDefined('codapi-snippet').then(() => {
    // Get all codapi snippets
    const snippets = document.querySelectorAll('codapi-snippet');
    snippets.forEach(snippet => {
        // Only handle diagram-trigger-* elements
        if (snippet.id.startsWith('diagram-trigger-')) {
            // Listen for the result event from Codapi
            snippet.addEventListener('result', (event) => {
                // Only emit if status is ok: true
                if (event.detail.ok) {
                    // Emit our custom event with just the id
                    const customEvent = new CustomEvent('codapiCommandComplete', {
                        detail: {
                            id: snippet.id
                        }
                    });
                    console.log('emitting custom event for diagram trigger:', snippet.id);
                    document.dispatchEvent(customEvent);
                }
            });
        }
    });
}); 