#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
const enquirer = require('enquirer')
const path = require('path')
const fs = require('fs')
const shell = require('shelljs')
const chalk = require('chalk')
const cheerio = require('cheerio')

function readReleaseConfig() {
  const configPath = path.resolve(process.cwd(), '.release-cra.json')
  if (fs.existsSync(configPath)) {
    const text = fs.readFileSync(configPath, {
      encoding: 'utf-8',
    })

    try {
      const config = JSON.parse(text)
      return config
    } catch {
      return {}
    }
  }

  return {}
}

function extractAssets(filepath) {
  const content = fs.readFileSync(filepath).toString()
  const $ = cheerio.load(content)
  const css = []
  const js = []

  $('link[rel="stylesheet"]').each(function getCssLink() {
    css.push(this.attribs.href)
  })
  $('script').each(function getJsLink() {
    js.push(this.attribs.src)
  })

  return {
    css: css.filter(Boolean),
    js: js.filter(Boolean),
  }
}

async function bootstrap() {
  const configs = readReleaseConfig()

  const { mode } = await enquirer.prompt({
    type: 'select',
    name: 'mode',
    message: '本地启动(start)还是构建生产(build)',
    choices: [
      {
        name: 'start',
        message: '本地启动(start)',
      },
      {
        name: 'build',
        message: '构建生产(build)',
      },
    ],
    initial: 'start',
  })

  const { entry } = await enquirer.prompt({
    type: 'select',
    name: 'entry',
    message: '选择要启动的模块(Choose Your Entry Module)',
    choices: Object.entries(configs.entry).map(([key, { label }]) => ({
      name: key,
      message: label,
    })),
    initial: Object.keys(configs.entry)[0]
  })

  const { label, subDir = '' } = configs.entry[entry]

  process.env.REACT_APP_ENTRY_FILE = entry

  if (mode === 'start') {
    console.log(chalk.yellowBright(`开始启动(Start) ${label || ''}...`))
    shell.exec('react-scripts start')
    return
  }

  const envs = Object.keys(configs.env)

  let env = envs[0]

  if (envs.length > 1) {
    const result = await enquirer.prompt({
      type: 'select',
      name: 'env',
      message: '请选择构建的环境(Choose Your Build Env)',
      choices: envs,
      initial: envs[0],
    })
    env = result.env
  }

  process.env.REACT_APP_BUILD_ENV = env

  const envConfig = configs.env[env]

  process.env.PUBLIC_URL = envConfig.publicUrl + (subDir ? subDir + '/' : '')

  console.log(chalk.yellowBright('🐬开始构建 Start Build...'))
  shell.exec('react-scripts build')
  console.log(chalk.greenBright('🎉构建成功 Build Success!'))
  console.log()

  if (config.upload) {
    console.log(chalk.yellowBright('🚀上传静态资源 Start Upload Static Resource...'))
    shell.exec(config.upload)
    console.log(chalk.greenBright('🎉上传静态资源成功 Upload Static Resource Success!'))
    console.log()
  }

  console.log(chalk.yellowBright('🧪提取静态资源 Extract Static Resource'))
  const { css, js } = extractAssets(
    path.resolve(process.cwd(), 'build/index.html')
  )
  console.log()
  console.log(
    [...(config.css || []), ...css, ...(config.js || []), ...js].join(
      '\n'
    )
  )
  console.log()

  if (config.releaseUrl) {
    console.log(
      chalk.greenBright('🏹前往发布 Goto Release Page', chalk.underline(config.releaseUrl))
    )
  }
}

bootstrap()
