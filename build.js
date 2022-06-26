#!/usr/bin/env node
const path = require('path');

/* Configure START */
const pathBuildKram = path.resolve("../buildKramGhsvs");
const updateXml = `${pathBuildKram}/build/update.xml`;
const changelogXml = `${pathBuildKram}/build/changelog.xml`;
const releaseTxt = `${pathBuildKram}/build/release.txt`;
/* Configure END */

const replaceXml = require(`${pathBuildKram}/build/replaceXml.js`);
const helper = require(`${pathBuildKram}/build/helper.js`);

const pc = require(`${pathBuildKram}/node_modules/picocolors`);
const fse = require(`${pathBuildKram}/node_modules/fs-extra`);

const util = require("util");
const exec = util.promisify(require('child_process').exec);

let replaceXmlOptions = {};
let zipOptions = {};
let from = "";
let to = "";

const {
	filename,
	name,
	nameReal,
	version,
} = require("./package.json");

const packagesDir = `./package/packages`;
const childDir = `${packagesDir}/file_iconsghsvs`;

// By package abweichend. Nicht filename.
const manifestFileName = `${name}.xml`;
const Manifest = path.resolve(`./package/${manifestFileName}`);
const jsonMain = './package.json';

const manifestFileNameChild = `${filename}.xml`;
const manifestChild = `${childDir}/${manifestFileNameChild}`;
const jsonChild = `${childDir}/packageOverride.json`;

let versionSub = '';
let thisPackages = [];

// Permanent SVG holder:
// Don't delete it! No cleanout! Used by repo hugo_baseghsvs!
const pathMedia = `./media/svgs`;

async function buildOverview()
{
	const { stdout, stderr } = await exec('php bin/icons-html.php');

	if (stderr)
	{
		console.error(`error during icons-html.php: ${stderr}`);
	}
	console.log(`${stdout}`);
}

(async function exec()
{
	let cleanOuts = [
		`./package`,
		`./dist`,
		pathMedia,
	];
	await helper.cleanOut(cleanOuts);

	from = path.resolve(`node_modules/bootstrap-icons/package.json`);
	versionSub = await helper.findVersionSubSimple (from, 'bootstrap-icons');
	console.log(pc.magenta(pc.bold(`versionSub identified as: "${versionSub}"`)));

	from = `./src`;
	to = `./package`;
	await helper.copy(from, to)

	console.log(pc.red(pc.bold(`Be patient! Preparing, moving around svg files and so.`)));

	from = `./node_modules/@fortawesome/fontawesome-free/svgs`;
	to = `${pathMedia}`;
	await helper.copy(from, to)

	from = `./node_modules/bootstrap-icons/icons`;
	to = `${pathMedia}/bi`;
	await helper.copy(from, to)

	const buildSvgs = require('./build/build-svgs.js');
	await buildSvgs.main();

	from = `${pathMedia}`;
	to = `${childDir}/svgs`;
	await helper.copy(from, to)

	to = './dist';

	if (!(await fse.exists(to)))
	{
		await fse.mkdir(to).then(
			answer => console.log(pc.yellow(pc.bold(`Created "${to}".`)))
		);
	}

	// ##### The File(s) (child). START.

	// package/packages/file_iconsghsvs/iconsghsvs.xml
	let jsonString = await helper.mergeJson(
		[path.resolve(jsonMain), path.resolve(jsonChild)]
	)

	let tempPackage = JSON.parse(jsonString);

	let zipFilename = `${tempPackage.name}-${version}_${versionSub}.zip`;

	replaceXmlOptions = {
		"xmlFile": path.resolve(manifestChild),
		"zipFilename": zipFilename,
		"checksum": "",
		"dirname": __dirname,
		"thisPackages": thisPackages,
		"jsonString": jsonString
	};

	await replaceXml.main(replaceXmlOptions);
	from = manifestChild;
	to = `./dist/${manifestFileNameChild}`
	await helper.copy(from, to)

	// ## Create child zip file.
	let zipFilePath = path.resolve(`./${packagesDir}/${zipFilename}`);

	zipOptions = {
		"source": path.resolve(childDir),
		"target": zipFilePath
	};
	await helper.zip(zipOptions);

	// The id element in <file ..> tag is not arbitrary! The id= should be set to the value of the element column in the #__extensions table. If they are not set correctly, upon uninstallation of the package, the child file will not be found and uninstalled.
	thisPackages.push(
		`<file type="${tempPackage.update.type}" id="${tempPackage.update.pkgId}">${zipFilename}</file>`
	);
	await helper.cleanOut([childDir]);
	// ##### The File(s) (child). END.

	// ##### The Package (main). START.
	zipFilename = `${nameReal}-${version}_${versionSub}.zip`;

	// package/pkg_xyz.xml
	replaceXmlOptions.xmlFile = Manifest;
	replaceXmlOptions.zipFilename = zipFilename;
	replaceXmlOptions.thisPackages = thisPackages;
	replaceXmlOptions.jsonString = "";

	await replaceXml.main(replaceXmlOptions);
	from = Manifest;
	to = `./dist/${manifestFileName}`
	await helper.copy(from, to)

	// ## Create main zip file.
	zipFilePath = path.resolve(`./dist/${zipFilename}`);

	zipOptions = {
		"source": path.resolve("package"),
		"target": zipFilePath
	};
	await helper.zip(zipOptions)

	const Digest = 'sha256'; //sha384, sha512
	const checksum = await helper.getChecksum(zipFilePath, Digest)
  .then(
		hash => {
			const tag = `<${Digest}>${hash}</${Digest}>`;
			console.log(pc.green(pc.bold(`Checksum tag is: ${tag}`)));
			return tag;
		}
	)
	.catch(error => {
		console.log(error);
		console.log(pc.red(pc.bold(
			`Error while checksum creation. I won't set one!`)));
		return '';
	});

	replaceXmlOptions.checksum = checksum;

	// Bei diesen werden zuerst Vorlagen nach dist/ kopiert und dort erst "replaced".
	for (const file of [updateXml, changelogXml, releaseTxt])
	{
		from = file;
		to = `./dist/${path.win32.basename(file)}`;
		await helper.copy(from, to)

		replaceXmlOptions.xmlFile = path.resolve(to);

		await replaceXml.main(replaceXmlOptions);
	}

	await buildOverview();

	from = `${pathMedia}/prepped-icons.json`;
	to = `./dist/prepped-icons.json`;
	await helper.copy(from, to)

	cleanOuts = [
		`./package`,
	];

	await helper.cleanOut(cleanOuts).then(
		answer => console.log(pc.cyan(pc.bold(pc.bgRed(
			`Finished. Good bye!`))))
	);
})();
