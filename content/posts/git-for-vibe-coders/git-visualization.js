// Git visualization state
let gitState = {
    initialized: false,
    currentBranch: 'master',
    branches: ['master'],
    commits: []
};

// Function to update the mermaid diagram
function updateGitGraph() {
    const mermaidElement = document.querySelector('.mermaid');
    if (!mermaidElement) return;

    let graphDefinition = 'gitGraph\n';
    
    if (!gitState.initialized) {
        graphDefinition += '   commit id: "Not a git repository."\n';
    } else if (gitState.commits.length === 0) {
        // After git init, show empty master branch
        graphDefinition += '   branch master\n';
    } else {
        // After git commit, show the commit
        graphDefinition += '   commit id: "initial commit"\n';
    }

    // Update the mermaid diagram
    mermaidElement.textContent = graphDefinition;
    mermaid.render('git-graph', graphDefinition).then(({svg}) => {
        mermaidElement.innerHTML = svg;
    });
}

// Function to handle Git commands
function handleGitCommand(id) {
    console.log('Handling command for id:', id);
    
    if (id === 'diagram-trigger-init') {
        // Initialize with an empty state
        gitState = {
            initialized: true,
            currentBranch: 'master',
            branches: ['master'],
            commits: []
        };
        console.log('Git initialized:', gitState);
    } else if (id === 'diagram-trigger-commit') {
        // Add a new commit
        gitState.commits.push({
            type: 'commit',
            id: 'initial commit',
            branch: gitState.currentBranch
        });
        console.log('Commit added:', gitState);
    }

    // Update the visualization
    updateGitGraph();
}

// Listen for Codapi command outputs
document.addEventListener('codapiCommandComplete', (event) => {
    console.log('Received Codapi event:', event);
    const { id } = event.detail;
    handleGitCommand(id);
}); 