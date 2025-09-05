pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Clone the Git bare repository
                git url: 'file:///C:/WirelessAppDev/PersonalFinanceApp', branch: 'master'
            }
        }
        stage('Install Dependencies') {
            steps {
                script {
                    // Ensure Node.js is installed
                    bat 'npm install'
                }
            }
        }
        stage('Build') {
            steps {
                // Change to the android directory and run the Gradle build command
                script {
                    bat 'cd android && gradlew assembleRelease'
                }
                // Archive the APK as the main artifact
                archiveArtifacts artifacts: '**/android/app/build/outputs/apk/release/*.apk', fingerprint: true
            }
        }
    }
    post {
        always {
            echo 'Cleaning up workspace'
            deleteDir()     // Clean up the workspace after the build
        }
        success {
            echo 'Build completed successfully!'
        }
        failure {
            echo 'Build failed! Please check the logs.'
        }
    }
}
