// Git visualization state
let gitState = {
    currentBranch: 'master',
    branches: ['master'],
    commits: [],
    lastCommitId: 0
};

// Function to update the mermaid diagram
function updateGitGraph() {
    const mermaidElement = document.querySelector('.mermaid');
    if (!mermaidElement) return;

    let graphDefinition = 'gitGraph\n';
    
    // Add commits in order
    gitState.commits.forEach(commit => {
        if (commit.type === 'commit') {
            graphDefinition += `   commit id: "${commit.id}"\n`;
        } else if (commit.type === 'branch') {
            graphDefinition += `   branch ${commit.branchName}\n`;
        } else if (commit.type === 'checkout') {
            graphDefinition += `   checkout ${commit.branchName}\n`;
        } else if (commit.type === 'merge') {
            graphDefinition += `   merge ${commit.branchName}\n`;
        }
    });

    // Update the mermaid diagram
    mermaidElement.textContent = graphDefinition;
    mermaid.render('git-graph', graphDefinition).then(({svg}) => {
        mermaidElement.innerHTML = svg;
    });
}

// Function to handle Git commands
function handleGitCommand(command, output) {
    if (command.includes('git init')) {
        // Initialize with an empty state
        gitState = {
            currentBranch: 'master',
            branches: ['master'],
            commits: [],
            lastCommitId: 0
        };
    } else if (command.includes('git commit')) {
        // Add a new commit
        gitState.lastCommitId++;
        gitState.commits.push({
            type: 'commit',
            id: `commit-${gitState.lastCommitId}`,
            branch: gitState.currentBranch
        });
    } else if (command.includes('git branch')) {
        // Parse branch name from command
        const branchName = command.split(' ')[2];
        if (branchName && !gitState.branches.includes(branchName)) {
            gitState.branches.push(branchName);
            gitState.commits.push({
                type: 'branch',
                branchName: branchName
            });
        }
    } else if (command.includes('git checkout')) {
        // Handle branch checkout
        const branchName = command.split(' ')[2];
        if (branchName && gitState.branches.includes(branchName)) {
            gitState.currentBranch = branchName;
            gitState.commits.push({
                type: 'checkout',
                branchName: branchName
            });
        }
    } else if (command.includes('git merge')) {
        // Handle merge
        const branchName = command.split(' ')[2];
        if (branchName && gitState.branches.includes(branchName)) {
            gitState.commits.push({
                type: 'merge',
                branchName: branchName
            });
        }
    }

    // Update the visualization
    updateGitGraph();
}

// Listen for Codapi command outputs
document.addEventListener('codapiCommandComplete', (event) => {
    const { command, output } = event.detail;
    handleGitCommand(command, output);
}); 