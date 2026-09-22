// Run with: groovy playwright_tests/jenkins/validate.spec.groovy
def pipeline = new File('playwright_tests/jenkins/validate.groovy')
def run = { String failedCommand, Map summary, boolean missingReports, boolean missingOdhin = false ->
  def commands = []
  def published = []
  def failed = false
  def caught = null
  def bindings = new Binding([
    env: [NODE_NAME: 'xui-agent'],
    lock: { Map options, Closure body ->
      assert options.resource == 'toolkit-playwright-xui-agent-4300'
      body()
    },
    timeout: { Map options, Closure body -> body() },
    stage: { String name, Closure body -> body() },
    dir: { String path, Closure body -> body() },
    deleteDir: { -> },
    pwd: { -> '/workspace' },
    withEnv: { List values, Closure body ->
      assert values.contains('CI=true')
      body()
    },
    sh: { Object command ->
      if (command instanceof Map) {
        assert command.script.contains('set -euo pipefail')
        return '/opt/node/bin/node\n'
      }
      commands << command
      if (command == failedCommand) {
        throw new IllegalStateException('original command failure')
      }
    },
    catchError: { Map options, Closure body ->
      assert options.buildResult == 'FAILURE'
      try { body() } catch (Exception ignored) { failed = true }
    },
    archiveArtifacts: { Map options ->
      assert options.artifacts.contains('playwright_tests/odhin-report/**')
      published << 'archive'
    },
    junit: { Map options ->
      published << 'junit'
      assert !options.allowEmptyResults
      if (missingReports) { throw new IllegalStateException('missing JUnit') }
      summary
    },
    publishHTML: { Map options ->
      published << (options.reportDir.endsWith('odhin-report') ? 'odhin' : 'html')
      assert !options.allowMissing
      if (missingReports || (missingOdhin && options.reportDir.endsWith('odhin-report'))) {
        throw new IllegalStateException('missing HTML report')
      }
    },
    error: { String message -> throw new IllegalStateException(message) }
  ])
  def script = new GroovyShell(bindings).parse(pipeline)
  script.run()
  try { script.call() } catch (Exception error) { caught = error }
  assert published == ['archive', 'junit', 'html', 'odhin']
  [commands: commands, failed: failed, caught: caught]
}

def green = [totalCount: 2, skipCount: 0, failCount: 0]
def success = run(null, green, false)
assert !success.failed && !success.caught
assert success.commands.contains('node .yarn/releases/yarn-4.5.0.cjs lint:playwright')
assert success.commands.contains('node .yarn/releases/yarn-4.5.0.cjs test:playwright:typecheck')
assert !success.commands.contains('node .yarn/releases/yarn-4.5.0.cjs lint')
assert !success.commands.any { it.contains('build:library') || it.contains('test --watch=false') }
assert success.commands.last() == 'node .yarn/releases/yarn-4.5.0.cjs test:playwright'

['install --immutable', 'playwright install chromium --only-shell', 'lint:playwright', 'test:playwright:typecheck', 'test:playwright'].each { task ->
  def command = "node .yarn/releases/yarn-4.5.0.cjs ${task}".toString()
  def result = run(command, green, true)
  assert result.caught?.message == 'original command failure'
  assert result.commands.last() == command
  assert result.failed
}

[1, 2, 3].each { count ->
  def result = run(null, [totalCount: count, skipCount: 0, failCount: 0], false)
  assert !result.failed && !result.caught
}

[
  [totalCount: 0, skipCount: 0, failCount: 0],
  [totalCount: 2, skipCount: 1, failCount: 0],
  [totalCount: 2, skipCount: 0, failCount: 1]
].each { summary -> assert run(null, summary, false).failed }
assert run(null, green, true).failed
assert run(null, green, false, true).failed
println 'Pipeline contract checks passed: variable suite counts, install/browser/static/test failures, empty/skipped/failed/missing reports'
