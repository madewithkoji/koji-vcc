// this file is a server side tool
// that will do the following:
// 1: set a flag for static rendering to use PWA stuff 
// 2: inject in a generated manifest.json --check
// 3: inject reference to manifest.json in index.html --check
// 4: get a list of all relevent files in the *dist* directory. --check
// 5: inject a service worker with all those files.-- check

const fs = require('fs');
const crypto = require('crypto');

module.exports = () => {
    const config = require('./config.json').config;

    // tell frontend that we're using a pwa setup now...
    const newConfig = JSON.stringify({ config, pwa: true }, null, 2);
    fs.writeFileSync(`${__dirname}/config.json`, newConfig);

    const dist_dir = `${require('./tools/findRootDirectory.js')()}/${config.deploy.frontend.output}`;

    // we need to reference the manifest we're putting in...
    const index = fs.readFileSync(`${dist_dir}/index.html`).toString();
    const newIndex = index.replace('<head>', '<head><link rel="manifest" href="./manifest.webmanifest"/>');
    fs.writeFileSync(`${dist_dir}/index.html`, newIndex);


    const manifest = require('./tools/buildManifest.js')(config.metadata);
    const dist_files = fs.readdirSync(dist_dir);
    const precache = [];
    let all_shas = '';
    dist_files.forEach((file) => {
      const sha = crypto.createHash('sha256').update(fs.readFileSync(`${dist_dir}/${file}`)).digest('hex');
      precache.push({ url: `/${file}`, revision: sha });
      all_shas += sha;
    });
    const manifest_id = crypto.createHash('sha256').update(all_shas).digest('hex');

    const precache_file = `self.__precacheManifest = (self.__precacheManifest || []).concat(${JSON.stringify(precache, null, 2)});`;
    const sw_file = fs.readFileSync(`${__dirname}/tools/service-worker.js`).toString();
    const sw_file_injected = sw_file.replace('[inject_id]', manifest_id);

    fs.writeFileSync(`${dist_dir}/precache-manifest-${manifest_id}.js`, precache_file);
    fs.writeFileSync(`${dist_dir}/service-worker.js`, sw_file_injected);
    fs.writeFileSync(`${dist_dir}/manifest.webmanifest`, manifest);
    
};