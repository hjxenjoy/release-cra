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

  if (mode === 'start') {
    console.log(chalk.yellowBright('开始启动 Start...'))
    shell.exec('react-scripts start')
    return
  }

  const configs = readReleaseConfig()

  const envs = Object.keys(configs)

  let env = envs[0]

  if (envs.length > 1) {
    const result = await enquirer.prompt({
      type: 'select',
      name: 'env',
      message: '请选择启动的环境(Choose Your Env)',
      choices: envs,
      initial: envs[0],
    })
    env = result.env
  }

  process.env.REACT_APP_BUILD_ENV = env

  const config = configs[env]

  process.env.PUBLIC_URL = config.publicUrl

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
    [...(config.extracss || []), ...css, ...(config.extrajs || []), ...js].join(
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
