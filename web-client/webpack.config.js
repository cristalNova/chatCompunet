const path = require('path');

module.exports = {
  entry: './src/index.js',   
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',   
    clean: true              
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  devServer: {
    static: './',
    open: true,
    port: 3000
  },
  mode: 'development'
};
