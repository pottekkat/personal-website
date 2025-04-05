// Git visualization state
let gitState = {
    initialized: false,
    currentBranch: 'main',
    branches: [],
    commits: [],
    commandSequence: ['diagram-trigger-init', 'diagram-trigger-commit'],
    lastExecutedCommand: null
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
        graphDefinition = 'flowchart LR\n    A[Initialized a Git repository with a main branch.]\n';
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
    
    // Find the index of the current command in the sequence
    const currentIndex = gitState.commandSequence.indexOf(id);
    if (currentIndex === -1) return; // Command not in sequence

    // Execute any skipped commands in order
    for (let i = 0; i < currentIndex; i++) {
        const skippedCommand = gitState.commandSequence[i];
        if (skippedCommand !== gitState.lastExecutedCommand) {
            executeCommand(skippedCommand);
        }
    }

    // Execute the current command
    executeCommand(id);
    gitState.lastExecutedCommand = id;

    // Update the visualization
    updateGitGraph();
}

// Function to execute a single command
function executeCommand(id) {
    if (id === 'diagram-trigger-init') {
        // Initialize with an empty state
        gitState = {
            ...gitState,
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
}

// Listen for Codapi command outputs
document.addEventListener('codapiCommandComplete', (event) => {
    console.log('Received Codapi event:', event);
    const { id } = event.detail;
    handleGitCommand(id);
}); 