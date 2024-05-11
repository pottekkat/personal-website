const fs = require("fs");

async function fetchCommitData(username, repo, page = 1) {
  const fetch = (await import("node-fetch")).default;
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${username}/${repo}/commits?page=${page}&per_page=100`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const commits = await response.json();
  const linkHeader = response.headers.get("Link");
  let nextPage = null;

  if (linkHeader) {
    const links = linkHeader.split(",").map((header) => header.trim());
    const nextLink = links.find((link) => link.includes('rel="next"'));
    nextPage = nextLink ? nextLink.match(/page=(\d+)/)[1] : null;
  }

  // Ensure commits is an array
  if (!Array.isArray(commits)) {
    throw new Error(
      "Expected commits to be an array. Likely exceeded the GitHub API rate limit."
    );
  }

  // Filter commits by date range
  const endDate = new Date(); // Today
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1); // One year ago
  const filteredCommits = commits.filter((commit) => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= startDate && commitDate <= endDate;
  });

  // If there's a next page, recursively fetch and concatenate results
  if (nextPage) {
    const nextPageCommits = await fetchCommitData(username, repo, nextPage);
    return filteredCommits.concat(nextPageCommits);
  } else {
    return filteredCommits;
  }
}

fetchCommitData("pottekkat", "personal-website")
  .then((data) => {
    // Aggregate commits by day and count them
    const aggregatedData = data.reduce((acc, commit) => {
      const date = new Date(commit.commit.author.date);
      // Construct the key in the format "YYYY-MM-DD"
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Calculate the maximum number of commits
    const maxCommits = Math.max(...Object.values(aggregatedData));

    // Calculate the normalization factor
    const normalizationFactor = 100 / maxCommits;

    // Format data for ECharts
    // Directly use the keys as dates in the desired format
    const formattedData = Object.entries(aggregatedData).map(
      ([date, count]) => [date, count * normalizationFactor]
    );

    const normalizationData = [normalizationFactor].concat(formattedData);

    // Write formatted data to JSON
    fs.writeFileSync(
      "./content/about/commitsData.json",
      JSON.stringify(normalizationData, null, 2)
    );
    console.log("Data saved to commitsData.json");
  })
  .catch((error) => console.error("Failed to fetch commit data:", error));
