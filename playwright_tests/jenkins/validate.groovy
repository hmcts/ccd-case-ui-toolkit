// Keep this test-only pipeline independent from deployment wrappers.
// This library deliberately uses its agent selection, not its deployment wrapper.
def call() {
  timeout(time: 60, unit: 'MINUTES') {
    try {
      dir('playwright_tests/test-results') { deleteDir() }
      dir('playwright_tests/playwright-report') { deleteDir() }
      dir('playwright_tests/odhin-report') { deleteDir() }
      def nodePath
      stage('Toolkit runtime') {
        sh 'git rev-parse HEAD'
        nodePath = sh(returnStdout: true, script: '''#!/bin/bash
set -eo pipefail
export NVM_DIR=/home/jenkinsssh/.nvm
source /opt/nvm/nvm.sh --no-use
node_version="$(tr -d '[:space:]' < .nvmrc)"
nvm install "$node_version" >&2
nvm use "$node_version" >&2
nvm which "$node_version"
''').trim()
      }
      withEnv(["PATH+TOOLKIT_NODE=${pwd()}/.toolkit-bin:${nodePath.substring(0, nodePath.lastIndexOf('/'))}", 'CI=true']) {
        stage('Toolkit dependencies') {
          sh '''#!/bin/bash
set -euo pipefail
mkdir -p .toolkit-bin
printf '#!/bin/sh\nexec node "%s/.yarn/releases/yarn-4.5.0.cjs" "$@"\n' "$PWD" > .toolkit-bin/yarn
chmod +x .toolkit-bin/yarn
'''
          sh 'node --version && node .yarn/releases/yarn-4.5.0.cjs --version'
          sh 'node .yarn/releases/yarn-4.5.0.cjs install --immutable'
          sh 'node .yarn/releases/yarn-4.5.0.cjs playwright install chromium --only-shell'
        }
        stage('Toolkit Playwright static checks') {
          sh 'node .yarn/releases/yarn-4.5.0.cjs lint:playwright'
          sh 'node .yarn/releases/yarn-4.5.0.cjs test:playwright:typecheck'
        }
        stage('Toolkit Playwright integration tests') {
          lock(resource: "toolkit-playwright-${env.NODE_NAME}-4300") {
            sh 'node .yarn/releases/yarn-4.5.0.cjs test:playwright'
          }
        }
      }
    } finally {
      stage('Toolkit test evidence') {
        // Publication cannot hide the original command failure or turn a failed run green.
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          archiveArtifacts allowEmptyArchive: true,
            artifacts: 'playwright_tests/test-results/**,playwright_tests/playwright-report/**,playwright_tests/odhin-report/**'
        }
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          def result = junit allowEmptyResults: false,
            testResults: 'playwright_tests/test-results/junit.xml'
          if (result.totalCount == 0 || result.skipCount > 0 || result.failCount > 0) {
            error('Toolkit Playwright must execute a non-empty suite with no skipped or failed tests')
          }
        }
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright_tests/playwright-report',
            reportFiles: 'index.html',
            reportName: 'CCD Case UI Toolkit Playwright report'
          ])
        }
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          publishHTML([
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright_tests/odhin-report',
            reportFiles: 'toolkit-playwright.html',
            reportName: 'CCD Case UI Toolkit Odhín report'
          ])
        }
      }
    }
  }
}

return this
