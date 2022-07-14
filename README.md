# pkg_file_iconsghsvs
- Joomla package that copies some slightly customised SVG icons in folder `/media/iconsghsvs/`. Not more, not less.
- Is an addition for `plg_system_bs3ghsvs_bs5`. Feature "SVG Embedding".
- Icon sources:
  - https://github.com/FortAwesome/Font-Awesome (V5. Will not support V6+. Complete removal from this package is planned. Or will only use brands. Let's see.).
  - https://github.com/twbs/icons

# Be aware
- The package ZIP has a size of 1.5 MB depending on the size of the SVGs.
  - Extracted size: 6 MB or so on the server.
- This is a Joomla `package` extension instead of just a simple `file` extension. This is simply because so far Joomla does not delete the folder `/media/iconsghsvs/` on uninstallation correctly.
- So after installation you will find two extensions named "iconsghsvs" in the Joomla extension manager.
- Stupid, but no further problem.
- To uninstall the files uninstall the package.
  - When you see a message like `JFolder: :files: Path is not a folder. Path: /www/htdocs/w00f7959/j3.illovo.de/media/iconsghsvs/svgs` ignore it! No harm! Sometimes Joomla is strange ;-) I have no idea where it comes from and why.

-----------------------------------------------------

# My personal build procedure (WSL 1, Debian, Win 10)

!!!**@since versions greater then 2022.05.14_1.8.2.zip: Build procedure uses local repo fork of https://github.com/GHSVS-de/buildKramGhsvs**!!!

# My personal build procedure
- Prepare/adapt `./package.json`.
- `cd /mnt/z/git-kram/pkg_file_iconsghsvs`

## node/npm updates/installation
- `npm install` (if never done before)

### Update dependencies
- `npm run updateCheck` or (faster) `npm outdated`
- `npm run update` (if needed) or (faster) `npm update --save-dev`

## Check package.json overrides
Extensions in `src/packages/**/` may have a file `packageOverride.json` that can be merged into the main `package.json` during build.

Thus you can override some parameters for `replaceXml.js` of repo `buildKramGhsvs`.

Not documented. Therfore see `./build.js` (`helper.mergeJson`, `replaceXmlOptions.jsonString`).

## Build installable ZIP package
- `node build.js`
- New, installable ZIP is in `./dist` afterwards.
- Packed files for this ZIP can be seen in `./package`. **But only if you disable deletion of this folder at the end of `build.js`**.

### For Joomla update and changelog server
- Create new release with new tag.
  - See release description in `dist/release.txt`.
- Extracts(!) of the update and changelog XML for update and changelog servers are in `./dist` as well. Copy/paste and necessary additions.
