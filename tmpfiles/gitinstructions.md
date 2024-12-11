
# Simplified Git Instructions

## To push changes to a separate branch of the website:
    git checkout <branch-name>
    git add .
    git commit -m "<commit-message>"
    git push origin <branch-name>

## To pull changes into the main branch of the website (make it live):
    1. Go to the GitHub repository page in a browser.
    2. Find your recently pushed branch and select the option to "Create Pull Request."
    3. Add a description of the changes and submit the pull request.

After merging the changes via GitHub, update your local repository with:
    git pull origin main

# Long-Form Git Instructions

## Pull Files from the GitHub Repository
### To pull files the first time:
    `git clone <repository-url>`
    `cd <repository-folder>`
    `git pull origin main`    
### To pull updates subsequent times:
    `cd <repository-folder>`
    `git pull origin main`

## Make and Commit Changes to Separate Files and Merge into the Main Branch 
### Create a new branch for your changes:
    `git checkout -b <branch-name>` ("evan-branch" and "austin-branch" could work well)
Make changes to the separate files in your branch.

### Stage and commit your changes:
    `git add <file1> <file2>` (`git add .` adds all changed files)
    `git commit -m "Descriptive message about the changes"`
    `git push origin <branch-name>`

### Create a pull request (PR):
    Go to the GitHub repository page in a browser.
    Find your recently pushed branch and select the option to "Create Pull Request."
    Add a description of the changes and submit the pull request.

### Merge the branch into main:
    After reviewing the changes in the PR, merge it via GitHub.
    After merging the changes via GitHub, update your local repository with:
        `git pull origin main`

## Resolve Conflicts Between Merges (if editing the same files)
### Pull the latest changes from the main branch: Before committing your changes:
    `git pull origin main`
### View the conflicts: Open the conflicted files in your text editor. Git will insert conflict markers:
    <<<<<<< HEAD
    Your changes
    =======
    Changes from the other branch
    >>>>>>> branch-name

### Resolve the conflicts:
    Edit the file to manually combine the changes as needed.
    Remove the conflict markers (<<<<<<<, =======, and >>>>>>>).

### Stage the resolved file:
    `git add <conflicted-file>`
### Commit the resolved changes:
    `git commit -m "Resolved merge conflict in <file-name>"`
### Push your changes:
    `git push origin <your-branch-name>`
### Complete the merge:
    If you are merging your branch into main, ensure no other conflicts remain. Then complete the merge via a pull request on GitHub.