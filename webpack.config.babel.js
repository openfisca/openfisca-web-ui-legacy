import webpack from 'webpack'

export default {
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react' // For babel JSX transformation which generates React.createElement.
    })
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}
