tasks.register<Exec>("assembleDebug") {
    environment("PATH", "${projectDir}/node_modules/.bin:" + (System.getenv("PATH") ?: ""))
    commandLine("npm", "run", "build")
}

