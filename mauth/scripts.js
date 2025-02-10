// Remove all existing code and replace with this minimal version
window.addEventListener('load', async function () {
  try {
    if (!window.Clerk) {
      throw new Error('Clerk failed to load')
    }

    await Clerk.load()

    if (!Clerk.isReady()) {
      throw new Error('Clerk failed to initialize')
    }

    const content = document.getElementById('content')
    const signIn = document.getElementById('sign-in')
    const userButton = document.getElementById('user-button')

    if (Clerk.user) {
      content.classList.remove('hidden')
      signIn.classList.add('hidden')
      Clerk.mountUserButton(userButton)
      loadGitHubRepos()
    } else {
      content.classList.add('hidden')
      userButton.classList.add('hidden')
      Clerk.mountSignIn(signIn, {
        // Add specific sign-in options
        signInUrl: '/',
        afterSignInUrl: '/',
        routing: 'hash',
        appearance: {
          elements: {
            rootBox: {
              boxShadow: 'none',
            },
          },
        },
      })
    }
  } catch (error) {
    console.error('Initialization error:', error.message)
    // Show error to user
    document.getElementById('app').innerHTML = `
      <div style="color: red; padding: 1rem;">
        Error initializing app. Please try again later.
      </div>
    `
  }
})

async function loadGitHubRepos() {
  try {
    if (!Clerk.session) {
      throw new Error('No active session')
    }

    const token = await Clerk.session.getToken({ template: 'github' })
    if (!token) {
      throw new Error('GitHub connection not configured. Please connect your GitHub account.')
    }

    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (response.status === 403) {
      throw new Error('Missing required GitHub permissions. Please revoke Clerk access in GitHub Settings and reconnect.')
    } else if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const repos = await response.json()
    displayRepos(repos)
  } catch (error) {
    console.error('GitHub Error:', error.message)
    document.getElementById('repos').innerHTML = `
      <div style="color: red">
        ${error.message}
        ${error.message.includes('permissions') ? 
          '<br><br>To fix:<br>1. Go to GitHub Settings → Applications → Authorized OAuth Apps<br>2. Find Clerk and click "Revoke"<br>3. Sign out and back in to reconnect GitHub' 
          : ''}
      </div>
    `
  }
}

function displayRepos(repos) {
  const reposDiv = document.getElementById('repos')
  reposDiv.innerHTML = repos
    .map(
      repo => `
      <div class="repo">
        <h2>${repo.name}</h2>
        <p>${repo.description || 'No description'}</p>
        <p>Language: ${repo.language || 'Not specified'} • Stars: ${repo.stargazers_count}</p>
      </div>
    `,
    )
    .join('')
}
