import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default [
    ...getExtensionConfig('content', 'popup', 'service-worker')
];

function getExtensionConfig(...filenames) {
    return filenames.map(basename => getConfig(basename));
}

function getConfig(basename) {
    return {
        input: `src/${basename}.ts`,
        output: {
            file: `dist/${basename}.js`,
            format: 'esm',
            // plugins: [terser()]
        },
        plugins: [
            typescript({
                target: 'esnext',
                module: undefined
            }),
            babel({
                babelHelpers: 'bundled',
                extensions: ['.ts'],
                presets: [
                    ['@babel/preset-env', {
                        targets: 'Chrome >= 85'
                    }]
                ]
            })
        ]
    };
}
