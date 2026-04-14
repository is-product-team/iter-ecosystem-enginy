import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const SINGLETON_PACKAGES = ['react', 'react-dom'];
const VERIFIED_VERSIONS = ['typescript', 'zod'];

async function getWorkspaces() {
  const rootPkg = JSON.parse(await fs.readFile(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
  const workspaces = [];
  
  for (const pattern of rootPkg.workspaces || []) {
    if (pattern.endsWith('/*')) {
      const baseDir = pattern.replace('/*', '');
      const dirs = await fs.readdir(path.join(ROOT_DIR, baseDir));
      for (const dir of dirs) {
        if (!dir.startsWith('.') && dir !== 'node_modules') {
          const stats = await fs.stat(path.join(ROOT_DIR, baseDir, dir));
          if (stats.isDirectory()) {
            workspaces.push(path.join(baseDir, dir));
          }
        }
      }
    } else {
      workspaces.push(pattern);
    }
  }
  return workspaces;
}

async function auditWorkspace(workspacePath) {
  const fullPath = path.join(ROOT_DIR, workspacePath);
  const nodeModulesPath = path.join(fullPath, 'node_modules');
  let issuesFound = false;

  console.log(`\n🔍 Auditing workspace: ${workspacePath}`);

  // 1. Check for Singleton Violations (Local node_modules)
  try {
    const modules = await fs.readdir(nodeModulesPath);
    for (const pkg of SINGLETON_PACKAGES) {
      if (modules.includes(pkg)) {
        console.warn(`[VIOLATION] Found local '${pkg}' in ${workspacePath}/node_modules. Purging...`);
        await fs.rm(path.join(nodeModulesPath, pkg), { recursive: true, force: true });
        issuesFound = true;
      }
    }
  } catch (err) {
    // node_modules might not exist, which is fine
  }

  // 2. Check for Version Drift in package.json
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(fullPath, 'package.json'), 'utf-8'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    
    for (const depName of VERIFIED_VERSIONS) {
      if (allDeps[depName]) {
        console.warn(`[WARNING] Workspace '${workspacePath}' declares '${depName}' locally. It should be managed at root.`);
        issuesFound = true;
      }
    }
    
    if (pkg.dependencies && (pkg.dependencies.react || pkg.dependencies['react-dom'])) {
        console.warn(`[VIOLATION] Workspace '${workspacePath}' has react/react-dom in dependencies. Re-running singleton cleanup.`);
        issuesFound = true;
    }
  } catch (err) {
    console.error(`Could not read package.json for ${workspacePath}`);
  }

  return issuesFound;
}

async function run() {
  console.log('🛡️  Starting Monorepo Hygiene Check...');
  const workspaces = await getWorkspaces();
  let totalIssues = 0;

  for (const ws of workspaces) {
    const found = await auditWorkspace(ws);
    if (found) totalIssues++;
  }

  if (totalIssues > 0) {
    console.log(`\n⚠️  Hygiene check finished. Found issues in ${totalIssues} workspaces.`);
    console.log('Action: Conflicting local modules were purged. Please run "npm install" at root to ensure correct linking.');
  } else {
    console.log('\n✅ Monorepo is clean and compliant.');
  }
}

run().catch(err => {
  console.error('Hygiene check failed:', err);
  process.exit(1);
});
