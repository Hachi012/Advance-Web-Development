
let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];


function renderPosts() {
    const postsList = document.getElementById('postsList');
    
    if (posts.length === 0) {
        postsList.innerHTML = '<div class="empty-state"><p>No posts yet. Create your first post!</p></div>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
            <div class="post-header">
                <h2 class="post-title">${escapeHtml(post.title)}</h2>
                <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
            </div>
            <p class="post-content">${escapeHtml(post.content)}</p>
            
            <div class="comments-section">
                <h3>Comments (${post.comments.length})</h3>
                
                <div class="comment-form">
                    <input type="text" placeholder="Add a comment..." class="commentInput" data-post-id="${post.id}">
                    <button onclick="addComment(${post.id})">Comment</button>
                </div>

                <div class="comments-list">
                    ${post.comments.length > 0 
                        ? post.comments.map(comment => `
                            <div class="comment">
                                <p class="comment-text">${escapeHtml(comment.text)}</p>
                                <div class="comment-meta">
                                    <span>${new Date(comment.date).toLocaleString()}</span>
                                    <button class="comment-delete" onclick="deleteComment(${post.id}, '${comment.id}')">Delete</button>
                                </div>
                            </div>
                        `).join('')
                        : '<p style="color: #ccc; text-align: center; margin: 10px 0;">No comments yet. Be the first!</p>'
                    }
                </div>
            </div>

            <div class="post-actions">
                <button class="btn-delete" onclick="deletePost(${post.id})">Delete Post</button>
            </div>
        </div>
    `).join('');
}

// Add new post
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    if (title.trim() && content.trim()) {
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toISOString(),
            comments: []
        };

        posts.unshift(newPost);
        savePosts();
        renderPosts();
        
        // Clear form
        this.reset();
        document.getElementById('postTitle').focus();
    }
});

// Delete post
function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== postId);
        savePosts();
        renderPosts();
    }
}

// Add comment
function addComment(postId) {
    const input = document.querySelector(`.commentInput[data-post-id="${postId}"]`);
    const comment = input.value.trim();

    if (comment) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments.push({
                id: Date.now().toString(),
                text: comment,
                date: new Date().toISOString()
            });
            savePosts();
            renderPosts();
            input.focus();
        }
    }
}

// Delete comment
function deleteComment(postId, commentId) {
    if (confirm('Delete this comment?')) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments = post.comments.filter(c => c.id !== commentId);
            savePosts();
            renderPosts();
        }
    }
}

// Save posts to localStorage
function savePosts() {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Allow Enter key in comments
document.addEventListener('keypress', function(e) {
    if (e.target.classList.contains('commentInput') && e.key === 'Enter') {
        const postId = parseInt(e.target.dataset.postId);
        addComment(postId);
    }
});

// Initial render
renderPosts();