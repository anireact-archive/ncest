/* eslint-env node */

const dedent = require('dedent');
const { Confirm } = require('enquirer');

const lerna = require('./lerna');
const pkg = require('./package');

module.exports = {
    scopes: ['ncest'],
    workspaces: ['@ncest'],
    repository: pkg.repository,
    homepage: (name, workspace) => `https://github.com/anireact/ncest/tree/master/${workspace}/${name}`,
    bugs: (name, workspace) => `https://github.com/anireact/ncest/issues?q=is:issue+label:${workspace}/${name}`,
    author: pkg.author,
    context: __dirname,
    version: lerna.version,
    private: false,
    license: 'MIT',
    main: 'dist/index.js',
    package: x => ({
        ...x,
        scripts: {
            build: 'babel --source-maps --out-dir dist --extensions .ts src',
        },
    }),
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
