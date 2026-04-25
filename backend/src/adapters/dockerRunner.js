import { spawn } from 'child_process'
import { writeFileSync, rmSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey)

// Detect runtime based on filename
function getRuntime(filename) {
  if (filename.endsWith('.py')) return { cmd: 'python', args: [] }
  if (filename.endsWith('.js')) return { cmd: 'node', args: [] }
  if (filename.endsWith('.ts')) return { cmd: 'npx', args: ['tsx'] }
  return { cmd: 'python', args: [] } // default to Python
}

// Cross-platform safe directory cleanup using Node fs.rmSync
function cleanupDir(dir) {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {
    // Ignore cleanup errors — temp files will be cleaned by the OS eventually
  }
}

// Check if Docker is available
async function isDockerAvailable() {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['info'], { stdio: 'ignore' })
    proc.on('close', (code) => resolve(code === 0))
    proc.on('error', () => resolve(false))
  })
}

// Execute code directly (no Docker) — used as fallback or on Windows without Docker
function executeLocal(code, filename) {
  const runtime = getRuntime(filename)
  const tempDir = mkdtempSync(join(tmpdir(), 'exec-'))
  const tempFile = join(tempDir, filename)

  return new Promise((resolve, reject) => {
    writeFileSync(tempFile, code, 'utf-8')

    const proc = spawn(runtime.cmd, [...runtime.args, tempFile], {
      timeout: config.execTimeoutMs,
      env: { ...process.env, PATH: process.env.PATH },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => { stdout += data.toString() })
    proc.stderr.on('data', (data) => { stderr += data.toString() })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      cleanupDir(tempDir)
      reject(Object.assign(
        new Error('Code execution exceeded the time limit.'),
        { statusCode: 408, code: 'EXECUTION_TIMEOUT' }
      ))
    }, config.execTimeoutMs)

    proc.on('close', (code) => {
      clearTimeout(timer)
      cleanupDir(tempDir)
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code })
    })

    proc.on('error', (err) => {
      clearTimeout(timer)
      cleanupDir(tempDir)
      reject(Object.assign(
        new Error(`Execution failed: ${err.message}`),
        { statusCode: 500, code: 'EXECUTION_ERROR' }
      ))
    })
  })
}

// Execute code in Docker container
function executeInDocker(code, filename) {
  const runtime = getRuntime(filename)

  // Determine Docker image from command
  let image = 'python:3.11-alpine'
  if (runtime.cmd === 'node' || runtime.cmd === 'npx') image = 'node:20-alpine'

  const tempDir = mkdtempSync(join(tmpdir(), 'exec-'))
  const tempFile = join(tempDir, filename)

  return new Promise((resolve, reject) => {
    writeFileSync(tempFile, code, 'utf-8')

    const dockerCmd = runtime.cmd === 'npx'
      ? ['npx', 'tsx', `/code/${filename}`]
      : [runtime.cmd, `/code/${filename}`]

    const args = [
      'run', '--rm',
      '--network', 'none',
      '--memory', config.execMemoryLimit,
      '--cpus', config.execCpuLimit,
      '-v', `${tempDir}:/code:ro`,
      image,
      ...dockerCmd,
    ]

    const proc = spawn('docker', args)
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => { stdout += data.toString() })
    proc.stderr.on('data', (data) => { stderr += data.toString() })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      cleanupDir(tempDir)
      reject(Object.assign(
        new Error('Code execution exceeded the time limit.'),
        { statusCode: 408, code: 'EXECUTION_TIMEOUT' }
      ))
    }, config.execTimeoutMs)

    proc.on('close', (code) => {
      clearTimeout(timer)
      cleanupDir(tempDir)
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code })
    })

    proc.on('error', (err) => {
      clearTimeout(timer)
      cleanupDir(tempDir)
      reject(Object.assign(
        new Error(`Docker execution failed: ${err.message}`),
        { statusCode: 500, code: 'EXECUTION_ERROR' }
      ))
    })
  })
}

export async function executeCode(submissionId) {
  // 1. Fetch submission code from Supabase
  const { data: submission, error } = await supabase
    .from('submissions')
    .select('code, filename')
    .eq('id', submissionId)
    .single()

  if (error || !submission) {
    throw Object.assign(new Error('Submission not found.'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  const filename = submission.filename || 'script.py'
  const code = submission.code

  // 2. Try Docker first, fall back to local execution
  const dockerAvailable = await isDockerAvailable()

  if (dockerAvailable) {
    console.log(`🐳 Executing ${filename} in Docker`)
    return executeInDocker(code, filename)
  } else {
    console.log(`⚡ Docker not available, executing ${filename} locally`)
    return executeLocal(code, filename)
  }
}

// Execute code directly without a submission record (for Run button)
export async function executeCodeDirect(code, filename) {
  const dockerAvailable = await isDockerAvailable()

  if (dockerAvailable) {
    console.log(`🐳 Executing ${filename} in Docker (direct)`)
    return executeInDocker(code, filename)
  } else {
    console.log(`⚡ Executing ${filename} locally (direct)`)
    return executeLocal(code, filename)
  }
}
