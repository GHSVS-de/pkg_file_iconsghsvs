# pkg_file_iconsghsvs
- Joomla package that copies some slightly customised SVG icons in folder `/media/iconsghsvs/`. Not more, not less.
- Is an addition for `plg_system_bs3ghsvs_bs5`. Feature "SVG Embedding".
- Icon sources:
- - https://github.com/FortAwesome/Font-Awesome (V5. Will not support V6+.).
- - https://github.com/twbs/icons

# Be aware
- The package ZIP has a size of 1.5 MB depending on the size of the SVGs.
- - Extracted size: 6 MB or so on the server.
- This is a Joomla `package` extension instead of just a simple `file` extension. This is simply because so far Joomla does not delete the folder `/media/iconsghsvs/` on uninstallation correctly.
- So after installation you will find two extensions named "iconsghsvs" in the Joomla extension manager.
- Stupid, but no further problem.
- To uninstall the files uninstall the package.
- - When you see a message like `JFolder: :files: Path is not a folder. Path: /www/htdocs/w00f7959/j3.illovo.de/media/iconsghsvs/svgs` ignore it! No harm! Sometimes Joomla is strange ;-) I have no idea where it comes from and why.

---

# My personal build procedure
- Prepare/adapt `./package.json`.

- `cd /mnt/z/git-kram/pkg_file_iconsghsvs`

## node/npm updates/installation
- `npm install` (if not done yet)
### Update
- `npm run g-npm-update-check` or (faster) `npm outdated`
- `npm run g-npm-update` (if needed) or (faster) `npm update --save-dev`

## Build installable ZIP package
- `node build.js`
- New, installable ZIP is in `./dist` afterwards.
- FYI: Packed files for this ZIP can be seen in `./package`. **But only if you disable deletion of this folder at the end of `build.js`**.

## For Joomla update server
- Create new release with new tag using `dist/release.txt` as a blueprint.
- Copy content of `dist/changelog.xml` and `dist/update.xml` to concerning manifest files.
