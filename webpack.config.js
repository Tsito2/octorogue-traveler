const path = require('path');

module.exports = {
    entry: './src/index.ts', // Point d'entrée de ton projet
    output: {
        filename: 'bundle.js', // Fichier de sortie
        path: path.resolve(__dirname, 'dist'), // Dossier de sortie
    },
    mode: 'development', // Peut être 'development' ou 'production'
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader', // Charger les fichiers TypeScript
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'], // Extensions supportées
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // Dossier pour les fichiers statiques
        },
        open: true, // Ouvre automatiquement le navigateur
        port: 8080, // Port du serveur
    },
};
