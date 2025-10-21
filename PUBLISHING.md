# Publishing Guide for unified-browser-mcp

This document contains instructions for publishing updates to npm.

## Prerequisites

- npm account (create at https://www.npmjs.com/signup)
- Collaborator access to the `unified-browser-mcp` package on npm
- Local repository up to date with latest changes

## First Time Setup

### 1. Create npm Account

If you don't have an npm account:
1. Go to https://www.npmjs.com/signup
2. Create a free account
3. Verify your email address
4. (Optional but recommended) Enable 2FA in your npm account settings

### 2. Login to npm

In your terminal, run:

```bash
npm login
```

You'll be prompted for:
- **Username:** Your npm username
- **Password:** Your npm password
- **Email:** Your registered email
- **One-time password:** If you have 2FA enabled

You should see:
```
Logged in as [your-username] on https://registry.npmjs.org/.
```

## Publishing a New Version

### Step 1: Make Your Changes

1. Make and test your code changes
2. Update documentation if needed
3. Commit your changes to git

### Step 2: Update Version Number

Use npm's versioning commands to bump the version:

**For bug fixes (1.0.0 → 1.0.1):**
```bash
npm version patch
```

**For new features (1.0.0 → 1.1.0):**
```bash
npm version minor
```

**For breaking changes (1.0.0 → 2.0.0):**
```bash
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git commit with the version
- Creates a git tag

### Step 3: Build and Test

Ensure everything builds correctly:

```bash
npm run build
```

Test the package contents without publishing:

```bash
npm publish --dry-run
```

Review the output to ensure only necessary files are included:
- ✅ `LICENSE`
- ✅ `README.md`
- ✅ `build/index.js`
- ✅ `package.json`

❌ Should NOT include:
- `node_modules/`
- `src/` (TypeScript source)
- `.git/`
- Test files

### Step 4: Push to GitHub

Push your changes and the version tag:

```bash
git push origin main
git push origin --tags
```

### Step 5: Publish to npm

**Important:** Make sure you're logged in first (`npm whoami` to check)

```bash
npm publish
```

You should see:
```
npm notice 
npm notice 📦  unified-browser-mcp@x.x.x
npm notice === Tarball Contents === 
npm notice ... (file list)
npm notice === Tarball Details === 
npm notice name:          unified-browser-mcp                        
npm notice version:       x.x.x                                      
npm notice package size:  X.X kB                                     
npm notice unpacked size: XX.X kB                                    
npm notice total files:   4                                          
npm notice 
+ unified-browser-mcp@x.x.x
```

### Step 6: Verify Publication

1. **Check npm website:**
   - Go to https://www.npmjs.com/package/unified-browser-mcp
   - Verify the new version is listed
   - Check that README displays correctly

2. **Test installation:**
   ```bash
   npx unified-browser-mcp@latest
   ```
   Should download and start the server

3. **Test in Cursor:**
   - Update your `mcp.json` if needed
   - Restart Cursor
   - Verify the tools are available

## Versioning Guidelines

Follow [Semantic Versioning](https://semver.org/) (SemVer):

### Patch (1.0.X)
- Bug fixes
- Documentation updates
- Performance improvements
- No breaking changes

**Example:**
```bash
npm version patch
# 1.0.0 → 1.0.1
```

### Minor (1.X.0)
- New features
- New tools or capabilities
- Backward-compatible changes
- No breaking changes

**Example:**
```bash
npm version minor
# 1.0.0 → 1.1.0
```

### Major (X.0.0)
- Breaking changes
- Removed features or tools
- Changed API or configuration format
- Incompatible with previous versions

**Example:**
```bash
npm version major
# 1.0.0 → 2.0.0
```

## Troubleshooting

### "You must be logged in to publish"

**Solution:**
```bash
npm login
```

### "You do not have permission to publish"

**Possible causes:**
1. Package name already taken by someone else
2. You're not logged in with the correct account
3. You don't have publish permissions

**Solutions:**
- Check your login: `npm whoami`
- Verify package ownership: `npm owner ls unified-browser-mcp`

### "Version already exists"

You're trying to publish a version that's already on npm.

**Solution:**
```bash
npm version patch  # Bump the version first
npm publish
```

### Build Fails During Publish

The `prepublishOnly` script runs before publishing and must succeed.

**Solution:**
```bash
npm run build  # Test the build manually
# Fix any TypeScript errors
npm publish
```

### Wrong Files in Package

Check what will be published:
```bash
npm publish --dry-run
```

The `files` array in `package.json` controls what's included:
```json
{
  "files": [
    "build",
    "README.md"
  ]
}
```

## Publishing Checklist

Use this checklist when publishing:

- [ ] All changes committed to git
- [ ] Tests pass (if you have tests)
- [ ] Build succeeds (`npm run build`)
- [ ] Version bumped (`npm version [patch|minor|major]`)
- [ ] CHANGELOG updated (if you maintain one)
- [ ] Changes pushed to GitHub (`git push origin main --tags`)
- [ ] Logged in to npm (`npm whoami`)
- [ ] Dry-run checked (`npm publish --dry-run`)
- [ ] Published (`npm publish`)
- [ ] Verified on npm website
- [ ] Tested with `npx unified-browser-mcp@latest`

## Rolling Back a Release

If you publish a broken version:

### Option 1: Deprecate (Recommended)

```bash
npm deprecate unified-browser-mcp@1.0.1 "This version has critical bugs. Please use 1.0.2 instead"
```

Then publish a fixed version:
```bash
npm version patch
npm publish
```

### Option 2: Unpublish (Use with caution)

⚠️ **Warning:** Can only unpublish within 72 hours, and only if no other packages depend on it.

```bash
npm unpublish unified-browser-mcp@1.0.1
```

**Note:** Unpublishing is discouraged as it can break existing users.

## npm Package Stats

Monitor your package usage:

- **npm website:** https://www.npmjs.com/package/unified-browser-mcp
- **Download stats:** https://npm-stat.com/charts.html?package=unified-browser-mcp
- **View downloads:**
  ```bash
  npm info unified-browser-mcp
  ```

## Useful Commands

```bash
# Check who you're logged in as
npm whoami

# View package info
npm info unified-browser-mcp

# View all published versions
npm view unified-browser-mcp versions

# Check current local version
npm version

# View package owners
npm owner ls unified-browser-mcp

# Add a collaborator
npm owner add <username> unified-browser-mcp

# See what files would be published
npm pack --dry-run
```

## Support

If you encounter issues:

1. Check npm status: https://status.npmjs.org/
2. npm documentation: https://docs.npmjs.com/
3. npm support: https://www.npmjs.com/support
4. GitHub Issues: https://github.com/msawayda/unified-browser-mcp/issues

## Security

- **Never commit** your npm credentials
- **Enable 2FA** on your npm account
- **Review** the files being published before running `npm publish`
- **Test** new versions before marking them as `latest`

## Automated Publishing (Future)

Consider setting up GitHub Actions to automate publishing:

1. Create `.github/workflows/publish.yml`
2. Use npm automation tokens
3. Trigger on git tags or releases
4. Automatically publish to npm

This is recommended for mature projects with multiple contributors.

