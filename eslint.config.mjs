import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/node_modules/",
        "build/*.js",
        "config/*.js",
        "coverage/*.js",
        "coverage/*",
        "jest/*.js",
        "__tests__/*",
        "__tests__/*.js",
    ],
}, ...compat.extends("plugin:react/recommended", "airbnb", "airbnb/hooks", "prettier"), {
    plugins: {
        react,
        "react-native": reactNative,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "react/function-component-definition": "off",
        "no-param-reassign": "off",

        "react/jsx-filename-extension": [1, {
            extensions: [".js", ".jsx"],
        }],

        "no-use-before-define": ["error", {
            variables: false,
        }],

        "react/prop-types": ["error", {
            ignore: ["navigation", "navigation.navigate"],
        }],

        "react-native/no-inline-styles": "error",

        "max-lines": ["error", {
            max: 500,
        }],
    },
}];