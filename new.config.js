/* eslint-env node */

const dedent = require('dedent');
const { Confirm } = require('enquirer');

const lerna = require('./lerna');
const pkg = require('./package');

module.exports = {
    // Allowed scopes.
    scopes: ['ncest'],

    // Workspaces locations.
    workspaces: ['@ncest'],

    // Repository URL.
    repository: pkg.repository,

    // Package’s homepage.
    homepage: (name, workspace) => `https://github.com/anireact/ncest/tree/master/${workspace}/${name}`,

    // Issue tracker URL.
    bugs: (name, workspace) => `https://github.com/anireact/ncest/issues?q=is:issue+label:${workspace}/${name}`,

    // Author’s name, email, homepage.
    author: pkg.author,

    // Monorepo root.
    context: __dirname,

    // Initial version of new packages.
    version: lerna.version,

    // Prefer private packages.
    private: false,

    // Default license.
    license: 'MIT',

    // Default entry point.
    main: 'dist/index.js',

    // Post-process generated `package.json`.
    package: x => ({
        ...x,
        scripts: {
            build: 'babel --source-maps --out-dir dist --extensions .ts src',
        },
    }),

    // Post-spawn commands.
    finalize: async pkg_ => {
        const add = await new Confirm({
            message: 'Add to Git:',
            initial: true,
        }).run();

        return [
            { root: true, run: ['yarn'] },
            ['yarn', 'add', '@babel/runtime', 'core-js'],
            {
                file: 'README.md',
                // language=Markdown
                data: dedent`
                    # ${pkg_.name}

                    > ${pkg_.description}

                    ## License

                    MIT`,
            },
            {
                file: 'babel.config.js',
                data: `
                    module.exports = require('../../babel.config');
                `,
            },
            {
                file: 'tsconfig.json',
                data: {
                    extends: '../../tsconfig.json',
                    compilerOptions: {
                        rootDir: 'src',
                        outDir: 'dist',
                    },
                },
            },
            ['mkdirp', 'src'],
            ['prettier', '--write', './**/*.{js,jsx,ts,tsx,css,less,scss,html,json,md}'],
            add && ['git', 'add', './*'],
        ];
    },
};
