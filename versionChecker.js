const MIN_NODE_VERSION = "18.17.0"; // Set your minimum Node.js version

// Check the Node.js version
const nodeVersion = process.version;
const currentVersion = nodeVersion.slice(1); // Remove 'v' from version string

// Parse version strings and compare
const isVersionBelowMinimum =
  compareVersions(currentVersion, MIN_NODE_VERSION) < 0;

// Throw an error if the version is below the minimum
if (isVersionBelowMinimum) {
  console.error(
    `Error: This application requires Node.js version ${MIN_NODE_VERSION} or later.`,
  );
  process.exit(1); // Exit with an error code
}

// Helper function to compare version strings
function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) return 1;
    if (partsA[i] < partsB[i]) return -1;
  }

  return 0;
}
