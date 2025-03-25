// Git visualization state
let gitState = {
    initialized: false,
    currentBranch: 'main',
    branches: [],
    commits: []
};

// Function to update the mermaid diagram
function updateGitGraph() {
    const mermaidElement = document.getElementById('git-graph-1');
    if (!mermaidElement) return;

    let graphDefinition;
    
    if (!gitState.initialized) {
        graphDefinition = 'flowchart LR\n    A[Run git init to start.]\n';
    } else if (gitState.commits.length === 0) {
        // After git init, show empty main branch
        graphDefinition = 'flowchart LR\n    A[Initialized a Git repository.]\n';
    } else {
        // After git commit, show the commit
        graphDefinition = 'gitGraph\n   commit id: "initial commit"\n';
    }

    // Update the mermaid diagram
    mermaidElement.textContent = graphDefinition;
    mermaid.render('git-graph-svg-1', graphDefinition).then(({svg}) => {
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
            currentBranch: 'main',
            branches: ['main'],
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