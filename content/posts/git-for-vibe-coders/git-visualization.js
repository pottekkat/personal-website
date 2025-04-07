// Git visualization state
let gitState = {
    initialized: false,
    currentBranch: 'main',
    branches: [],
    commits: [],
    commandHistory: [],
    commandSequence: [
        'diagram-trigger-init', 
        'diagram-trigger-commit', 
        'diagram-trigger-branch',
        'diagram-trigger-commit-feature-1',
        'diagram-trigger-commit-feature-2',
        'diagram-trigger-merge'
    ],
    lastExecutedCommand: null
};

// Save a backup of the state for recovery if needed
let stateBackup = null;

// Function to update the mermaid diagram
function updateGitGraph() {
    const mermaidElement = document.getElementById('git-graph-1');
    if (!mermaidElement) return;

    let graphDefinition;
    
    // Ensure state integrity - important fix
    if (gitState.initialized) {
        if (gitState.commits.length === 0) {
            // After git init, show empty main branch
            graphDefinition = 'flowchart LR\n    A[Initialized a Git repository with a main branch.]\n';
        } else {
            // We have at least one commit
            graphDefinition = 'gitGraph\n';
            
            // Add the initial commit on main
            graphDefinition += '   commit id: "initial commit"\n';
            
            // If we have a feature branch, show it
            if (gitState.branches.includes('feature')) {
                graphDefinition += '   branch feature\n';
                graphDefinition += '   checkout feature\n';
                
                // Add feature branch commits if they exist
                const featureCommits = gitState.commits.filter(commit => 
                    commit.branch === 'feature' && commit.id !== 'initial commit');
                
                featureCommits.forEach(commit => {
                    graphDefinition += `   commit id: "${commit.id}"\n`;
                });
                
                // Return to main branch
                graphDefinition += '   checkout main\n';
                
                // If merge has been performed, add a merge commit
                if (gitState.commits.some(commit => commit.type === 'merge')) {
                    graphDefinition += '   merge feature\n';
                }
            }
        }
    } else {
        // Not initialized
        graphDefinition = 'flowchart LR\n    A[Run git init to start.]\n';
    }

    // Log the graph definition we're about to render
    console.log('Rendering graph definition:', graphDefinition);

    // Backup state before rendering
    stateBackup = JSON.parse(JSON.stringify(gitState));

    // Update the mermaid diagram
    mermaidElement.textContent = graphDefinition;
    mermaid.render('git-graph-svg-1', graphDefinition).then(({svg}) => {
        mermaidElement.innerHTML = svg;
    }).catch(error => {
        console.error('Error rendering mermaid diagram:', error);
        // Restore state if rendering failed
        if (stateBackup) {
            gitState = stateBackup;
        }
    });
}

// Function to handle Git commands
function handleGitCommand(id) {
    console.log('Handling command for id:', id, 'Current state:', JSON.stringify(gitState));
    
    // Add to command history if not already there
    if (!gitState.commandHistory.includes(id)) {
        gitState.commandHistory.push(id);
    }
    
    // Execute command safely depending on its position in sequence
    const currentIndex = gitState.commandSequence.indexOf(id);
    
    if (currentIndex === -1) {
        console.log('Command not in sequence:', id);
        return; // Command not in sequence
    }
    
    // Ensure prerequisites are met (key fix for the bug)
    ensureCommandPrerequisites(id);
    
    // Execute the current command
    executeCommand(id);
    gitState.lastExecutedCommand = id;
    
    // Update the visualization
    updateGitGraph();
    
    // Log the final state after command execution
    console.log('Final state after command:', JSON.stringify(gitState));
}

// Function to ensure prerequisites for a command are met
function ensureCommandPrerequisites(id) {
    if (id === 'diagram-trigger-branch') {
        // Branch command requires init and commit
        if (!gitState.initialized) {
            executeCommand('diagram-trigger-init');
        }
        if (gitState.commits.length === 0) {
            executeCommand('diagram-trigger-commit');
        }
    } else if (id === 'diagram-trigger-commit') {
        // Commit requires init
        if (!gitState.initialized) {
            executeCommand('diagram-trigger-init');
        }
    } else if (id === 'diagram-trigger-commit-feature-1' || id === 'diagram-trigger-commit-feature-2') {
        // Feature commits require init, main commit, and branch creation
        if (!gitState.initialized) {
            executeCommand('diagram-trigger-init');
        }
        if (gitState.commits.length === 0) {
            executeCommand('diagram-trigger-commit');
        }
        if (!gitState.branches.includes('feature')) {
            executeCommand('diagram-trigger-branch');
        }
        // Set current branch to feature for these commits
        gitState.currentBranch = 'feature';
    } else if (id === 'diagram-trigger-merge') {
        // Merge requires init, main commit, feature branch, and at least one feature commit
        if (!gitState.initialized) {
            executeCommand('diagram-trigger-init');
        }
        if (gitState.commits.length === 0) {
            executeCommand('diagram-trigger-commit');
        }
        if (!gitState.branches.includes('feature')) {
            executeCommand('diagram-trigger-branch');
        }
        
        // Ensure we have at least one feature commit
        const hasFeatureCommit = gitState.commits.some(commit => 
            commit.branch === 'feature' && commit.id !== 'initial commit');
            
        if (!hasFeatureCommit) {
            executeCommand('diagram-trigger-commit-feature-1');
        }
        
        // Switch to main branch for merge
        gitState.currentBranch = 'main';
    }
}

// Function to execute a single command
function executeCommand(id) {
    console.log('Executing command:', id);
    
    if (id === 'diagram-trigger-init') {
        // Initialize only if not already initialized
        if (!gitState.initialized) {
            console.log('Initializing Git repository');
            gitState.initialized = true;
            gitState.currentBranch = 'main';
            gitState.branches = ['main'];
            gitState.commits = [];
        }
    } else if (id === 'diagram-trigger-commit') {
        // Add a commit only if we don't already have one
        if (gitState.commits.length === 0) {
            console.log('Adding commit');
            gitState.commits.push({
                type: 'commit',
                id: 'initial commit',
                branch: gitState.currentBranch
            });
        }
    } else if (id === 'diagram-trigger-branch') {
        // Add feature branch if not already there
        if (!gitState.branches.includes('feature')) {
            console.log('Adding branch');
            gitState.branches.push('feature');
        }
    } else if (id === 'diagram-trigger-commit-feature-1') {
        // Add first feature branch commit
        const commitExists = gitState.commits.some(commit => commit.id === 'update app title');
        if (!commitExists) {
            console.log('Adding first feature commit');
            gitState.commits.push({
                type: 'commit',
                id: 'update app title',
                branch: 'feature'
            });
            gitState.currentBranch = 'feature';
        }
    } else if (id === 'diagram-trigger-commit-feature-2') {
        // Add second feature branch commit
        const commitExists = gitState.commits.some(commit => commit.id === 'increase border radius');
        if (!commitExists) {
            console.log('Adding second feature commit');
            gitState.commits.push({
                type: 'commit',
                id: 'increase border radius',
                branch: 'feature'
            });
            gitState.currentBranch = 'feature';
        }
    } else if (id === 'diagram-trigger-merge') {
        // Add merge commit if not already merged
        const mergeExists = gitState.commits.some(commit => commit.type === 'merge');
        if (!mergeExists) {
            console.log('Adding merge commit');
            gitState.commits.push({
                type: 'merge',
                branch: 'main',
                mergedFrom: 'feature'
            });
            // Switch to main branch
            gitState.currentBranch = 'main';
        }
    }
    
    console.log('State after executing', id, ':', JSON.stringify(gitState));
}

// Listen for Codapi command outputs
document.addEventListener('codapiCommandComplete', (event) => {
    console.log('Received Codapi event:', event);
    const { id } = event.detail;
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        handleGitCommand(id);
    }, 50);
}); 