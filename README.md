release-cra
===

cli based on create-react-app

## Install 安装

```shell
npm install --save-dev release-cra
```

## Config 配置

Create a `.release-cra.json` file in project root directory

在项目根目录创建一个 `.release-cra.json` 文件

Example

```json
{
  "env": {

    "test": {
      "publicUrl": "https://your-cdn.domain.com",
      "upload": "scp -rf ./build/static root@0.0.0.0:/home/assets/",
      "releaseUrl": "https://your-release-page.domain.com",
      "css": [
        "https://your-cdn.domain.com/path/extra.css"
      ],
      "js": [
        "https://your-cdn.domain.com/path/extra.js"
      ]
    },
    "production": {
      "publicUrl": "https://your-cdn.domain.com",
      "upload": "scp -rf ./build/static root@0.0.0.0:/home/assets/",
      "releaseUrl": "https://your-release-page.domain.com",
      "css": [
        "https://your-cdn.domain.com/path/extra.css"
      ],
      "js": [
        "https://your-cdn.domain.com/path/extra.js"
      ]
    }
  },
  "entry": {
    "ModuleA": {
      "label": "module-a",
      "subDir": "module-a-static"
    }
    "ModuleB": {
      "label": "module-b",
      "subDir": "module-b-static"
    }
  }
}
```
