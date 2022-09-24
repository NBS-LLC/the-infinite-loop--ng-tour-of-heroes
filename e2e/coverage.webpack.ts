import * as path from 'path';

export default {
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                loader: '@jsdevtools/coverage-istanbul-loader',
                enforce: 'post',
                include: path.join(__dirname, '..', 'src'),
            },
        ],
    },
}