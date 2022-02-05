const fse = require('fs-extra');
const pc = require('picocolors');
const replaceXml = require('./build/replaceXml.js');
const path = require('path');
const helper = require('./build/helper.js');

let thisPackages = [];

const {
	filename,
	name,
	version,
} = require("./package.json");

const packagesDir = `./package/packages`;
const childDir = `${packagesDir}/file_iconsghsvs`;
const manifestFileName = `pkg_${filename}.xml`;
const Manifest = `${__dirname}/package/${manifestFileName}`;

(async function exec()
{
	let cleanOuts = [
		`./package`,
		`./dist`,
	];

	await helper.cleanOut(cleanOuts);

	let from = `${__dirname}/node_modules/bootstrap-icons/package.json`;
	versionSub = await helper.findVersionSubSimple (from, 'bootstrap-icons');
	console.log(pc.magenta(pc.bold(`versionSub identified as: "${versionSub}"`)));

	if (!(await fse.exists("./dist")))
	{
		await fse.mkdir("./dist"
		).then(
			answer => console.log(pc.yellow(pc.bold(`Created "./dist".`)))
		);
	}

	from = `./src`;
	let to = `./package`;
	await fse.copy(from, to
	).then(
		answer => console.log(
			pc.yellow(pc.bold(`Copied "${from}" to "${to}".`))
		)
	);

	console.log(pc.red(pc.bold(`Be very patient! Preparing svg files.`)));

	from = `./node_modules/@fortawesome/fontawesome-free/svgs`;
	to = `${childDir}/svgs`;
	await fse.copy(from, to
	).then(
		answer => console.log(
			pc.yellow(pc.bold(`Copied "${from}" to "${to}".`))
		)
	);

	from = `./node_modules/bootstrap-icons/icons`;
	to = `${childDir}/svgs/bi`;
	await fse.copy(from, to
	).then(
		answer => console.log(
			pc.yellow(pc.bold(`Copied "${from}" to "${to}".`))
		)
	);

	const buildSvgs = require('./build/build-svgs.js');
	await buildSvgs.main();

	// ##### Zip the file extension (child). START.
	// package/packages/file_iconsghsvs/iconsghsvs.xml
	let zipFilename = `${name}-${version}_${versionSub}.zip`;
	let zipFile = `${path.join(__dirname, packagesDir, zipFilename)}`;
	let folderToZip = childDir;
	let xmlFileName = `${filename}.xml`;
	let xmlFile = `${path.join(__dirname, childDir, xmlFileName)}`;

	await replaceXml.main(xmlFile);
	await fse.copy(xmlFile, `./dist/${xmlFileName}`).then(
		answer => console.log(pc.yellow(pc.bold(
			`Copied "${xmlFile}" to ./dist.`)))
	);

	let zip = new (require("adm-zip"))();
	zip.addLocalFolder(folderToZip, false);
	await zip.writeZip(zipFile);
	console.log(pc.cyan(pc.bold(pc.bgRed(`${zipFile} written.`))));

	// We need only zip for later pkg_* build.
	await helper.cleanOut([childDir]);

	thisPackages.push(
		`<file type="file" id="iconsghsvs">${zipFilename}</file>`
	);
	// ##### Zip the Library (child). END.

	// ##### Zip the Package (main). START.
	zipFilename = `pkg_${zipFilename}`;
	const zipFilePath = `./dist/${zipFilename}`;
	folderToZip = `./package`;
	xmlFileName = manifestFileName;
	xmlFile = Manifest;

	await replaceXml.main(xmlFile, null, null, thisPackages);
	await fse.copy(xmlFile, `./dist/${xmlFileName}`).then(
		answer => console.log(pc.yellow(pc.bold(
			`Copied "${xmlFile}" to ./dist.`)))
	);

	zip = new (require("adm-zip"))();
	zip.addLocalFolder(folderToZip, false);
	await zip.writeZip(zipFilePath);
	console.log(pc.cyan(pc.bold(pc.bgRed(`./dist/${zipFilename} written.`))));
	// ##### Zip the Package (main). END.

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

	xmlFile = 'update.xml';
	await fse.copy(`./${xmlFile}`, `./dist/${xmlFile}`).then(
		answer => console.log(pc.yellow(pc.bold(
			`Copied "${xmlFile}" to ./dist.`)))
	);
	await replaceXml.main(`${__dirname}/dist/${xmlFile}`, zipFilename, checksum,
		thisPackages);

	xmlFile = 'changelog.xml';
	await fse.copy(`./${xmlFile}`, `./dist/${xmlFile}`).then(
		answer => console.log(pc.yellow(pc.bold(
			`Copied "${xmlFile}" to ./dist.`)))
	);
	await replaceXml.main(`${__dirname}/dist/${xmlFile}`, zipFilename, checksum,
		thisPackages);

	xmlFile = 'release.txt';
	await fse.copy(`./${xmlFile}`, `./dist/${xmlFile}`).then(
		answer => console.log(pc.yellow(pc.bold(
			`Copied "${xmlFile}" to ./dist.`)))
	);
	await replaceXml.main(`${__dirname}/dist/${xmlFile}`, zipFilename, checksum,
		thisPackages);

	cleanOuts = [
		`./package`,
	];
	await helper.cleanOut(cleanOuts).then(
		answer => console.log(pc.cyan(pc.bold(pc.bgRed(
			`Finished. Good bye!`))))
	);
})();
