#!groovy

properties(
    [[$class: 'GithubProjectProperty', projectUrlStr: 'https://git.reform.hmcts.net/case-management/case-ui-toolkit/'],
     pipelineTriggers([[$class: 'GitHubPushTrigger']])]
)

@Library('Reform') _

milestone()
lock(resource: "case-ui-toolkit-${env.BRANCH_NAME}", inversePrecedence: true) {
    node {
        try {
            wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {
                stage('Checkout') {
                    deleteDir()
                    checkout scm
                }

                stage('Install') {
                    sh "yarn install"
                }

                stage('Lint') {
                    sh "yarn run lint"
                }

                onPR {
                    enforceNodeVersionBump()
                }

                onMaster {
                    stage('Build') {
                        sh "yarn run build"
                    }

										stage('Publish') {
                      withNPMRC {
                        sh 'npm publish --registry https://artifactory.reform.hmcts.net/artifactory/api/npm/npm-local/'
                      }
										}
                }

                milestone()
            }
        } catch (err) {
            notifyBuildFailure channel: '#ccd-notifications'
            throw err
        }
    }
}
