const fs = require('node:fs');
const path = require('node:path');

const {
  IOSConfig,
  createRunOncePlugin,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');

// why: the require is what makes brand-accent.json a fingerprint source (ADR 0027 §3).
const accent = require('./brand-accent.json');
const { COLOR_SETS, colorSetContents } = require('./brand-color-sets');

const APPLICATION_PRODUCT_TYPE = 'com.apple.product-type.application';
const ACCENT_SETTING = 'ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME';

function withColorSets(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const catalog = path.join(
        IOSConfig.Paths.getSourceRoot(cfg.modRequest.projectRoot),
        'Images.xcassets',
      );
      for (const [name, key] of Object.entries(COLOR_SETS)) {
        const dir = path.join(catalog, `${name}.colorset`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'Contents.json'),
          `${JSON.stringify(colorSetContents(accent[key], name), null, 2)}\n`,
        );
      }
      return cfg;
    },
  ]);
}

// why: scoped to the application target so a future extension target (ADR 0022) brings its own colour.
function withGlobalAccent(config) {
  return withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const targets = project.pbxNativeTargetSection();
    const lists = project.pbxXCConfigurationList();
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const target of Object.values(targets)) {
      if (typeof target !== 'object') continue;
      if (target.productType?.replace(/"/g, '') !== APPLICATION_PRODUCT_TYPE) continue;
      for (const { value } of lists[target.buildConfigurationList].buildConfigurations) {
        configurations[value].buildSettings[ACCENT_SETTING] = 'AccentColor';
      }
    }
    return cfg;
  });
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
function withBrandColors(config) {
  return withGlobalAccent(withColorSets(config));
}

module.exports = createRunOncePlugin(withBrandColors, 'with-brand-colors');
