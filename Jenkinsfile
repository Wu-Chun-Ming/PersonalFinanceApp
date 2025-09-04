pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Clone the Git repository
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
            }
        }
    }
}
