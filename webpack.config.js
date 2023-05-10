const path = require("path");
const PugPlugin = require("pug-plugin");
const fs = require("fs");
const rootDir = "app";
const pug = /(.*)\.pug$/;

/**
 *
 * @param {*} dir Root directory to traverse to start building the views list
 * @param {*} depth specifies the recursion depth to reach for child directories
 * @returns Object. Mapping of pug templates
 * {
 *  [challenge]: 'path/to/challenge/challenge.pug',
 * ...
 * ...
 * }
 * @author janarthanancs
 */
function buildPugTemplateEntries(rootDir, depth) {
  let views = {};

  fs.readdirSync(rootDir, { withFileTypes: true }).forEach(function (view) {
    const { name: fileOrDir } = view;
    const path = `${rootDir}/${fileOrDir}`;

    if (view.isDirectory()) {
      views =
        depth > 0
          ? { ...views, ...buildPugTemplateEntries(path, depth - 1) }
          : views;
    } else {
      if (pug.test(fileOrDir)) {
        views[fileOrDir.replace(pug, "$1")] = path;
      }
    }
  });

  return views;
}

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    devtool: isDev ? "inline-source-map" : "source-map",

    output: {
      path: path.join(__dirname, "dist"),
    },

    entry: {
      // Pug templates goes here
      ...buildPugTemplateEntries(rootDir, 1),
    },

    resolve: {
      alias: {
        normalize: path.join(__dirname, "/node_modules/normalize.css"),
      },
    },
    plugins: [
      new PugPlugin({
        css: {
          // output name of a generated CSS file
          filename: "assets/css/[name].[contenthash:8].css",
        },
      }),
    ],

    module: {
      rules: [
        // templates
        {
          test: /\.pug$/,
          loader: PugPlugin.loader,
        },

        // styles
        {
          test: /\.(css|sass|scss)$/,
          use: ["css-loader", "sass-loader"],
        },
      ],
    },

    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      compress: true,
      watchFiles: {
        paths: ["app/**/*.*"],
        options: {
          usePolling: true,
        },
      },
    },
  };
};
